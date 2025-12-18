// ===== SIAMATCH MAIN APP — FIKSED VERSION =====
class SiaMatchApp {
  constructor() {
    this.init();
  }

  async init() {
    console.log('🚀 SiaMatch инициализация...');
    
    // 1. Ждём полной загрузки logic.js
    await this.waitForLogic();
    
    // 2. Telegram
    await initTelegram();
    
    // 3. Загружаем данные
    await this.loadUserData();
    
    // 4. Показываем UI
    this.showMainApp();
    
    // 5. Все системы
    initAllSystems();
    
    // 6. События
    this.bindEvents();
    
    console.log('✅ SiaMatch полностью готов!');
  }

  waitForLogic() {
    return new Promise(resolve => {
      const check = () => {
        if (typeof showCurrentCandidate === 'function' && 
            typeof candidates !== 'undefined' &&
            typeof currentIndex !== 'undefined') {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  async loadUserData() {
    // Безопасная загрузка профиля
    window.profileData = window.profileData || {};
    try {
      if (typeof loadProfile === 'function') {
        window.profileData.current = loadProfile();
      }
    } catch(e) {
      console.log('📝 Профиль не найден — демо режим');
      window.profileData.current = {
        tg_id: 'demo',
        first_name: 'Пользователь',
        photos: []
      };
    }
    
    // Telegram данные
    if (window.tg?.initDataUnsafe?.user) {
      const user = window.tg.initDataUnsafe.user;
      document.getElementById('profileName').textContent = user.first_name || 'Пользователь';
      
      if (!window.profileData.current) {
        window.profileData.current = {
          tg_id: user.id,
          first_name: user.first_name || 'Пользователь',
          username: user.username || '',
          photos: []
        };
      }
    }
  }

  showMainApp() {
    document.querySelector('.loading-screen').classList.remove('active');
    document.querySelector('.main-content').style.display = 'block';
    
    setActiveTab('feed');
    showCurrentCandidate();
  }

  bindEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        setActiveTab(tab);
      });
    });

    document.getElementById('dislikeBtn').addEventListener('click', handleDislike);
    document.getElementById('likeBtn').addEventListener('click', handleLike);
    document.getElementById('likesBadge').addEventListener('click', () => {
      showNotification('❤️ Лайки в разработке!');
    });

    document.getElementById('menuBtn').addEventListener('click', () => {
      showNotification('📱 Меню скоро!');
    });

    document.getElementById('settingsBtn').addEventListener('click', () => {
      setActiveTab('profile');
    });
  }
}

// ===== БЕЗОПАСНЫЕ ФУНКЦИИ =====
function setActiveTab(tabName) {
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  
  const screen = document.getElementById(`screen-${tabName}`);
  if (screen) screen.classList.add('active');
  
  const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
  if (tabBtn) tabBtn.classList.add('active');
  
  if (tabName === 'feed') {
    if (typeof showCurrentCandidate === 'function') showCurrentCandidate();
  }
}

function handleLike() {
  if (typeof useSwipe === 'function' && !useSwipe()) return;
  
  showSwipeAnimation('right');
  
  setTimeout(() => {
    if (typeof currentIndex !== 'undefined') currentIndex++;
    if (typeof showCurrentCandidate === 'function') showCurrentCandidate();
  }, 400);
}

function handleDislike() {
  showSwipeAnimation('left');
  
  setTimeout(() => {
    if (typeof currentIndex !== 'undefined') currentIndex++;
    if (typeof showCurrentCandidate === 'function') showCurrentCandidate();
  }, 400);
}

function showSwipeAnimation(direction) {
  const card = document.getElementById('profileCard');
  if (card) {
    card.classList.add(`swipe-${direction}`);
    setTimeout(() => card.classList.remove('swipe-left', 'swipe-right'), 500);
  }
}

function showNotification(text) {
  const notification = document.createElement('div');
  notification.textContent = text;
  notification.style.cssText = `
    position: fixed; top: 100px; left: 50%; transform: translateX(-50%);
    background: rgba(0,0,0,0.9); color: white; padding: 16px 24px;
    border-radius: 20px; font-size: 15px; z-index: 10000;
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// ===== ЗАПУСК =====
document.addEventListener('DOMContentLoaded', () => {
  new SiaMatchApp();
});
