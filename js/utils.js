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

// Отправка заявки на модерацию (исправленная для мобильных)
function submitForModeration(userData) {
    console.log('submitForModeration вызвана для:', userData.name);
    
    let pendingUsers = [];
    try {
        const storedData = localStorage.getItem('sia_pending_users');
        if (storedData) {
            pendingUsers = JSON.parse(storedData);
        }
    } catch (e) {
        console.error('Ошибка при чтении:', e);
        pendingUsers = [];
    }
    
    // Проверяем, не отправлял ли уже пользователь заявку
    const existingIndex = pendingUsers.findIndex(u => u.id === userData.id);
    
    if (existingIndex !== -1) {
        pendingUsers[existingIndex] = {
            ...pendingUsers[existingIndex],
            ...userData,
            status: 'pending',
            submittedAt: new Date().toISOString(),
            applicationId: pendingUsers[existingIndex].applicationId || 'APP-' + userData.id.toString().slice(-6)
        };
    } else {
        // Создаем новую заявку
        const newApplication = {
            id: userData.id,
            name: userData.name,
            age: userData.age,
            city: userData.city,
            gender: userData.gender,
            bio: userData.bio || "Пользователь SiaMatch",
            status: 'pending',
            submittedAt: new Date().toISOString(),
            applicationId: 'APP-' + userData.id.toString().slice(-6),
            mainPhoto: userData.mainPhoto || '',
            selfie: userData.selfie || ''
        };
        
        pendingUsers.push(newApplication);
    }
    
    // Пытаемся сохранить в localStorage
    try {
        localStorage.setItem('sia_pending_users', JSON.stringify(pendingUsers));
        console.log('✅ Заявка сохранена, всего:', pendingUsers.length);
        
    } catch (e) {
        console.error('❌ Ошибка сохранения:', e);
        
        // Пробуем сохранить без фото для мобильных
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            const simplifiedApplications = pendingUsers.map(app => ({
                id: app.id,
                name: app.name,
                age: app.age,
                city: app.city,
                gender: app.gender,
                status: app.status,
                submittedAt: app.submittedAt,
                applicationId: app.applicationId,
                hasMainPhoto: !!app.mainPhoto,
                hasSelfie: !!app.selfie
            }));
            
            localStorage.setItem('sia_pending_users', JSON.stringify(simplifiedApplications));
            console.log('✅ Заявки сохранены в упрощенном виде');
        }
    }
    
    // Создаем уведомление для админа
    notifyAdmin(userData);
    
    return userData.id;
}

// Уведомление админа
function notifyAdmin(userData) {
    let adminNotifications = [];
    try {
        adminNotifications = JSON.parse(localStorage.getItem('sia_admin_notifications') || '[]');
    } catch (e) {
        adminNotifications = [];
    }
    
    const newNotification = {
        id: Date.now(),
        userId: userData.id,
        applicationId: 'APP-' + userData.id.toString().slice(-6),
        name: userData.name,
        gender: userData.gender === 'male' ? 'Мужчина' : 'Женщина',
        age: userData.age,
        city: userData.city,
        time: new Date().toLocaleString('ru-RU'),
        type: 'new_application',
        read: false
    };
    
    adminNotifications.push(newNotification);
    
    try {
        localStorage.setItem('sia_admin_notifications', JSON.stringify(adminNotifications.slice(-50)));
        console.log('✅ Уведомление для админа создано');
    } catch (e) {
        console.log('❌ Не удалось сохранить уведомление');
    }
}

// Проверка статуса пользователя
function checkUserStatus(userId) {
    let pendingUsers = [];
    try {
        pendingUsers = JSON.parse(localStorage.getItem('sia_pending_users') || '[]');
    } catch (e) {
        pendingUsers = [];
    }
    
    const user = pendingUsers.find(u => u.id === userId);
    
    if (!user) {
        let activeUsers = [];
        try {
            activeUsers = JSON.parse(localStorage.getItem('sia_active_users') || '[]');
        } catch (e) {
            activeUsers = [];
        }
        const activeUser = activeUsers.find(u => u.id === userId);
        return activeUser ? 'approved' : 'not_found';
    }
    
    if (user.status === 'approved') {
        let activeUsers = [];
        try {
            activeUsers = JSON.parse(localStorage.getItem('sia_active_users') || '[]');
        } catch (e) {
            activeUsers = [];
        }
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
    
    return user.status || 'pending';
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
    
    let activeUsers = [];
    try {
        activeUsers = JSON.parse(localStorage.getItem('sia_active_users') || '[]');
    } catch (e) {
        activeUsers = [];
    }
    
    if (activeUsers.length === 0) {
        return [];
    }
    
    return activeUsers.filter(user => {
        return user.id !== currentUserId && 
               ((currentUser.gender === 'male' && user.gender === 'female') ||
                (currentUser.gender === 'female' && user.gender === 'male'));
    });
}

// Функция для проверки и восстановления данных
function repairAdminData() {
    console.log('Проверяем данные админ-панели...');
    
    let pendingUsers = [];
    try {
        pendingUsers = JSON.parse(localStorage.getItem('sia_pending_users') || '[]');
    } catch (e) {
        localStorage.removeItem('sia_pending_users');
        pendingUsers = [];
    }
    
    // Проверяем структуру данных
    const repairedUsers = pendingUsers.map(user => {
        return {
            id: user.id || Date.now() + Math.random(),
            name: user.name || 'Неизвестно',
            age: user.age || 0,
            city: user.city || 'Не указан',
            gender: user.gender || 'unknown',
            status: user.status || 'pending',
            submittedAt: user.submittedAt || new Date().toISOString(),
            applicationId: user.applicationId || 'APP-' + (user.id || Date.now()).toString().slice(-6),
            mainPhoto: user.mainPhoto || '',
            selfie: user.selfie || '',
            bio: user.bio || 'Пользователь SiaMatch'
        };
    });
    
    try {
        localStorage.setItem('sia_pending_users', JSON.stringify(repairedUsers));
        console.log('✅ Данные восстановлены, заявок:', repairedUsers.length);
    } catch (e) {
        console.log('❌ Не удалось восстановить данные');
    }
    
    return repairedUsers;
}

// Создание тестовых данных
function createTestData() {
    const testUsers = [
        {
            id: 100001,
            name: "Анна",
            age: 25,
            city: "Москва",
            gender: "female",
            photo: "",
            bio: "Люблю путешествия и книги.",
            status: "pending",
            submittedAt: new Date().toISOString(),
            applicationId: "APP-100001"
        },
        {
            id: 100002,
            name: "Иван",
            age: 30,
            city: "Санкт-Петербург",
            gender: "male",
            photo: "",
            bio: "Программист, люблю горы.",
            status: "pending",
            submittedAt: new Date(Date.now() - 86400000).toISOString(),
            applicationId: "APP-100002"
        }
    ];
    
    localStorage.setItem('sia_pending_users', JSON.stringify(testUsers));
    console.log("✅ Тестовые данные созданы");
    return testUsers;
}

console.log("✅ Utils.js загружен");
