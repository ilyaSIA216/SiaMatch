document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 SiaMatch запускается...');
  
  // ===== СОСТОЯНИЕ ПРИЛОЖЕНИЯ =====
  let tg = null;
  let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  let profileData = null;
  let currentIndex = 0;
  let likedIds = [];
  let hasInitialized = false;
  let keyboardHeight = 0;
  let originalHeight = window.innerHeight;
  
  // Фильтры поиска
  let searchFilters = {
    minAge: 18,
    maxAge: 35,
    genders: [], // Массив для выбранных полов
    interests: [],
    datingGoal: ''
  };
  
  // Добавляем состояние верификации
  let verificationStatus = 'not_verified';
  let verificationPhoto = null;
  
  // Система лайков
  let usersWhoLikedMeCount = 0;
  let lastLikesCount = 0;
  let newLikesReceived = false;
  
  // Интересы пользователя
  let userInterests = [];
  let datingGoal = '';
  
  // Система буста
  let boostActive = false;
  let boostEndTime = null;
  
  // Система свайпов
  let remainingSwipes = 20;
  let maxSwipesPerDay = 20;
  
  // СИСТЕМА ЧАТОВ И ЖАЛОБ
  let matchedUsers = []; // Список мэтчей
  let currentChatId = null; // Текущий открытый чат
  let chatMessages = {}; // Сообщения по чатам
  let userReports = []; // Жалобы пользователя
  
  // Демо-данные кандидатов (с интересами и статусом буста)
  const candidates = [
    {
      id: 1,
      name: "Алина",
      age: 24,
      gender: "female",
      city: "Москва",
      bio: "Люблю кофе ☕ Москва ❤️. Ищу серьезные отношения.",
      photo: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=800",
      verified: true,
      verification_status: 'verified',
      interests: ["travel", "movies", "photography"],
      dating_goal: "marriage",
      boosted: true,
      boost_end: Date.now() + 24 * 60 * 60 * 1000 // Буст на 24 часа
    },
    {
      id: 2,
      name: "Дмитрий",
      age: 28,
      gender: "male",
      city: "Санкт-Петербург",
      bio: "Инженер, люблю спорт и путешествия. Ищу активную девушку.",
      photo: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800",
      verified: false,
      verification_status: 'pending',
      interests: ["sport", "travel", "cars"],
      dating_goal: "dating",
      boosted: false
    },
    {
      id: 3,
      name: "Екатерина",
      age: 26,
      gender: "female",
      city: "Москва",
      bio: "Фотограф, люблю искусство и природу. Ищу творческого человека.",
      photo: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800",
      verified: true,
      verification_status: 'verified',
      interests: ["art", "photography", "travel"],
      dating_goal: "friendship",
      boosted: false
    },
    {
      id: 4,
      name: "Иван",
      age: 29,
      gender: "male",
      city: "Казань",
      bio: "Предприниматель. Люблю активный отдых и путешествия 🗺️",
      photo: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=800",
      verified: true,
      verification_status: 'verified',
      interests: ["business", "travel", "sport"],
      dating_goal: "marriage",
      boosted: true,
      boost_end: Date.now() + 12 * 60 * 60 * 1000 // Буст на 12 часов
    },
    {
      id: 5,
      name: "София",
      age: 25,
      gender: "female",
      city: "Новосибирск",
      bio: "Дизайнер. Увлекаюсь йогой и здоровым питанием 🥗",
      photo: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=800",
      verified: false,
      verification_status: 'pending',
      interests: ["art", "music", "cooking"],
      dating_goal: "dating",
      boosted: false
    }
  ];
  
  // Демо-данные мэтчей для чатов
  const demoMatches = [
    {
      id: 101,
      name: "Алексей",
      age: 28,
      gender: "male",
      city: "Москва",
      bio: "Дизайнер, люблю искусство и путешествия",
      photo: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800",
      verified: true,
      interests: ["art", "travel", "photography"],
      matched_date: "2024-01-15",
      unread: 2
    },
    {
      id: 102,
      name: "Мария",
      age: 25,
      gender: "female",
      city: "Санкт-Петербург",
      bio: "Программист, увлекаюсь спортом и музыкой",
      photo: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800",
      verified: true,
      interests: ["sport", "music", "gaming"],
      matched_date: "2024-01-14",
      unread: 0
    }
  ];
  
  // Демо сообщения для чатов
  const demoMessages = {
    101: [
      { id: 1, sender: 'other', text: 'Привет! Как дела?', time: '10:30', date: '2024-01-15' },
      { id: 2, sender: 'me', text: 'Привет! Всё отлично, а у тебя?', time: '10:32', date: '2024-01-15' },
      { id: 3, sender: 'other', text: 'Тоже хорошо! Вижу, ты любишь искусство?', time: '10:35', date: '2024-01-15' },
      { id: 4, sender: 'me', text: 'Да, очень! Часто хожу на выставки', time: '10:40', date: '2024-01-15' },
      { id: 5, sender: 'other', text: 'Круто! Может сходим вместе когда-нибудь?', time: '10:45', date: '2024-01-15' }
    ],
    102: [
      { id: 1, sender: 'me', text: 'Привет! Вижу, ты программист?', time: '14:20', date: '2024-01-14' },
      { id: 2, sender: 'other', text: 'Да! Занимаюсь веб-разработкой 3 года', time: '14:25', date: '2024-01-14' },
      { id: 3, sender: 'me', text: 'Круто! Я тоже в IT сфере', time: '14:30', date: '2024-01-14' },
      { id: 4, sender: 'other', text: 'Отлично! Есть о чём поговорить 😊', time: '14:35', date: '2024-01-14' }
    ]
  };
  
  // ===== DOM ЭЛЕМЕНТЫ =====
  const welcomeScreen = document.getElementById("welcome-screen");
  const startBtn = document.getElementById("startBtn");
  const usernameElem = document.getElementById("username");
  const onboardingScreen = document.getElementById("onboarding-screen");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const tabBar = document.getElementById("tab-bar");
  const appRoot = document.getElementById("app-root");
  const card = document.getElementById("card");
  
  // Элементы для системы лайков
  const likesBadge = document.getElementById('likes-badge');
  const likesCountElement = document.getElementById('likes-count');
  const likesCountBadge = document.getElementById('likes-count-badge');
  const newLikesNotification = document.getElementById('new-likes-notification');
  const tabChatsBadge = document.getElementById('tab-chats-badge');
  
  // Фильтры поиска
  const saveFiltersBtn = document.getElementById('save-filters-btn');
  const searchMinAge = document.getElementById('search-min-age');
  const searchMaxAge = document.getElementById('search-max-age');
  
  // Интересы пользователя
  const saveInterestsBtn = document.getElementById('save-interests');
  const datingGoalSelect = document.getElementById('dating-goal');
  const saveDatingGoalBtn = document.getElementById('save-dating-goal');
  
  // Система свайпов
  const swipesInfo = document.getElementById('swipes-info');
  const remainingSwipesElement = document.getElementById('remaining-swipes');
  const buySwipesBtn = document.getElementById('buy-swipes-btn');
  
  // ===== ИНИЦИАЛИЗАЦИЯ TELEGRAM =====
  function initTelegram() {
    try {
      if (window.Telegram && Telegram.WebApp) {
        tg = Telegram.WebApp;
        console.log('✅ Telegram WebApp обнаружен');
        
        tg.ready();
        tg.expand();
        
        if (tg.MainButton) {
          tg.MainButton.hide();
        }
        
        if (isIOS) {
          console.log('📱 iOS обнаружен');
          document.body.classList.add('no-bounce');
          setupKeyboardHandlers();
        }
        
        setTimeout(() => {
          if (tg && typeof tg.requestViewport === 'function') {
            tg.requestViewport();
          }
        }, 500);
        
        return true;
      }
    } catch (e) {
      console.error("❌ Ошибка Telegram WebApp:", e);
    }
    return false;
  }
  
  // ===== FIX ДЛЯ КЛАВИАТУРЫ iOS =====
  function setupKeyboardHandlers() {
    console.log('⌨️ Настраиваю обработчики клавиатуры');
    
    originalHeight = window.innerHeight;
    window.addEventListener('resize', handleResize);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('touchstart', handleTouchOutside);
  }
  
  function handleResize() {
    const newHeight = window.innerHeight;
    const heightDiff = originalHeight - newHeight;
    
    if (heightDiff > 100) {
      keyboardHeight = heightDiff;
      
      document.body.classList.add('keyboard-open');
      
      if (card) {
        card.style.transform = `translateY(-${Math.min(150, keyboardHeight - 100)}px)`;
      }
      
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        setTimeout(() => {
          activeElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }, 100);
      }
    } 
    else if (Math.abs(originalHeight - newHeight) < 50) {
      document.body.classList.remove('keyboard-open');
      
      if (card) {
        card.style.transform = 'translateY(0)';
      }
      
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (card) card.scrollTop = 0;
      }, 200);
      
      keyboardHeight = 0;
    }
    
    originalHeight = newHeight;
  }
  
  function handleFocusIn(e) {
    if (e.target.matches('input, textarea, select')) {
      if (isIOS) {
        setTimeout(() => {
          document.body.classList.add('keyboard-open');
        }, 100);
      }
    }
  }
  
  function handleFocusOut(e) {
    if (e.target.matches('input, textarea, select')) {
      if (isIOS) {
        setTimeout(() => {
          const activeElement = document.activeElement;
          if (!activeElement || !activeElement.matches('input, textarea, select')) {
            document.body.classList.remove('keyboard-open');
            if (card) card.style.transform = 'translateY(0)';
          }
        }, 500);
      }
    }
  }
  
  function handleTouchOutside(e) {
    if (!e.target.closest('input, textarea, select, button')) {
      document.activeElement?.blur();
    }
  }
  
  // ===== LOCALSTORAGE ФУНКЦИИ =====
  function loadProfile() {
    try {
      const raw = localStorage.getItem("siamatch_profile");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error("❌ Ошибка загрузки профиля:", e);
      return null;
    }
  }
  
  function saveProfile(obj) {
    try {
      localStorage.setItem("siamatch_profile", JSON.stringify(obj));
      return true;
    } catch (e) {
      console.error("❌ Ошибка сохранения профиля:", e);
      return false;
    }
  }
  
  // ===== СИСТЕМА ЧАТОВ И ЖАЛОБ =====
  function initChatsSystem() {
    console.log('💬 Инициализирую систему чатов и жалоб');
    
    loadMatchedUsers();
    loadChatMessages();
    loadUserReports();
    
    // Если нет мэтчей, добавляем демо для тестирования
    if (matchedUsers.length === 0) {
      matchedUsers = demoMatches;
      saveMatchedUsers();
    }
    
    // Инициализируем демо сообщения
    Object.keys(demoMessages).forEach(chatId => {
      if (!chatMessages[chatId]) {
        chatMessages[chatId] = demoMessages[chatId];
      }
    });
    
    // Сохраняем сообщения
    saveChatMessages();
    
    updateChatsList();
  }
  
  function loadMatchedUsers() {
    try {
      const saved = localStorage.getItem("siamatch_matches");
      if (saved) {
        matchedUsers = JSON.parse(saved);
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки мэтчей:", e);
    }
  }
  
  function saveMatchedUsers() {
    try {
      localStorage.setItem("siamatch_matches", JSON.stringify(matchedUsers));
    } catch (e) {
      console.error("❌ Ошибка сохранения мэтчей:", e);
    }
  }
  
  function loadChatMessages() {
    try {
      const saved = localStorage.getItem("siamatch_chat_messages");
      if (saved) {
        chatMessages = JSON.parse(saved);
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки сообщений:", e);
    }
  }
  
  function saveChatMessages() {
    try {
      localStorage.setItem("siamatch_chat_messages", JSON.stringify(chatMessages));
    } catch (e) {
      console.error("❌ Ошибка сохранения сообщений:", e);
    }
  }
  
  function loadUserReports() {
    try {
      const saved = localStorage.getItem("siamatch_user_reports");
      if (saved) {
        userReports = JSON.parse(saved);
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки жалоб:", e);
    }
  }
  
  function saveUserReports() {
    try {
      localStorage.setItem("siamatch_user_reports", JSON.stringify(userReports));
    } catch (e) {
      console.error("❌ Ошибка сохранения жалоб:", e);
    }
  }
  
  function updateChatsList() {
    const chatsList = document.getElementById('chats-list');
    const chatsEmpty = document.getElementById('chats-empty');
    
    if (!chatsList || !chatsEmpty) return;
    
    chatsList.innerHTML = '';
    
    if (matchedUsers.length === 0) {
      chatsEmpty.classList.remove('hidden');
      return;
    }
    
    chatsEmpty.classList.add('hidden');
    
    matchedUsers.forEach(user => {
      const chatItem = document.createElement('li');
      chatItem.className = 'chat-item';
      chatItem.dataset.userId = user.id;
      chatItem.innerHTML = `
        <div class="chat-item-content">
          <img src="${user.photo}" alt="${user.name}" class="chat-user-photo" />
          <div class="chat-user-info">
            <div class="chat-user-name">${user.name}, ${user.age}</div>
            <div class="chat-user-last-message">${user.city} • ${user.interests.slice(0, 2).join(', ')}</div>
          </div>
          <div class="chat-meta">
            <div class="chat-time">${user.matched_date}</div>
            ${user.unread > 0 ? `<div class="chat-unread">${user.unread}</div>` : ''}
          </div>
        </div>
      `;
      
      chatItem.addEventListener('click', () => {
        openChat(user.id);
      });
      
      chatsList.appendChild(chatItem);
    });
  }
  
  function openChat(userId) {
    currentChatId = userId;
    
    const user = matchedUsers.find(u => u.id === parseInt(userId));
    if (!user) return;
    
    // Создаем экран чата если его нет
    if (!document.getElementById('chat-screen')) {
      createChatScreen();
    }
    
    // Показываем экран чата
    document.getElementById('screen-chats').classList.add('hidden');
    document.getElementById('chat-screen').classList.remove('hidden');
    document.getElementById('tab-bar').classList.add('hidden');
    
    // Устанавливаем информацию о собеседнике
    document.getElementById('chat-user-name').textContent = `${user.name}, ${user.age}`;
    document.getElementById('chat-user-city').textContent = user.city;
    document.getElementById('chat-user-photo').src = user.photo;
    document.getElementById('chat-user-bio').textContent = user.bio;
    
    // Загружаем сообщения
    loadMessagesForChat(userId);
    
    // Обнуляем непрочитанные
    user.unread = 0;
    saveMatchedUsers();
    updateChatsList();
  }
  
  function createChatScreen() {
    const chatScreen = document.createElement('div');
    chatScreen.id = 'chat-screen';
    chatScreen.className = 'screen hidden';
    chatScreen.innerHTML = `
      <div class="chat-header">
        <button id="back-to-chats" class="back-btn">←</button>
        <div class="chat-header-info">
          <img id="chat-user-photo" class="chat-header-photo" />
          <div>
            <div id="chat-user-name" class="chat-header-name"></div>
            <div id="chat-user-city" class="chat-header-status"></div>
          </div>
        </div>
        <button id="chat-report-btn" class="report-btn">⚠️</button>
      </div>
      
      <div class="chat-messages-container">
        <div class="chat-messages" id="chat-messages"></div>
      </div>
      
      <div class="chat-input-container">
        <input type="text" id="chat-message-input" placeholder="Напишите сообщение..." />
        <button id="send-message-btn" class="send-btn">➤</button>
      </div>
      
      <!-- Модальное окно жалобы -->
      <div id="report-modal" class="modal-overlay hidden">
        <div class="modal" style="max-width: 500px;">
          <div class="modal-header">
            <h3>⚠️ Отправить жалобу</h3>
            <button class="close-btn" id="close-report-modal-btn">×</button>
          </div>
          <div id="report-modal-content">
            <div style="margin-bottom: 20px;">
              <div style="font-size: 14px; color: var(--muted); margin-bottom: 10px;">
                Жалоба на пользователя: <span id="report-user-name">-</span><br>
                Все сообщения из этого диалога будут скопированы в жалобу.
              </div>
              
              <div class="field">
                <label for="report-reason">Причина жалобы *</label>
                <select id="report-reason" class="filter-select" style="width: 100%;">
                  <option value="">Выберите причину</option>
                  <option value="spam">Спам, реклама</option>
                  <option value="harassment">Оскорбления, харассмент</option>
                  <option value="fake">Фейковая анкета</option>
                  <option value="scam">Мошенничество</option>
                  <option value="inappropriate">Неуместный контент</option>
                  <option value="other">Другое</option>
                </select>
              </div>
              
              <div id="custom-report-reason" class="hidden">
                <div class="field">
                  <label for="custom-reason-text">Опишите проблему подробно *</label>
                  <textarea id="custom-reason-text" rows="3" placeholder="Опишите причину жалобы..." style="width: 100%; padding: 12px; border-radius: 10px; border: 2px solid #bbf7d0; background: #ffffff; color: #000; font-size: 14px; resize: none;"></textarea>
                </div>
              </div>
              
              <div class="field">
                <label for="report-additional">Дополнительные комментарии (опционально)</label>
                <textarea id="report-additional" rows="2" placeholder="Любая дополнительная информация..." style="width: 100%; padding: 12px; border-radius: 10px; border: 2px solid #bbf7d0; background: #ffffff; color: #000; font-size: 14px; resize: none;"></textarea>
              </div>
              
              <div class="field" style="margin-top: 15px;">
                <label style="color: var(--danger-red); font-size: 13px;">
                  ⚠️ Внимание: После отправки жалобы диалог может быть заблокирован для проверки модератором.
                </label>
              </div>
            </div>
            
            <div class="modal-actions">
              <button id="submit-report-btn" class="primary danger-btn">Отправить жалобу</button>
              <button id="cancel-report-btn" class="secondary-btn">Отмена</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('card').appendChild(chatScreen);
    
    // Инициализируем обработчики событий
    setupChatEventHandlers();
  }
  
  function setupChatEventHandlers() {
    // Кнопка "Назад к чатам"
    document.getElementById('back-to-chats').addEventListener('click', () => {
      document.getElementById('chat-screen').classList.add('hidden');
      document.getElementById('screen-chats').classList.remove('hidden');
      document.getElementById('tab-bar').classList.remove('hidden');
      currentChatId = null;
    });
    
    // Кнопка отправки сообщения
    document.getElementById('send-message-btn').addEventListener('click', sendMessage);
    
    // Ввод сообщения по Enter
    document.getElementById('chat-message-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
    
    // Кнопка жалобы
    document.getElementById('chat-report-btn').addEventListener('click', openReportModal);
    
    // Закрытие модального окна жалобы
    document.getElementById('close-report-modal-btn').addEventListener('click', () => {
      document.getElementById('report-modal').classList.add('hidden');
    });
    
    // Отмена жалобы
    document.getElementById('cancel-report-btn').addEventListener('click', () => {
      document.getElementById('report-modal').classList.add('hidden');
    });
    
    // Выбор причины жалобы
    document.getElementById('report-reason').addEventListener('change', function() {
      const customReasonDiv = document.getElementById('custom-report-reason');
      if (this.value === 'other') {
        customReasonDiv.classList.remove('hidden');
      } else {
        customReasonDiv.classList.add('hidden');
      }
    });
    
    // Отправка жалобы
    document.getElementById('submit-report-btn').addEventListener('click', submitReport);
    
    // Закрытие модального окна при клике вне его
    document.getElementById('report-modal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('report-modal')) {
        document.getElementById('report-modal').classList.add('hidden');
      }
    });
  }
  
  function loadMessagesForChat(userId) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';
    
    const messages = chatMessages[userId] || [];
    
    if (messages.length === 0) {
      messagesContainer.innerHTML = `
        <div class="no-messages">
          <div class="no-messages-icon">💬</div>
          <div class="no-messages-text">Начните общение первым!</div>
        </div>
      `;
      return;
    }
    
    messages.forEach(msg => {
      const messageElement = document.createElement('div');
      messageElement.className = `message ${msg.sender === 'me' ? 'message-out' : 'message-in'}`;
      messageElement.innerHTML = `
        <div class="message-content">${msg.text}</div>
        <div class="message-time">${msg.time}</div>
      `;
      messagesContainer.appendChild(messageElement);
    });
    
    // Прокрутка вниз
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
  }
  
  function sendMessage() {
    const input = document.getElementById('chat-message-input');
    const messageText = input.value.trim();
    
    if (!messageText || !currentChatId) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toISOString().split('T')[0];
    
    const newMessage = {
      id: Date.now(),
      sender: 'me',
      text: messageText,
      time: timeString,
      date: dateString
    };
    
    // Добавляем сообщение в историю
    if (!chatMessages[currentChatId]) {
      chatMessages[currentChatId] = [];
    }
    
    chatMessages[currentChatId].push(newMessage);
    saveChatMessages();
    
    // Добавляем сообщение в интерфейс
    const messagesContainer = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message message-out';
    messageElement.innerHTML = `
      <div class="message-content">${messageText}</div>
      <div class="message-time">${timeString}</div>
    `;
    messagesContainer.appendChild(messageElement);
    
    // Очищаем поле ввода
    input.value = '';
    
    // Прокрутка вниз
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
    
    // Симулируем ответ через 1-3 секунды
    setTimeout(() => {
      simulateResponse(currentChatId);
    }, 1000 + Math.random() * 2000);
  }
  
  function simulateResponse(chatId) {
    const responses = [
      "Интересно!",
      "Расскажи подробнее",
      "Согласен с тобой",
      "Как дела?",
      "Что нового?",
      "Понял тебя",
      "Спасибо за ответ!"
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toISOString().split('T')[0];
    
    const responseMessage = {
      id: Date.now(),
      sender: 'other',
      text: response,
      time: timeString,
      date: dateString
    };
    
    if (!chatMessages[chatId]) {
      chatMessages[chatId] = [];
    }
    
    chatMessages[chatId].push(responseMessage);
    saveChatMessages();
    
    // Если чат открыт, добавляем сообщение
    if (currentChatId === chatId) {
      const messagesContainer = document.getElementById('chat-messages');
      if (messagesContainer) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-in';
        messageElement.innerHTML = `
          <div class="message-content">${response}</div>
          <div class="message-time">${timeString}</div>
        `;
        messagesContainer.appendChild(messageElement);
        
        setTimeout(() => {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
      }
    } else {
      // Увеличиваем счетчик непрочитанных
      const user = matchedUsers.find(u => u.id === parseInt(chatId));
      if (user) {
        user.unread = (user.unread || 0) + 1;
        saveMatchedUsers();
        updateChatsList();
      }
    }
  }
  
  function openReportModal() {
    if (!currentChatId) return;
    
    const user = matchedUsers.find(u => u.id === parseInt(currentChatId));
    if (!user) return;
    
    document.getElementById('report-user-name').textContent = `${user.name}, ${user.age}`;
    
    // Сброс формы
    document.getElementById('report-reason').value = '';
    document.getElementById('custom-report-reason').classList.add('hidden');
    document.getElementById('custom-reason-text').value = '';
    document.getElementById('report-additional').value = '';
    
    document.getElementById('report-modal').classList.remove('hidden');
  }
  
  function submitReport() {
    const reason = document.getElementById('report-reason').value;
    const customReason = document.getElementById('custom-reason-text').value;
    const additional = document.getElementById('report-additional').value;
    
    if (!reason) {
      showNotification('Выберите причину жалобы');
      return;
    }
    
    if (reason === 'other' && !customReason.trim()) {
      showNotification('Опишите причину жалобы');
      return;
    }
    
    const user = matchedUsers.find(u => u.id === parseInt(currentChatId));
    if (!user) return;
    
    // Собираем данные для жалобы
    const reportData = {
      id: Date.now(),
      reporterId: profileData?.tg_id || 1,
      reporterName: profileData?.first_name || 'Пользователь',
      reportedUserId: user.id,
      reportedUserName: user.name,
      reason: reason === 'other' ? customReason : reason,
      additionalInfo: additional,
      chatMessages: chatMessages[currentChatId] || [],
      reporterProfile: profileData,
      reportedUserProfile: user,
      createdAt: new Date().toISOString(),
      status: 'pending',
      adminResponse: null
    };
    
    // Добавляем жалобу
    userReports.push(reportData);
    saveUserReports();
    
    // Сохраняем жалобу в localStorage для админ-панели
    saveReportToAdmin(reportData);
    
    // Показываем уведомление
    showNotification('✅ Жалоба отправлена!\n\nВаша жалоба будет рассмотрена администратором в течение 24 часов. Диалог сохранён для проверки.');
    
    // Закрываем модальное окно
    document.getElementById('report-modal').classList.add('hidden');
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('medium');
      } catch (e) {}
    }
  }
  
  function saveReportToAdmin(reportData) {
    try {
      const existingReports = JSON.parse(localStorage.getItem('siamatch_admin_reports') || '[]');
      existingReports.push(reportData);
      localStorage.setItem('siamatch_admin_reports', JSON.stringify(existingReports));
    } catch (e) {
      console.error('❌ Ошибка сохранения жалобы для админа:', e);
    }
  }
  
  // ===== СИСТЕМА ФИЛЬТРОВ =====
  function initFiltersSystem() {
    console.log('🔍 Инициализирую систему фильтров');
    
    loadSearchFilters();
    
    // Удаляем старую кнопку открытия фильтров
    const openFiltersBtn = document.getElementById("open-filters-btn");
    if (openFiltersBtn) {
      openFiltersBtn.parentNode.removeChild(openFiltersBtn);
    }
    
    initSearchFilters();
  }
  
  function initSearchFilters() {
    loadSearchFilters();
    
    if (searchMinAge) {
      searchMinAge.value = searchFilters.minAge;
      searchMinAge.addEventListener('change', function() {
        searchFilters.minAge = parseInt(this.value) || 18;
      });
    }
    
    if (searchMaxAge) {
      searchMaxAge.value = searchFilters.maxAge;
      searchMaxAge.addEventListener('change', function() {
        searchFilters.maxAge = parseInt(this.value) || 35;
      });
    }
    
    // Инициализация фильтра по полу
    const genderMaleCheckbox = document.getElementById('filter-gender-male');
    const genderFemaleCheckbox = document.getElementById('filter-gender-female');
    
    if (genderMaleCheckbox) {
      genderMaleCheckbox.checked = searchFilters.genders.includes('male');
      genderMaleCheckbox.addEventListener('change', function() {
        if (this.checked) {
          if (!searchFilters.genders.includes('male')) {
            searchFilters.genders.push('male');
          }
        } else {
          const index = searchFilters.genders.indexOf('male');
          if (index > -1) {
            searchFilters.genders.splice(index, 1);
          }
        }
      });
    }
    
    if (genderFemaleCheckbox) {
      genderFemaleCheckbox.checked = searchFilters.genders.includes('female');
      genderFemaleCheckbox.addEventListener('change', function() {
        if (this.checked) {
          if (!searchFilters.genders.includes('female')) {
            searchFilters.genders.push('female');
          }
        } else {
          const index = searchFilters.genders.indexOf('female');
          if (index > -1) {
            searchFilters.genders.splice(index, 1);
          }
        }
      });
    }
    
    document.querySelectorAll('.search-interest').forEach(checkbox => {
      checkbox.checked = searchFilters.interests.includes(checkbox.value);
      
      checkbox.addEventListener('change', function() {
        const interest = this.value;
        if (this.checked) {
          if (!searchFilters.interests.includes(interest)) {
            searchFilters.interests.push(interest);
          }
        } else {
          const index = searchFilters.interests.indexOf(interest);
          if (index > -1) {
            searchFilters.interests.splice(index, 1);
          }
        }
      });
    });
    
    const searchDatingGoalSelect = document.getElementById('search-dating-goal');
    if (searchDatingGoalSelect) {
      searchDatingGoalSelect.value = searchFilters.datingGoal;
      searchDatingGoalSelect.addEventListener('change', function() {
        searchFilters.datingGoal = this.value;
      });
    }
    
    if (saveFiltersBtn) {
      saveFiltersBtn.addEventListener('click', function() {
        saveSearchFilters();
        setActiveTab("feed");
        
        showNotification('✅ Фильтры применены!\n\nТеперь в ленте будут показываться только подходящие анкеты. 🎯');
        
        if (tg?.HapticFeedback) {
          try {
            tg.HapticFeedback.impactOccurred('medium');
          } catch (e) {}
        }
      });
    }
  }
  
  function loadSearchFilters() {
    try {
      const saved = localStorage.getItem("siamatch_search_filters");
      if (saved) {
        const data = JSON.parse(saved);
        searchFilters.minAge = data.minAge || 18;
        searchFilters.maxAge = data.maxAge || 35;
        searchFilters.genders = data.genders || []; // Загружаем выбранные полы
        searchFilters.interests = data.interests || [];
        searchFilters.datingGoal = data.datingGoal || '';
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки фильтров:", e);
    }
  }
  
  function saveSearchFilters() {
    try {
      localStorage.setItem("siamatch_search_filters", JSON.stringify(searchFilters));
    } catch (e) {
      console.error("❌ Ошибка сохранения фильтров:", e);
    }
  }
  
  // ===== СИСТЕМА БУСТА =====
  function initBoostSystem() {
    console.log('🚀 Инициализирую систему буста');
    
    loadBoostStatus();
    updateBoostUI();
    
    // Удаляем кнопку покупки буста если она существует
    const boostProfileBtn = document.getElementById('boostProfileBtn');
    if (boostProfileBtn && boostProfileBtn.parentNode) {
      boostProfileBtn.parentNode.removeChild(boostProfileBtn);
    }
    
    // Удаляем форму буста если она существует
    const boostFormSection = document.getElementById('boost-form-section');
    if (boostFormSection && boostFormSection.parentNode) {
      boostFormSection.parentNode.removeChild(boostFormSection);
    }
    
    // Обновляем секцию буста в профиле - используем существующий элемент
    const boostInfoRow = document.querySelector('.profile-info-row:nth-child(5)');
    if (boostInfoRow) {
      // Сохраняем существующую структуру, но обновляем текст
      const boostStatusSpan = boostInfoRow.querySelector('#boost-status');
      if (boostStatusSpan) {
        updateBoostStatusElement(boostStatusSpan);
      }
    }
    
    // Запускаем таймер обновления
    setInterval(updateBoostTimer, 1000);
  }
  
  function loadBoostStatus() {
    try {
      const saved = localStorage.getItem("siamatch_boost");
      if (saved) {
        const data = JSON.parse(saved);
        boostActive = data.active || false;
        boostEndTime = data.endTime || null;
        
        if (boostActive && boostEndTime) {
          if (Date.now() > boostEndTime) {
            boostActive = false;
            saveBoostStatus();
          }
        }
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки статуса буста:", e);
    }
  }
  
  function saveBoostStatus() {
    try {
      const data = {
        active: boostActive,
        endTime: boostEndTime,
        timestamp: Date.now()
      };
      localStorage.setItem("siamatch_boost", JSON.stringify(data));
    } catch (e) {
      console.error("❌ Ошибка сохранения статуса буста:", e);
    }
  }
  
  function updateBoostUI() {
    const boostStatusElement = document.getElementById('boost-status');
    if (boostStatusElement) {
      updateBoostStatusElement(boostStatusElement);
    }
  }
  
  function updateBoostStatusElement(element) {
    if (boostActive && boostEndTime) {
      element.textContent = 'Активен';
      element.className = 'boost-status boosted';
    } else {
      element.textContent = 'Доступен только из админ-панели';
      element.className = 'boost-status not-boosted';
    }
  }
  
  function updateBoostTimer() {
    if (!boostActive || !boostEndTime) return;
    
    const now = Date.now();
    if (now >= boostEndTime) {
      boostActive = false;
      saveBoostStatus();
      updateBoostUI();
      return;
    }
    
    const timeLeft = boostEndTime - now;
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    const boostTimerElement = document.getElementById('boost-timer');
    if (boostTimerElement) {
      boostTimerElement.textContent = `Осталось: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }
  
  // ===== СИСТЕМА СВАЙПОВ =====
  function initSwipesSystem() {
    console.log('🔄 Инициализирую систему свайпов');
    
    loadSwipesCount();
    updateSwipesUI();
    
    if (buySwipesBtn) {
      buySwipesBtn.addEventListener('click', handleBuySwipes);
    }
  }
  
  function loadSwipesCount() {
    try {
      const saved = localStorage.getItem("siamatch_swipes");
      if (saved) {
        const data = JSON.parse(saved);
        const today = new Date().toDateString();
        
        if (data.date === today) {
          remainingSwipes = data.remaining || maxSwipesPerDay;
        } else {
          remainingSwipes = maxSwipesPerDay;
          saveSwipesCount();
        }
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки количества свайпов:", e);
    }
  }
  
  function saveSwipesCount() {
    try {
      const data = {
        date: new Date().toDateString(),
        remaining: remainingSwipes,
        totalUsed: maxSwipesPerDay - remainingSwipes
      };
      localStorage.setItem("siamatch_swipes", JSON.stringify(data));
    } catch (e) {
      console.error("❌ Ошибка сохранения количества свайпов:", e);
    }
  }
  
  function updateSwipesUI() {
    if (remainingSwipesElement) {
      remainingSwipesElement.textContent = remainingSwipes;
    }
    
    if (swipesInfo) {
      if (remainingSwipes <= 5) {
        swipesInfo.classList.remove('hidden');
      } else {
        swipesInfo.classList.add('hidden');
      }
    }
  }
  
  function useSwipe() {
    if (remainingSwipes > 0) {
      remainingSwipes--;
      saveSwipesCount();
      updateSwipesUI();
      
      if (remainingSwipes === 0) {
        setTimeout(() => {
          showNotification('🎯 Свайпы на сегодня закончились!\n\nВы можете:\n1. Подождать до завтра\n2. Купить дополнительные свайпы');
        }, 300);
      }
      
      return true;
    } else {
      showNotification('🚫 Свайпы на сегодня закончились!\n\nКупите дополнительные свайпы или подождите до завтра.');
      return false;
    }
  }
  
  function handleBuySwipes() {
    const options = [
      { count: 10, price: 99 },
      { count: 25, price: 199 },
      { count: 50, price: 349 },
      { count: 100, price: 599 }
    ];
    
    let message = '🛒 Купить дополнительные свайпы:\n\n';
    options.forEach((option, index) => {
      message += `${index + 1}. ${option.count} свайпов - ${option.price} ₽\n`;
    });
    message += '\nВыберите пакет:';
    
    const choice = prompt(message);
    if (choice && ['1', '2', '3', '4'].includes(choice)) {
      const selected = options[parseInt(choice) - 1];
      remainingSwipes += selected.count;
      saveSwipesCount();
      updateSwipesUI();
      
      showNotification(`✅ Успешно!\n\nВы купили ${selected.count} дополнительных свайпов за ${selected.price} ₽.\nТеперь у вас ${remainingSwipes} свайпов.`);
      
      if (tg?.HapticFeedback) {
        try {
          tg.HapticFeedback.impactOccurred('medium');
        } catch (e) {}
      }
    }
  }
  
  // ===== СИСТЕМА ЛАЙКОВ =====
  function initLikesSystem() {
    console.log('💗 Инициализирую систему лайков');
    
    loadLikesData();
    updateLikesUI();
    
    if (likesBadge) {
      likesBadge.addEventListener('click', handleLikesBadgeClick);
    }
    
    simulateNewLikes();
  }
  
  function loadLikesData() {
    try {
      const saved = localStorage.getItem("siamatch_likes");
      if (saved) {
        const data = JSON.parse(saved);
        usersWhoLikedMeCount = data.count || 0;
        lastLikesCount = data.lastCount || 0;
        console.log('📂 Загружено количество лайков:', usersWhoLikedMeCount);
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки данных о лайках:", e);
    }
  }
  
  function saveLikesData() {
    try {
      const data = {
        count: usersWhoLikedMeCount,
        lastCount: lastLikesCount,
        lastUpdated: Date.now()
      };
      localStorage.setItem("siamatch_likes", JSON.stringify(data));
      console.log('💾 Сохранены данные о лайках');
    } catch (e) {
      console.error("❌ Ошибка сохранения данных о лайков:", e);
    }
  }
  
  function updateLikesUI() {
    const count = usersWhoLikedMeCount;
    
    if (likesCountElement) {
      const currentCount = parseInt(likesCountElement.textContent) || 0;
      if (currentCount !== count) {
        likesCountElement.classList.remove('counter-animation');
        void likesCountElement.offsetWidth;
        likesCountElement.classList.add('counter-animation');
        likesCountElement.textContent = count;
      }
    }
    
    if (likesCountBadge) {
      const currentBadgeCount = parseInt(likesCountBadge.textContent) || 0;
      if (currentBadgeCount !== count) {
        likesCountBadge.textContent = count;
        likesCountBadge.style.animation = 'none';
        setTimeout(() => {
          likesCountBadge.style.animation = 'countPulse 2s infinite';
        }, 10);
      }
    }
    
    updateTabChatsBadge();
    checkForNewLikes();
  }
  
  function updateTabChatsBadge() {
    if (!tabChatsBadge) return;
    
    const count = usersWhoLikedMeCount;
    
    if (count > 0) {
      tabChatsBadge.textContent = count > 99 ? '99+' : count.toString();
      tabChatsBadge.classList.remove('hidden');
      
      if (newLikesReceived) {
        tabChatsBadge.style.animation = 'badgePulse 1.5s infinite';
      }
    } else {
      tabChatsBadge.classList.add('hidden');
    }
  }
  
  function checkForNewLikes() {
    if (usersWhoLikedMeCount > lastLikesCount) {
      newLikesReceived = true;
      showNewLikesNotification();
      lastLikesCount = usersWhoLikedMeCount;
      saveLikesData();
    }
  }
  
  function showNewLikesNotification() {
    if (!newLikesNotification || !newLikesReceived) return;
    
    newLikesNotification.classList.remove('hidden');
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
    
    setTimeout(() => {
      newLikesNotification.classList.add('hidden');
      newLikesReceived = false;
    }, 5000);
  }
  
  function handleLikesBadgeClick() {
    console.log('💗 Клик на бадж с лайками');
    
    if (usersWhoLikedMeCount > 0) {
      const messages = [
        `🎯 У вас ${usersWhoLikedMeCount} тайных поклонников! Продолжайте свайпать, чтобы найти их в ленте.`,
        `✨ ${usersWhoLikedMeCount} человек уже оценили вашу анкету. Они где-то рядом!`,
        `💝 Кто-то уже заинтересовался вами! Продолжайте свайпать, чтобы найти взаимную симпатию.`,
        `🌟 У вас ${usersWhoLikedMeCount} потенциальных мэтчей! Они появятся в ленте впереди.`
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      showNotification(randomMessage);
    } else {
      showNotification('Пока нет лайков, но это временно! Продолжайте активно использовать приложение, и скоро появятся первые симпатии! 💕');
    }
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.selectionChanged();
      } catch (e) {}
    }
  }
  
  function simulateNewLikes() {
    if (usersWhoLikedMeCount === 0) {
      setTimeout(() => {
        usersWhoLikedMeCount = Math.floor(Math.random() * 5) + 3;
        saveLikesData();
        updateLikesUI();
        console.log('🎲 Демо: добавлены лайки для мотивации');
      }, 3000);
    }
    
    setInterval(() => {
      if (Math.random() > 0.7) {
        const newLikes = Math.floor(Math.random() * 2) + 1;
        usersWhoLikedMeCount += newLikes;
        newLikesReceived = true;
        saveLikesData();
        updateLikesUI();
        console.log(`🎲 Демо: добавлено ${newLikes} новых лайков`);
      }
    }, 30000);
  }
  
  // ===== СИСТЕМА ВЕРИФИКАЦИИ =====
  function initVerification() {
    console.log('🔐 Инициализирую систему верификации');
    
    loadVerificationStatus();
    
    const verifyBtn = document.getElementById('verifyProfileBtn');
    const verificationPhotoInput = document.getElementById('verification-photo');
    const submitBtn = document.getElementById('submit-verification');
    const cancelBtn = document.getElementById('cancel-verification');
    const retryBtn = document.getElementById('retry-verification');
    
    if (verifyBtn) verifyBtn.addEventListener('click', handleVerificationRequest);
    if (verificationPhotoInput) verificationPhotoInput.addEventListener('change', handleVerificationPhotoUpload);
    if (submitBtn) submitBtn.addEventListener('click', submitVerification);
    if (cancelBtn) cancelBtn.addEventListener('click', cancelVerification);
    if (retryBtn) retryBtn.addEventListener('click', retryVerification);
    
    updateVerificationUI();
  }
  
  function loadVerificationStatus() {
    try {
      const saved = localStorage.getItem("siamatch_verification");
      if (saved) {
        const data = JSON.parse(saved);
        verificationStatus = data.status || 'not_verified';
        verificationPhoto = data.photo || null;
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки статуса верификации:", e);
    }
  }
  
  function saveVerificationStatus() {
    try {
      const data = {
        status: verificationStatus,
        photo: verificationPhoto,
        timestamp: Date.now()
      };
      localStorage.setItem("siamatch_verification", JSON.stringify(data));
    } catch (e) {
      console.error("❌ Ошибка сохранения статуса верификации:", e);
    }
  }
  
  function updateVerificationUI() {
    const verifyBtn = document.getElementById('verifyProfileBtn');
    const verificationStatusElem = document.getElementById('verification-status');
    const verificationSection = document.getElementById('verification-form-section');
    const verificationPendingSection = document.getElementById('verification-pending-section');
    const verificationVerifiedSection = document.getElementById('verification-verified-section');
    const verificationRejectedSection = document.getElementById('verification-rejected-section');
    
    if (!verifyBtn || !verificationStatusElem) return;
    
    if (verificationSection) verificationSection.classList.add('hidden');
    if (verificationPendingSection) verificationPendingSection.classList.add('hidden');
    if (verificationVerifiedSection) verificationVerifiedSection.classList.add('hidden');
    if (verificationRejectedSection) verificationRejectedSection.classList.add('hidden');
    
    verifyBtn.style.display = verificationStatus === 'not_verified' || verificationStatus === 'rejected' ? 'block' : 'none';
    
    switch(verificationStatus) {
      case 'not_verified':
        verificationStatusElem.textContent = 'Анкета не верифицирована';
        verificationStatusElem.className = 'profile-verification-status not-verified';
        break;
        
      case 'pending':
        verificationStatusElem.textContent = '⏳ На проверке';
        verificationStatusElem.className = 'profile-verification-status pending';
        if (verificationPendingSection) verificationPendingSection.classList.remove('hidden');
        break;
        
      case 'verified':
        verificationStatusElem.textContent = '✅ Верифицирована';
        verificationStatusElem.className = 'profile-verification-status verified';
        if (verificationVerifiedSection) verificationVerifiedSection.classList.remove('hidden');
        break;
        
      case 'rejected':
        verificationStatusElem.textContent = '❌ Отклонена';
        verificationStatusElem.className = 'profile-verification-status rejected';
        if (verificationRejectedSection) verificationRejectedSection.classList.remove('hidden');
        break;
    }
  }
  
  function handleVerificationRequest() {
    const verificationSection = document.getElementById('verification-form-section');
    const verifyBtn = document.getElementById('verifyProfileBtn');
    
    if (verificationSection && verifyBtn) {
      verificationSection.classList.remove('hidden');
      verifyBtn.style.display = 'none';
      
      const preview = document.getElementById('verification-preview');
      if (preview) preview.style.display = 'none';
    }
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.selectionChanged();
      } catch (e) {}
    }
  }
  
  function handleVerificationPhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Фото слишком большое (максимум 5MB)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
      verificationPhoto = event.target.result;
      
      const preview = document.getElementById('verification-preview');
      if (preview) {
        preview.src = verificationPhoto;
        preview.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  }
  
  function submitVerification() {
    if (!verificationPhoto) {
      showNotification('Сначала загрузите селфи фото');
      return;
    }
    
    verificationStatus = 'pending';
    saveVerificationStatus();
    updateVerificationUI();
    
    const verificationSection = document.getElementById('verification-form-section');
    if (verificationSection) verificationSection.classList.add('hidden');
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('medium');
      } catch (e) {}
    }
    
    showNotification('✅ Запрос на верификацию отправлен!\n\nАнкета будет проверена администратором в течение 24 часов.\n\nВы получите уведомление, когда проверка будет завершена.');
  }
  
  function cancelVerification() {
    verificationPhoto = null;
    verificationStatus = 'not_verified';
    saveVerificationStatus();
    updateVerificationUI();
    
    const verificationPhotoInput = document.getElementById('verification-photo');
    if (verificationPhotoInput) verificationPhotoInput.value = '';
    
    const preview = document.getElementById('verification-preview');
    if (preview) preview.style.display = 'none';
    
    const verificationSection = document.getElementById('verification-form-section');
    if (verificationSection) verificationSection.classList.add('hidden');
    
    const verifyBtn = document.getElementById('verifyProfileBtn');
    if (verifyBtn) verifyBtn.style.display = 'block';
  }
  
  function retryVerification() {
    verificationPhoto = null;
    verificationStatus = 'not_verified';
    saveVerificationStatus();
    updateVerificationUI();
    
    const verificationPhotoInput = document.getElementById('verification-photo');
    if (verificationPhotoInput) verificationPhotoInput.value = '';
    
    const preview = document.getElementById('verification-preview');
    if (preview) preview.style.display = 'none';
    
    const verificationRejectedSection = document.getElementById('verification-rejected-section');
    if (verificationRejectedSection) verificationRejectedSection.classList.add('hidden');
    
    const verifyBtn = document.getElementById('verifyProfileBtn');
    if (verifyBtn) verifyBtn.style.display = 'block';
  }
  
  // ===== СИСТЕМА ИНТЕРЕСОВ =====
  function initInterestsSystem() {
    console.log('🎯 Инициализирую систему интересов');
    
    loadUserInterests();
    updateInterestsUI();
    
    if (saveInterestsBtn) {
      saveInterestsBtn.addEventListener('click', saveUserInterests);
    }
    
    if (datingGoalSelect) {
      datingGoalSelect.value = datingGoal;
      datingGoalSelect.addEventListener('change', function() {
        datingGoal = this.value;
      });
    }
    
    if (saveDatingGoalBtn) {
      saveDatingGoalBtn.addEventListener('click', saveDatingGoal);
    }
  }
  
  function loadUserInterests() {
    try {
      const saved = localStorage.getItem("siamatch_interests");
      if (saved) {
        const data = JSON.parse(saved);
        userInterests = data.interests || [];
        datingGoal = data.datingGoal || '';
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки интересов:", e);
    }
  }
  
  function saveUserInterests() {
    userInterests = [];
    document.querySelectorAll('.user-interest:checked').forEach(checkbox => {
      userInterests.push(checkbox.value);
    });
    
    try {
      const data = {
        interests: userInterests,
        datingGoal: datingGoal,
        timestamp: Date.now()
      };
      localStorage.setItem("siamatch_interests", JSON.stringify(data));
      
      showNotification('✅ Интересы сохранены!');
      
      if (tg?.HapticFeedback) {
        try {
          tg.HapticFeedback.impactOccurred('light');
        } catch (e) {}
      }
    } catch (e) {
      console.error("❌ Ошибка сохранения интересов:", e);
      showNotification('❌ Ошибка при сохранении интересов');
    }
  }
  
  function saveDatingGoal() {
    if (!datingGoal) {
      showNotification('Выберите цель знакомства');
      return;
    }
    
    saveUserInterests();
    
    showNotification('✅ Цель знакомства сохранена!');
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
  }
  
  function updateInterestsUI() {
    document.querySelectorAll('.user-interest').forEach(checkbox => {
      checkbox.checked = userInterests.includes(checkbox.value);
    });
    
    if (datingGoalSelect) {
      datingGoalSelect.value = datingGoal;
    }
  }
  
  // ===== ОБРАБОТЧИК КНОПКИ "НАЧАТЬ ЗНАКОМСТВО" =====
  function setupStartButton() {
    if (!startBtn) return;
    
    startBtn.addEventListener('click', handleStartClick, { passive: true });
    startBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      handleStartClick();
    }, { passive: false });
  }
  
  function handleStartClick() {
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
    
    if (welcomeScreen) {
      welcomeScreen.classList.add("hidden");
    }
    
    profileData = loadProfile();
    
    if (profileData) {
      showMainApp();
    } else {
      showOnboarding();
    }
  }
  
  // ===== ПОКАЗАТЬ АНКЕТУ =====
  function showOnboarding() {
    if (onboardingScreen) {
      onboardingScreen.classList.remove("hidden");
    }
    if (tabBar) {
      tabBar.classList.add("hidden");
    }
    
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    
    setupSaveButton();
  }
  
  // ===== НАСТРОЙКА КНОПКИ "СОХРАНИТЬ ПРОФИЛЬ" =====
  function setupSaveButton() {
    if (!saveProfileBtn) return;
    
    saveProfileBtn.addEventListener('click', handleSaveProfile, { passive: true });
    saveProfileBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      handleSaveProfile();
    }, { passive: false });
    
    saveProfileBtn.style.display = 'block';
  }
  
  function handleSaveProfile() {
    document.activeElement?.blur();
    document.body.classList.remove('keyboard-open');
    if (card) card.style.transform = 'translateY(0)';
    
    setTimeout(() => {
      const ageValue = Number(document.getElementById("age").value);
      const gender = document.getElementById("gender").value;
      const city = document.getElementById("city").value;
      const bio = document.getElementById("bio").value.trim();
      
      if (!ageValue || ageValue < 18 || ageValue > 99) {
        showNotification("Возраст должен быть от 18 до 99 лет");
        return;
      }
      if (!gender) {
        showNotification("Выберите пол");
        return;
      }
      if (!city) {
        showNotification("Выберите город");
        return;
      }
      if (bio.length < 10) {
        showNotification("О себе минимум 10 символов");
        return;
      }
      
      const user = tg?.initDataUnsafe?.user || { id: 1, first_name: "Пользователь" };
      profileData = {
        tg_id: user.id,
        first_name: user.first_name || "Пользователь",
        username: user.username || "",
        age: ageValue,
        gender,
        city,
        bio,
        verification_status: 'not_verified'
      };
      
      if (saveProfile(profileData)) {
        if (tg?.HapticFeedback) {
          try {
            tg.HapticFeedback.impactOccurred('medium');
          } catch (e) {}
        }
        
        initVerification();
        initLikesSystem();
        initInterestsSystem();
        initFiltersSystem();
        initBoostSystem();
        initSwipesSystem();
        initChatsSystem(); // Добавляем инициализацию чатов
        showMainApp();
        
        setTimeout(() => {
          showNotification("✅ Профиль сохранён! Добро пожаловать в SiaMatch 🍀\n\nТеперь вы можете:\n1. Пройти верификацию анкеты\n2. Выбрать свои интересы\n3. Настроить фильтры поиска\n4. Познакомиться с людьми в чатах");
        }, 300);
      } else {
        showNotification("❌ Ошибка при сохранении профиля");
      }
    }, 300);
  }
  
  // ===== ПОКАЗАТЬ ОСНОВНОЕ ПРИЛОЖЕНИЕ =====
  function showMainApp() {
    if (welcomeScreen) welcomeScreen.classList.add("hidden");
    if (onboardingScreen) onboardingScreen.classList.add("hidden");
    
    if (tabBar) {
      tabBar.classList.remove("hidden");
    }
    
    initVerification();
    initLikesSystem();
    initInterestsSystem();
    initFiltersSystem();
    initBoostSystem();
    initSwipesSystem();
    initChatsSystem(); // Добавляем инициализацию чатов
    
    setActiveTab("feed");
  }
  
  // ===== УПРАВЛЕНИЕ ТАБАМИ =====
  function setActiveTab(tab) {
    document.querySelectorAll('.screen').forEach(screen => {
      if (screen.id !== 'welcome-screen' && screen.id !== 'chat-screen') {
        screen.classList.add('hidden');
      }
    });
    
    // Скрываем экран чата если переключаемся на другую вкладку
    if (tab !== 'chats' && document.getElementById('chat-screen')) {
      document.getElementById('chat-screen').classList.add('hidden');
    }
    
    const screenId = 'screen-' + tab;
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.remove('hidden');
    }
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    if (tab === 'feed') {
      initFeed();
    } else if (tab === 'profile') {
      initProfile();
    } else if (tab === 'filters') {
      initFiltersTab();
    } else if (tab === 'chats') {
      updateLikesUI();
      updateChatsList();
    }
    
    if (tabBar) {
      tabBar.classList.remove('hidden');
    }
    
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
  }
  
  function setupTabButtons() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const tab = this.dataset.tab;
        setActiveTab(tab);
        
        if (tg?.HapticFeedback) {
          try {
            tg.HapticFeedback.selectionChanged();
          } catch (e) {}
        }
      });
    });
  }
  
  // ===== ЛЕНТА СВАЙПОВ С ФИЛЬТРАЦИЕЙ =====
  function initFeed() {
    currentIndex = 0;
    initSearchFilters();
    showCurrentCandidate();
    
    const btnLike = document.getElementById("btn-like");
    const btnDislike = document.getElementById("btn-dislike");
    
    if (btnLike) {
      btnLike.onclick = null;
      btnLike.addEventListener('click', handleLike);
    }
    
    if (btnDislike) {
      btnDislike.onclick = null;
      btnDislike.addEventListener('click', handleDislike);
    }
  }
  
  function initFiltersTab() {
    // Просто инициализируем фильтры
    initSearchFilters();
  }
  
  function getFilteredCandidates() {
    let filtered = candidates.filter(c => !likedIds.includes(c.id));
    
    // Применяем фильтр по возрасту
    filtered = filtered.filter(c => {
      return c.age >= searchFilters.minAge && c.age <= searchFilters.maxAge;
    });
    
    // Применяем фильтр по полу (если выбран хотя бы один пол)
    if (searchFilters.genders.length > 0) {
      filtered = filtered.filter(c => {
        return searchFilters.genders.includes(c.gender);
      });
    }
    // Если пол не выбран - показываем все
    
    // Применяем фильтр по интересам (если выбраны интересы)
    if (searchFilters.interests.length > 0) {
      filtered = filtered.filter(c => {
        return searchFilters.interests.some(interest => 
          c.interests.includes(interest)
        );
      });
    }
    // Если интересы не выбраны - показываем все
    
    // Применяем фильтр по цели знакомства (если выбрана цель)
    if (searchFilters.datingGoal) {
      filtered = filtered.filter(c => {
        return c.dating_goal === searchFilters.datingGoal;
      });
    }
    // Если цель не выбрана - показываем все
    
    // Сортируем: сначала бустированные анкеты
    filtered.sort((a, b) => {
      if (a.boosted && !b.boosted) return -1;
      if (!a.boosted && b.boosted) return 1;
      return 0;
    });
    
    return filtered;
  }
  
  function showCurrentCandidate() {
    const filtered = getFilteredCandidates();
    
    if (filtered.length === 0) {
      document.getElementById("candidate-name").textContent = "";
      document.getElementById("candidate-age").textContent = "";
      document.getElementById("candidate-city").textContent = "";
      document.getElementById("candidate-bio").textContent = "";
      document.getElementById("candidate-photo").src = "";
      
      const verifiedBadge = document.getElementById('candidate-verified');
      if (verifiedBadge) verifiedBadge.classList.add('hidden');
      
      const boostBadge = document.getElementById('candidate-boost');
      if (boostBadge) boostBadge.classList.add('hidden');
      
      document.getElementById("feed-status").textContent = 
        "Нет подходящих анкет по вашим фильтрам. Попробуйте изменить параметры поиска 🍀";
      return;
    }
    
    if (currentIndex >= filtered.length) {
      document.getElementById("candidate-name").textContent = "";
      document.getElementById("candidate-age").textContent = "";
      document.getElementById("candidate-city").textContent = "";
      document.getElementById("candidate-bio").textContent = "";
      document.getElementById("candidate-photo").src = "";
      
      const verifiedBadge = document.getElementById('candidate-verified');
      if (verifiedBadge) verifiedBadge.classList.add('hidden');
      
      const boostBadge = document.getElementById('candidate-boost');
      if (boostBadge) boostBadge.classList.add('hidden');
      
      document.getElementById("feed-status").textContent = 
        "На сегодня всё! Загляните позже 🍀";
      return;
    }
    
    const candidate = filtered[currentIndex];
    
    document.getElementById("candidate-name").textContent = candidate.name;
    document.getElementById("candidate-age").textContent = candidate.age;
    document.getElementById("candidate-city").textContent = candidate.city;
    document.getElementById("candidate-bio").textContent = candidate.bio;
    document.getElementById("candidate-photo").src = candidate.photo;
    document.getElementById("feed-status").textContent = "";
    
    const verifiedBadge = document.getElementById('candidate-verified');
    if (verifiedBadge) {
      if (candidate.verified) {
        verifiedBadge.classList.remove('hidden');
      } else {
        verifiedBadge.classList.add('hidden');
      }
    }
    
    const boostBadge = document.getElementById('candidate-boost');
    if (boostBadge) {
      if (candidate.boosted) {
        boostBadge.classList.remove('hidden');
      } else {
        boostBadge.classList.add('hidden');
      }
    }
  }
  
  function handleLike() {
    if (!useSwipe()) return;
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
    
    const filtered = getFilteredCandidates();
    if (currentIndex < filtered.length) {
      const likedUser = filtered[currentIndex];
      likedIds.push(likedUser.id);
      currentIndex++;
      showCurrentCandidate();
      
      checkForMatch(likedUser.id);
      
      console.log(`❤️ Лайк пользователю ${likedUser.name} (ID: ${likedUser.id})`);
    }
  }
  
  function handleDislike() {
    if (!useSwipe()) return;
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
    
    const filtered = getFilteredCandidates();
    if (currentIndex < filtered.length) {
      const dislikedUser = filtered[currentIndex];
      currentIndex++;
      showCurrentCandidate();
      
      console.log(`✖️ Дизлайк пользователю ${dislikedUser.name} (ID: ${dislikedUser.id})`);
    }
  }
  
  function checkForMatch(likedUserId) {
    if (Math.random() > 0.7) {
      if (usersWhoLikedMeCount > 0) {
        usersWhoLikedMeCount--;
        saveLikesData();
        updateLikesUI();
        
        setTimeout(() => {
          showNotification('🎉 У вас взаимная симпатия! Один из ваших тайных поклонников ответил вам взаимностью! Теперь вы можете начать общение в чатах.');
        }, 500);
      }
    }
  }
  
  // ===== ПРОФИЛЬ =====
  function initProfile() {
    profileData = loadProfile();
    
    if (profileData) {
      updateProfileDisplay();
      updateEditForm();
    }
    
    updateVerificationUI();
    updateBoostUI();
    initInterestsSystem();
  }
  
  function updateProfileDisplay() {
    const profileNameElem = document.getElementById('profile-name');
    const profileAgeElem = document.getElementById('profile-age-display');
    const profileGenderElem = document.getElementById('profile-gender-display');
    const profileCityElem = document.getElementById('profile-city-display');
    const profilePhotoElem = document.getElementById('profile-photo-preview');
    
    if (profileNameElem) {
      profileNameElem.textContent = profileData.first_name || "Пользователь";
    }
    
    if (profileAgeElem) {
      profileAgeElem.textContent = profileData.age ? `${profileData.age} лет` : "";
    }
    
    if (profileGenderElem) {
      const genderMap = {
        'male': 'Мужской',
        'female': 'Женский'
      };
      profileGenderElem.textContent = profileData.gender ? genderMap[profileData.gender] || profileData.gender : "";
    }
    
    if (profileCityElem) {
      profileCityElem.textContent = profileData.city || "";
    }
    
    if (profilePhotoElem && profileData.custom_photo_url) {
      profilePhotoElem.src = profileData.custom_photo_url;
      profilePhotoElem.style.display = 'block';
    }
  }
  
  function updateEditForm() {
    const editAgeElem = document.getElementById("edit-age");
    const editGenderElem = document.getElementById("edit-gender");
    const editCityElem = document.getElementById("edit-city");
    const editBioElem = document.getElementById("edit-bio");
    const editPhotoElem = document.getElementById('edit-photo-preview');
    
    if (editAgeElem) editAgeElem.value = profileData.age || "";
    if (editGenderElem) editGenderElem.value = profileData.gender || "";
    if (editCityElem) editCityElem.value = profileData.city || "";
    if (editBioElem) editBioElem.value = profileData.bio || "";
    
    if (editPhotoElem && profileData.custom_photo_url) {
      editPhotoElem.src = profileData.custom_photo_url;
      editPhotoElem.style.display = 'block';
    }
  }
  
  function handleEditProfile() {
    document.getElementById('profile-display').classList.add('hidden');
    document.getElementById('profile-edit').classList.remove('hidden');
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.selectionChanged();
      } catch (e) {}
    }
  }
  
  function handleSaveProfileChanges() {
    document.activeElement?.blur();
    document.body.classList.remove('keyboard-open');
    if (card) card.style.transform = 'translateY(0)';
    
    setTimeout(() => {
      if (!profileData) {
        showNotification("Сначала создайте профиль!");
        return;
      }
      
      profileData.age = Number(document.getElementById("edit-age").value);
      profileData.gender = document.getElementById("edit-gender").value;
      profileData.city = document.getElementById("edit-city").value;
      profileData.bio = document.getElementById("edit-bio").value.trim();
      
      if (saveProfile(profileData)) {
        updateProfileDisplay();
        
        document.getElementById('profile-display').classList.remove('hidden');
        document.getElementById('profile-edit').classList.add('hidden');
        
        showNotification("✅ Профиль обновлён!");
        
        if (tg?.HapticFeedback) {
          try {
            tg.HapticFeedback.impactOccurred('light');
        } catch (e) {}
        }
      } else {
        showNotification("❌ Ошибка при обновлении профиля");
      }
    }, 300);
  }
  
  function handleCancelEdit() {
    document.getElementById('profile-display').classList.remove('hidden');
    document.getElementById('profile-edit').classList.add('hidden');
  }
  
  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Фото слишком большое (максимум 5MB)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
      const isEditMode = !document.getElementById('profile-edit').classList.contains('hidden');
      
      if (isEditMode) {
        const preview = document.getElementById('edit-photo-preview');
        if (preview) {
          preview.src = event.target.result;
          preview.style.display = 'block';
        }
        
        profileData.custom_photo_url = event.target.result;
      } else {
        const preview = document.getElementById('profile-photo-preview');
        if (preview) {
          preview.src = event.target.result;
          preview.style.display = 'block';
        }
        
        profileData.custom_photo_url = event.target.result;
        saveProfile(profileData);
        showNotification('Фото загружено! 📸');
      }
    };
    reader.readAsDataURL(file);
  }
  
  // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
  function showNotification(message) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-text">${message.replace(/\n/g, '<br>')}</div>
      </div>
    `;
    
    // Добавляем стили
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 20px 25px;
      border-radius: 15px;
      z-index: 9999;
      text-align: center;
      max-width: 80%;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      animation: fadeIn 0.3s ease;
    `;
    
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `;
    
    const text = notification.querySelector('.notification-text');
    text.style.cssText = `
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 15px;
    `;
    
    // Добавляем анимацию
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, -60%); }
        to { opacity: 1; transform: translate(-50%, -50%); }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translate(-50%, -50%); }
        to { opacity: 0; transform: translate(-50%, -40%); }
      }
    `;
    document.head.appendChild(style);
    
    // Добавляем уведомление в DOM
    document.body.appendChild(notification);
    
    // Автоматически скрываем через 3 секунды
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      }, 300);
    }, 3000);
    
    // Также позволяем закрыть по клику
    notification.addEventListener('click', () => {
      notification.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      }, 300);
    });
  }
  
  // ===== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====
  function initApp() {
    if (hasInitialized) return;
    hasInitialized = true;
    
    console.log('🎬 Инициализация приложения...');
    
    initTelegram();
    setupStartButton();
    setupTabButtons();
    
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const saveChangesBtn = document.getElementById('save-profile-changes');
    const cancelEditBtn = document.getElementById('cancel-profile-edit');
    const profilePhotoInput = document.getElementById('profile-photo-upload');
    const editPhotoInput = document.getElementById('edit-photo-upload');
    
    if (editProfileBtn) {
      editProfileBtn.addEventListener('click', handleEditProfile);
    }
    
    if (saveChangesBtn) {
      saveChangesBtn.addEventListener('click', handleSaveProfileChanges);
    }
    
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', handleCancelEdit);
    }
    
    if (profilePhotoInput) {
      profilePhotoInput.addEventListener('change', handlePhotoUpload);
    }
    
    if (editPhotoInput) {
      editPhotoInput.addEventListener('change', handlePhotoUpload);
    }
    
    profileData = loadProfile();
    
    if (welcomeScreen) {
      welcomeScreen.classList.remove("hidden");
    }
    
    if (onboardingScreen) onboardingScreen.classList.add("hidden");
    document.querySelectorAll('.screen').forEach(screen => {
      if (screen.id !== 'welcome-screen') {
        screen.classList.add('hidden');
      }
    });
    
    if (tabBar) tabBar.classList.add("hidden");
    
    if (isIOS) {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 300);
    }
    
    initLikesSystem();
    initInterestsSystem();
    initFiltersSystem();
    initBoostSystem();
    initSwipesSystem();
    initChatsSystem(); // Добавляем инициализацию чатов
    
    console.log('✅ Приложение инициализировано');
  }
  
  // ===== ЗАПУСК =====
  setTimeout(initApp, 100);
});
