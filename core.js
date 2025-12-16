// core.js - Основная инициализация и состояние приложения
let tg = null;
let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
let profileData = null;
let currentIndex = 0;
let likedIds = [];
let hasInitialized = false;
let keyboardHeight = 0;
let originalHeight = window.innerHeight;

// Экспортируемые переменные (для других модулей)
export const appState = {
  tg,
  isIOS,
  profileData,
  currentIndex,
  likedIds,
  hasInitialized,
  keyboardHeight,
  originalHeight,
  
  // Обновляемые геттеры/сеттеры
  setProfileData(data) {
    profileData = data;
    this.profileData = data;
  },
  
  setTg(telegramInstance) {
    tg = telegramInstance;
    this.tg = telegramInstance;
  }
};

// DOM элементы
export const domElements = {
  welcomeScreen: document.getElementById("welcome-screen"),
  animatedWelcomeScreen: document.getElementById("welcome-animated-screen"),
  startBtn: document.getElementById("startBtn"),
  usernameElem: document.getElementById("username"),
  onboardingScreen: document.getElementById("onboarding-screen"),
  saveProfileBtn: document.getElementById("saveProfileBtn"),
  tabBar: document.getElementById("tab-bar"),
  appRoot: document.getElementById("app-root"),
  card: document.getElementById("card"),
  likesBadge: document.getElementById('likes-badge'),
  likesCountElement: document.getElementById('likes-count'),
  likesCountBadge: document.getElementById('likes-count-badge'),
  newLikesNotification: document.getElementById('new-likes-notification'),
  tabChatsBadge: document.getElementById('tab-chats-badge')
};

// Инициализация Telegram
export function initTelegram() {
  try {
    if (window.Telegram && Telegram.WebApp) {
      const tgInstance = Telegram.WebApp;
      console.log('✅ Telegram WebApp обнаружен');
      
      tgInstance.ready();
      tgInstance.expand();
      
      if (tgInstance.MainButton) {
        tgInstance.MainButton.hide();
      }
      
      appState.setTg(tgInstance);
      
      setTimeout(() => {
        if (tgInstance && typeof tgInstance.requestViewport === 'function') {
          tgInstance.requestViewport();
        }
      }, 500);
      
      return true;
    }
  } catch (e) {
    console.error("❌ Ошибка Telegram WebApp:", e);
  }
  return false;
}

// LocalStorage функции
export function loadProfile() {
  try {
    const raw = localStorage.getItem("siamatch_profile");
    const data = raw ? JSON.parse(raw) : null;
    appState.setProfileData(data);
    return data;
  } catch (e) {
    console.error("❌ Ошибка загрузки профиля:", e);
    return null;
  }
}

export function saveProfile(obj) {
  try {
    localStorage.setItem("siamatch_profile", JSON.stringify(obj));
    appState.setProfileData(obj);
    return true;
  } catch (e) {
    console.error("❌ Ошибка сохранения профиля:", e);
    return false;
  }
}

// Базовая инициализация приложения
export function initApp() {
  if (appState.hasInitialized) return;
  appState.hasInitialized = true;
  
  console.log('🎬 Инициализация приложения...');
  
  initTelegram();
  
  // Загружаем профиль
  const data = loadProfile();
  if (data) {
    // Показываем основной интерфейс
    domElements.welcomeScreen?.classList.add("hidden");
    domElements.animatedWelcomeScreen?.classList.remove("hidden");
  }

  // 🔥 ФИКС ТАБ-БАРА - ДОБАВЬТЕ В КОНЕЦ core.js
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 DOM готов - показываем таб-бар');
  
  // ФОРСИРУЕМ показ таб-бара
  const tabBar = document.getElementById('tab-bar');
  if (tabBar) {
    tabBar.classList.remove('hidden');
    tabBar.style.display = 'flex';
    tabBar.style.position = 'fixed';
    tabBar.style.bottom = '0';
    tabBar.style.left = '0';
    tabBar.style.right = '0';
    tabBar.style.zIndex = '9999';
    console.log('✅ Tab-bar показан!');
  } else {
    console.error('❌ Tab-bar НЕ НАЙДЕН!');
  }
  
  // Запускаем основную инициализацию
  initApp();
});

  console.log('✅ Core модуль инициализирован');
}
