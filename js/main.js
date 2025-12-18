// ===== ОСНОВНОЙ ФАЙЛ ПРИЛОЖЕНИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 SiaMatch запускается...');
  
  // Глобальные переменные состояния
  window.tg = null;
  window.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  window.profileData = { current: null };
  window.hasInitialized = false;
  
  // ===== ИНИЦИАЛИЗАЦИЯ TELEGRAM WEBAPP =====
  function initTelegramApp() {
    console.log('🔧 Инициализация Telegram WebApp...');
    
    if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
      window.tg = Telegram.WebApp;
      console.log('✅ Telegram WebApp обнаружен');
      
      // Получаем данные пользователя
      const initData = window.tg.initData || '';
      const initDataUnsafe = window.tg.initDataUnsafe || {};
      const user = initDataUnsafe.user || null;
      
      // Сохраняем данные пользователя в localStorage для использования
      if (user) {
        console.log('👤 Пользователь Telegram:', user);
        localStorage.setItem('tg_user', JSON.stringify(user));
        
        // Обновляем приветствие
        const usernameElement = document.getElementById('username');
        if (usernameElement) {
          usernameElement.textContent = `Привет, ${user.first_name || 'друг'}!`;
        }
      }
      
      // Настройка интерфейса Telegram
      window.tg.setHeaderColor('#7c3aed'); // Фиолетовый цвет
      window.tg.setBackgroundColor('#f8fafc'); // Светлый фон
      
      // Включаем кнопку "Назад"
      window.tg.BackButton.show();
      window.tg.BackButton.onClick(() => {
        handleBackButton();
      });
      
      // Устанавливаем тему
      if (window.tg.themeParams) {
        applyTelegramTheme(window.tg.themeParams);
      }
      
    } else {
      console.log('⚠️ Telegram WebApp не обнаружен, работаем в браузере');
      window.tg = null;
      
      // Создаем тестового пользователя для разработки
      const mockUser = {
        id: Math.floor(Math.random() * 1000000),
        first_name: 'Тестовый',
        last_name: 'Пользователь',
        username: 'test_user_' + Date.now(),
        language_code: 'ru'
      };
      
      localStorage.setItem('tg_user', JSON.stringify(mockUser));
      
      const usernameElement = document.getElementById('username');
      if (usernameElement) {
        usernameElement.textContent = 'Привет, тестовый пользователь!';
      }
    }
  }

  // ===== ПРИМЕНЕНИЕ ТЕМЫ TELEGRAM =====
  function applyTelegramTheme(themeParams) {
    console.log('🎨 Применение темы Telegram:', themeParams);
    
    // Устанавливаем CSS переменные для темной/светлой темы
    const root = document.documentElement;
    
    if (themeParams.bg_color) {
      root.style.setProperty('--bg-color', themeParams.bg_color);
    }
    
    if (themeParams.text_color) {
      root.style.setProperty('--text-color', themeParams.text_color);
    }
    
    if (themeParams.hint_color) {
      root.style.setProperty('--text-secondary', themeParams.hint_color);
    }
    
    if (themeParams.button_color) {
      root.style.setProperty('--primary-color', themeParams.button_color);
    }
    
    if (themeParams.button_text_color) {
      root.style.setProperty('--button-text-color', themeParams.button_text_color);
    }
  }

  // ===== ОБРАБОТКА КНОПКИ "НАЗАД" =====
  function handleBackButton() {
    console.log('← Кнопка "Назад" нажата');
    
    const currentScreen = getCurrentScreen();
    
    switch(currentScreen) {
      case 'welcome-screen':
      case 'welcome-animated-screen':
        // На стартовом экране - закрываем приложение
        if (window.tg && window.tg.close) {
          window.tg.close();
        }
        break;
        
      case 'onboarding-screen':
        // Возвращаемся на приветственный экран
        showScreen('welcome');
        break;
        
      case 'screen-feed':
      case 'screen-chats':
      case 'screen-filters':
      case 'screen-profile':
        // В основном интерфейсе - показываем меню или выходим
        if (window.tg && window.tg.showConfirm) {
          window.tg.showConfirm('Закрыть приложение?', (confirmed) => {
            if (confirmed && window.tg.close) {
              window.tg.close();
            }
          });
        }
        break;
        
      case 'screen-invite':
        // Возвращаемся в профиль
        showScreen('profile');
        break;
        
      default:
        // По умолчанию показываем ленту
        showScreen('feed');
        break;
    }
  }

  // ===== ПОЛУЧЕНИЕ ТЕКУЩЕГО ЭКРАНА =====
  function getCurrentScreen() {
    const screens = document.querySelectorAll('.screen:not(.hidden)');
    return screens.length > 0 ? screens[0].id : null;
  }

  // ===== ЗАГРУЗКА ПРОФИЛЯ =====
  function loadProfile() {
    try {
      // Пробуем загрузить из localStorage
      const saved = localStorage.getItem('sia_profile');
      if (saved) {
        const profile = JSON.parse(saved);
        console.log('📂 Загружен профиль:', profile);
        return profile;
      }
      
      // Если нет профиля, создаем новый на основе данных Telegram
      const tgUser = JSON.parse(localStorage.getItem('tg_user') || '{}');
      
      const newProfile = {
        id: tgUser.id || Date.now(),
        firstName: tgUser.first_name || 'Пользователь',
        lastName: tgUser.last_name || '',
        username: tgUser.username || `user_${Date.now()}`,
        age: null,
        gender: null,
        city: null,
        bio: '',
        interests: [],
        datingGoal: '',
        photos: [],
        verificationStatus: 'not_verified',
        boostStatus: 'not_boosted',
        remainingSwipes: 20,
        likesCount: 0,
        chats: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('🆕 Создан новый профиль:', newProfile);
      return newProfile;
      
    } catch (error) {
      console.error('❌ Ошибка загрузки профиля:', error);
      return null;
    }
  }

  // ===== ПОКАЗ АНИМИРОВАННОГО ПРИВЕТСТВЕННОГО ЭКРАНА =====
  function showAnimatedWelcomeScreen() {
    const animatedScreen = document.getElementById('welcome-animated-screen');
    if (!animatedScreen) return;
    
    console.log('🎭 Показ анимированного приветственного экрана');
    
    // Скрываем обычный приветственный экран
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
      welcomeScreen.classList.add('hidden');
    }
    
    // Показываем анимированный экран
    animatedScreen.classList.remove('hidden');
    
    // Запускаем анимации
    setTimeout(() => {
      const clover = document.getElementById('animated-clover');
      const title = document.getElementById('animated-title');
      const subtitle = document.getElementById('animated-subtitle');
      
      if (clover) clover.style.animation = 'bounceIn 1s ease forwards';
      if (title) title.style.animation = 'fadeInUp 1s ease forwards 0.3s';
      if (subtitle) subtitle.style.animation = 'fadeInUp 1s ease forwards 0.6s';
      
      // Запускаем анимацию сердца
      const heartPath = document.querySelector('.heart-path');
      if (heartPath) {
        heartPath.style.animation = 'drawHeart 2s ease-in-out forwards 1s';
      }
      
    }, 100);
    
    // Через 3 секунды показываем основной интерфейс
    setTimeout(() => {
      // Проверяем, заполнен ли профиль
      const profile = window.profileData.current;
      if (profile && profile.age && profile.gender && profile.city) {
        // Профиль заполнен - показываем ленту
        showScreen('feed');
      } else {
        // Профиль не заполнен - показываем анкету
        showScreen('onboarding');
      }
    }, 3000);
  }

  // ===== ИНИЦИАЛИЗАЦИЯ ВСЕХ СИСТЕМ =====
  function initAllSystems() {
    console.log('⚙️ Инициализация всех систем...');
    
    // Проверяем наличие профиля
    const profile = window.profileData.current;
    
    if (profile) {
      // Загружаем фотографии
      if (typeof loadUserPhotos === 'function') {
        loadUserPhotos(profile.id);
      }
      
      // Обновляем отображение профиля
      if (typeof updateProfileDisplay === 'function') {
        updateProfileDisplay();
      }
      
      // Загружаем кандидатов для свайпов
      if (typeof loadCandidates === 'function') {
        setTimeout(() => loadCandidates(), 500);
      }
      
      // Обновляем счетчик свайпов
      if (typeof updateSwipesCount === 'function') {
        updateSwipesCount();
      }
    }
    
    // Инициализация свайпов
    if (typeof initSwipeHandlers === 'function') {
      setTimeout(() => initSwipeHandlers(), 1000);
    }
    
    console.log('✅ Все системы инициализированы');
  }
  
  // ===== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====
  async function initApp() {
    if (window.hasInitialized) return;
    window.hasInitialized = true;
    
    console.log('🎬 Инициализация приложения...');
    
    // 1. Инициализация Telegram WebApp
    initTelegramApp();
    initUI();
    initInviteScreen(); // Добавлен вызов инициализации экрана приглашения
      
    if (window.tg) {
      window.tg.expand(); // Расширяет на полный экран
      window.tg.ready();  // Сообщаем что приложение готово
      
      // Фикс для iOS Safari (решает проблему с кнопками)
      if (window.isIOS) {
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
        document.documentElement.style.height = '100vh';
      }
    }
    
    // 2. Загрузка профиля ИЗ localStorage ДО UI
    window.profileData.current = loadProfile() || null;
    console.log('📂 Загружен профиль:', window.profileData.current ? 'Да' : 'Нет');
    
    // Инициализация хранилища фото
    setTimeout(async () => {
      if (typeof initPhotoStorage === 'function') {
        await initPhotoStorage();
      }
    }, 500);
    
    // 3. Инициализация интерфейса (UI уже видит profileData.current)
    // initUI() уже был вызван выше
    
    // 4. Показ экрана в зависимости от состояния
    const welcomeScreen = document.getElementById("welcome-screen");
    
    if (window.profileData.current) {
      showAnimatedWelcomeScreen();
    } else {
      if (welcomeScreen) {
        welcomeScreen.classList.remove("hidden");
      }
    }
    
    // Скрытие лишних экранов
    const onboardingScreen = document.getElementById("onboarding-screen");
    const tabBar = document.getElementById("tab-bar");
    
    if (onboardingScreen) onboardingScreen.classList.add("hidden");
    if (tabBar) tabBar.classList.add("hidden");
    
    // 5. Инициализация всех систем
    setTimeout(() => {
      initAllSystems();
    }, 100);
    
    // 6. Очистка старых фотографий
    setTimeout(() => {
      if (typeof cleanupOldPhotos === 'function') {
        cleanupOldPhotos();
      }
    }, 1000);
    
    console.log('✅ Приложение инициализировано');
  }
  
  // ===== ЗАПУСК =====
  setTimeout(initApp, 100);
});
