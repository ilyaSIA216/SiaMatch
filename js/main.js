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
  
  // ===== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====
  async function initApp() {
    if (window.hasInitialized) return;
    window.hasInitialized = true;
    
    console.log('🎬 Инициализация приложения...');
    
    // 1. Инициализация Telegram WebApp
    initTelegramApp(); // Изменено с initTelegram()
    initUI();
      
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
