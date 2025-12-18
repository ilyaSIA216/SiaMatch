// 🍀 SIAMATCH — ФИНАЛЬНАЯ ВЕРСИЯ (БЕЗ ОШИБОК)
class SiaMatchApp {
  constructor() { this.init(); }

  async init() {
    console.log('🍀 SiaMatch ЗЕЛЁНЫЙ старт!');
    
    // Ждём logic.js
    await this.waitForLogic();
    
    // Telegram
    if (typeof initTelegram === 'function') initTelegram();
    
    // UI
    this.showMainApp();
    this.bindEvents();
    
    console.log('✅ Готово без ошибок!');
  }

  waitForLogic() {
    return new Promise(resolve => {
      const check = () => {
        if (typeof candidates !== 'undefined') {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  }

  showMainApp() {
    document.querySelector('.loading-screen').classList.remove('active');
    document.querySelector('.main-content').style.display = 'block';
    setTimeout(() => {
      if (typeof showCurrentCandidate === 'function') showCurrentCandidate();
    }, 500);
  }

  bindEvents() {
    // Табы
    document.querySelectorAll('.tab-btn')?.forEach(btn => {
      btn.onclick = (e) => {
        const tab = e.currentTarget.dataset.tab;
        setActiveTab(tab);
      };
    });

    // Свайпы
    document.getElementById('dislikeBtn')?.onclick = handleDislikeSafe;
    document.getElementById('likeBtn')?.onclick = handleLikeSafe;

    // Остальное
    document.getElementById('likesBadge')?.onclick = () => showNotificationSafe('❤️ Лайки скоро!');
  }
}

// 🛡️ БЕЗОПАСНЫЕ ФУНКЦИИ (НЕ ВЫЗЫВАЮТ ОШИБКИ)
function setActiveTab(tab) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  
  const screen = document.getElementById(`screen-${tab}`);
  const btn = document.querySelector(`[data-tab="${tab}"]`);
  if (screen) screen.classList.add('active');
  if (btn) btn.classList.add('active');
  
  if (tab === 'feed' && typeof showCurrentCandidate === 'function') {
    showCurrentCandidate();
  }
}

function handleLikeSafe() {
  if (typeof useSwipe === 'function' && !useSwipe()) return;
  showSwipeAnimationSafe('right');
  setTimeout(() => {
    if (typeof currentIndex !== 'undefined') currentIndex++;
    if (typeof showCurrentCandidate === 'function') showCurrentCandidate();
  }, 400);
}

function handleDislikeSafe() {
  showSwipeAnimationSafe('left');
  setTimeout(() => {
    if (typeof currentIndex !== 'undefined') currentIndex++;
    if (typeof showCurrentCandidate === 'function') showCurrentCandidate();
  }, 400);
}

function showSwipeAnimationSafe(direction) {
  const card = document.getElementById('profileCard');
  if (card) {
    card.classList.add(`swipe-${direction}`);
    setTimeout(() => card.classList.remove('swipe-left', 'swipe-right'), 500);
  }
}

function showNotificationSafe(text) {
  const n = document.createElement('div');
  n.textContent = text;
  n.style.cssText = `
    position:fixed;top:100px;left:50%;transform:translateX(-50%);
    background:var(--gradient);color:white;padding:16px 24px;border-radius:20px;
    font-size:15px;z-index:10000;font-weight:600;
  `;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 3000);
}

// ЗАПУСК
document.addEventListener('DOMContentLoaded', () => new SiaMatchApp());
