import TelegramBot from 'node-telegram-bot-api';

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const ADMIN_CHAT_ID = '562890944';

// Обработка /start
bot.onText(/\/start(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const startParam = match[1].trim();
  const userName = msg.from.first_name || 'Друг';
  
  let welcomeMessage = '';
  let keyboard = {};
  
  // ОБЩАЯ ЛИСТОВКА
  if (startParam === 'flyer_general') {
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
        [{ text: '📞 Позвоните мне', callback_data: 'callback' }]
      ]
    };
    
    await bot.sendMessage(ADMIN_CHAT_ID, `🔔 Новый лид из ОБЩЕЙ листовки!\nИмя: ${userName}\nChat ID: ${chatId}`);
  } 
  
  // СЕМЕЙНАЯ ЛИСТОВКА
  else if (startParam === 'flyer_family') {
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
        [{ text: '📞 Позвоните мне', callback_data: 'callback' }]
      ]
    };
    
    await bot.sendMessage(ADMIN_CHAT_ID, `🔔 Новый лид из СЕМЕЙНОЙ листовки!\nИмя: ${userName}\nChat ID: ${chatId}`);
  }
  
  // ОБЫЧНЫЙ ЗАХОД
  else {
    welcomeMessage = `Привет, ${userName}! 👋

Я бот клуба *Падел 10/20* 🎾

📍 Московское шоссе, 105к10
⏰ Работаем ежедневно 8:00-23:00

Чем могу помочь?`;
    
    keyboard = {
      inline_keyboard: [
        [{ text: '📅 Забронировать корт', url: 'https://n943508.yclients.com/' }],
        [{ text: 'ℹ️ Что такое падел?', callback_data: 'about' }],
        [{ text: '📞 Связаться', callback_data: 'callback' }]
      ]
    };
  }
  
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
  
  if (data === 'trial_general') {
    await bot.sendMessage(chatId, `Отлично! Пробное занятие с тренером 🎾

📅 *Доступные дни (будни):*
Понедельник-пятница: 10:00-17:00
Стоимость: 1500₽ с человека

📝 Для записи напишите:
1️⃣ Ваше имя
2️⃣ Телефон
3️⃣ Удобный день и время
4️⃣ Сколько человек?

Или нажмите "Позвоните мне" 👇`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '📞 Позвоните мне', callback_data: 'callback' }]]
      }
    });
  }
  
  if (data === 'trial_family') {
    await bot.sendMessage(chatId, `Замечательно! Семейное занятие 👨‍👩‍👧

📋 Для записи напишите:
1️⃣ Ваше имя
2️⃣ Телефон
3️⃣ Сколько взрослых и детей?
4️⃣ Возраст детей
5️⃣ Удобный день и время

Или нажмите "Позвоните мне" 👇`, {
      reply_markup: {
        inline_keyboard: [[{ text: '📞 Позвоните мне', callback_data: 'callback' }]]
      }
    });
  }
  
  if (data === 'trial_adult') {
    await bot.sendMessage(chatId, `Хорошая идея! Сначала попробуете сами 🎾

📝 Для записи напишите:
1️⃣ Ваше имя
2️⃣ Телефон
3️⃣ Удобный день и время

Или нажмите "Позвоните мне" 👇`, {
      reply_markup: {
        inline_keyboard: [[{ text: '📞 Позвоните мне', callback_data: 'callback' }]]
      }
    });
  }
  
  if (data === 'evening') {
    await bot.sendMessage(chatId, `Вечерние игры 🌙

🕐 18:00-23:00 — прайм-тайм
Аренда корта: уточняйте по телефону

📞 Свяжитесь с нами:`, {
      reply_markup: {
        inline_keyboard: [[{ text: '📞 Позвоните мне', callback_data: 'callback' }]]
      }
    });
  }
  
  if (data === 'callback') {
    await bot.sendMessage(chatId, `Отлично! 📞

Напишите:
1️⃣ Ваше имя
2️⃣ Телефон
3️⃣ Удобное время для звонка

Перезвоним в течение часа! ⏱`);
    
    await bot.sendMessage(ADMIN_CHAT_ID, `📞 Запрос обратного звонка от ${userName} (@${query.from.username || 'нет username'})`);
  }
  
  if (data === 'about') {
    await bot.sendMessage(chatId, `*Что такое падел?* 🎾

Падел — это микс большого тенниса и сквоша:
- Играют парами на закрытом корте
- Корт окружён стенами (мяч отскакивает от них)
- Ракетки без струн, лёгкие
- Мяч как теннисный, но мягче

*Почему это круто:*
✅ Легко начать с нуля
✅ Много движения, мало травм
✅ Весело в компании
✅ Можно в любую погоду (крытые корты)

Хотите попробовать? 👇`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎾 Записаться на пробное', callback_data: 'trial_general' }],
          [{ text: '📞 Позвоните мне', callback_data: 'callback' }]
        ]
      }
    });
  }
  
  await bot.answerCallbackQuery(query.id);
});

// Обработка текстовых сообщений
bot.on('message', async (msg) => {
  if (msg.text && !msg.text.startsWith('/') && !msg.text.startsWith('🎾')) {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name || 'Пользователь';
    const username = msg.from.username ? `@${msg.from.username}` : 'нет username';
    
    await bot.sendMessage(chatId, `Спасибо за сообщение! 📝

Администратор свяжется с вами в ближайшее время.

📍 Падел 10/20
Московское шоссе, 105к10
⏰ 8:00-23:00 ежедневно`);
    
    await bot.sendMessage(ADMIN_CHAT_ID, `📩 *Новое сообщение от клиента*

Имя: ${userName} (${username})
Сообщение:
_${msg.text}_`, { parse_mode: 'Markdown' });
  }
});

console.log('🎾 Бот Падел 10/20 запущен!');
