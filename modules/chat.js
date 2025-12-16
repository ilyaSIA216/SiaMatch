// modules/chat.js - ПРОСТОЙ ИСПРАВЛЕННЫЙ ВАРИАНТ

window.AppChat = {
  // ДЕМО-ДАННЫЕ
  demoMatches: [
    {
      id: 101,
      name: "Алексей",
      age: 28,
      gender: "male",
      city: "Москва",
      bio: "Дизайнер, люблю искусство и путешествия",
      photo: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800",
      verified: true,
      interests: ["art", "travel", "photography", "tattoos"],
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
      interests: ["sport", "music", "gaming", "workout"],
      matched_date: "2024-01-14",
      unread: 0
    }
  ],
  
  demoMessages: {
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
  },
  
  // ФУНКЦИИ
  init: function() {
    console.log('💬 Инициализирую систему чатов');
    
    // Загружаем данные
    this.loadMatchedUsers();
    this.loadChatMessages();
    this.loadUserReports();
    this.loadLikesData();
    
    // Если нет данных - используем демо
    if (this.matchedUsers.length === 0) {
      this.matchedUsers = this.demoMatches;
      this.saveMatchedUsers();
    }
    
    // Добавляем демо-сообщения
    for (const chatId in this.demoMessages) {
      if (!this.chatMessages[chatId]) {
        this.chatMessages[chatId] = this.demoMessages[chatId];
      }
    }
    
    this.saveChatMessages();
    this.updateChatsList();
  },
  
  // ГЛАВНЫЕ ПЕРЕМЕННЫЕ (объявляем их здесь)
  matchedUsers: [],
  currentChatId: null,
  chatMessages: {},
  userReports: [],
  usersWhoLikedMeCount: 0,
  lastLikesCount: 0,
  newLikesReceived: false,
  
  // ЗАГРУЗКА ДАННЫХ
  loadMatchedUsers: function() {
    try {
      const saved = localStorage.getItem("siamatch_matches");
      if (saved) {
        this.matchedUsers = JSON.parse(saved);
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки мэтчей:", e);
    }
  },
  
  saveMatchedUsers: function() {
    try {
      localStorage.setItem("siamatch_matches", JSON.stringify(this.matchedUsers));
    } catch (e) {
      console.error("❌ Ошибка сохранения мэтчей:", e);
    }
  },
  
  loadChatMessages: function() {
    try {
      const saved = localStorage.getItem("siamatch_chat_messages");
      if (saved) {
        this.chatMessages = JSON.parse(saved);
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки сообщений:", e);
    }
  },
  
  saveChatMessages: function() {
    try {
      localStorage.setItem("siamatch_chat_messages", JSON.stringify(this.chatMessages));
    } catch (e) {
      console.error("❌ Ошибка сохранения сообщений:", e);
    }
  },
  
  loadUserReports: function() {
    try {
      const saved = localStorage.getItem("siamatch_user_reports");
      if (saved) {
        this.userReports = JSON.parse(saved);
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки жалоб:", e);
    }
  },
  
  saveUserReports: function() {
    try {
      localStorage.setItem("siamatch_user_reports", JSON.stringify(this.userReports));
    } catch (e) {
      console.error("❌ Ошибка сохранения жалоб:", e);
    }
  },
  
  loadLikesData: function() {
    try {
      const saved = localStorage.getItem("siamatch_likes");
      if (saved) {
        const data = JSON.parse(saved);
        this.usersWhoLikedMeCount = data.count || 0;
        this.lastLikesCount = data.lastCount || 0;
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки данных о лайках:", e);
    }
  },
  
  saveLikesData: function() {
    try {
      const data = {
        count: this.usersWhoLikedMeCount,
        lastCount: this.lastLikesCount,
        lastUpdated: Date.now()
      };
      localStorage.setItem("siamatch_likes", JSON.stringify(data));
    } catch (e) {
      console.error("❌ Ошибка сохранения данных о лайков:", e);
    }
  },
  
  // ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
  updateLikesUI: function() {
    const count = this.usersWhoLikedMeCount;
    
    // Обновляем счетчик лайков
    const likesCountElement = document.getElementById('likes-count');
    if (likesCountElement) {
      likesCountElement.textContent = count;
    }
    
    // Обновляем бейдж
    const likesCountBadge = document.getElementById('likes-count-badge');
    if (likesCountBadge) {
      likesCountBadge.textContent = count;
    }
    
    // Обновляем бейдж в табах
    this.updateTabChatsBadge();
    
    // Проверяем новые лайки
    this.checkForNewLikes();
  },
  
  updateTabChatsBadge: function() {
    const tabChatsBadge = document.getElementById('tab-chats-badge');
    if (!tabChatsBadge) return;
    
    const count = this.usersWhoLikedMeCount;
    
    if (count > 0) {
      tabChatsBadge.textContent = count > 99 ? '99+' : count.toString();
      tabChatsBadge.classList.remove('hidden');
    } else {
      tabChatsBadge.classList.add('hidden');
    }
  },
  
  checkForNewLikes: function() {
    if (this.usersWhoLikedMeCount > this.lastLikesCount) {
      this.newLikesReceived = true;
      this.lastLikesCount = this.usersWhoLikedMeCount;
      this.saveLikesData();
    }
  },
  
  updateChatsList: function() {
    const chatsList = document.getElementById('chats-list');
    const chatsEmpty = document.getElementById('chats-empty');
    
    if (!chatsList || !chatsEmpty) return;
    
    chatsList.innerHTML = '';
    
    if (this.matchedUsers.length === 0) {
      chatsEmpty.classList.remove('hidden');
      return;
    }
    
    chatsEmpty.classList.add('hidden');
    
    this.matchedUsers.forEach(user => {
      const chatItem = document.createElement('li');
      chatItem.className = 'chat-item';
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
        this.openChat(user.id);
      });
      
      chatsList.appendChild(chatItem);
    });
  },
  
  // ОСНОВНЫЕ ФУНКЦИИ ЧАТА
  openChat: function(userId) {
    this.currentChatId = userId;
    
    const user = this.matchedUsers.find(u => u.id === parseInt(userId));
    if (!user) return;
    
    // Создаем экран чата если нужно
    if (!document.getElementById('chat-screen')) {
      this.createChatScreen();
    }
    
    // Показываем чат
    document.getElementById('screen-chats').classList.add('hidden');
    document.getElementById('chat-screen').classList.remove('hidden');
    document.getElementById('tab-bar').classList.add('hidden');
    
    // Заполняем информацию о пользователе
    document.getElementById('chat-user-name').textContent = `${user.name}, ${user.age}`;
    document.getElementById('chat-user-city').textContent = user.city;
    document.getElementById('chat-user-photo').src = user.photo;
    document.getElementById('chat-user-bio').textContent = user.bio;
    
    // Загружаем сообщения
    this.loadMessagesForChat(userId);
    
    // Сбрасываем непрочитанные
    user.unread = 0;
    this.saveMatchedUsers();
    this.updateChatsList();
  },
  
  // ПРОСТЫЕ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  loadMessagesForChat: function(userId) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';
    
    const messages = this.chatMessages[userId] || [];
    
    if (messages.length === 0) {
      messagesContainer.innerHTML = '<div class="no-messages">Начните общение первым!</div>';
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
    
    // Скроллим вниз
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
  },
  
  createChatScreen: function() {
    // Простая версия экрана чата
    const chatScreen = document.createElement('div');
    chatScreen.id = 'chat-screen';
    chatScreen.className = 'screen hidden';
    chatScreen.innerHTML = `
      <div class="chat-header">
        <button id="back-to-chats" class="back-btn">← Назад</button>
        <div class="chat-header-info">
          <img id="chat-user-photo" class="chat-header-photo" />
          <div>
            <div id="chat-user-name" class="chat-header-name"></div>
            <div id="chat-user-city" class="chat-header-status"></div>
          </div>
        </div>
      </div>
      
      <div class="chat-messages-container">
        <div class="chat-messages" id="chat-messages"></div>
      </div>
      
      <div class="chat-input-container">
        <input type="text" id="chat-message-input" placeholder="Напишите сообщение..." />
        <button id="send-message-btn" class="send-btn">Отправить</button>
      </div>
    `;
    
    document.getElementById('card').appendChild(chatScreen);
    
    // Настраиваем кнопки
    document.getElementById('back-to-chats').addEventListener('click', () => {
      document.getElementById('chat-screen').classList.add('hidden');
      document.getElementById('screen-chats').classList.remove('hidden');
      document.getElementById('tab-bar').classList.remove('hidden');
      this.currentChatId = null;
    });
    
    document.getElementById('send-message-btn').addEventListener('click', () => {
      this.sendMessage();
    });
  },
  
  sendMessage: function() {
    const input = document.getElementById('chat-message-input');
    const messageText = input.value.trim();
    
    if (!messageText || !this.currentChatId) return;
    
    // Создаем сообщение
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    const newMessage = {
      id: Date.now(),
      sender: 'me',
      text: messageText,
      time: timeString,
      date: now.toISOString().split('T')[0]
    };
    
    // Добавляем в историю
    if (!this.chatMessages[this.currentChatId]) {
      this.chatMessages[this.currentChatId] = [];
    }
    
    this.chatMessages[this.currentChatId].push(newMessage);
    this.saveChatMessages();
    
    // Показываем в интерфейсе
    const messagesContainer = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message message-out';
    messageElement.innerHTML = `
      <div class="message-content">${messageText}</div>
      <div class="message-time">${timeString}</div>
    `;
    messagesContainer.appendChild(messageElement);
    
    // Очищаем поле
    input.value = '';
    
    // Скроллим вниз
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
  },
  
  // ИМИТАЦИЯ НОВЫХ ЛАЙКОВ (для демо)
  simulateNewLikes: function() {
    if (this.usersWhoLikedMeCount === 0) {
      setTimeout(() => {
        this.usersWhoLikedMeCount = 3; // Стартовые лайки
        this.saveLikesData();
        this.updateLikesUI();
      }, 3000);
    }
  },
  
  // ФУНКЦИЯ ДЛЯ ДОБАВЛЕНИЯ ЛАЙКОВ (вызывается из других модулей)
  addLike: function() {
    this.usersWhoLikedMeCount++;
    this.saveLikesData();
    this.updateLikesUI();
  }
};
