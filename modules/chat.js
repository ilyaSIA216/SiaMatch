// modules/chat.js

window.AppChat = {
  // Состояние чатов
  matchedUsers: [],
  currentChatId: null,
  chatMessages: {},
  userReports: [],
  usersWhoLikedMeCount: 0,
  lastLikesCount: 0,
  newLikesReceived: false,
  
  // Демо-данные
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
    // ... остальные мэтчи
  ],
  
  demoMessages: {
    101: [
      { id: 1, sender: 'other', text: 'Привет! Как дела?', time: '10:30', date: '2024-01-15' },
      // ... остальные сообщения
    ],
    // ... остальные чаты
  },
  
  // Функции
  init: function() {
    console.log('💬 Инициализирую систему чатов');
    this.loadMatchedUsers();
    this.loadChatMessages();
    this.loadUserReports();
    this.loadLikesData();
    this.initDemoData();
    this.updateChatsList();
    this.simulateNewLikes();
  },
  
  initDemoData: function() {
    if (this.matchedUsers.length === 0) {
      this.matchedUsers = this.demoMatches;
      this.saveMatchedUsers();
    }
    
    Object.keys(this.demoMessages).forEach(chatId => {
      if (!this.chatMessages[chatId]) {
        this.chatMessages[chatId] = this.demoMessages[chatId];
      }
    });
    
    this.saveChatMessages();
  },
  
  // Функции для работы с лайками
  loadLikesData: function() {
    const saved = AppCore.loadLocalStorage("siamatch_likes");
    if (saved) {
      this.usersWhoLikedMeCount = saved.count || 0;
      this.lastLikesCount = saved.lastCount || 0;
    }
  },
  
  saveLikesData: function() {
    const data = {
      count: this.usersWhoLikedMeCount,
      lastCount: this.lastLikesCount,
      lastUpdated: Date.now()
    };
    AppCore.saveLocalStorage("siamatch_likes", data);
  },
  
  updateLikesUI: function() {
    const count = this.usersWhoLikedMeCount;
    
    const likesCountElement = document.getElementById('likes-count');
    const likesCountBadge = document.getElementById('likes-count-badge');
    const tabChatsBadge = document.getElementById('tab-chats-badge');
    
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
    
    this.updateTabChatsBadge();
    this.checkForNewLikes();
  },
  
  updateTabChatsBadge: function() {
    const tabChatsBadge = document.getElementById('tab-chats-badge');
    if (!tabChatsBadge) return;
    
    const count = this.usersWhoLikedMeCount;
    
    if (count > 0) {
      tabChatsBadge.textContent = count > 99 ? '99+' : count.toString();
      tabChatsBadge.classList.remove('hidden');
      
      if (this.newLikesReceived) {
        tabChatsBadge.style.animation = 'badgePulse 1.5s infinite';
      }
    } else {
      tabChatsBadge.classList.add('hidden');
    }
  },
  
  checkForNewLikes: function() {
    if (this.usersWhoLikedMeCount > this.lastLikesCount) {
      this.newLikesReceived = true;
      this.showNewLikesNotification();
      this.lastLikesCount = this.usersWhoLikedMeCount;
      this.saveLikesData();
    }
  },
  
  showNewLikesNotification: function() {
    const newLikesNotification = document.getElementById('new-likes-notification');
    if (!newLikesNotification || !this.newLikesReceived) return;
    
    newLikesNotification.classList.remove('hidden');
    
    if (AppCore.tg?.HapticFeedback) {
      try {
        AppCore.tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
    
    setTimeout(() => {
      newLikesNotification.classList.add('hidden');
      this.newLikesReceived = false;
    }, 5000);
  },
  
  handleLikesBadgeClick: function() {
    console.log('💗 Клик на бадж с лайками');
    
    if (this.usersWhoLikedMeCount > 0) {
      const messages = [
        `🎯 У вас ${this.usersWhoLikedMeCount} тайных поклонников! Продолжайте свайпать, чтобы найти их в ленте.`,
        `✨ ${this.usersWhoLikedMeCount} человек уже оценили вашу анкету. Они где-то рядом!`,
        `💝 Кто-то уже заинтересовался вами! Продолжайте свайпать, чтобы найти взаимную симпатию.`,
        `🌟 У вас ${this.usersWhoLikedMeCount} потенциальных мэтчей! Они появятся в ленте впереди.`
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      AppCore.showNotification(randomMessage);
    } else {
      AppCore.showNotification('Пока нет лайков, но это временно! Продолжайте активно использовать приложение, и скоро появятся первые симпатии! 💕');
    }
    
    if (AppCore.tg?.HapticFeedback) {
      try {
        AppCore.tg.HapticFeedback.selectionChanged();
      } catch (e) {}
    }
  },
  
  simulateNewLikes: function() {
    if (this.usersWhoLikedMeCount === 0) {
      setTimeout(() => {
        this.usersWhoLikedMeCount = Math.floor(Math.random() * 5) + 3;
        this.saveLikesData();
        this.updateLikesUI();
        console.log('🎲 Демо: добавлены лайки для мотивации');
      }, 3000);
    }
    
    setInterval(() => {
      if (Math.random() > 0.7) {
        const newLikes = Math.floor(Math.random() * 2) + 1;
        this.usersWhoLikedMeCount += newLikes;
        this.newLikesReceived = true;
        this.saveLikesData();
        this.updateLikesUI();
        console.log(`🎲 Демо: добавлено ${newLikes} новых лайков`);
      }
    }, 30000);
  },
  
  // Функции для работы с чатами
  loadMatchedUsers: function() {
    const saved = AppCore.loadLocalStorage("siamatch_matches");
    if (saved) {
      this.matchedUsers = saved;
    }
  },
  
  saveMatchedUsers: function() {
    AppCore.saveLocalStorage("siamatch_matches", this.matchedUsers);
  },
  
  loadChatMessages: function() {
    const saved = AppCore.loadLocalStorage("siamatch_chat_messages");
    if (saved) {
      this.chatMessages = saved;
    }
  },
  
  saveChatMessages: function() {
    AppCore.saveLocalStorage("siamatch_chat_messages", this.chatMessages);
  },
  
  loadUserReports: function() {
    const saved = AppCore.loadLocalStorage("siamatch_user_reports");
    if (saved) {
      this.userReports = saved;
    }
  },
  
  saveUserReports: function() {
    AppCore.saveLocalStorage("siamatch_user_reports", this.userReports);
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
        this.openChat(user.id);
      });
      
      chatsList.appendChild(chatItem);
    });
  },
  
  // ... остальные функции чатов (openChat, sendMessage и т.д.)
};
