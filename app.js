// app.js - Упрощенная версия
// ДОБАВЬ ЭТО ПЕРВЫМИ СТРОЧКАМИ В app.js
(function initTelegram() {
    if (window.Telegram && window.Telegram.WebApp) {
        // КРИТИЧНО для iOS
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        
        // Отключаем кнопку если есть
        if (window.Telegram.WebApp.MainButton) {
            window.Telegram.WebApp.MainButton.hide();
        }
        
        console.log('✅ Telegram WebApp готов для iOS');
    } else {
        console.log('⚠️ Не в Telegram WebView, режим демо');
        // Создаем заглушку для тестирования
        window.Telegram = {
            WebApp: {
                ready: () => console.log('DEMO: ready'),
                expand: () => console.log('DEMO: expand'),
                initDataUnsafe: { user: { id: 1, first_name: 'Демо' } }
            }
        };
    }
})();

document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 SiaMatch запускается...');
  
  let hasInitialized = false;
  
  // ===== ОСНОВНЫЕ ФУНКЦИИ =====
  function initApp() {
    if (hasInitialized) return;
    hasInitialized = true;
    
    console.log('🎬 Инициализация приложения...');
    
    try {
      // Инициализируем базовые функции
      AppCore.initTelegram();
      
      // Инициализируем системы (в правильном порядке)
      AppBonus.init();
      AppProfile.init();
      AppChat.init();
      AppSwipe.init();
      
      // Настройка кнопок и UI
      setupStartButton();
      setupTabButtons();
      setupProfileEventListeners();
      
      // Загрузка профиля
      const profileData = AppCore.loadLocalStorage("siamatch_profile");
      
      if (profileData) {
        // Обновляем данные профиля в модуле
        if (AppProfile && AppProfile.profileData === null) {
          AppProfile.profileData = profileData;
        }
        showAnimatedWelcomeScreen();
      } else {
        const welcomeScreen = document.getElementById('welcome-screen');
        if (welcomeScreen) {
          welcomeScreen.classList.remove("hidden");
        }
      }
      
      // Скрываем все экраны кроме welcome
      document.querySelectorAll('.screen').forEach(screen => {
        if (screen.id !== 'welcome-screen' && 
            screen.id !== 'screen-interests' && 
            screen.id !== 'welcome-animated-screen') {
          screen.classList.add('hidden');
        }
      });
      
      const tabBar = document.getElementById('tab-bar');
      if (tabBar) tabBar.classList.add("hidden");
      
      console.log('✅ Приложение инициализировано');
    } catch (error) {
      console.error('❌ Ошибка инициализации:', error);
      AppCore.showNotification('Ошибка загрузки приложения. Пожалуйста, обновите страницу.');
    }
  }
  
  // ===== НАСТРОЙКА КНОПКИ "НАЧАТЬ" =====
  function setupStartButton() {
    const startBtn = document.getElementById("startBtn");
    if (!startBtn) return;
    
    startBtn.addEventListener('click', handleStartClick, { passive: true });
  }
  
  function handleStartClick() {
    if (AppCore.tg?.HapticFeedback) {
      try {
        AppCore.tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
    
    const welcomeScreen = document.getElementById("welcome-screen");
    if (welcomeScreen) {
      welcomeScreen.classList.add("hidden");
    }
    
    const animatedWelcomeScreen = document.getElementById("welcome-animated-screen");
    if (animatedWelcomeScreen) {
      animatedWelcomeScreen.classList.add('hidden');
    }
    
    const profileData = AppCore.loadLocalStorage("siamatch_profile");
    
    if (profileData) {
      showMainApp();
    } else {
      showOnboarding();
    }
  }
  
  // ===== ПОКАЗАТЬ АНКЕТУ =====
  function showOnboarding() {
    const onboardingScreen = document.getElementById("onboarding-screen");
    if (onboardingScreen) {
      onboardingScreen.classList.remove("hidden");
    }
    
    const tabBar = document.getElementById("tab-bar");
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
    const saveProfileBtn = document.getElementById("saveProfileBtn");
    if (!saveProfileBtn) return;
    
    saveProfileBtn.addEventListener('click', handleSaveProfile, { passive: true });
    saveProfileBtn.style.display = 'block';
  }
  
  function handleSaveProfile() {
    document.activeElement?.blur();
    document.body.classList.remove('keyboard-open');
    const card = document.getElementById('card');
    if (card) card.style.transform = 'translateY(0)';
    
    setTimeout(() => {
      const ageValue = Number(document.getElementById("age").value);
      const gender = document.getElementById("gender").value;
      const city = document.getElementById("city").value;
      const bio = document.getElementById("bio").value.trim();
      
      if (!ageValue || ageValue < 18 || ageValue > 99) {
        AppCore.showNotification("Возраст должен быть от 18 до 99 лет");
        return;
      }
      if (!gender) {
        AppCore.showNotification("Выберите пол");
        return;
      }
      if (!city) {
        AppCore.showNotification("Выберите город");
        return;
      }
      if (bio.length < 10) {
        AppCore.showNotification("О себе минимум 10 символов");
        return;
      }
      
      const user = AppCore.tg?.initDataUnsafe?.user || { id: 1, first_name: "Пользователь" };
      const profileData = {
        tg_id: user.id,
        first_name: user.first_name || "Пользователь",
        username: user.username || "",
        age: ageValue,
        gender,
        city,
        bio,
        verification_status: 'not_verified'
      };
      
      if (AppCore.saveLocalStorage("siamatch_profile", profileData)) {
        if (AppCore.tg?.HapticFeedback) {
          try {
            AppCore.tg.HapticFeedback.impactOccurred('medium');
          } catch (e) {}
        }
        
        AppProfile.profileData = profileData;
        showMainApp();
        
        setTimeout(() => {
          AppCore.showNotification("✅ Профиль сохранён! Добро пожаловать в SiaMatch 🍀");
        }, 300);
      } else {
        AppCore.showNotification("❌ Ошибка при сохранении профиля");
      }
    }, 300);
  }
  
  // ===== ПОКАЗАТЬ ОСНОВНОЕ ПРИЛОЖЕНИЕ =====
  function showMainApp() {
    const welcomeScreen = document.getElementById("welcome-screen");
    const animatedWelcomeScreen = document.getElementById("welcome-animated-screen");
    const onboardingScreen = document.getElementById("onboarding-screen");
    
    if (welcomeScreen) welcomeScreen.classList.add("hidden");
    if (animatedWelcomeScreen) animatedWelcomeScreen.classList.add("hidden");
    if (onboardingScreen) onboardingScreen.classList.add("hidden");
    
    const tabBar = document.getElementById("tab-bar");
    if (tabBar) {
      tabBar.classList.remove("hidden");
    }
    
    setActiveTab("feed");
  }
  
  // ===== УПРАВЛЕНИЕ ТАБАМИ =====
  function setActiveTab(tab) {
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
    
    if (tab === 'feed') {
      if (AppSwipe) AppSwipe.showCurrentCandidate();
    } else if (tab === 'profile') {
      if (AppProfile) {
        AppProfile.updateProfileDisplay();
        AppProfile.updateVerificationUI();
        AppProfile.initProfilePhotos();
      }
    } else if (tab === 'chats') {
      if (AppChat) {
        AppChat.updateLikesUI();
        AppChat.updateChatsList();
      }
    }
    
    const tabBar = document.getElementById('tab-bar');
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
        
        if (AppCore.tg?.HapticFeedback) {
          try {
            AppCore.tg.HapticFeedback.selectionChanged();
          } catch (e) {}
        }
      });
    });
  }
  
  // ===== НАСТРОЙКА ПРОФИЛЯ =====
  function setupProfileEventListeners() {
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
  
  function handleEditProfile() {
    document.getElementById('profile-display').classList.add('hidden');
    document.getElementById('profile-edit').classList.remove('hidden');
    
    if (AppCore.tg?.HapticFeedback) {
      try {
        AppCore.tg.HapticFeedback.selectionChanged();
      } catch (e) {}
    }
  }
  
  function handleSaveProfileChanges() {
    document.activeElement?.blur();
    document.body.classList.remove('keyboard-open');
    const card = document.getElementById('card');
    if (card) card.style.transform = 'translateY(0)';
    
    setTimeout(() => {
      if (!AppProfile.profileData) {
        AppCore.showNotification("Сначала создайте профиль!");
        return;
      }
      
      AppProfile.profileData.age = Number(document.getElementById("edit-age").value);
      AppProfile.profileData.gender = document.getElementById("edit-gender").value;
      AppProfile.profileData.city = document.getElementById("edit-city").value;
      AppProfile.profileData.bio = document.getElementById("edit-bio").value.trim();
      
      if (AppCore.saveLocalStorage("siamatch_profile", AppProfile.profileData)) {
        AppProfile.updateProfileDisplay();
        
        document.getElementById('profile-display').classList.remove('hidden');
        document.getElementById('profile-edit').classList.add('hidden');
        
        AppCore.showNotification("✅ Профиль обновлён!");
        
        if (AppCore.tg?.HapticFeedback) {
          try {
            AppCore.tg.HapticFeedback.impactOccurred('light');
          } catch (e) {}
        }
      } else {
        AppCore.showNotification("❌ Ошибка при обновлении профиля");
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
      AppCore.showNotification('Фото слишком большое (максимум 5MB)');
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
        
        AppProfile.profileData.custom_photo_url = event.target.result;
      } else {
        const preview = document.getElementById('profile-photo-preview');
        if (preview) {
          preview.src = event.target.result;
          preview.style.display = 'block';
        }
        
        AppProfile.profileData.custom_photo_url = event.target.result;
        AppCore.saveLocalStorage("siamatch_profile", AppProfile.profileData);
        AppCore.showNotification('Фото загружено! 📸');
      }
    };
    reader.readAsDataURL(file);
  }
  
  // ===== ПОКАЗАТЬ АНИМИРОВАННЫЙ ЭКРАН ПРИВЕТСТВИЯ =====
  function showAnimatedWelcomeScreen() {
    const animatedWelcomeScreen = document.getElementById('welcome-animated-screen');
    if (!animatedWelcomeScreen) return;
    
    const welcomeScreen = document.getElementById('welcome-screen');
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
    const animatedWelcomeScreen = document.getElementById('welcome-animated-screen');
    if (!animatedWelcomeScreen) return;
    
    animatedWelcomeScreen.style.animation = 'fadeOutScreen 0.8s ease forwards';
    
    setTimeout(() => {
      animatedWelcomeScreen.classList.add('hidden');
      animatedWelcomeScreen.style.animation = '';
      
      showMainApp();
      
      setTimeout(() => {
        AppCore.showNotification("🍀 С возвращением в SiaMatch!\n\nЖелаем вам найти свою идеальную пару! ❤️");
      }, 500);
    }, 800);
  }
  
  // ===== ЗАПУСК =====
  setTimeout(initApp, 100);
});
