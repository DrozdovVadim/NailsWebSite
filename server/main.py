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

class ServiceResponse(BaseModel):
    id: int
    service_name: str
    price: float
    date: datetime

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
    file: UploadFile = File(...),
    userId: str = Form(...),
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

# Run both FastAPI and Telegram bot
async def main():
    # Start Telegram bot in the background
    asyncio.create_task(run_telegram_bot())
    # FastAPI will run via uvicorn below

if __name__ == "__main__":
    asyncio.run(main())
    uvicorn.run(app, host="0.0.0.0", port=8000)