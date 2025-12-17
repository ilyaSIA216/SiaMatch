// ===== ОСНОВНОЙ ФАЙЛ ПРИЛОЖЕНИЯ =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 SiaMatch запускается...');
  
  // Глобальные переменные состояния
  window.tg = null;
  window.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  window.profileData = { current: null };
  window.hasInitialized = false;
  
  // ===== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====
  async function initApp() {
    if (window.hasInitialized) return;
    window.hasInitialized = true;
    
    console.log('🎬 Инициализация приложения...');
    
    // 1. Инициализация Telegram WebApp
    initTelegram();
    
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
    initUI();
    
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
    
    console.log('✅ Приложение инициализировано');
  }
  
  // ===== ЗАПУСК =====
  setTimeout(initApp, 100);
});
