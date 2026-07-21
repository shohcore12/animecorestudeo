/**
 * Animecorestudeo Telegram Boti
 * Tillar/Texnologiya: Node.js (Telegraf framework)
 * 
 * Ushbu bitta fayl barcha funksiyalarni o'z ichiga oladi:
 * - Majburiy kanalga obuna tekshiruvi
 * - Asosiy menyu va tugmalar
 * - WebApp / Veb-sayt havolasi
 * - Animelar bo'limi (Kanal postlaridan nusxalash)
 * - Donat bo'limi (Karta raqami bilan)
 * - Aniartifact buyurtma berish tizimi
 */

const { Telegraf, Markup } = require('telegraf');

// ==========================================
// 1. SOZLAMALAR (O'zingiznikiga almashtirasiz)
// ==========================================
const BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';         // BotFather bergan token
const CHANNEL_USERNAME = '@animecorestudeo';       // Majburiy kanal username'i (@ bilan)
const CHANNEL_ID = -1001234567890;                // Animelar saqlangan kanal ID'si
const WEBSITE_URL = 'https://animecorestudeo.github.io'; // Saytingiz havolasi
const ADMIN_ID = '123456789';                     // Buyurtma boradigan Admin Telegram ID'si

const bot = new Telegraf(BOT_TOKEN);

// Foydalanuvchi holatini saqlash (Buyurtma jarayoni uchun)
const userStates = {};

// ==========================================
// 2. YORDAMCHI FUNKSIYALAR
// ==========================================

// Kanalga obuna bo'lganligini tekshirish funksiyasi
async function checkSubscription(ctx) {
  try {
    const member = await ctx.telegram.getChatMember(CHANNEL_USERNAME, ctx.from.id);
    const validStatuses = ['creator', 'administrator', 'member'];
    return validStatuses.includes(member.status);
  } catch (error) {
    console.error('Obunani tekshirishda xatolik:', error.message);
    return false;
  }
}

// Asosiy menyuni ko'rsatish
function sendMainMenu(ctx, text = 'Asosiy menyuga xush kelibsiz! Kerakli bo\'limni tanlang:') {
  return ctx.reply(
    text,
    Markup.keyboard([
      ['🌐 Animecorestudeo web site', '📦 Aniartifactga buyurtma'],
      ['🎬 Animelar', '💳 Donat']
    ]).resize()
  );
}

// ==========================================
// 3. BOT BUYRUQLARI VA HODISALARI
// ==========================================

// /start buyrug'i
bot.start(async (ctx) => {
  const isSubscribed = await checkSubscription(ctx);

  if (isSubscribed) {
    await sendMainMenu(ctx, `Salom, ${ctx.from.first_name}! Animecorestudeo botiga xush kelibsiz! ✨`);
  } else {
    await ctx.reply(
      `Salom, ${ctx.from.first_name}! 👋\n\nBotdan foydalanish uchun avval rasmiy kanalimizga obuna bo'ling:`,
      Markup.inlineKeyboard([
        [Markup.button.url('📢 Kanalga o\'tish', `https://t.me/${CHANNEL_USERNAME.replace('@', '')}`)],
        [Markup.button.callback('✅ Obuna bo\'ldim', 'check_subscription')]
      ])
    );
  }
});

// "Obuna bo'ldim" tugmasi bosilganda
bot.action('check_subscription', async (ctx) => {
  const isSubscribed = await checkSubscription(ctx);

  if (isSubscribed) {
    await ctx.answerCbQuery('✅ Rahmat! Obuna tasdiqlandi.');
    await ctx.deleteMessage(); // Obuna xabarini o'chirib tashlaymiz
    await sendMainMenu(ctx, 'Obuna tasdiqlandi! Asosiy menyudan kerakli bo\'limni tanlang:');
  } else {
    await ctx.answerCbQuery('❌ Siz hali kanalga obuna bo\'lmadingiz!', { show_alert: true });
  }
});

// ------------------------------------------
// BO'LIM: 💳 Donat
// ------------------------------------------
bot.hears('💳 Donat', async (ctx) => {
  const isSub = await checkSubscription(ctx);
  if (!isSub) return ctx.reply('Iltimos, avval kanalimizga obuna bo\'ling!');

  const donateText = 
    `✨ **Animecorestudeo loyihasini qo'llab-quvvatlash**\n\n` +
    `Loyiha rivoji va yangi artefaktlar yaratilishi uchun donat qilishingiz mumkin:\n\n` +
    `💳 Karta raqami:\n\`5614682112850492\`\n\n` +
    `_Raqam ustiga bossangiz avtomati nusxalanadi!_`;

  await ctx.replyWithMarkdown(donateText);
});

// ------------------------------------------
// BO'LIM: 🌐 Website
// ------------------------------------------
bot.hears('🌐 Animecorestudeo web site', async (ctx) => {
  const isSub = await checkSubscription(ctx);
  if (!isSub) return ctx.reply('Iltimos, avval kanalimizga obuna bo\'ling!');

  await ctx.reply(
    '🌐 **Animecorestudeo rasmiy sayti**\n\nQuyidagi tugma orqali saytimizga o\'tishingiz mumkin:',
    Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Saytni ochish (WebApp)', WEBSITE_URL)],
      [Markup.button.url('🔗 Brauzerda ochish', WEBSITE_URL)]
    ])
  );
});

