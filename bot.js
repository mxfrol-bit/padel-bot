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

// Функция логирования в Supabase
async function logToSupabase(source, userName, username, chatId, action, message = null) {
  try {
    const { data, error } = await supabase
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
    } else {
      console.log('✅ Logged to Supabase:', action);
    }
  } catch (err) {
    console.error('Supabase connection error:', err);
  }
}

// Главное меню
const mainMenu = {
  inline_keyboard: [
    [{ text: '📅 Забронировать корт', url: 'https://n1488777.yclients.com/' }],
    [{ text: 'ℹ️ Что такое падел?', callback_data: 'about' }],
    [{ text: '🎾 Пробное занятие', callback_data: 'trial_general' }],
    [{ text: '📞 Связаться', callback_data: 'contacts' }]
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
    welcomeMessage = `Здравствуйте, ${userName}! 👋

Вы узнали о нас из листовки? Отлично! 

🎾 *Падел* — это микс тенниса и сквоша
Играют парами, правила простые
Даже если никогда не держали ракетку — всё получится!

Что вас интересует?`;
    
    keyboard = {
      inline_keyboard: [
        [{ text: '🎾 Пробное занятие (1500₽)', callback_data: 'trial_general' }],
        [{ text: '👥 Вечерние игры', callback_data: 'evening' }],
        [{ text: 'ℹ️ Что такое падел?', callback_data: 'about' }],
        [{ text: '📞 Связаться', callback_data: 'contacts' }]
      ]
    };
    
    await bot.sendMessage(ADMIN_CHAT_ID, `🔔 Новый лид из ОБЩЕЙ листовки!\nИмя: ${userName}\nChat ID: ${chatId}`);
  } 
  
  // СЕМЕЙНАЯ ЛИСТОВКА
  else if (startParam === 'flyer_family') {
    source = 'flyer_family';
    welcomeMessage = `Здравствуйте, ${userName}! 👋

Рады, что заинтересовались семейным паделом! 👨‍👩‍👧

🎾 *Падел безопасен для детей от 6 лет:*
- Мягкий мяч
- Закрытый корт
- Тренер всё покажет

Можем предложить:`;
    
    keyboard = {
      inline_keyboard: [
        [{ text: '👨‍👩‍👧 Семейное занятие', callback_data: 'trial_family' }],
        [{ text: '🧍 Сначала попробую сам(а)', callback_data: 'trial_adult' }],
        [{ text: 'ℹ️ Что такое падел?', callback_data: 'about' }],
        [{ text: '📞 Связаться', callback_data: 'contacts' }]
      ]
    };
    
    await bot.sendMessage(ADMIN_CHAT_ID, `🔔 Новый лид из СЕМЕЙНОЙ листовки!\nИмя: ${userName}\nChat ID: ${chatId}`);
  }
  
  // ОБЫЧНЫЙ ЗАХОД
  else {
    source = 'direct';
    welcomeMessage = `Привет, ${userName}! 👋

Я бот клуба *Падел 10/20* 🎾

📍 Московское шоссе, 105к10
⏰ Работаем ежедневно 8:00-23:00

Чем могу помочь?`;
    
    keyboard = mainMenu;
  }
  
  // Логируем в Supabase
  await logToSupabase(source, userName, username, chatId, 'start', null);
  
  await bot.sendMessage(chatId, welcomeMessage, {
    reply_markup: keyboard,
    parse_mode: 'Markdown'
  });
});

