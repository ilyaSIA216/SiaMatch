// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ДЛЯ ДОСТУПА =====
export let welcomeScreen = null;
export let animatedWelcomeScreen = null;
export let startBtn = null;
export let onboardingScreen = null;
export let saveProfileBtn = null;
export let tabBar = null;
export let appRoot = null;
export let card = null;

// ===== ИНИЦИАЛИЗАЦИЯ UI =====
export function initUI() {
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
  
  // Инициализация свайп системы
  initSwipeSystem();
}

// ===== ОБРАБОТЧИК КНОПКИ "НАЧАТЬ ЗНАКОМСТВО" =====
export function setupStartButton() {
  if (!startBtn) return;
  
  startBtn.addEventListener('click', handleStartClick, { passive: true });
  startBtn.addEventListener('touchstart', function(e) {
    e.preventDefault();
    handleStartClick();
  }, { passive: false });
}

export function handleStartClick() {
  import('./logic.js').then(({ tg, handleStartClickLogic }) => {
    handleStartClickLogic();
  });
}

// ===== НАСТРОЙКА КНОПКИ "СОХРАНИТЬ ПРОФИЛЬ" =====
export function setupSaveButton() {
  if (!saveProfileBtn) return;
  
  saveProfileBtn.addEventListener('click', handleSaveProfile, { passive: true });
  saveProfileBtn.addEventListener('touchstart', function(e) {
    e.preventDefault();
    handleSaveProfile();
  }, { passive: false });
  
  saveProfileBtn.style.display = 'block';
}

export function handleSaveProfile() {
  import('./logic.js').then(({ handleSaveProfileLogic }) => {
    handleSaveProfileLogic();
  });
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

// ===== УПРАВЛЕНИЕ ТАБАМИ =====
export function setupTabButtons() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const tab = this.dataset.tab;
      setActiveTab(tab);
      
      import('./logic.js').then(({ tg }) => {
        if (tg?.HapticFeedback) {
          try {
            tg.HapticFeedback.selectionChanged();
          } catch (e) {}
        }
      });
    });
  });
}

export function setActiveTab(tab) {
  document.querySelectorAll('.screen').forEach(screen => {
    if (screen.id !== 'welcome-screen' && 
        screen.id !== 'chat-screen' && 
        screen.id !== 'screen-interests' &&
        screen.id !== 'welcome-animated-screen') {
      screen.classList.add('hidden');
    }
  });
  
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
  
  import('./logic.js').then(({ initFeed, initProfile, initFiltersTab, updateChatsList }) => {
    import('./ui.js').then(({ updateLikesUI }) => {
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
    });
  });
  
  if (tabBar) {
    tabBar.classList.remove('hidden');
  }
  
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 50);
}

// ===== ПОКАЗАТЬ АНИМИРОВАННЫЙ ЭКРАН ПРИВЕТСТВИЯ =====
export function showAnimatedWelcomeScreen() {
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
export function showOnboarding() {
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
export function showMainApp() {
  if (welcomeScreen) welcomeScreen.classList.add("hidden");
  if (animatedWelcomeScreen) animatedWelcomeScreen.classList.add("hidden");
  if (onboardingScreen) onboardingScreen.classList.add("hidden");
  
  if (tabBar) {
    tabBar.classList.remove("hidden");
  }
  
  setActiveTab("feed");
}

// ===== СИСТЕМА СВАЙПОВ И УПРАВЛЕНИЯ ФОТОГРАФИЯМИ =====
export function initSwipeSystem() {
  console.log('🔄 Инициализирую систему свайпов и фотографий');
  
  const candidateCard = document.getElementById('candidate-card');
  const photosContainer = document.querySelector('.candidate-photos-container');
  
  if (!candidateCard || !photosContainer) return;
  
  const actions = document.querySelector('.actions');
  if (actions) {
    actions.style.display = 'none';
  }
  
  initSwipeGestures(candidateCard);
  initPhotoSwitching(photosContainer);
}

// ===== УПРАВЛЕНИЕ ПРОФИЛЕМ =====
export function handleEditProfile() {
  document.getElementById('profile-display').classList.add('hidden');
  document.getElementById('profile-edit').classList.remove('hidden');
  
  import('./logic.js').then(({ tg }) => {
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.selectionChanged();
      } catch (e) {}
    }
  });
}

export function handleSaveProfileChanges() {
  document.activeElement?.blur();
  document.body.classList.remove('keyboard-open');
  if (card) card.style.transform = 'translateY(0)';
  
  setTimeout(() => {
    import('./logic.js').then(({ handleSaveProfileChangesLogic }) => {
      handleSaveProfileChangesLogic();
    });
  }, 300);
}

export function handleCancelEdit() {
  document.getElementById('profile-display').classList.remove('hidden');
  document.getElementById('profile-edit').classList.add('hidden');
}

export function handlePhotoUpload(e) {
  import('./logic.js').then(({ handlePhotoUploadLogic }) => {
    handlePhotoUploadLogic(e);
  });
}

// ===== УВЕДОМЛЕНИЯ =====
export function showNotification(message) {
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

// Экспорт вспомогательных функций для других модулей
export function updateLikesUI() {
  // Экспорт для совместимости
}
export function updateChatsList() {
  // Экспорт для совместимости
}
