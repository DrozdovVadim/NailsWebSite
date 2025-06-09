import os
import asyncio
import nest_asyncio
from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
from typing import List
import psycopg2
from psycopg2.extras import RealDictCursor
import uvicorn
from telegram import Update
from telegram.ext import Application, MessageHandler, filters, ContextTypes
import shutil
from datetime import datetime, timedelta
# Apply nest_asyncio to allow running Telegram bot in the same event loop
nest_asyncio.apply()

# Initialize FastAPI app
app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
def get_db_connection():
    return psycopg2.connect(
        dbname="NailedIt",
        user="postgres",
        password="281929367",
        host="localhost",
        port="5432"
    )

# JWT Configuration
SECRET_KEY = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"  # Replace with a secure key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic Models
class UserCreate(BaseModel):
    full_name: str
    phone_number: str
    email: str
    password: str
    role: bool

class UserLogin(BaseModel):
    email: str
    password: str

class TokenWithUserInfo(BaseModel):
    access_token: str
    token_type: str
    email: str
    phone_number: str

class ServiceRes(BaseModel):
    id: int
    name: str
    price: float
    duration: float
class UpdateScheduleRequest(BaseModel):
    is_available: bool
class ServiceResponse(BaseModel):
    id: int
    service_name: str
    price: float
    date: datetime

    class Config:
        orm_mode = False
class ScheduleResponse(BaseModel):
    id: int
    date: str
    start_time: str
    end_time: str
    is_available: bool
    is_expired: bool  # Новое поле

    class Config:
        orm_mode = False

# Helper Functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('SELECT * FROM "User" WHERE "Email" = %s', (email,))
            user = cur.fetchone()
            if user is None:
                raise credentials_exception
            return user
    finally:
        conn.close()

# Telegram Bot Setup
DOWNLOAD_DIR = 'images'
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

TOPIC_MAP = {
    3: "topic_3",
    2: "topic_2",
}

async def handle_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    message = update.effective_message

    if message and message.photo:
        thread_id = message.message_thread_id
        if TOPIC_MAP.get(thread_id) == "topic_2":
            folder_name = 'gallery'
        else:
            folder_name = 'aboutMe'

        folder_path = os.path.join("../client/src/images", folder_name)
        os.makedirs(folder_path, exist_ok=True)

        message_id = message.message_id
        photo = message.photo[-1]
        file = await context.bot.get_file(photo.file_id)
        file_path = os.path.join(folder_path, f"{message_id}.jpg")
        await file.download_to_drive(file_path)
        print(f"Сохранено в '{folder_name}': {file_path}")
    else:
        print("Сообщение без фото.")

async def run_telegram_bot():
    bot_app = Application.builder().token('7677764801:AAEecvNrqBjWCSdC47Tprv3uIx1aSK1_H0o').build()
    bot_app.add_handler(MessageHandler(filters.PHOTO, handle_photo))
    print("Бот запущен. Ожидание изображений в Telegram группе...")
    await bot_app.run_polling()



UPLOAD_DIR = "../client/public/images/profileImg"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload-profile-image")
async def upload_profile_image(
    userId: int,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if current_user["id"]!= userId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own profile image"
        )
    filename = f"{userId}.jpg"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"message": "Файл загружен", "filename": filename}
    

PROFILE_IMG_DIR = "../client/public/images/profileImg"

@app.delete("/delete-profile-image")
async def delete_profile_image(userId: int, current_user: dict = Depends(get_current_user)):
    print(userId)
    if current_user["id"] != userId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own profile image"
        )

    file_path = os.path.join(PROFILE_IMG_DIR, f"{userId}.jpg")

    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="Profile image not found")

    try:
        os.remove(file_path)
        return JSONResponse(content={"detail": "Profile image deleted successfully"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting image: {str(e)}")

# FastAPI Endpoints
@app.post("/register", response_model=TokenWithUserInfo)
async def register(user: UserCreate):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('SELECT * FROM "User" WHERE "Email" = %s', (user.email,))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Email already registered")
            
            hashed_password = get_password_hash(user.password)
            cur.execute(
                """INSERT INTO "User" ("FullName", "PhoneNumber", "Email", "Password", "Role") 
                VALUES (%s, %s, %s, %s, %s) 
                RETURNING "id", "FullName", "PhoneNumber", "Email", "Role" """,
                (user.full_name, user.phone_number, user.email, hashed_password, user.role)
            )
            new_user = cur.fetchone()
            conn.commit()
            
            access_token = create_access_token(data={"sub": user.email})
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "email": user.email,
                "phone_number": user.phone_number
            }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.post("/token", response_model=TokenWithUserInfo)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('SELECT * FROM "User" WHERE "Email" = %s', (form_data.username,))
            user = cur.fetchone()
            if not user or not verify_password(form_data.password, user["Password"]):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect email or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            access_token = create_access_token(data={"sub": form_data.username})
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "email": user["Email"],
                "phone_number": user["PhoneNumber"]
            }
    finally:
        conn.close()

