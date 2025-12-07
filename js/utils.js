// ========== УТИЛИТЫ ДЛЯ SiaMatch ==========

// Мок Telegram WebApp
window.Telegram = {
    WebApp: {
        initData: '',
        initDataUnsafe: {
            user: {
                id: Math.floor(Math.random() * 1000000),
                first_name: 'Тестовый',
                last_name: 'Пользователь'
            }
        },
        ready: function() {
            console.log('Telegram WebApp ready');
        },
        expand: function() {
            console.log('WebApp expanded');
        },
        close: function() {
            console.log('Closing WebApp');
        }
    }
};

if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
}

// ========== УТИЛИТЫ ДЛЯ РАБОТЫ С ПОЛЬЗОВАТЕЛЯМИ ==========

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('sia_current_user')) || null;
}

function saveUser(userData) {
    localStorage.setItem('sia_current_user', JSON.stringify(userData));
    return userData;
}

// Показ уведомления
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
    
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========== СПИСОК ГОРОДОВ РОССИИ ==========

const russianCities = [
    "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань",
    "Нижний Новгород", "Челябинск", "Самара", "Омск", "Ростов-на-Дону",
    "Уфа", "Красноярск", "Воронеж", "Пермь", "Волгоград",
    "Краснодар", "Саратов", "Тюмень", "Тольятти", "Ижевск"
].sort();

// ========== АВТОПРОВЕРКА АВТОРИЗАЦИИ ==========

function checkAuth() {
    const currentUser = getCurrentUser();
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('dashboard.html') && !currentUser) {
        window.location.href = 'index.html';
        return false;
    }
    
    if (currentPath.includes('index.html') && currentUser) {
        const status = checkUserStatus(currentUser.id);
        if (status === 'approved') {
            window.location.href = 'dashboard.html';
            return false;
        }
    }
    
    return true;
}

document.addEventListener('DOMContentLoaded', checkAuth);

// ========== СИСТЕМА МОДЕРАЦИИ ==========

// Упрощенная функция для мобильных устройств
function submitForModeration(userData) {
    console.log('Отправка на модерацию:', userData.name);
    
    let pendingUsers = [];
    try {
        pendingUsers = JSON.parse(localStorage.getItem('sia_pending_users') || '[]');
    } catch (e) {
        console.error('Ошибка чтения:', e);
        pendingUsers = [];
    }
    
    // Для мобильных устройств упрощаем данные
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        userData = {
            id: userData.id,
            name: userData.name,
            age: userData.age,
            city: userData.city,
            gender: userData.gender,
            bio: userData.bio || "Пользователь SiaMatch",
            status: 'pending',
            submittedAt: new Date().toISOString(),
            applicationId: 'APP-' + userData.id.toString().slice(-6)
        };
    } else {
        userData.status = 'pending';
        userData.submittedAt = new Date().toISOString();
        userData.applicationId = 'APP-' + userData.id.toString().slice(-6);
    }
    
    pendingUsers.push(userData);
    
    try {
        localStorage.setItem('sia_pending_users', JSON.stringify(pendingUsers));
        console.log('Заявка сохранена, всего:', pendingUsers.length);
    } catch (e) {
        console.error('Ошибка сохранения:', e);
        // Пробуем сохранить без фото
        delete userData.mainPhoto;
        delete userData.selfie;
        localStorage.setItem('sia_pending_users', JSON.stringify(pendingUsers));
    }
    
    return userData.id;
}

// Проверка статуса пользователя
function checkUserStatus(userId) {
    const pendingUsers = JSON.parse(localStorage.getItem('sia_pending_users') || '[]');
    const user = pendingUsers.find(u => u.id === userId);
    
    if (!user) {
        const activeUsers = JSON.parse(localStorage.getItem('sia_active_users') || '[]');
        const activeUser = activeUsers.find(u => u.id === userId);
        return activeUser ? 'approved' : 'not_found';
    }
    
    if (user.status === 'approved') {
        const activeUsers = JSON.parse(localStorage.getItem('sia_active_users') || '[]');
        if (!activeUsers.find(u => u.id === userId)) {
            activeUsers.push({
                id: user.id,
                name: user.name,
                age: user.age,
                city: user.city,
                gender: user.gender,
                bio: user.bio || 'Пользователь SiaMatch'
            });
            localStorage.setItem('sia_active_users', JSON.stringify(activeUsers));
        }
    }
    
    return user.status;
}

// Проверка доступа для дашборда
function checkDashboardAccess() {
    const currentUser = getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
        return { allowed: false, reason: 'Пользователь не найден', code: 'no_user' };
    }
    
    const status = checkUserStatus(currentUser.id);
    
    if (status === 'pending') {
        return { 
            allowed: false, 
            reason: 'Ваша анкета находится на проверке', 
            code: 'pending'
        };
    } else if (status === 'rejected') {
        return { 
            allowed: false, 
            reason: 'Ваша анкета не прошла модерацию', 
            code: 'rejected'
        };
    } else if (status === 'approved') {
        return { 
            allowed: true, 
            reason: 'Доступ разрешен', 
            code: 'approved',
            user: currentUser
        };
    } else {
        return { 
            allowed: false, 
            reason: 'Статус вашей анкеты неизвестен', 
            code: 'unknown'
        };
    }
}

// Получение активных пользователей
function getActiveUsers(currentUserId) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return [];
    }
    
    const activeUsers = JSON.parse(localStorage.getItem('sia_active_users') || '[]');
    
    if (activeUsers.length === 0) {
        return [];
    }
    
    return activeUsers.filter(user => {
        return user.id !== currentUserId && 
               ((currentUser.gender === 'male' && user.gender === 'female') ||
                (currentUser.gender === 'female' && user.gender === 'male'));
    });
}

console.log("✅ Utils.js загружен");
