import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const ADMIN_CHAT_ID = '562890944';
const PHONE = '8 (920) 048-22-72';
const WEBSITE = 'https://padel1020.ru';
const CHAT_LINK = 'https://t.me/+CRrPn7qJB3phNDUy';
const BOOKING_LINK = 'https://n1488777.yclients.com/';

// Функция логирования в Supabase
async function logToSupabase(source, userName, username, chatId, action, message = null) {
  try {
    const { error } = await supabase
      .from('leads')
      .insert([
        {
          source: source,
          user_name: userName,
          username: username,
          chat_id: chatId.toString(),
          action: action,
          message: message
        }
      ]);
    
    if (error) {
      console.error('Supabase error:', error);
    }
  } catch (err) {
    console.error('Supabase connection error:', err);
  }
}

// Главное меню
const mainMenu = {
  inline_keyboard: [
    [{ text: '🎾 Пробное занятие', callback_data: 'trial_start' }],
    [{ text: '💳 Абонементы', callback_data: 'subscriptions' }],
    [{ text: 'ℹ️ Что такое падел?', callback_data: 'about_start' }],
    [{ text: '📞 Контакты', callback_data: 'contacts' }]
  ]
};

// Обработка /start
bot.onText(/\/start(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const startParam = match[1].trim();
  const userName = msg.from.first_name || 'Друг';
  const username = msg.from.username || 'no_username';
  
  let welcomeMessage = '';
  let keyboard = {};
  let source = 'direct';
  
  // ОБЩАЯ ЛИСТОВКА
  if (startParam === 'flyer_general') {
    source = 'flyer_general';
    welcomeMessage = `Привет, ${userName}! 👋

Отлично, что заглянули по листовке! 

Падел — это спорт который захватил Европу и Латинскую Америку. Сейчас он приходит в Россию, и вы можете стать одними из первых!

🎾 Почему падел — это круто:
- Легко начать (научитесь за 1 занятие)
- Активная нагрузка без перегрузок
- Играют парами — социально и весело
- Любая погода (крытые корты)

Хотите попробовать?`;
    
    keyboard = {
      inline_keyboard: [
        [{ text: '🎾 Да, хочу попробовать!', callback_data: 'trial_start' }],
        [{ text: '💳 Сразу смотрю абонементы', callback_data: 'subscriptions' }],
        [{ text: 'ℹ️ Расскажите подробнее', callback_data: 'about_start' }]
      ]
    };
    
    await bot.sendMessage(ADMIN_CHAT_ID, `🔔 Новый лид из ОБЩЕЙ листовки!\nИмя: ${userName}\nChat ID: ${chatId}`);
  } 
  
  // СЕМЕЙНАЯ ЛИСТОВКА
  else if (startParam === 'flyer_family') {
    source = 'flyer_family';
    welcomeMessage = `Привет, ${userName}! 👋

Здорово, что интересуетесь семейным спортом! 👨‍👩‍👧

Падел — идеальный вариант для всей семьи:
✅ Дети от 6 лет легко осваивают
✅ Безопасно (мягкий мяч, закрытый корт)
✅ Родители и дети играют ВМЕСТЕ
✅ Развивает координацию и реакцию
✅ Альтернатива гаджетам

Многие наши клиенты говорят: "Наконец-то нашли активность, которая нравится ВСЕЙ семье!"

Что вас интересует?`;
    
    keyboard = {
      inline_keyboard: [
        [{ text: '👨‍👩‍👧 Семейное занятие', callback_data: 'trial_family' }],
        [{ text: '💳 Семейные абонементы', callback_data: 'family_subscriptions' }],
        [{ text: '🧍 Сначала попробую сам', callback_data: 'trial_start' }]
      ]
    };
    
    await bot.sendMessage(ADMIN_CHAT_ID, `🔔 Новый лид из СЕМЕЙНОЙ листовки!\nИмя: ${userName}\nChat ID: ${chatId}`);
  }
  
  // ОБЫЧНЫЙ ЗАХОД
  else {
    source = 'direct';
    welcomeMessage = `Привет, ${userName}! 👋

Добро пожаловать в Падел 10/20 🎾

Мы — первый премиальный падел-клуб в Нижнем Новгороде.

Падел — это новый вид спорта, который взорвал Европу. Представьте теннис + сквош = адреналин, азарт и классная компания!

Что хотите узнать?`;
    
    keyboard = mainMenu;
  }
  
  // Логируем в Supabase
  await logToSupabase(source, userName, username, chatId, 'start', null);
  
  await bot.sendMessage(chatId, welcomeMessage, {
    reply_markup: keyboard
  });
});

