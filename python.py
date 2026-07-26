import logging
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
)

# ==========================================================
# 1) SOZLAMALAR
# ==========================================================

# @BotFather dan olingan bot tokeningiz
BOT_TOKEN = "8646884375:AAHRePNfWiUPNtdiOxmEZl0-ypuKOASnwxo"

# Saytingiz manzili
WEBSITE_URL = "https://animecorestudeo.vercel.app/"

# Majburiy obuna bo'lish kerak bo'lgan kanallar
# id -> @username yoki -100 bilan boshlanuvchi kanal ID si
REQUIRED_CHANNELS = [
    {"id": "@kanal_username_1", "url": "https://t.me/shohcore1", "name": "1-kanal"},
    {"id": "@kanal_username_2", "url": "https://t.me/Mobilografsamarqand", "name": "2-kanal"},
    {"id": "@kanal_username_3", "url": "https://t.me/animecorestudeo", "name": "3-kanal"},
]

# Anime qismlari saqlanadigan kontent kanali ID sining raqamli ko'rinishi (masalan, -1001234567890)
# DIQQAT: Telegram API forwardMessage uchun kanal URL emas, aynan ID yoki @username talab qiladi.
CONTENT_CHANNEL_ID = "@animecorestudeo"  # Yoki integer ID: -100xxxxxxxxxx

# Logging sozlamalari (xatoliklarni konsolda ko'rish uchun)
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)

# ==========================================================
# 2) YORDAMCHI FUNKSIYA — qismlarni generatsiya qilish
# ==========================================================

def qismlarni_yarat(boshlangich_xabar_id: int, qismlar_soni: int) -> dict:
    return {i: boshlangich_xabar_id + (i - 1) for i in range(1, qismlar_soni + 1)}

# ==========================================================
# 3) ANIMELAR RO'YXATI
# ==========================================================

ANIME_LIST = {
    "arra_odam": {
        "title": "🪚 Arra odam",
        "seasons": {
            "s1": {"title": "1-fasl", "episodes": qismlarni_yarat(101, 12)},
            "s2": {"title": "2-fasl", "episodes": qismlarni_yarat(201, 12)},
        },
    },
    "sollo_leviling": {
        "title": "⚔️ Sollo Leviling",
        "seasons": {
            "s1": {"title": "1-fasl", "episodes": qismlarni_yarat(301, 12)},
            "s2": {"title": "2-fasl", "episodes": qismlarni_yarat(401, 12)},
        },
    },
    "yugereni_abadiyligi": {
        "title": "🌙 Yugereni abadiyligi",
        "seasons": {
            "s1": {"title": "1-fasl", "episodes": qismlarni_yarat(501, 12)},
            "s2": {"title": "2-fasl", "episodes": qismlarni_yarat(601, 12)},
        },
    },
    "zulmat_farzandi": {
        "title": "🌑 Zulmat farzandi",
        "seasons": {
            "s1": {"title": "1-fasl", "episodes": qismlarni_yarat(701, 12)},
            "s2": {"title": "2-fasl", "episodes": qismlarni_yarat(801, 12)},
        },
    },
    "gachiakutura": {
        "title": "🔥 Gachiakuta",
        "seasons": {
            "s1": {"title": "1-fasl", "episodes": qismlarni_yarat(901, 12)},
            "s2": {"title": "2-fasl", "episodes": qismlarni_yarat(1001, 12)},
        },
    },
    "arifureta": {
        "title": "✨ Arifureta",
        "seasons": {
            "s1": {
                "title": "1-fasl",
                "episodes": {
                    1: 1101, 2: 1102, 3: 1103, 4: 1104, 5: 1105, 6: 1106,
                    7: 1107, 8: 1108, 9: 1109, 10: 1110, 11: 1111, 12: 1112,
                },
            },
            "s2": {"title": "2-fasl", "episodes": qismlarni_yarat(1201, 12)},
        },
    },
}

# ==========================================================
# 4) MENYU YASASH FUNKSIYALARI
# ==========================================================

