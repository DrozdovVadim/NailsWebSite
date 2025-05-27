import os
import asyncio
import nest_asyncio
from telegram import Update
from telegram.ext import Application, MessageHandler, filters, ContextTypes

nest_asyncio.apply()

DOWNLOAD_DIR = 'images'
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

TOPIC_MAP = {
    3: "topic_3",
    2: "topic_2"
}


async def handle_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    message = update.effective_message

    if message and message.photo:
        # Определяем тему
        thread_id = message.message_thread_id
        print(TOPIC_MAP.get(thread_id))
        if TOPIC_MAP.get(thread_id) =="topic_2":
            folder_name = 'gallery'
        else:
            folder_name = 'aboutMe'

        # Создаем папку
        folder_path = os.path.join("../client/src/images", folder_name)
        os.makedirs(folder_path, exist_ok=True)

        # Сохраняем только ОДНУ (большую) версию
        photo = message.photo[-1]
        file = await context.bot.get_file(photo.file_id)
        file_path = os.path.join(folder_path, f"{file.file_id}.jpg")
        await file.download_to_drive(file_path)
        print(f"Сохранено в '{folder_name}': {file_path}")
    else:
        print("Сообщение без фото.")

async def main():
    app = Application.builder().token('7677764801:AAEecvNrqBjWCSdC47Tprv3uIx1aSK1_H0o').build()
    app.add_handler(MessageHandler(filters.PHOTO, handle_photo))

    print("Бот запущен. Ожидание изображений в Telegram группе...")
    await app.run_polling()

if __name__ == '__main__':
    asyncio.run(main())