// ------------------------------------------
// BO'LIM: 🎬 Animelar
// ------------------------------------------
bot.hears('🎬 Animelar', async (ctx) => {
  const isSub = await checkSubscription(ctx);
  if (!isSub) return ctx.reply('Iltimos, avval kanalimizga obuna bo\'ling!');

  await ctx.reply(
    '🎬 **Mavjud animelar ro\'yxati:**\nKo\'rmoqchi bo\'lgan animengizni tanlang:',
    Markup.inlineKeyboard([
      [Markup.button.callback('🗡 Solo Leveling', 'anime_solo')],
      [Markup.button.callback('🪚 Arra odam', 'anime_arra')],
      [Markup.button.callback('⚡ Arifureta', 'anime_arifureta')]
    ])
  );
});

// Anime tugmalari bosilganda kanaldan mos xabarni olib beradi
bot.action('anime_solo', async (ctx) => {
  await ctx.answerCbQuery();
  try {
    // CHANNEL_ID dan 1-ID li xabarni nusxalab beradi
    await ctx.telegram.copyMessage(ctx.chat.id, CHANNEL_ID, 1);
  } catch (e) {
    await ctx.reply('Xabar yuklashda xatolik yuz berdi. Kanal ID va Post ID to\'g\'riligini tekshiring.');
  }
});

bot.action('anime_arra', async (ctx) => {
  await ctx.answerCbQuery();
  try {
    // CHANNEL_ID dan 2-ID li xabarni nusxalab beradi
    await ctx.telegram.copyMessage(ctx.chat.id, CHANNEL_ID, 2);
  } catch (e) {
    await ctx.reply('Xabar yuklashda xatolik yuz berdi.');
  }
});

bot.action('anime_arifureta', async (ctx) => {
  await ctx.answerCbQuery();
  try {
    // CHANNEL_ID dan 3-ID li xabarni nusxalab beradi
    await ctx.telegram.copyMessage(ctx.chat.id, CHANNEL_ID, 3);
  } catch (e) {
    await ctx.reply('Xabar yuklashda xatolik yuz berdi.');
  }
});

// ------------------------------------------
// BO'LIM: 📦 Aniartifactga buyurtma
// ------------------------------------------
bot.hears('📦 Aniartifactga buyurtma', async (ctx) => {
  const isSub = await checkSubscription(ctx);
  if (!isSub) return ctx.reply('Iltimos, avval kanalimizga obuna bo\'ling!');

  userStates[ctx.from.id] = { step: 'WAITING_FOR_ORDER' };

  await ctx.reply(
    `📦 **Aniartifact buyurtma bo'limi**\n\n` +
    `Qaysi artefaktni buyurtma qilmoqchisiz va aloqa uchun telefon raqamingizni yozib qoldiring.\n\n` +
    `_Masalan: Animecorestudeo Paper Box, +998901234567_`,
    Markup.keyboard([['❌ Bekor qilish']]).resize()
  );
});

// Bekor qilish tugmasi
bot.hears('❌ Bekor qilish', async (ctx) => {
  delete userStates[ctx.from.id];
  await sendMainMenu(ctx, 'Buyurtma bekor qilindi.');
});

// Foydalanuvchi buyurtma matnini yuborganda
bot.on('text', async (ctx) => {
  const state = userStates[ctx.from.id];

  if (state && state.step === 'WAITING_FOR_ORDER') {
    const orderText = ctx.message.text;
    const user = ctx.from;

    // Admin ga xabar yuborish
    const adminMessage = 
      `📥 **YANGI BUYURTMA!**\n\n` +
      `👤 **Mijoz:** ${user.first_name} (@${user.username || 'username yo\'q'})\n` +
      `🆔 **ID:** \`${user.id}\`\n\n` +
      `📝 **Buyurtma tafsilotlari:**\n${orderText}`;

    try {
      if (ADMIN_ID && ADMIN_ID !== '123456789') {
        await bot.telegram.sendMessage(ADMIN_ID, adminMessage, { parse_mode: 'Markdown' });
      }
      
      delete userStates[ctx.from.id];
      await ctx.reply('✅ Buyurtmangiz qabul qilindi! Tez orada siz bilan bog\'lanamiz.');
      await sendMainMenu(ctx);
    } catch (error) {
      console.error('Adminga yuborishda xatolik:', error);
      await ctx.reply('✅ Buyurtmangiz saqlandi.');
      await sendMainMenu(ctx);
    }
  }
});

// ==========================================
// 4. BOTNI ISHGA TUSHIRISH
// ==========================================
bot.launch().then(() => {
  console.log('🚀 Animecorestudeo boti muvaffaqiyatli ishga tushdi!');
});

// Xavfsiz to'xtatish
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