def anime_menyusini_yasash() -> InlineKeyboardMarkup:
    keyboard = []
    anime_keys = list(ANIME_LIST.keys())

    # Har bir qatorda 2 tadan anime tugmasi
    for i in range(0, len(anime_keys), 2):
        row = [
            InlineKeyboardButton(
                ANIME_LIST[anime_keys[i]]["title"],
                callback_data=f"anime:{anime_keys[i]}"
            )
        ]
        if i + 1 < len(anime_keys):
            row.append(
                InlineKeyboardButton(
                    ANIME_LIST[anime_keys[i + 1]]["title"],
                    callback_data=f"anime:{anime_keys[i + 1]}"
                )
            )
        keyboard.append(row)

    # Saytga kirish tugmasi
    keyboard.append([InlineKeyboardButton("🌐 Saytga kirish", url=WEBSITE_URL)])
    return InlineKeyboardMarkup(keyboard)

# ==========================================================
# 5) OBUNANI TEKSHIRISH FUNKSIYALARI
# ==========================================================

async def obuna_bolmagan_kanallarni_top(bot, user_id: int) -> list:
    obuna_bolmagan = []
    for kanal in REQUIRED_CHANNELS:
        try:
            member = await bot.get_chat_member(chat_id=kanal["id"], user_id=user_id)
            if member.status in ["left", "kicked"]:
                obuna_bolmagan.append(kanal)
        except Exception as e:
            logging.error(f"Kanalni tekshirishda xato ({kanal['id']}): {e}")
            obuna_bolmagan.append(kanal)
    return obuna_bolmagan


async def obuna_xabarini_yubor(update: Update, anime_key: str, season_key: str, ep_num: str, obuna_bolmagan: list):
    keyboard = []
    for kanal in obuna_bolmagan:
        keyboard.append([InlineKeyboardButton(f"➕ {kanal['name']}ga obuna bo'lish", url=kanal["url"])])

    keyboard.append([
        InlineKeyboardButton("✅ Tekshirish", callback_data=f"check:{anime_key}:{season_key}:{ep_num}")
    ])

    matn = '⚠️ Qismni ko\'rish uchun quyidagi kanallarga obuna bo\'ling, so\'ngra "✅ Tekshirish" tugmasini bosing.'
    
    if update.callback_query:
        await update.callback_query.message.reply_text(matn, reply_markup=InlineKeyboardMarkup(keyboard))
    else:
        await update.message.reply_text(matn, reply_markup=InlineKeyboardMarkup(keyboard))

# ==========================================================
# 6) HANDLER'LAR (BUYRUK VA TUGMALARGA JAVOB)
# ==========================================================

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    ism = update.effective_user.first_name or "do'stim"
    matn = (
        f"Salom, {ism}! 👋\n\n"
        f"Anime botimizga xush kelibsiz 🎬\n\n"
        f"Qanday anime ko'rmoqchisiz? Pastdan tanlang 👇\n"
        f"Yoki saytimizga kirib ko'rishingiz ham mumkin 🌐"
    )
    await update.message.reply_text(matn, reply_markup=anime_menyusini_yasash())


async def callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    data = query.data.split(":")
    amal = data[0]
    param = data[1:]

    chat_id = query.message.chat_id
    message_id = query.message.message_id
    user_id = query.from_user.id

    try:
        if amal == "anime":
            anime_key = param[0]
            await fasllarni_korsatish(query, anime_key)

        elif amal == "season":
            anime_key, season_key = param[0], param[1]
            await qismlarni_korsatish(query, anime_key, season_key)

        elif amal == "ep":
            anime_key, season_key, ep_num = param[0], param[1], param[2]
            await qismni_yuborishga_harakat_qil(update, context, user_id, anime_key, season_key, ep_num)

        elif amal == "check":
            anime_key, season_key, ep_num = param[0], param[1], param[2]
            await qismni_yuborishga_harakat_qil(update, context, user_id, anime_key, season_key, ep_num, qayta_tekshirish=True)

        elif amal == "back_main":
            await query.edit_message_text(
                "Qanday anime ko'rmoqchisiz? Pastdan tanlang 👇",
                reply_markup=anime_menyusini_yasash()
            )

        elif amal == "back_seasons":
            anime_key = param[0]
            await fasllarni_korsatish(query, anime_key)

    except Exception as e:
        logging.error(f"Callback error: {e}")


