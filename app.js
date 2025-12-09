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
  
  // НОВОЕ: Система матчей и лайков
  let matches = []; // {id, userId, name, age, photo, lastMessage, lastMessageTime, unread, messages}
  let totalLikes = 0; // Общее количество лайков профиля
  let currentChat = null; // Текущий открытый чат
  let currentTab = "feed"; // Текущий активный таб
  
  // Верификация
  let verificationStatus = 'not_verified';
  let verificationPhoto = null;
  
  // Обновленные демо-данные кандидатов
  const candidates = [
    {
      id: 1, name: "Алина", age: 24, gender: "female", city: "Москва",
      bio: "Люблю кофе ☕ Москва ❤️ Ищу серьезные отношения", 
      photo: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=800",
      verified: true, 
      likes: 45, 
      distance: 2.3,
      interests: ["Кофе", "Путешествия", "Искусство"]
    },
    {
      id: 2, name: "Дмитрий", age: 28, gender: "male", city: "Санкт-Петербург",
      bio: "Инженер СПб. Люблю спорт и путешествия. Ищу активную девушку.", 
      photo: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800",
      verified: false, 
      likes: 28, 
      distance: 5.7,
      interests: ["Спорт", "Технологии", "Авто"]
    },
    {
      id: 3, name: "Екатерина", age: 26, gender: "female", city: "Москва",
      bio: "Фотограф ❤️ Ищу интересного собеседника. Люблю природу и животных.", 
      photo: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800",
      verified: true, 
      likes: 89, 
      distance: 1.2,
      interests: ["Фотография", "Природа", "Йога"]
    },
    {
      id: 4, name: "Максим", age: 30, gender: "male", city: "Казань",
      bio: "Предприниматель. Увлекаюсь автоспортом и инвестициями. Ищу умную девушку.", 
      photo: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=800",
      verified: false, 
      likes: 34, 
      distance: 15.5,
      interests: ["Бизнес", "Авто", "Инвестиции"]
    },
    {
      id: 5, name: "София", age: 23, gender: "female", city: "Москва",
      bio: "Студентка МГУ. Люблю книги, театр и хорошее кино. Ищу интеллигентного парня.", 
      photo: "https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=800",
      verified: true, 
      likes: 67, 
      distance: 3.1,
      interests: ["Книги", "Театр", "Наука"]
    }
  ];
  
  // Демо-данные матчей
  const demoMatches = [
    {
      id: 1,
      userId: 2,
      name: "Дмитрий",
      age: 28,
      city: "Санкт-Петербург",
      photo: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800",
      lastMessage: "Привет! Как дела?",
      lastMessageTime: "10:30",
      unread: 2,
      messages: [
        { id: 1, text: "Привет! Как дела?", time: "10:30", isOwn: false },
        { id: 2, text: "Привет! Всё отлично, а у тебя?", time: "10:32", isOwn: true },
        { id: 3, text: "Тоже хорошо! Как выходные?", time: "10:33", isOwn: false }
      ]
    },
    {
      id: 2,
      userId: 3,
      name: "Екатерина",
      age: 26,
      city: "Москва",
      photo: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800",
      lastMessage: "Спасибо за лайк! ❤️",
      lastMessageTime: "Вчера",
      unread: 0,
      messages: [
        { id: 1, text: "Спасибо за лайк! ❤️", time: "Вчера", isOwn: false },
        { id: 2, text: "Очень красивая анкета!", time: "Вчера", isOwn: true }
      ]
    }
  ];
  
  // DOM ЭЛЕМЕНТЫ
  const welcomeScreen = document.getElementById("welcome-screen");
  const startBtn = document.getElementById("startBtn");
  const usernameElem = document.getElementById("username");
  const onboardingScreen = document.getElementById("onboarding-screen");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const tabBar = document.getElementById("tab-bar");
  const appRoot = document.getElementById("app-root");
  const card = document.getElementById("card");
  
  // НОВЫЕ ЭЛЕМЕНТЫ
  const likesCounter = document.getElementById("likes-counter");
  const likesCount = document.getElementById("likes-count");
  const matchesList = document.getElementById("matches-list");
  const matchesEmpty = document.getElementById("matches-empty");
  const chatScreen = document.getElementById("chat-screen");
  const backToMatchesBtn = document.getElementById("back-to-matches");
  const chatMessages = document.getElementById("chat-messages");
  const messageInput = document.getElementById("message-input");
  const sendMessageBtn = document.getElementById("send-message");
  const chatPartnerInfo = document.getElementById("chat-partner-info");
  
  // Новые счетчики для ленты
  let likesCounterFeed = null;
  let likesCountFeed = null;
  
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
  
  // ===== СИСТЕМА ВЕРИФИКАЦИИ =====
  function initVerification() {
    console.log('🔐 Инициализирую систему верификации');
    
    loadVerificationStatus();
    
    const verifyBtn = document.getElementById('verifyProfileBtn');
    const verificationPhotoInput = document.getElementById('verification-photo');
    const submitBtn = document.getElementById('submit-verification');
    const cancelBtn = document.getElementById('cancel-verification');
    const retryBtn = document.getElementById('retry-verification');
    
    if (verifyBtn) {
      verifyBtn.addEventListener('click', handleVerificationRequest);
    }
    
    if (verificationPhotoInput) {
      verificationPhotoInput.addEventListener('change', handleVerificationPhotoUpload);
    }
    
    if (submitBtn) {
      submitBtn.addEventListener('click', submitVerification);
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', cancelVerification);
    }
    
    if (retryBtn) {
      retryBtn.addEventListener('click', retryVerification);
    }
    
    updateVerificationUI();
  }
  
  function loadVerificationStatus() {
    try {
      const saved = localStorage.getItem("siamatch_verification");
      if (saved) {
        const data = JSON.parse(saved);
        verificationStatus = data.status || 'not_verified';
        verificationPhoto = data.photo || null;
        console.log('📂 Загружен статус верификации:', verificationStatus);
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
      console.log('💾 Сохранен статус верификации:', verificationStatus);
    } catch (e) {
      console.error("❌ Ошибка сохранения статуса верификации:", e);
    }
  }
  
  function updateVerificationUI() {
    const verifyBtn = document.getElementById('verifyProfileBtn');
    const verificationStatusElem = document.getElementById('verification-status');
    const verificationSection = document.getElementById('verification-section-content');
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
    console.log('🔐 Запрос верификации');
    
    const verificationSection = document.getElementById('verification-section-content');
    const verifyBtn = document.getElementById('verifyProfileBtn');
    
    if (verificationSection && verifyBtn) {
      verificationSection.classList.remove('hidden');
      verifyBtn.style.display = 'none';
      
      const preview = document.getElementById('verification-preview');
      if (preview) {
        preview.style.display = 'none';
      }
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
      alert('Фото слишком большое (максимум 5MB)');
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
      
      console.log('📸 Фото для верификации загружено');
    };
    reader.readAsDataURL(file);
  }
  
  function submitVerification() {
    if (!verificationPhoto) {
      alert('Сначала загрузите селфи-фото');
      return;
    }
    
    console.log('📤 Отправка запроса на верификацию...');
    
    verificationStatus = 'pending';
    saveVerificationStatus();
    updateVerificationUI();
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('medium');
      } catch (e) {}
    }
    
    alert('✅ Запрос на верификацию отправлен!\n\nАнкета будет проверена администратором в течение 24 часов.\n\nВы получите уведомление, когда проверка будет завершена.');
  }
  
  function cancelVerification() {
    console.log('❌ Отмена верификации');
    
    verificationPhoto = null;
    verificationStatus = 'not_verified';
    saveVerificationStatus();
    updateVerificationUI();
    
    const verificationPhotoInput = document.getElementById('verification-photo');
    if (verificationPhotoInput) verificationPhotoInput.value = '';
    
    const preview = document.getElementById('verification-preview');
    if (preview) preview.style.display = 'none';
  }
  
  function retryVerification() {
    console.log('🔄 Повторная попытка верификации');
    
    verificationPhoto = null;
    verificationStatus = 'not_verified';
    saveVerificationStatus();
    updateVerificationUI();
    
    const verificationPhotoInput = document.getElementById('verification-photo');
    if (verificationPhotoInput) verificationPhotoInput.value = '';
    
    const preview = document.getElementById('verification-preview');
    if (preview) preview.style.display = 'none';
  }
  
  // ===== СИСТЕМА МАТЧЕЙ И ЛАЙКОВ =====
  function initMatchesSystem() {
    console.log('❤️ Инициализирую систему матчей и лайков');
    
    loadMatchesData();
    updateLikesCounter();
    renderMatchesList();
    initWebSocket();
    
    // Добавляем бейдж на кнопку матчей если есть непрочитанные
    updateMatchesBadge();
    
    // Добавляем демо-лайки при первом запуске
    setTimeout(() => {
      if (totalLikes === 0) {
        totalLikes = Math.floor(Math.random() * 50) + 20;
        updateLikesCounter();
        saveMatchesData();
      }
    }, 1000);
  }
  
  function loadMatchesData() {
    try {
      const savedMatches = localStorage.getItem("siamatch_matches");
      if (savedMatches) {
        matches = JSON.parse(savedMatches);
      } else {
        matches = [...demoMatches];
      }
      
      const savedLikes = localStorage.getItem("siamatch_total_likes");
      if (savedLikes) {
        totalLikes = parseInt(savedLikes);
      } else {
        totalLikes = Math.floor(Math.random() * 50) + 20;
      }
      
      console.log(`📂 Загружено: ${matches.length} матчей, ${totalLikes} лайков`);
    } catch (e) {
      console.error("❌ Ошибка загрузки данных матчей:", e);
      matches = [...demoMatches];
      totalLikes = 45;
    }
  }
  
  function saveMatchesData() {
    try {
      localStorage.setItem("siamatch_matches", JSON.stringify(matches));
      localStorage.setItem("siamatch_total_likes", totalLikes.toString());
    } catch (e) {
      console.error("❌ Ошибка сохранения данных матчей:", e);
    }
  }
  
  function updateLikesCounter() {
    // Обновляем счетчик в ленте
    if (likesCounterFeed && likesCountFeed) {
      if (totalLikes > 0) {
        likesCounterFeed.style.display = 'flex';
        likesCountFeed.textContent = totalLikes;
        
        likesCountFeed.style.transform = 'scale(1.2)';
        setTimeout(() => {
          likesCountFeed.style.transform = 'scale(1)';
        }, 300);
      } else {
        likesCounterFeed.style.display = 'none';
      }
    }
    
    // Удаляем общий счетчик из шапки (больше не нужен)
    if (likesCounter) {
      likesCounter.style.display = 'none';
    }
  }
  
  function addLike() {
    totalLikes++;
    updateLikesCounter();
    saveMatchesData();
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
  }
  
  // Функция для обновления бейджа на кнопке матчей
  function updateMatchesBadge() {
    const totalUnread = matches.reduce((sum, match) => sum + match.unread, 0);
    const matchesTab = document.querySelector('.tab-btn[data-tab="matches"]');
    
    if (matchesTab) {
      // Удаляем старый бейдж если есть
      const oldBadge = matchesTab.querySelector('.tab-badge');
      if (oldBadge) oldBadge.remove();
      
      // Добавляем новый бейдж если есть непрочитанные
      if (totalUnread > 0) {
        const badge = document.createElement('span');
        badge.className = 'tab-badge';
        badge.textContent = totalUnread > 9 ? '9+' : totalUnread;
        badge.style.cssText = `
          position: absolute;
          top: 5px;
          right: 5px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: bold;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        matchesTab.style.position = 'relative';
        matchesTab.appendChild(badge);
      }
    }
  }
  
  // ===== ОБРАБОТКА МАТЧЕЙ =====
  function handleLike(candidateId) {
    console.log(`❤️ Лайк пользователю ${candidateId}`);
    
    addLike();
    
    const candidate = candidates.find(c => c.id === candidateId);
    if (candidate && Math.random() > 0.7) {
      createMatch(candidate);
    }
    
    likedIds.push(candidateId);
    currentIndex++;
    showCurrentCandidate();
  }
  
  function createMatch(candidate) {
    console.log(`💘 Создаем матч с ${candidate.name}`);
    
    const existingMatch = matches.find(m => m.userId === candidate.id);
    if (existingMatch) return;
    
    const newMatch = {
      id: Date.now(),
      userId: candidate.id,
      name: candidate.name,
      age: candidate.age,
      city: candidate.city,
      photo: candidate.photo,
      lastMessage: "Вы понравились друг другу! Начните общение ❤️",
      lastMessageTime: "Только что",
      unread: 1,
      messages: [
        {
          id: 1,
          text: "Вы понравились друг другу! Начните общение ❤️",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: false
        }
      ]
    };
    
    matches.unshift(newMatch);
    saveMatchesData();
    renderMatchesList();
    
    showMatchNotification(candidate.name);
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.notificationOccurred('success');
      } catch (e) {}
    }
  }
  
  function showMatchNotification(name) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      left: 20px;
      right: 20px;
      background: linear-gradient(135deg, #f472b6, #db2777);
      color: white;
      padding: 16px;
      border-radius: 16px;
      z-index: 3000;
      text-align: center;
      box-shadow: 0 8px 25px rgba(219, 39, 119, 0.4);
      animation: slideDown 0.5s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="font-size: 40px; margin-bottom: 8px;">💘</div>
      <div style="font-weight: 700; font-size: 18px;">У вас новый матч!</div>
      <div style="font-size: 14px; opacity: 0.9; margin-top: 4px;">Вы понравились ${name}</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideUp 0.5s ease-out forwards';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }
  
  function renderMatchesList() {
    if (!matchesList) return;
    
    matchesList.innerHTML = '';
    
    if (matches.length === 0) {
      matchesEmpty.style.display = 'block';
      return;
    }
    
    matchesEmpty.style.display = 'none';
    
    matches.forEach((match, index) => {
      const matchCard = document.createElement('div');
      matchCard.className = 'match-card';
      matchCard.dataset.matchId = match.id;
      
      if (index === 0 && match.unread > 0) {
        matchCard.classList.add('new-match');
      }
      
      matchCard.innerHTML = `
        <img src="${match.photo}" alt="${match.name}" class="match-photo" onerror="this.src='https://via.placeholder.com/70x70?text=Фото'" />
        <div class="match-info">
          <div class="match-name">${match.name}, ${match.age}</div>
          <div class="match-details">${match.city}</div>
          <div class="match-last-message">${match.lastMessage}</div>
          <div class="match-status">${match.lastMessageTime}</div>
        </div>
        ${match.unread > 0 ? `<div class="unread-badge">${match.unread}</div>` : ''}
      `;
      
      matchCard.addEventListener('click', () => openChat(match));
      matchesList.appendChild(matchCard);
    });
    
    // Обновляем бейдж на кнопке табов
    updateMatchesBadge();
  }
  
  // ===== ЧАТЫ =====
  function openChat(match) {
    console.log(`💬 Открываем чат с ${match.name}`);
    
    currentChat = match;
    match.unread = 0;
    saveMatchesData();
    renderMatchesList(); // Это обновит и бейдж
    
    if (chatScreen) {
      chatScreen.classList.remove('hidden');
    }
    
    if (chatPartnerInfo) {
      chatPartnerInfo.innerHTML = `
        <div class="chat-partner">
          <img src="${match.photo}" alt="${match.name}" class="chat-partner-photo" onerror="this.src='https://via.placeholder.com/45x45?text=Фото'" />
          <div>
            <div class="chat-partner-name">${match.name}, ${match.age}</div>
            <div class="chat-partner-status">в сети</div>
          </div>
        </div>
      `;
    }
    
    renderChatMessages();
    
    setTimeout(() => {
      if (messageInput) messageInput.focus();
    }, 300);
  }
  
  function renderChatMessages() {
    if (!chatMessages || !currentChat) return;
    
    chatMessages.innerHTML = '';
    
    currentChat.messages.forEach(message => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${message.isOwn ? 'sent' : 'received'}`;
      
      messageDiv.innerHTML = `
        <div>${message.text}</div>
        <div class="message-time">${message.time}</div>
      `;
      
      chatMessages.appendChild(messageDiv);
    });
    
    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
  }
  
  function sendMessage() {
    if (!messageInput || !messageInput.value.trim() || !currentChat) return;
    
    const text = messageInput.value.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newMessage = {
      id: Date.now(),
      text: text,
      time: time,
      isOwn: true
    };
    
    currentChat.messages.push(newMessage);
    currentChat.lastMessage = text;
    currentChat.lastMessageTime = time;
    
    renderChatMessages();
    renderMatchesList();
    saveMatchesData();
    
    messageInput.value = '';
    
    setTimeout(() => {
      simulateReply();
    }, Math.random() * 2000 + 1000);
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.selectionChanged();
      } catch (e) {}
    }
  }
  
  function simulateReply() {
    if (!currentChat) return;
    
    const replies = [
      "Привет! Как дела?",
      "Очень рад матчу! 😊",
      "Чем занимаешься?",
      "Как твои выходные?",
      "Классная анкета!",
      "Хочешь пообщаться?",
      "Какой у тебя план на сегодня?",
      "Люблю такие знакомства!",
      "Что нового?",
      "Как настроение? 😊"
    ];
    
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const replyMessage = {
      id: Date.now(),
      text: randomReply,
      time: time,
      isOwn: false
    };
    
    currentChat.messages.push(replyMessage);
    currentChat.lastMessage = randomReply;
    currentChat.lastMessageTime = time;
    currentChat.unread = 0;
    
    renderChatMessages();
    renderMatchesList(); // Обновит бейдж
    
    if (currentTab !== 'matches' && document.hidden) {
      showMessageNotification(currentChat.name, randomReply);
    }
  }
  
  function showMessageNotification(name, message) {
    if (tg?.showPopup) {
      tg.showPopup({
        title: `Новое сообщение от ${name}`,
        message: message,
        buttons: [{ type: 'ok', text: 'Открыть' }]
      }, (buttonId) => {
        if (buttonId === 'ok') {
          setActiveTab('matches');
        }
      });
    }
  }
  
  function initWebSocket() {
    console.log('📡 WebSocket инициализирован (демо-режим)');
    
    setInterval(() => {
      if (matches.length > 0 && Math.random() > 0.9) {
        const randomMatch = matches[Math.floor(Math.random() * matches.length)];
        if (randomMatch !== currentChat) {
          randomMatch.unread++;
          saveMatchesData();
          renderMatchesList(); // Обновит бейдж
          
          if (currentTab !== 'matches') {
            showMessageNotification(randomMatch.name, "Привет! 😊");
          }
        }
      }
    }, 30000);
  }
  
  // ===== УПРАВЛЕНИЕ ТАБАМИ =====
  function setActiveTab(tab) {
    console.log('🔘 Активирую таб:', tab);
    currentTab = tab;
    
    // Управляем отображением шапки
    const header = document.getElementById("header");
    if (header) {
      if (tab === 'feed') {
        header.classList.remove('hidden');
      } else {
        header.classList.add('hidden');
      }
    }
    
    // Управляем экраном чата
    if (chatScreen && tab !== 'chat') {
      chatScreen.classList.add('hidden');
      currentChat = null;
    }
    
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(screen => {
      if (screen.id !== 'welcome-screen' && !screen.id.includes('chat')) {
        screen.classList.add('hidden');
      }
    });
    
    // Показываем нужный экран
    const screenId = tab === 'matches' ? 'screen-matches' : 'screen-' + tab;
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.remove('hidden');
    }
    
    // Обновляем активные кнопки табов
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Инициализация экрана
    if (tab === 'feed') {
      initFeed();
    } else if (tab === 'profile') {
      initProfile();
    } else if (tab === 'matches') {
      renderMatchesList();
    }
    
    // Прокрутка вверх
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
  
  // ===== ОБРАБОТЧИК КНОПКИ "НАЧАТЬ ЗНАКОМСТВО" =====
  function setupStartButton() {
    if (!startBtn) return;
    
    console.log('✅ Настраиваю кнопку "Начать знакомство"');
    
    startBtn.onclick = null;
    startBtn.ontouchstart = null;
    
    startBtn.addEventListener('click', handleStartClick, { passive: true });
    
    startBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      handleStartClick();
    }, { passive: false });
  }
  
  function handleStartClick() {
    console.log('🎯 Кнопка "Начать знакомство" нажата');
    
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
      console.log('📁 Профиль найден, переходим в ленту');
      showMainApp();
    } else {
      console.log('📝 Профиля нет, показываем анкету');
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
    
    console.log('✅ Настраиваю кнопку "Сохранить профиль"');
    
    saveProfileBtn.onclick = null;
    saveProfileBtn.ontouchstart = null;
    
    saveProfileBtn.addEventListener('click', handleSaveProfile, { passive: true });
    
    saveProfileBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      handleSaveProfile();
    }, { passive: false });
    
    saveProfileBtn.style.display = 'block';
  }
  
  function handleSaveProfile() {
    console.log('💾 Сохраняю профиль...');
    
    document.activeElement?.blur();
    document.body.classList.remove('keyboard-open');
    if (card) card.style.transform = 'translateY(0)';
    
    setTimeout(() => {
      const ageValue = Number(document.getElementById("age").value);
      const gender = document.getElementById("gender").value;
      const city = document.getElementById("city").value;
      const bio = document.getElementById("bio").value.trim();
      
      if (!ageValue || ageValue < 18 || ageValue > 99) {
        alert("Возраст должен быть от 18 до 99 лет");
        return;
      }
      if (!gender) {
        alert("Выберите пол");
        return;
      }
      if (!city) {
        alert("Выберите город");
        return;
      }
      if (bio.length < 10) {
        alert("О себе минимум 10 символов");
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
        min_age_filter: 18,
        max_age_filter: 35,
        max_distance_km: 50,
        use_geolocation: false,
        verification_status: 'not_verified'
      };
      
      if (saveProfile(profileData)) {
        console.log('✅ Профиль сохранен');
        
        if (tg?.HapticFeedback) {
          try {
            tg.HapticFeedback.impactOccurred('medium');
          } catch (e) {}
        }
        
        initVerification();
        initMatchesSystem();
        showMainApp();
        
        setTimeout(() => {
          alert("✅ Профиль сохранён! Добро пожаловать в SiaMatch 🍀\n\nТеперь вы можете пройти верификацию анкеты в разделе профиля.");
        }, 300);
      } else {
        alert("❌ Ошибка при сохранении профиля");
      }
    }, 300);
  }
  
  // ===== ПОКАЗАТЬ ОСНОВНОЕ ПРИЛОЖЕНИЕ =====
  function showMainApp() {
    console.log('🚀 Показываю основное приложение');
    
    if (welcomeScreen) welcomeScreen.classList.add("hidden");
    if (onboardingScreen) onboardingScreen.classList.add("hidden");
    
    if (tabBar) {
      tabBar.classList.remove("hidden");
    }
    
    initVerification();
    initMatchesSystem();
    
    setActiveTab("feed");
  }
  
  // ===== ЛЕНТА СВАЙПОВ =====
  function initFeed() {
    console.log('🔄 Инициализирую ленту');
    
    currentIndex = 0;
    showCurrentCandidate();
    
    const btnLike = document.getElementById("btn-like");
    const btnDislike = document.getElementById("btn-dislike");
    
    if (btnLike) {
      btnLike.onclick = null;
      btnLike.addEventListener('click', () => {
        const filtered = candidates.filter(c => !likedIds.includes(c.id));
        if (currentIndex < filtered.length) {
          handleLike(filtered[currentIndex].id);
        }
      });
    }
    
    if (btnDislike) {
      btnDislike.onclick = null;
      btnDislike.addEventListener('click', handleDislike);
    }
  }
  
  function showCurrentCandidate() {
    const filtered = candidates.filter(c => !likedIds.includes(c.id));
    
    if (currentIndex >= filtered.length) {
      document.getElementById("candidate-name").textContent = "";
      document.getElementById("candidate-age").textContent = "";
      document.getElementById("candidate-city").textContent = "";
      document.getElementById("candidate-bio").textContent = "";
      document.getElementById("candidate-photo").src = "";
      
      const likesInfo = document.getElementById("candidate-likes");
      if (likesInfo) likesInfo.style.display = 'none';
      
      const verifiedBadge = document.getElementById('candidate-verified');
      if (verifiedBadge) verifiedBadge.classList.add('hidden');
      
      document.getElementById("feed-status").textContent = 
        "На сегодня всё! Загляните позже 🍀";
      return;
    }
    
    const candidate = filtered[currentIndex];
    
    document.getElementById("candidate-name").textContent = candidate.name;
    document.getElementById("candidate-age").textContent = candidate.age;
    document.getElementById("candidate-city").textContent = `${candidate.city} • ${candidate.distance} км`;
    document.getElementById("candidate-bio").textContent = candidate.bio;
    document.getElementById("candidate-photo").src = candidate.photo;
    
    const likesInfo = document.getElementById("candidate-likes");
    if (!likesInfo) {
      const candidateInfo = document.querySelector('.candidate-info');
      if (candidateInfo) {
        const likesDiv = document.createElement('div');
        likesDiv.id = "candidate-likes";
        likesDiv.className = "candidate-likes";
        likesDiv.textContent = `❤️ ${candidate.likes} лайков`;
        candidateInfo.insertBefore(likesDiv, document.getElementById("candidate-bio"));
      }
    } else {
      likesInfo.textContent = `❤️ ${candidate.likes} лайков`;
      likesInfo.style.display = 'block';
    }
    
    document.getElementById("feed-status").textContent = "";
    
    const verifiedBadge = document.getElementById('candidate-verified');
    if (verifiedBadge) {
      if (candidate.verified) {
        verifiedBadge.classList.remove('hidden');
      } else {
        verifiedBadge.classList.add('hidden');
      }
    }
  }
  
  function handleDislike() {
    console.log('✖️ Дизлайк!');
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
    
    const filtered = candidates.filter(c => !likedIds.includes(c.id));
    if (currentIndex < filtered.length) {
      currentIndex++;
      showCurrentCandidate();
    }
  }
  
  // ===== ПРОФИЛЬ =====
  function initProfile() {
    console.log('👤 Инициализирую профиль');
    
    profileData = loadProfile();
    
    if (profileData) {
      document.getElementById("profile-age").value = profileData.age || "";
      document.getElementById("profile-gender").value = profileData.gender || "";
      document.getElementById("profile-city").value = profileData.city || "";
      document.getElementById("profile-bio").value = profileData.bio || "";
      document.getElementById("profile-min-age").value = profileData.min_age_filter || 18;
      document.getElementById("profile-max-age").value = profileData.max_age_filter || 35;
      document.getElementById("profile-max-distance").value = profileData.max_distance_km || 50;
      
      const geoCheckbox = document.getElementById("profile-use-geolocation");
      if (geoCheckbox) {
        geoCheckbox.checked = profileData.use_geolocation || false;
      }
      
      if (profileData.custom_photo_url) {
        const preview = document.getElementById('photo-preview');
        if (preview) {
          preview.src = profileData.custom_photo_url;
          preview.style.display = 'block';
        }
      }
    }
    
    const updateBtn = document.getElementById("updateProfileBtn");
    if (updateBtn) {
      updateBtn.onclick = null;
      updateBtn.addEventListener('click', handleUpdateProfile);
      updateBtn.style.display = 'block';
    }
    
    const photoInput = document.getElementById('profile-photo');
    if (photoInput) {
      photoInput.addEventListener('change', handlePhotoUpload);
    }
    
    updateVerificationUI();
  }
  
  function handleUpdateProfile() {
    console.log('📝 Обновляю профиль...');
    
    document.activeElement?.blur();
    document.body.classList.remove('keyboard-open');
    if (card) card.style.transform = 'translateY(0)';
    
    setTimeout(() => {
      if (!profileData) {
        alert("Сначала создайте профиль!");
        return;
      }
      
      profileData.age = Number(document.getElementById("profile-age").value);
      profileData.gender = document.getElementById("profile-gender").value;
      profileData.city = document.getElementById("profile-city").value;
      profileData.bio = document.getElementById("profile-bio").value.trim();
      profileData.min_age_filter = Number(document.getElementById("profile-min-age").value);
      profileData.max_age_filter = Number(document.getElementById("profile-max-age").value);
      profileData.max_distance_km = Number(document.getElementById("profile-max-distance").value);
      
      const geoCheckbox = document.getElementById("profile-use-geolocation");
      if (geoCheckbox) {
        profileData.use_geolocation = geoCheckbox.checked;
      }
      
      if (saveProfile(profileData)) {
        alert("✅ Профиль обновлён!");
        
        if (tg?.HapticFeedback) {
          try {
            tg.HapticFeedback.impactOccurred('light');
          } catch (e) {}
        }
      } else {
        alert("❌ Ошибка при обновлении профиля");
      }
    }, 300);
  }
  
  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Фото слишком большое (максимум 5MB)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
      const preview = document.getElementById('photo-preview');
      if (preview) {
        preview.src = event.target.result;
        preview.style.display = 'block';
      }
      
      if (profileData) {
        profileData.custom_photo_url = event.target.result;
        saveProfile(profileData);
      }
      
      alert('Фото загружено! 📸');
    };
    reader.readAsDataURL(file);
  }
  
  // ===== НАСТРОЙКА НОВЫХ КНОПОК =====
  function setupNewButtons() {
    if (backToMatchesBtn) {
      backToMatchesBtn.addEventListener('click', () => {
        if (chatScreen) chatScreen.classList.add('hidden');
        setActiveTab('matches');
      });
    }
    
    if (sendMessageBtn && messageInput) {
      sendMessageBtn.addEventListener('click', sendMessage);
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
      });
    }
  }
  
  // ===== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====
  function initApp() {
    if (hasInitialized) return;
    hasInitialized = true;
    
    console.log('🎬 Инициализация приложения...');
    
    initTelegram();
    setupStartButton();
    setupTabButtons();
    setupNewButtons();
    
    // Инициализируем счетчики лайков
    likesCounterFeed = document.getElementById("likes-counter-feed");
    likesCountFeed = document.getElementById("likes-count-feed");
    
    profileData = loadProfile();
    
    if (welcomeScreen) {
      welcomeScreen.classList.remove("hidden");
      console.log('👋 Показываю приветственный экран');
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
    
    console.log('✅ Приложение инициализировано');
  }
  
  // ===== ЗАПУСК =====
  setTimeout(initApp, 100);
});