// Обработка кнопок
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const userName = query.from.first_name || 'Друг';
  const username = query.from.username || 'no_username';
  
  // Логируем действие
  await logToSupabase('callback', userName, username, chatId, data, null);
  
  // Главное меню
  if (data === 'main_menu') {
    await bot.editMessageText(
      `Привет, ${userName}! 👋\n\nЯ бот клуба *Падел 10/20* 🎾\n\n📍 Московское шоссе, 105к10\n⏰ Работаем ежедневно 8:00-23:00\n\nЧем могу помочь?`,
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: mainMenu
      }
    );
  }
  
  // Контакты
  else if (data === 'contacts') {
    await bot.editMessageText(
      `📞 *Контакты Падел 10/20*\n\n` +
      `☎️ Телефон: ${PHONE}\n` +
      `🌐 Сайт: ${WEBSITE}\n` +
      `💬 Чат клуба: присоединяйтесь!\n\n` +
      `📍 Адрес: Московское шоссе, 105к10\n` +
      `⏰ Ежедневно 8:00-23:00`,
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📱 Позвонить', url: `tel:${PHONE.replace(/[^\d+]/g, '')}` }],
            [{ text: '🌐 Открыть сайт', url: WEBSITE }],
            [{ text: '💬 Чат клуба', url: CHAT_LINK }],
            [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
          ]
        }
      }
    );
    
    await bot.sendMessage(ADMIN_CHAT_ID, `📞 Пользователь ${userName} (@${username}) открыл контакты`);
  }
  
  // Пробное занятие (общее)
  else if (data === 'trial_general') {
    await bot.editMessageText(
      `Отлично! Пробное занятие с тренером 🎾\n\n📅 *Доступные дни (будни):*\nПонедельник-пятница: 10:00-17:00\nСтоимость: 1500₽ с человека\n\n📝 Для записи напишите:\n1️⃣ Ваше имя\n2️⃣ Телефон\n3️⃣ Удобный день и время\n4️⃣ Сколько человек?\n\nИли позвоните: ${PHONE}`,
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📱 Позвонить', url: `tel:${PHONE.replace(/[^\d+]/g, '')}` }],
            [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
          ]
        }
      }
    );
  }
  
  // Семейное занятие
  else if (data === 'trial_family') {
    await bot.editMessageText(
      `Замечательно! Семейное занятие 👨‍👩‍👧\n\n📋 Для записи напишите:\n1️⃣ Ваше имя\n2️⃣ Телефон\n3️⃣ Сколько взрослых и детей?\n4️⃣ Возраст детей\n5️⃣ Удобный день и время\n\nИли позвоните: ${PHONE}`,
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📱 Позвонить', url: `tel:${PHONE.replace(/[^\d+]/g, '')}` }],
            [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
          ]
        }
      }
    );
  }
  
  // Взрослый сначала
  else if (data === 'trial_adult') {
    await bot.editMessageText(
      `Хорошая идея! Сначала попробуете сами 🎾\n\n📝 Для записи напишите:\n1️⃣ Ваше имя\n2️⃣ Телефон\n3️⃣ Удобный день и время\n\nИли позвоните: ${PHONE}`,
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📱 Позвонить', url: `tel:${PHONE.replace(/[^\d+]/g, '')}` }],
            [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
          ]
        }
      }
    );
  }
  
  // Вечерние игры
  else if (data === 'evening') {
    await bot.editMessageText(
      `Вечерние игры 🌙\n\n🕐 18:00-23:00 — прайм-тайм\nАренда корта: уточняйте по телефону\n\n☎️ ${PHONE}`,
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📱 Позвонить', url: `tel:${PHONE.replace(/[^\d+]/g, '')}` }],
            [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
          ]
        }
      }
    );
  }
  
  // Что такое падел
  else if (data === 'about') {
    await bot.editMessageText(
      `*Что такое падел?* 🎾\n\nПадел — это микс большого тенниса и сквоша:\n• Играют парами на закрытом корте\n• Корт окружён стенами (мяч отскакивает от них)\n• Ракетки без струн, лёгкие\n• Мяч как теннисный, но мягче\n\n*Почему это круто:*\n✅ Легко начать с нуля\n✅ Много движения, мало травм\n✅ Весело в компании\n✅ Можно в любую погоду (крытые корты)\n\nБольше на сайте: ${WEBSITE}`,
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🎾 Записаться на пробное', callback_data: 'trial_general' }],
            [{ text: '🌐 Открыть сайт', url: WEBSITE }],
            [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
          ]
        }
      }
    );
  }
  
  await bot.answerCallbackQuery(query.id);
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
    `Спасибо за сообщение! 📝\n\n` +
    `Администратор свяжется с вами в ближайшее время.\n\n` +
    `Или звоните сами: ${PHONE}\n\n` +
    `📍 Падел 10/20\n` +
    `Московское шоссе, 105к10\n` +
    `⏰ 8:00-23:00 ежедневно`, 
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📱 Позвонить', url: `tel:${PHONE.replace(/[^\d+]/g, '')}` }],
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

console.log('🎾 Бот Падел 10/20 запущен с Supabase!');