// Обработка кнопок
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const data = query.data;
  const userName = query.from.first_name || 'Друг';
  const username = query.from.username || 'no_username';
  
  // Логируем действие
  await logToSupabase('callback', userName, username, chatId, data, null);
  
  try {
    // ========== ГЛАВНОЕ МЕНЮ ==========
    if (data === 'main_menu') {
      await bot.editMessageText(
        `Привет, ${userName}! 👋\n\nЯ бот клуба Падел 10/20 🎾\n\n📍 Московское шоссе, 105к10\n⏰ Работаем ежедневно 8:00-23:00\n\nЧто хотите узнать?`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: mainMenu
        }
      );
    }
    
    // ========== КОНТАКТЫ ==========
    else if (data === 'contacts') {
      await bot.editMessageText(
        `📞 Контакты Падел 10/20\n\n` +
        `☎️ Телефон: ${PHONE}\n` +
        `🌐 Сайт: ${WEBSITE}\n` +
        `💬 Чат клуба (найдите партнёров для игры)\n\n` +
        `📍 Адрес: Московское шоссе, 105к10\n` +
        `🚗 Бесплатная парковка\n` +
        `⏰ Ежедневно 8:00-23:00\n\n` +
        `Звоните или пишите — ответим на все вопросы!`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '🌐 Открыть сайт', url: WEBSITE }],
              [{ text: '💬 Чат клуба', url: CHAT_LINK }],
              [{ text: '📅 Забронировать корт', url: BOOKING_LINK }],
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ]
          }
        }
      );
      
      await bot.sendMessage(ADMIN_CHAT_ID, `📞 Пользователь ${userName} (@${username}) открыл контакты`);
    }
    
    // ========== ЧТО ТАКОЕ ПАДЕЛ (воронка) ==========
    else if (data === 'about_start') {
      await bot.editMessageText(
        `Что такое падел? 🎾\n\n` +
        `Падел — это микс тенниса и сквоша.\n\n` +
        `Играют парами на корте, окружённом стенами. Мяч отскакивает от стен — это добавляет драйва и тактики!\n\n` +
        `Родился в Мексике в 1960-х, взорвал Испанию в 90-х, сейчас №1 спорт в Аргентине.\n\n` +
        `В Европе 20+ миллионов игроков. В России только начинается — будьте в числе первых!`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '👍 Понятно, а что мне даст?', callback_data: 'about_benefits' }],
              [{ text: '🎾 Хочу попробовать!', callback_data: 'trial_start' }],
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ]
          }
        }
      );
    }
    
    else if (data === 'about_benefits') {
      await bot.editMessageText(
        `Почему падел — это ВАШ спорт? 💪\n\n` +
        `1️⃣ Быстрый старт\n` +
        `Научитесь играть за ОДНО занятие. Не нужно месяцами отрабатывать технику как в теннисе.\n\n` +
        `2️⃣ Нагрузка + безопасность\n` +
        `Сжигаете 600-800 ккал за час, но нет ударных нагрузок на колени.\n\n` +
        `3️⃣ Социальность\n` +
        `Играют парами — легко найти компанию. У нас чат клуба, где ищут партнёров!\n\n` +
        `4️⃣ Всесезонность\n` +
        `Крытые корты — играете круглый год.\n\n` +
        `5️⃣ Азарт\n` +
        `Быстрые розыгрыши, тактика, адреналин — не заметите как пролетит час!`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔥 Убедили! Записываюсь', callback_data: 'trial_start' }],
              [{ text: '🤔 А это сложно?', callback_data: 'about_difficulty' }],
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ]
          }
        }
      );
    }
    
    else if (data === 'about_difficulty') {
      await bot.editMessageText(
        `Это легко? Конечно! 😊\n\n` +
        `Падел создан так, чтобы в него могли играть ВСЕ:\n\n` +
        `👶 Дети от 6 лет\n` +
        `Наши юные игроки осваивают за 2-3 занятия.\n\n` +
        `👨 Новички 25-45 лет\n` +
        `Большинство играют в своё удовольствие уже с первой игры.\n\n` +
        `👵 Возраст 50+\n` +
        `Много клиентов 50-60 лет. Нагрузку регулируете сами.\n\n` +
        `💡 Секрет: парная игра и стены делают падел доступным для любого уровня!`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '🎾 Записаться на пробное', callback_data: 'trial_start' }],
              [{ text: '💳 Смотреть абонементы', callback_data: 'subscriptions' }],
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ]
          }
        }
      );
    }
    
    // ========== ПРОБНОЕ ЗАНЯТИЕ (воронка) ==========
    else if (data === 'trial_start') {
      await bot.editMessageText(
        `Пробное занятие с тренером 🎾\n\n` +
        `Что входит:\n` +
        `✅ 1 час игры с профессиональным тренером\n` +
        `✅ Обучение базовым техникам\n` +
        `✅ Ракетки и мячи предоставляем\n` +
        `✅ Душ и раздевалка\n\n` +
        `📅 Когда удобно:\n` +
        `Будни 10:00-17:00 — 1500₽/чел\n` +
        `Вечера и выходные — 2000₽/чел\n\n` +
        `💰 Почему стоит попробовать сейчас?\n` +
        `После пробного — скидка 20% на первый абонемент!`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '📝 Записаться на пробное', callback_data: 'trial_book' }],
              [{ text: '🤔 Что нужно иметь с собой?', callback_data: 'trial_what_bring' }],
              [{ text: '💳 Сразу смотрю абонементы', callback_data: 'subscriptions' }],
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ]
          }
        }
      );
    }
    
    else if (data === 'trial_what_bring') {
      await bot.editMessageText(
        `Что взять на занятие? 👟\n\n` +
        `Нужно:\n` +
        `✅ Спортивная одежда\n` +
        `✅ Кроссовки с нескользящей подошвой\n` +
        `✅ Вода (есть кулер в клубе)\n\n` +
        `НЕ нужно:\n` +
        `❌ Ракетки (выдаём бесплатно)\n` +
        `❌ Мячи (предоставляем)\n` +
        `❌ Полотенце (есть в раздевалке)\n\n` +
        `💡 Совет: приходите за 10 минут до занятия, чтобы переодеться и освоиться.`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '📝 Отлично, записываюсь!', callback_data: 'trial_book' }],
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ]
          }
        }
      );
    }
    
    else if (data === 'trial_book') {
      await bot.editMessageText(
        `Запись на пробное занятие 📝\n\n` +
        `Напишите сообщением:\n` +
        `1️⃣ Ваше имя\n` +
        `2️⃣ Телефон\n` +
        `3️⃣ Удобный день и время\n` +
        `4️⃣ Сколько человек?\n\n` +
        `Пример:\n` +
        `"Владимир\n${PHONE}\nЗавтра в 18:00\n2 человека"\n\n` +
        `Или позвоните: ${PHONE}`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '📅 Онлайн-бронирование', url: BOOKING_LINK }],
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ]
          }
        }
      );
      
      await bot.sendMessage(ADMIN_CHAT_ID, `🎾 ${userName} (@${username}) хочет записаться на пробное!`);
    }
    
    // ========== СЕМЕЙНОЕ ПРОБНОЕ ==========
    else if (data === 'trial_family') {
      await bot.editMessageText(
        `Семейное занятие 👨‍👩‍👧\n\n` +
        `Что входит:\n` +
        `✅ 1 час игры с тренером для всей семьи\n` +
        `✅ Обучение детей и взрослых\n` +
        `✅ Ракетки для детей и взрослых\n` +
        `✅ Весёлая атмосфера\n\n` +
        `💰 Цена:\n` +
        `2 взрослых + 1 ребёнок = 3500₽\n` +
        `2 взрослых + 2 детей = 4500₽\n\n` +
        `🎁 Бонус: после занятия — семейная фотосессия на корте!`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '📝 Записаться', callback_data: 'trial_book' }],
              [{ text: '💳 Семейные абонементы', callback_data: 'family_subscriptions' }],
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ]
          }
        }
      );
    }
    
    // ========== АБОНЕМЕНТЫ (воронка продаж) ==========
    else if (data === 'subscriptions') {
      await bot.editMessageText(
        `Абонементы Падел 10/20 💳\n\n` +
        `Зачем абонемент?\n` +
        `✅ Экономия до 40% от разовой аренды\n` +
        `✅ Приоритетное бронирование\n` +
        `✅ Доступ в чат клуба\n` +
        `✅ Участие в турнирах\n\n` +
        `Выберите что подходит:`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '🎾 Индивидуальные', callback_data: 'sub_individual' }],
              [{ text: '👥 Парные', callback_data: 'sub_pair' }],
              [{ text: '👨‍👩‍👧 Семейные', callback_data: 'family_subscriptions' }],
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ]
          }
        }
      );
    }
    
    else if (data === 'sub_individual') {
      await bot.editMessageText(
        `Индивидуальные абонементы 🎾\n\n` +
        `💎 СТАРТОВЫЙ (4 часа)\n` +
        `6000₽ = 1500₽/час\n` +
        `Срок: 30 дней\n` +
        `Для: знакомство с паделом\n\n` +
        `🔥 АКТИВНЫЙ (8 часов)\n` +
        `10400₽ = 1300₽/час (экономия 1600₽!)\n` +
        `Срок: 30 дней\n` +
        `Для: регулярные игры 2 раза в неделю\n\n` +
        `⭐ ПРЕМИУМ (12 часов)\n` +
        `14400₽ = 1200₽/час (экономия 3600₽!)\n` +
        `Срок: 45 дней\n` +
        `Для: фанатов падела\n` +
        `Бонус: 1 час персональной тренировки БЕСПЛАТНО!\n\n` +
        `🎁 Первый абонемент со скидкой 15%!`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '💳 Купить абонемент', callback_data: 'sub_buy' }],
              [{ text: '🤔 Чем отличаются?', callback_data: 'sub_compare' }],
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ]
          }
        }
      );
    }
    
    else if (data === 'sub_pair') {
      await bot.editMessageText(
        `Парные абонементы 👥\n\n` +
        `Играете с постоянным партнёром? Берите парный абонемент!\n\n` +
        `🔥 ДУО-СТАРТОВЫЙ (8 часов на двоих)\n` +
        `10000₽ = 1250₽/час на двоих (625₽/чел)\n` +
        `Экономия: 2000₽\n\n` +
        `⭐ ДУО-АКТИВНЫЙ (16 часов на двоих)\n` +
        `18000₽ = 1125₽/час на двоих (562₽/чел)\n` +
        `Экономия: 5000₽\n\n` +
        `💡 Почему парный:\n` +
        `• Дешевле чем два индивидуальных\n` +
        `• Всегда есть с кем играть\n` +
        `• Развиваете командную тактику\n\n` +
        `🎁 Скидка 20% на первый абонемент!`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '💳 Купить парный', callback_data: 'sub_buy' }],
              [{ text: '🎾 Индивидуальные', callback_data: 'sub_individual' }],
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ]
          }
        }
      );
    }
    
    else if (data === 'family_subscriptions') {
      await bot.editMessageText(
        `Семейные абонементы 👨‍👩‍👧\n\n` +
        `🌟 СЕМЬЯ-СТАРТ (8 часов)\n` +
        `12000₽\n` +
        `Для: 2 взрослых + 2 детей\n` +
        `= 1500₽/час для всей семьи!\n\n` +
        `⭐ СЕМЬЯ-АКТИВ (16 часов)\n` +
        `20000₽ (экономия 4000₽!)\n` +
        `Для: 2 взрослых + 2 детей\n` +
        `Срок: 60 дней\n\n` +
        `🎁 В подарок:\n` +
        `• Детские ракетки на время абонемента\n` +
        `• Сертификат на семейную фотосессию\n` +
        `• Скидка 50% на день рождения ребёнка в клубе\n\n` +
        `💡 Это 400-500₽/час/чел — дешевле чем кино!`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '💳 Купить семейный', callback_data: 'sub_buy' }],
              [{ text: '🎾 Другие абонементы', callback_data: 'subscriptions' }],
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ]
          }
        }
      );
    }
    
    else if (data === 'sub_compare') {
      await bot.editMessageText(
        `Какой абонемент выбрать? 🤔\n\n` +
        `СТАРТОВЫЙ (4 часа) — если:\n` +
        `• Вы новичок\n` +
        `• Хотите попробовать регулярно\n` +
        `• Играете 1 раз в неделю\n\n` +
        `АКТИВНЫЙ (8 часов) — если:\n` +
        `• Уже поиграли и понравилось\n` +
        `• Хотите играть 2 раза в неделю\n` +
        `• Нужна максимальная экономия\n\n` +
        `ПРЕМИУМ (12 часов) — если:\n` +
        `• Падел стал вашим хобби\n` +
        `• Играете 3+ раз в неделю\n` +
        `• Хотите персональные тренировки\n\n` +
        `💡 Совет: 80% клиентов берут АКТИВНЫЙ — оптимальный баланс цены и частоты игр!`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '💳 Выбрать абонемент', callback_data: 'sub_individual' }],
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ]
          }
        }
      );
    }
    
    else if (data === 'sub_buy') {
      await bot.editMessageText(
        `Покупка абонемента 💳\n\n` +
        `Способы покупки:\n\n` +
        `1️⃣ Онлайн (рекомендуем):\n` +
        `Забронируйте через сайт — оплата картой, абонемент активируется сразу.\n\n` +
        `2️⃣ В клубе:\n` +
        `Приезжайте по адресу:\n` +
        `Московское шоссе, 105к10\n` +
        `Оплата наличными или картой.\n\n` +
        `3️⃣ По телефону:\n` +
        `Позвоните ${PHONE}\n` +
        `Забронируем абонемент, отправим реквизиты.\n\n` +
        `🎁 Акция: Первый абонемент со скидкой 15%!\n` +
        `Просто напишите промокод: ПЕРВЫЙ`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '🌐 Купить на сайте', url: WEBSITE }],
              [{ text: '💬 Написать менеджеру', callback_data: 'write_manager' }],
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ]
          }
        }
      );
      
      await bot.sendMessage(ADMIN_CHAT_ID, `💳 ${userName} (@${username}) хочет купить абонемент!`);
    }
    
    else if (data === 'write_manager') {
      await bot.editMessageText(
        `Связь с менеджером 💬\n\n` +
        `Напишите сообщением:\n` +
        `1️⃣ Ваше имя\n` +
        `2️⃣ Телефон\n` +
        `3️⃣ Какой абонемент интересует\n\n` +
        `Менеджер свяжется с вами в течение 15 минут!\n\n` +
        `Или позвоните: ${PHONE}`,
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ]
          }
        }
      );
    }
    
    await bot.answerCallbackQuery(query.id);
    
  } catch (error) {
    console.error('Callback error:', error.message);
    try {
      await bot.answerCallbackQuery(query.id, {
        text: 'Произошла ошибка, попробуйте снова',
        show_alert: false
      });
    } catch (e) {
      console.error('Answer callback error:', e.message);
    }
  }
});

