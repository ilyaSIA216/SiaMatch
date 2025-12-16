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
  
  // ❌ УДАЛЕНО: editPhotoInput обработчик
  
  // ✅ ДОБАВЛЕНО: обработчик для кнопки добавления фото
  const addPhotoBtn = document.getElementById('add-photo-btn');
  if (addPhotoBtn) {
    addPhotoBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔥 КНОПКА "Добавить фото" КЛИКНУТА!');
      
      const input = document.getElementById('profile-photo-upload');
      if (input) {
        input.click();  // Открываем file picker
        console.log('✅ File input кликнут!');
      } else {
        console.error('❌ input#profile-photo-upload не найден!');
      }
    });
    
    // ДЛЯ МОБИЛЬНЫХ
    addPhotoBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔥 Touch на "Добавить фото"!');
      const input = document.getElementById('profile-photo-upload');
      input?.click();
    }, { passive: false });
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
  
  // ✅ ТОЛЬКО ГАЛЕРЕЯ
  updateProfilePhotos();  // Показывает photos[0..2] в .profile-photos-container
}

function updateEditForm() {
  const editAgeElem = document.getElementById("edit-age");
  const editGenderElem = document.getElementById("edit-gender");
  const editCityElem = document.getElementById("edit-city");
  const editBioElem = document.getElementById("edit-bio");
  
  if (!window.profileData || !window.profileData.current) return;
  
  if (editAgeElem) editAgeElem.value = window.profileData.current.age || "";
  if (editGenderElem) editGenderElem.value = window.profileData.current.gender || "";
  if (editCityElem) editCityElem.value = window.profileData.current.city || "";
  if (editBioElem) editBioElem.value = window.profileData.current.bio || "";
  
  // ❌ УДАЛЕНО: код с custom_photo_url
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
    img.dataset.index = index;
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

// ===== ИНИЦИАЛИЗАЦИЯ ПРОФИЛЯ =====
function initProfile() {
  updateProfileDisplay();
  updateProfilePhotos();
  
  // ✅ Простой тач-драг без Sortable.js
  const container = document.querySelector('.profile-photos-container');
  if (container && window.profileData?.current?.photos?.length > 1) {
    let dragIndex = -1;
    let touchStartY = 0;
    
    container.addEventListener('touchstart', (e) => {
      const img = e.target.closest('img');
      if (!img) return;
      
      dragIndex = parseInt(img.dataset.index);
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    container.addEventListener('touchmove', (e) => {
      if (dragIndex >= 0 && window.profileData?.current?.photos?.length > 1) {
        const touchY = e.touches[0].clientY;
        const deltaY = touchY - touchStartY;
        
        // Простая логика перестановки
        if (Math.abs(deltaY) > 50) {
          const newIndex = deltaY > 0 ? 
            Math.min(dragIndex + 1, window.profileData.current.photos.length - 1) : 
            Math.max(dragIndex - 1, 0);
          
          if (newIndex !== dragIndex) {
            // Меняем местами в массиве
            [window.profileData.current.photos[dragIndex], window.profileData.current.photos[newIndex]] = 
            [window.profileData.current.photos[newIndex], window.profileData.current.photos[dragIndex]];
            
            // Сохраняем изменения
            if (typeof saveProfile === 'function') {
              saveProfile(window.profileData.current);
            }
            
            // Обновляем UI
            updateProfilePhotos();
            showNotification('✅ Порядок изменён!');
          }
          dragIndex = -1;
        }
      }
    }, { passive: true });
    
    container.addEventListener('touchend', () => {
      dragIndex = -1;
    }, { passive: true });
  }
  
  // Инициализируем слайдер фото если есть
  const profilePhotos = document.querySelectorAll('.profile-main-photo');
  const photoIndicators = document.querySelectorAll('.profile-photo-indicator');
  
  if (profilePhotos.length > 0) {
    let currentPhotoIndex = 0;
    
    // Добавляем обработчики свайпа
    let touchStartX = 0;
    let touchEndX = 0;
    
    container?.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    container?.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0 && currentPhotoIndex < profilePhotos.length - 1) {
          // Свайп влево - следующее фото
          currentPhotoIndex++;
        } else if (diff < 0 && currentPhotoIndex > 0) {
          // Свайп вправо - предыдущее фото
          currentPhotoIndex--;
        }
        
        // Обновляем отображение
        profilePhotos.forEach((photo, index) => {
          photo.classList.toggle('active', index === currentPhotoIndex);
        });
        
        photoIndicators.forEach((indicator, index) => {
          indicator.classList.toggle('active', index === currentPhotoIndex);
        });
      }
    }
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
window.initProfile = initProfile;
