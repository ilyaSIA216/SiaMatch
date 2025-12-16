// ===== UI.JS - УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ И DOM =====

// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ДЛЯ ДОСТУПА =====
let welcomeScreen = null;
let animatedWelcomeScreen = null;
let startBtn = null;
let onboardingScreen = null;
let saveProfileBtn = null;
let tabBar = null;
let appRoot = null;
let card = null;

// ===== ИНИЦИАЛИЗАЦИЯ UI =====
function initUI() {
  console.log('🎨 Инициализация интерфейса...');
  
  // Получаем DOM элементы
  welcomeScreen = document.getElementById("welcome-screen");
  animatedWelcomeScreen = document.getElementById("welcome-animated-screen");
  startBtn = document.getElementById("startBtn");
  onboardingScreen = document.getElementById("onboarding-screen");
  saveProfileBtn = document.getElementById("saveProfileBtn");
  tabBar = document.getElementById("tab-bar");
  appRoot = document.getElementById("app-root");
  card = document.getElementById("card");
  
  // Настраиваем обработчики
  setupStartButton();
  setupTabButtons();
  setupProfileEventHandlers();
  
  // ✅ ДОБАВЛЕНО: обновление UI после загрузки профиля
  setTimeout(() => {
    if (window.profileData && window.profileData.current) {
      // Обновляем отображение профиля если он есть
      if (typeof updateProfileDisplay === 'function') {
        updateProfileDisplay();
      }
      if (typeof updateEditForm === 'function') {
        updateEditForm();
      }
      if (typeof updateProfilePhotos === 'function') {
        updateProfilePhotos();
      }
    }
  }, 50);
  
  console.log('✅ Интерфейс инициализирован');
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
  if (window.tg?.HapticFeedback) {
    try {
      window.tg.HapticFeedback.impactOccurred('light');
    } catch (e) {}
  }
  
  if (welcomeScreen) {
    welcomeScreen.classList.add("hidden");
  }
  
  if (animatedWelcomeScreen) {
    animatedWelcomeScreen.classList.add('hidden');
  }
  
  if (window.profileData && window.profileData.current) {
    showMainApp();
  } else {
    showOnboarding();
  }
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

// ===== ПОКАЗАТЬ АНИМИРОВАННЫЙ ЭКРАН ПРИВЕТСТВИЯ =====
function showAnimatedWelcomeScreen() {
  if (!animatedWelcomeScreen) return;
  
  if (welcomeScreen) {
    welcomeScreen.classList.add('hidden');
  }
  
  animatedWelcomeScreen.classList.remove('hidden');
  
  const animatedSubtitle = document.getElementById('animated-subtitle');
  if (animatedSubtitle) {
    setTimeout(() => {
      hideAnimatedWelcomeScreen();
    }, 6500);
    
    animatedSubtitle.addEventListener('animationend', function() {
      setTimeout(hideAnimatedWelcomeScreen, 2000);
    }, { once: true });
  }
}

function hideAnimatedWelcomeScreen() {
  if (!animatedWelcomeScreen) return;
  
  animatedWelcomeScreen.style.animation = 'fadeOutScreen 0.8s ease forwards';
  
  setTimeout(() => {
    animatedWelcomeScreen.classList.add('hidden');
    animatedWelcomeScreen.style.animation = '';
    
    showMainApp();
    
    setTimeout(() => {
      showNotification("🍀 С возвращением в SiaMatch!\n\nЖелаем вам найти свою идеальную пару! ❤️");
    }, 500);
  }, 800);
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

// ===== ПОКАЗАТЬ ОСНОВНОЕ ПРИЛОЖЕНИЕ =====
function showMainApp() {
  if (welcomeScreen) welcomeScreen.classList.add("hidden");
  if (animatedWelcomeScreen) animatedWelcomeScreen.classList.add("hidden");
  if (onboardingScreen) onboardingScreen.classList.add("hidden");
  
  if (tabBar) {
    tabBar.classList.remove("hidden");
  }
  
  setActiveTab("feed");
}

// ===== УПРАВЛЕНИЕ ТАБАМИ =====
function setupTabButtons() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const tab = this.dataset.tab;
      setActiveTab(tab);
      
      if (window.tg?.HapticFeedback) {
        try {
          window.tg.HapticFeedback.selectionChanged();
        } catch (e) {}
      }
    });
  });
}