// Обработка текстовых сообщений
const processedMessages = new Set();

bot.on('text', async (msg) => {
  // Пропускаем команды
  if (msg.text.startsWith('/')) return;
  
  // Пропускаем уже обработанные сообщения
  const msgKey = `${msg.chat.id}_${msg.message_id}`;
  if (processedMessages.has(msgKey)) return;
  processedMessages.add(msgKey);
  
  // Чистим кеш
  if (processedMessages.size > 100) {
    const arr = Array.from(processedMessages);
    processedMessages.clear();
    arr.slice(-50).forEach(key => processedMessages.add(key));
  }
  
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'Пользователь';
  const username = msg.from.username || 'no_username';
  const userMessage = msg.text;
  
  // Логируем сообщение
  await logToSupabase('message', userName, username, chatId, 'text_message', userMessage);
  
  // Отвечаем пользователю
  await bot.sendMessage(chatId, 
    `Спасибо за сообщение, ${userName}! 📝\n\n` +
    `Администратор свяжется с вами в ближайшее время.\n\n` +
    `📞 Или звоните: ${PHONE}\n\n` +
    `📍 Падел 10/20\n` +
    `Московское шоссе, 105к10\n` +
    `⏰ 8:00-23:00 ежедневно`, 
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
        ]
      }
    }
  );
  
  // Уведомляем админа
  await bot.sendMessage(ADMIN_CHAT_ID, 
    `📩 Новое сообщение от клиента\n\n` +
    `Имя: ${userName} (@${username})\n` +
    `Сообщение:\n${userMessage}`
  );
});

console.log('🎾 Бот Падел 10/20 запущен!');
