from fastapi import FastAPI, HTTPException
import os
from fastapi.middleware.cors import CORSMiddleware
import uvicorn 


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.delete("/delete-from-gallery")
async def delete_photo_gallery(data: dict):
    photo_src = data.get("src")
    if not photo_src:
        raise HTTPException(status_code=400, detail="Поле 'src' обязательно")

    # Извлекаем имя файла из src
    file_name = os.path.basename(photo_src)
    folder_path = "../client/src/images/gallery"
    file_path = os.path.join(folder_path, file_name)

    # Проверяем, существует ли файл
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"message": f"Файл {file_name} удален"}
    else:
        raise HTTPException(status_code=404, detail="Файл не найден")

@app.delete("/delete-from-about-me")
async def delete_photo_aboutMe(data: dict):
    photo_src=data.get("src")
    if not photo_src:
        raise HTTPException(status_code=400, detail="Поле 'src' обязательно")
    file_name=os.path.basename(photo_src)
    folder_path="../client/src/images/aboutMe"
    file_path= os.path.join(folder_path, file_name)
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"message": f"Файл {file_name} удален"}
    else:
        raise HTTPException(status_code=404, detail="Файл не найден")



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)