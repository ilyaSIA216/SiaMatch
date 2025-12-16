// ===== ОСНОВНОЙ ФАЙЛ ПРИЛОЖЕНИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 SiaMatch запускается...');
  
  // Глобальные переменные состояния (будут определены в logic.js)
  window.tg = null;
  window.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  window.profileData = { current: null };
  window.hasInitialized = false;
  
  // ===== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====
  function initApp() {
    if (window.hasInitialized) return;
    window.hasInitialized = true;
    
    console.log('🎬 Инициализация приложения...');
    
    // Инициализация Telegram WebApp
    initTelegram();
    
    // Инициализация интерфейса
    initUI();
    
    // Загрузка профиля
    window.profileData.current = loadProfile();
    
    // Показ экрана в зависимости от состояния
    const welcomeScreen = document.getElementById("welcome-screen");
    const animatedWelcomeScreen = document.getElementById("welcome-animated-screen");
    
    if (window.profileData.current) {
      // Пользователь уже зарегистрирован
      showAnimatedWelcomeScreen();
    } else {
      // Новый пользователь
      if (welcomeScreen) {
        welcomeScreen.classList.remove("hidden");
      }
    }
    
    // Скрытие лишних экранов
    const onboardingScreen = document.getElementById("onboarding-screen");
    const tabBar = document.getElementById("tab-bar");
    
    if (onboardingScreen) onboardingScreen.classList.add("hidden");
    if (tabBar) tabBar.classList.add("hidden");
    
    // Инициализация всех систем
    setTimeout(() => {
      initAllSystems();
    }, 100);
    
    console.log('✅ Приложение инициализировано');
  }
  
  // ===== ЗАПУСК =====
  setTimeout(initApp, 100);
});