function setActiveTab(tab) {
  // Скрываем все экраны
  document.querySelectorAll('.screen').forEach(screen => {
    if (screen.id !== 'welcome-screen' && 
        screen.id !== 'chat-screen' && 
        screen.id !== 'screen-interests' &&
        screen.id !== 'welcome-animated-screen') {
      screen.classList.add('hidden');
    }
  });
  
  // Скрываем чат если переключаемся на другую вкладку
  if (tab !== 'chats' && document.getElementById('chat-screen')) {
    document.getElementById('chat-screen').classList.add('hidden');
  }
  
  // Показываем выбранный экран
  const screenId = 'screen-' + tab;
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.remove('hidden');
  }
  
  // Обновляем активную кнопку таба
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  
  // Инициализация контента вкладки
  if (tab === 'feed') {
    if (typeof initFeed === 'function') initFeed();
  } else if (tab === 'profile') {
    if (typeof initProfile === 'function') initProfile();
  } else if (tab === 'filters') {
    if (typeof initFiltersTab === 'function') initFiltersTab();
  } else if (tab === 'chats') {
    if (typeof updateLikesUI === 'function') updateLikesUI();
    if (typeof updateChatsList === 'function') updateChatsList();
  }
  
  // Показываем панель навигации
  if (tabBar) {
    tabBar.classList.remove('hidden');
  }
  
  // Скролл наверх
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 50);
}

// ===== НАСТРОЙКА ОБРАБОТЧИКОВ ПРОФИЛЯ =====
function setupProfileEventHandlers() {
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
}

// ===== УПРАВЛЕНИЕ ПРОФИЛЕМ =====
function handleEditProfile() {
  document.getElementById('profile-display').classList.add('hidden');
  document.getElementById('profile-edit').classList.remove('hidden');
  
  if (window.tg?.HapticFeedback) {
    try {
      window.tg.HapticFeedback.selectionChanged();
    } catch (e) {}
  }
}

function handleSaveProfileChanges() {
  document.activeElement?.blur();
  document.body.classList.remove('keyboard-open');
  if (card) card.style.transform = 'translateY(0)';
  
  setTimeout(() => {
    if (typeof handleSaveProfileChangesLogic === 'function') {
      handleSaveProfileChangesLogic();
    }
  }, 300);
}

function handleCancelEdit() {
  document.getElementById('profile-display').classList.remove('hidden');
  document.getElementById('profile-edit').classList.add('hidden');
}

function handlePhotoUpload(e) {
  if (typeof handlePhotoUploadLogic === 'function') {
    handlePhotoUploadLogic(e);
  }
}

// ===== ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ ПРОФИЛЯ =====
function updateProfileDisplay() {
  const profileNameElem = document.getElementById('profile-name');
  const profileAgeElem = document.getElementById('profile-age-display');
  const profileGenderElem = document.getElementById('profile-gender-display');
  const profileCityElem = document.getElementById('profile-city-display');
  const profilePhotoElem = document.getElementById('profile-photo-preview');
  
  if (!window.profileData || !window.profileData.current) return;
  
  if (profileNameElem) {
    profileNameElem.textContent = window.profileData.current.first_name || "Пользователь";
  }
  
  if (profileAgeElem) {
    profileAgeElem.textContent = window.profileData.current.age ? `${window.profileData.current.age} лет` : "";
  }
  
  if (profileGenderElem) {
    const genderMap = {
      'male': 'Мужской',
      'female': 'Женский'
    };
    profileGenderElem.textContent = window.profileData.current.gender ? 
      genderMap[window.profileData.current.gender] || window.profileData.current.gender : "";
  }
  
  if (profileCityElem) {
    profileCityElem.textContent = window.profileData.current.city || "";
  }
  
  if (profilePhotoElem && window.profileData.current.custom_photo_url) {
    profilePhotoElem.src = window.profileData.current.custom_photo_url;
    profilePhotoElem.style.display = 'block';
  }
}