async def fasllarni_korsatish(query, anime_key: str):
    anime = ANIME_LIST.get(anime_key)
    if not anime:
        return

    keyboard = []
    for s_key, s_val in anime["seasons"].items():
        keyboard.append([
            InlineKeyboardButton(s_val["title"], callback_data=f"season:{anime_key}:{s_key}")
        ])

    keyboard.append([InlineKeyboardButton("🔙 Orqaga", callback_data="back_main")])

    await query.edit_message_text(
        f"{anime['title']}\n\nFaslni tanlang 👇",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )


async def qismlarni_korsatish(query, anime_key: str, season_key: str):
    anime = ANIME_LIST.get(anime_key)
    season = anime["seasons"].get(season_key) if anime else None
    if not season:
        return

    keyboard = []
    episodes = list(season["episodes"].keys())

    # Har bir qatorda 4 tadan tugma
    for i in range(0, len(episodes), 4):
        row = [
            InlineKeyboardButton(
                f"{ep}-qism",
                callback_data=f"ep:{anime_key}:{season_key}:{ep}"
            )
            for ep in episodes[i:i + 4]
        ]
        keyboard.append(row)

    keyboard.append([InlineKeyboardButton("🔙 Orqaga", callback_data=f"back_seasons:{anime_key}")])

    await query.edit_message_text(
        f"{anime['title']} — {season['title']}\n\nQismni tanlang 👇",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )


async def qismni_yuborishga_harakat_qil(update: Update, context: ContextTypes.DEFAULT_TYPE, user_id: int, anime_key: str, season_key: str, ep_num: str, qayta_tekshirish=False):
    chat_id = update.effective_chat.id
    obuna_bolmagan = await obuna_bolmaganKanallarni_top(context.bot, user_id)

    if obuna_bolmagan:
        if qayta_tekshirish:
            await context.bot.send_message(chat_id=chat_id, text="❌ Siz hali barcha kanallarga obuna bo'lmagansiz.")
        await obuna_xabarini_yubor(update, anime_key, season_key, ep_num, obuna_bolmagan)
        return

    anime = ANIME_LIST.get(anime_key)
    season = anime["seasons"].get(season_key) if anime else None
    xabar_id = season["episodes"].get(int(ep_num)) if season else None

    if not xabar_id:
        await context.bot.send_message(chat_id=chat_id, text="Kechirasiz, bu qism topilmadi.")
        return

    try:
        await context.bot.forward_message(
            chat_id=chat_id,
            from_chat_id=CONTENT_CHANNEL_ID,
            message_id=xabar_id
        )
        if qayta_tekshirish:
            await context.bot.send_message(chat_id=chat_id, text="✅ Obuna tasdiqlandi! Qismingiz yuqorida 👆")
    except Exception as e:
        logging.error(f"Forward qilishda xato: {e}")
        await context.bot.send_message(chat_id=chat_id, text="❌ Qismni yuborishda xatolik yuz berdi. Keyinroq urinib ko'ring.")

# ==========================================================
# 7) BOTNI ISHGA TUSHIRISH
# ==========================================================

def main():
    if not BOT_TOKEN:
        print("❌ XATOLIK: BOT_TOKEN ko'rsatilmadi!")
        return

    # Application obyektini yaratish
    app = Application.builder().token(BOT_TOKEN).build()

    # Handlerni ro'yxatdan o'tkazish
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(callback_handler))

    print("🤖 Bot ishga tushdi...")
    print("   Botni to'xtatish uchun: Ctrl + C")

    # Pollingni boshlash
    app.run_polling()


if __name__ == "__main__":
    main()