@app.get("/users/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user

@app.get("/provided-services", response_model=List[ServiceResponse])
async def get_service_history(userId: int, current_user: dict = Depends(get_current_user)):
    if current_user["id"] != userId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own service history"
        )
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT 
                    ps.id,
                    s."Name" AS service_name,
                    s."Price" AS price,
                    ps."Time" AS date
                FROM 
                    "ProvidedServices" ps
                JOIN 
                    "Service" s ON ps."ServiceID" = s.id
                WHERE 
                    ps."UserID" = %s
                ORDER BY 
                    ps."Time" DESC
                """,
                (userId,)
            )
            services = cur.fetchall()
            if not services:
                return []
            return services
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.delete("/delete-from-gallery")
async def delete_photo_gallery(data: dict):
    photo_src = data.get("src")
    if not photo_src:
        raise HTTPException(status_code=400, detail="Поле 'src' обязательно")

    file_name = os.path.basename(photo_src)
    folder_path = "../client/src/images/gallery"
    file_path = os.path.join(folder_path, file_name)

    if os.path.exists(file_path):
        os.remove(file_path)
        return {"message": f"Файл {file_name} удален"}
    else:
        raise HTTPException(status_code=404, detail="Файл не найден")

@app.delete("/delete-from-about-me")
async def delete_photo_aboutMe(data: dict):
    photo_src = data.get("src")
    if not photo_src:
        raise HTTPException(status_code=400, detail="Поле 'src' обязательно")
    file_name = os.path.basename(photo_src)
    folder_path = "../client/src/images/aboutMe"
    file_path = os.path.join(folder_path, file_name)
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"message": f"Файл {file_name} удален"}
    else:
        raise HTTPException(status_code=404, detail="Файл не найден")




@app.get("/schedule", response_model=List[ScheduleResponse])
def get_schedule():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT id, "Date", "StartTime", "EndTime", "isAvailable" FROM "Schedule"')
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    result = []
    current_time = datetime.now(timezone.utc)
    for id_, date_, start_time, end_time, is_available in rows:
        slot_datetime = datetime.combine(date_, start_time, tzinfo=timezone.utc)
        is_expired = slot_datetime < current_time

        result.append(ScheduleResponse(
            id=id_,
            date=date_.isoformat(),
            start_time=start_time.strftime("%H:%M"),
            end_time=end_time.strftime("%H:%M"),
            is_available=is_available and not is_expired,
            is_expired=is_expired  # Обязательно включаем поле
        ))
    return result

@app.patch("/schedule/{slot_id}")
def update_schedule(slot_id: int, update_data: UpdateScheduleRequest):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'UPDATE "Schedule" SET "isAvailable" = %s WHERE id = %s RETURNING id',
                (update_data.is_available, slot_id)
            )
            updated = cur.fetchone()
            if not updated:
                raise HTTPException(status_code=404, detail="Слот не найден")
            conn.commit()
            return {"message": "Слот обновлен"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()



@app.get("/services", response_model=List[ServiceRes])
def get_services():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM "Service"')
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    result = []
    for row in rows:
        # Предполагаем, что row - это кортеж (id, name, price, duration)
        id_, name, price, duration = row
        
        # Преобразуем duration из timedelta в минуты
        if isinstance(duration, timedelta):
            duration_in_minutes = int(duration.total_seconds() / 60)
        else:
            duration_in_minutes = 0  # или другое значение по умолчанию
            
        result.append(ServiceRes(
            id=id_,
            name=name,
            price=float(price),  # Явное преобразование в float
            duration=duration_in_minutes
        ))
    return result

class UpdateScheduleRequest(BaseModel):
    is_available: bool

@app.patch("/schedule/{slot_id}")
def update_schedule(slot_id: int, update_data: UpdateScheduleRequest):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                'UPDATE "Schedule" SET "isAvailable" = %s WHERE id = %s RETURNING id',
                (update_data.is_available, slot_id)
            )
            updated = cur.fetchone()
            if not updated:
                raise HTTPException(status_code=404, detail="Слот не найден")
            conn.commit()
            return {"message": "Слот обновлен"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@app.post("/book-slot")
async def book_slot(
    userId: int = Form(...),
    serviceId: int = Form(...),
    scheduleId: int = Form(...),
    current_user: dict = Depends(get_current_user)
):
    if current_user["id"] != userId:
        raise HTTPException(status_code=403, detail="Доступ запрещён: чужой userId")

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Получаем слот
            cur.execute('SELECT * FROM "Schedule" WHERE id = %s', (scheduleId,))
            schedule = cur.fetchone()

            if not schedule:
                raise HTTPException(status_code=404, detail="Слот не найден")
            if not schedule["isAvailable"]:
                raise HTTPException(status_code=400, detail="Слот уже занят")

            # Combine Date and StartTime to create slot_datetime
            slot_date = schedule["Date"]  # Assuming Date is a date object
            slot_time = schedule["StartTime"]  # Assuming StartTime is a time object
            slot_datetime = datetime.combine(slot_date, slot_time, tzinfo=timezone.utc)

            # Проверяем дату и время
            now = datetime.now(timezone.utc)
            if slot_datetime < now:
                raise HTTPException(status_code=400, detail="Нельзя бронировать прошедшее время")

            # Добавляем бронирование
            cur.execute(
                """
                INSERT INTO "Booking" ("schedule_id", "user_id", "service_id")
                VALUES (%s, %s, %s)
                RETURNING id
                """,
                (scheduleId, userId, serviceId)
            )
            booking = cur.fetchone()

            # Update the schedule to mark it as unavailable
            cur.execute(
                'UPDATE "Schedule" SET "isAvailable" = %s WHERE id = %s',
                (False, scheduleId)
            )

            conn.commit()
            return {"message": "Бронирование успешно", "booking_id": booking["id"]}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")

    finally:
        conn.close()
# @app.get("/user-bookings", response_model=List[int])
# async def get_user_bookings(userId: int, current_user: dict = Depends(get_current_user)):
#     if current_user["id"] != userId:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="You can only access your own bookings"
#         )
    
#     conn = get_db_connection()
#     try:
#         with conn.cursor(cursor_factory=RealDictCursor) as cur:
#             cur.execute(
#                 """
#                 SELECT schedule_id
#                 FROM "Booking"
#                 WHERE "user_id" = %s
#                 """,
#                 (userId,)
#             )
#             bookings = cur.fetchall()
#             # Возвращаем список schedule_id
#             return [booking["schedule_id"] for booking in bookings]
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
#     finally:
#         conn.close()
@app.get("/user-bookings", response_model=List[dict])
async def get_user_bookings(userId: int, current_user: dict = Depends(get_current_user)):
    if current_user["id"] != userId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own bookings"
        )
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, schedule_id
                FROM "Booking"
                WHERE "user_id" = %s
                """,
                (userId,)
            )
            bookings = cur.fetchall()
            return bookings  # Возвращает [{id: bookingId, schedule_id: scheduleId}, ...]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
    


@app.delete("/delete-booking")
async def delete_booking(
    userId: int = Form(...),
    bookingId: int = Form(...),
    current_user: dict = Depends(get_current_user)
):
    if current_user["id"] != userId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own bookings"
        )

    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Retrieve the booking to get schedule_id and verify it belongs to the user
            cur.execute(
                """
                SELECT schedule_id
                FROM "Booking"
                WHERE id = %s AND user_id = %s
                """,
                (bookingId, userId)
            )
            booking = cur.fetchone()
            if not booking:
                raise HTTPException(status_code=404, detail="Бронирование не найдено или не принадлежит вам")

            # Update the Schedule table to set isAvailable = true
            cur.execute(
                'UPDATE "Schedule" SET "isAvailable" = %s WHERE id = %s',
                (True, booking["schedule_id"])
            )

            # Delete the booking from the Booking table
            cur.execute(
                'DELETE FROM "Booking" WHERE id = %s',
                (bookingId,)
            )

            # Verify the deletion
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="Бронирование не найдено")

            conn.commit()
            return {"message": "Бронирование успешно удалено"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Ошибка сервера: {str(e)}")
    finally:
        conn.close()


# Run both FastAPI and Telegram bot
async def main():
    # Start Telegram bot in the background
    asyncio.create_task(run_telegram_bot())
    # FastAPI will run via uvicorn below

if __name__ == "__main__":
    asyncio.run(main())
    uvicorn.run(app, host="0.0.0.0", port=8000)