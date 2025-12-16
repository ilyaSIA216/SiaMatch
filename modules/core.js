// modules/core.js

let tg = null;
let isIOS = false;
let originalHeight = window.innerHeight;
let keyboardHeight = 0;

// Экспортируемые переменные и функции
window.AppCore = {
  // Переменные
  tg: null,
  isIOS: false,
  originalHeight: window.innerHeight,
  keyboardHeight: 0,
  
  // Функции
  initTelegram: function() {
    try {
      if (window.Telegram && Telegram.WebApp) {
        tg = Telegram.WebApp;
        console.log('✅ Telegram WebApp обнаружен');
        
        if (tg.MainButton) {
          tg.MainButton.hide();
        }
        
        isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        if (isIOS) {
          console.log('📱 iOS обнаружен');
          document.body.classList.add('no-bounce');
          this.setupKeyboardHandlers();
        }
        
        setTimeout(() => {
          if (tg && typeof tg.requestViewport === 'function') {
            tg.requestViewport();
          }
        }, 500);
        
        this.tg = tg;
        this.isIOS = isIOS;
        
        return true;
      }
    } catch (e) {
      console.error("❌ Ошибка Telegram WebApp:", e);
    }
    return false;
  },
  
  setupKeyboardHandlers: function() {
    console.log('⌨️ Настраиваю обработчики клавиатуры');
    
    originalHeight = window.innerHeight;
    window.addEventListener('resize', this.handleResize.bind(this));
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
    document.addEventListener('focusout', this.handleFocusOut.bind(this));
    document.addEventListener('touchstart', this.handleTouchOutside.bind(this));
  },
  
  handleResize: function() {
    const newHeight = window.innerHeight;
    const heightDiff = originalHeight - newHeight;
    const card = document.getElementById('card');
    
    if (heightDiff > 100) {
      keyboardHeight = heightDiff;
      document.body.classList.add('keyboard-open');
      
      if (card) {
        card.style.transform = `translateY(-${Math.min(150, keyboardHeight - 100)}px)`;
      }
      
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        setTimeout(() => {
          activeElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }, 100);
      }
    } 
    else if (Math.abs(originalHeight - newHeight) < 50) {
      document.body.classList.remove('keyboard-open');
      
      if (card) {
        card.style.transform = 'translateY(0)';
      }
      
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (card) card.scrollTop = 0;
      }, 200);
      
      keyboardHeight = 0;
    }
    
    originalHeight = newHeight;
    this.originalHeight = originalHeight;
    this.keyboardHeight = keyboardHeight;
  },
  
  handleFocusIn: function(e) {
    if (e.target.matches('input, textarea, select')) {
      if (isIOS) {
        setTimeout(() => {
          document.body.classList.add('keyboard-open');
        }, 100);
      }
    }
  },
  
  handleFocusOut: function(e) {
    if (e.target.matches('input, textarea, select')) {
      if (isIOS) {
        setTimeout(() => {
          const activeElement = document.activeElement;
          if (!activeElement || !activeElement.matches('input, textarea, select')) {
            document.body.classList.remove('keyboard-open');
            const card = document.getElementById('card');
            if (card) card.style.transform = 'translateY(0)';
          }
        }, 500);
      }
    }
  },
  
  handleTouchOutside: function(e) {
    if (!e.target.closest('input, textarea, select, button')) {
      document.activeElement?.blur();
    }
  },
  
  // Утилиты
  showNotification: function(message) {
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
  },
  
  // LocalStorage функции
  loadLocalStorage: function(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error(`❌ Ошибка загрузки ${key}:`, e);
      return null;
    }
  },
  
  saveLocalStorage: function(key, obj) {
    try {
      localStorage.setItem(key, JSON.stringify(obj));
      return true;
    } catch (e) {
      console.error(`❌ Ошибка сохранения ${key}:`, e);
      return false;
    }
  }
};