function updateEditForm() {
  const editAgeElem = document.getElementById("edit-age");
  const editGenderElem = document.getElementById("edit-gender");
  const editCityElem = document.getElementById("edit-city");
  const editBioElem = document.getElementById("edit-bio");
  const editPhotoElem = document.getElementById('edit-photo-preview');
  
  if (!window.profileData || !window.profileData.current) return;
  
  if (editAgeElem) editAgeElem.value = window.profileData.current.age || "";
  if (editGenderElem) editGenderElem.value = window.profileData.current.gender || "";
  if (editCityElem) editCityElem.value = window.profileData.current.city || "";
  if (editBioElem) editBioElem.value = window.profileData.current.bio || "";
  
  if (editPhotoElem && window.profileData.current.custom_photo_url) {
    editPhotoElem.src = window.profileData.current.custom_photo_url;
    editPhotoElem.style.display = 'block';
  }
}

function updateProfilePhotos() {
  if (!window.profileData || !window.profileData.current || 
      !window.profileData.current.photos || window.profileData.current.photos.length === 0) return;
  
  const container = document.querySelector('.profile-photos-container');
  const indicators = document.querySelector('.profile-photo-indicators');
  const photosCount = document.getElementById('photos-count');
  const removeBtn = document.getElementById('remove-photo-btn');
  
  if (!container || !indicators) return;
  
  container.innerHTML = '';
  
  window.profileData.current.photos.forEach((photoUrl, index) => {
    const img = document.createElement('img');
    img.className = `profile-main-photo ${index === 0 ? 'active' : ''}`;
    img.src = photoUrl;
    img.alt = `Фото ${index + 1}`;
    container.appendChild(img);
  });
  
  indicators.innerHTML = '';
  window.profileData.current.photos.forEach((_, index) => {
    const indicator = document.createElement('div');
    indicator.className = `profile-photo-indicator ${index === 0 ? 'active' : ''}`;
    indicator.dataset.index = index;
    indicators.appendChild(indicator);
  });
  
  if (photosCount) {
    photosCount.textContent = `${window.profileData.current.photos.length}/3 фото`;
  }
  
  if (removeBtn) {
    removeBtn.disabled = window.profileData.current.photos.length <= 1;
  }
}

// ===== УВЕДОМЛЕНИЯ =====
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-text">${message.replace(/\n/g, '<br>')}</div>
    </div>
  `;
  
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
  
  document.body.appendChild(notification);
  
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

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ДРУГИХ МОДУЛЕЙ =====
function updateLikesUI() {
  // Заглушка - реализация в likes.js
}

function updateChatsList() {
  // Заглушка - реализация в chats.js
}

// ===== ЭКСПОРТ ФУНКЦИЙ В ГЛОБАЛЬНУЮ ОБЛАСТЬ ВИДИМОСТИ =====
window.initUI = initUI;
window.showAnimatedWelcomeScreen = showAnimatedWelcomeScreen;
window.showOnboarding = showOnboarding;
window.showMainApp = showMainApp;
window.setActiveTab = setActiveTab;
window.showNotification = showNotification;
window.updateProfileDisplay = updateProfileDisplay;
window.updateEditForm = updateEditForm;
window.updateProfilePhotos = updateProfilePhotos;
window.handleEditProfile = handleEditProfile;
window.handleSaveProfileChanges = handleSaveProfileChanges;
window.handleCancelEdit = handleCancelEdit;
window.handlePhotoUpload = handlePhotoUpload;
window.updateLikesUI = updateLikesUI;
window.updateChatsList = updateChatsList;
