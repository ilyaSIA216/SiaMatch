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
    try {
        const user = JSON.parse(localStorage.getItem('sia_current_user'));
        console.log('📱 Текущий пользователь:', user?.name || 'нет');
        return user || null;
    } catch (e) {
        console.error('Ошибка получения пользователя:', e);
        return null;
    }
}

function saveUser(userData) {
    try {
        localStorage.setItem('sia_current_user', JSON.stringify(userData));
        console.log('✅ Пользователь сохранен:', userData.name);
        return userData;
    } catch (e) {
        console.error('❌ Ошибка сохранения пользователя:', e);
        return null;
    }
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
    console.log('🔐 Проверка авторизации...');
    const currentUser = getCurrentUser();
    const currentPath = window.location.pathname;
    
    console.log('Текущий путь:', currentPath);
    console.log('Текущий пользователь:', currentUser);
    
    if (currentPath.includes('dashboard.html') && !currentUser) {
        console.log('❌ Нет пользователя, редирект на index.html');
        window.location.href = 'index.html';
        return false;
    }
    
    if (currentPath.includes('index.html') && currentUser) {
        console.log('Есть пользователь, проверяем статус...');
        const status = checkUserStatus(currentUser.id);
        console.log('Статус пользователя:', status);
        
        if (status === 'approved') {
            console.log('✅ Анкета одобрена, редирект на dashboard.html');
            window.location.href = 'dashboard.html';
            return false;
        }
    }
    
    console.log('✅ Проверка авторизации пройдена');
    return true;
}

// ========== СИСТЕМА МОДЕРАЦИИ - ИСПРАВЛЕННАЯ ==========

// КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Отправка заявки на модерацию
function submitForModeration(userData) {
    console.log('🚀 ========== ОТПРАВКА НА МОДЕРАЦИЮ ==========');
    console.log('Данные пользователя:', userData);
    
    // 1. Создаем ID если его нет
    if (!userData.id) {
        userData.id = Date.now();
        console.log('📝 Создан новый ID:', userData.id);
    }
    
    // 2. Подготавливаем заявку
    const newApplication = {
        id: userData.id,
        name: userData.name || 'Неизвестно',
        age: userData.age || 18,
        city: userData.city || 'Не указан',
        gender: userData.gender || 'unknown',
        bio: userData.bio || 'Пользователь SiaMatch',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        applicationId: 'APP-' + userData.id.toString().slice(-6) + '-' + Date.now().toString().slice(-4),
        mainPhoto: userData.mainPhoto || '',
        selfie: userData.selfie || '',
        moderatedAt: null,
        moderator: null,
        rejectionReason: null
    };
    
    console.log('📋 Создана заявка:', newApplication);
    
    // 3. Получаем существующие заявки
    let pendingUsers = [];
    try {
        const stored = localStorage.getItem('sia_pending_users');
        console.log('📂 Данные из localStorage:', stored ? 'есть' : 'нет');
        
        if (stored && stored !== 'undefined' && stored !== 'null' && stored.trim() !== '') {
            pendingUsers = JSON.parse(stored);
            console.log('📊 Существующие заявки:', pendingUsers.length);
        } else {
            console.log('📂 Нет данных о заявках, создаем новый массив');
        }
    } catch (e) {
        console.error('❌ Ошибка при чтении:', e);
        pendingUsers = [];
    }
    
    // 4. Проверяем, нет ли уже такой заявки
    const existingIndex = pendingUsers.findIndex(u => u.id === userData.id);
    
    if (existingIndex !== -1) {
        console.log('⚠️ Заявка уже существует, обновляем...');
        pendingUsers[existingIndex] = newApplication;
    } else {
        console.log('➕ Добавляем новую заявку...');
        pendingUsers.push(newApplication);
    }
    
    // 5. Сохраняем в localStorage
    try {
        localStorage.setItem('sia_pending_users', JSON.stringify(pendingUsers));
        console.log('💾 Заявка сохранена! Всего заявок:', pendingUsers.length);
        
        // Верификация сохранения
        const verify = JSON.parse(localStorage.getItem('sia_pending_users'));
        console.log('✅ Проверка: сохранено', verify?.length || 0, 'заявок');
        
        if (verify && verify.length > 0) {
            const lastApp = verify[verify.length - 1];
            console.log('📋 Последняя заявка:', {
                id: lastApp.id,
                name: lastApp.name,
                status: lastApp.status,
                applicationId: lastApp.applicationId
            });
        }
        
    } catch (e) {
        console.error('❌ КРИТИЧЕСКАЯ ОШИБКА сохранения:', e);
        
        // Пробуем сохранить в упрощенном виде для мобильных
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            console.log('📱 Мобильное устройство, сохраняем упрощенно...');
            try {
                const simplified = pendingUsers.map(app => ({
                    id: app.id,
                    name: app.name,
                    age: app.age,
                    city: app.city,
                    gender: app.gender,
                    status: app.status,
                    applicationId: app.applicationId,
                    submittedAt: app.submittedAt
                }));
                
                localStorage.setItem('sia_pending_users', JSON.stringify(simplified));
                console.log('✅ Сохранено в упрощенном виде');
            } catch (e2) {
                console.error('❌ Не удалось сохранить даже упрощенные данные:', e2);
            }
        }
    }
    
    // 6. Сохраняем ID пользователя для проверки статуса
    localStorage.setItem('sia_current_user_id', userData.id.toString());
    console.log('🔑 sia_current_user_id сохранен:', userData.id);
    
    // 7. Создаем уведомление для админа
    notifyAdmin(newApplication);
    
    console.log('🎉 ========== ОТПРАВКА ЗАВЕРШЕНА ==========');
    return userData.id;
}

// Уведомление админа
function notifyAdmin(userData) {
    console.log('📢 Создаем уведомление для админа...');
    
    let adminNotifications = [];
    try {
        const stored = localStorage.getItem('sia_admin_notifications');
        if (stored && stored !== 'undefined') {
            adminNotifications = JSON.parse(stored);
        }
    } catch (e) {
        console.log('⚠️ Нет уведомлений для админа, создаем новый массив');
        adminNotifications = [];
    }
    
    const newNotification = {
        id: Date.now(),
        userId: userData.id,
        applicationId: userData.applicationId,
        name: userData.name,
        gender: userData.gender === 'male' ? 'Мужчина' : 'Женщина',
        age: userData.age,
        city: userData.city,
        time: new Date().toLocaleString('ru-RU'),
        type: 'new_application',
        read: false,
        status: userData.status
    };
    
    adminNotifications.push(newNotification);
    
    try {
        // Сохраняем только последние 50 уведомлений
        localStorage.setItem('sia_admin_notifications', JSON.stringify(adminNotifications.slice(-50)));
        console.log('✅ Уведомление для админа создано');
    } catch (e) {
        console.log('⚠️ Не удалось сохранить уведомление для админа');
    }
}

// Проверка статуса пользователя (исправленная)
function checkUserStatus(userId) {
    console.log('🔍 Проверка статуса для userId:', userId);
    
    if (!userId) {
        console.log('❌ userId не передан');
        return 'not_found';
    }
    
    const numericUserId = Number(userId);
    console.log('🔢 Числовой ID:', numericUserId);
    
    // 1. Проверяем в заявках на модерацию
    let pendingUsers = [];
    try {
        const stored = localStorage.getItem('sia_pending_users');
        if (stored && stored !== 'undefined' && stored !== 'null') {
            pendingUsers = JSON.parse(stored);
            console.log('📂 Найдено заявок:', pendingUsers.length);
        }
    } catch (e) {
        console.error('❌ Ошибка при чтении заявок:', e);
        pendingUsers = [];
    }
    
    const userApp = pendingUsers.find(u => Number(u.id) === numericUserId);
    
    if (userApp) {
        console.log('✅ Пользователь найден в заявках, статус:', userApp.status);
        return userApp.status || 'pending';
    }
    
    // 2. Проверяем в активных пользователях
    let activeUsers = [];
    try {
        activeUsers = JSON.parse(localStorage.getItem('sia_active_users') || '[]');
    } catch (e) {
        console.log('⚠️ Нет активных пользователей');
        activeUsers = [];
    }
    
    const activeUser = activeUsers.find(u => Number(u.id) === numericUserId);
    
    if (activeUser) {
        console.log('✅ Пользователь найден в активных');
        return 'approved';
    }
    
    console.log('❌ Пользователь не найден нигде');
    return 'not_found';
}

// Проверка доступа для дашборда
function checkDashboardAccess() {
    console.log('🔐 Проверка доступа к дашборду...');
    
    const currentUser = getCurrentUser();
    console.log('Текущий пользователь:', currentUser);
    
    if (!currentUser || !currentUser.id) {
        console.log('❌ Пользователь не найден');
        return { 
            allowed: false, 
            reason: 'Пользователь не найден', 
            code: 'no_user' 
        };
    }
    
    const status = checkUserStatus(currentUser.id);
    console.log('Статус пользователя:', status);
    
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
    } else if (status === 'not_found') {
        return { 
            allowed: false, 
            reason: 'Ваша анкета не найдена', 
            code: 'not_found'
        };
    } else {
        return { 
            allowed: false, 
            reason: 'Статус вашей анкеты неизвестен', 
            code: 'unknown'
        };
    }
}

// Получение активных пользователей для свайпов
function getActiveUsers(currentUserId) {
    console.log('👥 Получение активных пользователей...');
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.log('❌ Текущий пользователь не найден');
        return [];
    }
    
    let activeUsers = [];
    try {
        activeUsers = JSON.parse(localStorage.getItem('sia_active_users') || '[]');
        console.log('📊 Активных пользователей:', activeUsers.length);
    } catch (e) {
        console.log('⚠️ Нет активных пользователей');
        activeUsers = [];
    }
    
    if (activeUsers.length === 0) {
        console.log('📂 Создаем тестовых пользователей...');
        // Создаем тестовых пользователей
        activeUsers = [
            {
                id: 1001,
                name: "Анна",
                age: 24,
                city: "Москва",
                gender: "female",
                bio: "Люблю путешествия и кофе",
                photo: "https://randomuser.me/api/portraits/women/1.jpg"
            },
            {
                id: 1002,
                name: "Мария",
                age: 26,
                city: "Санкт-Петербург",
                gender: "female",
                bio: "Фотограф, ищу интересного собеседника",
                photo: "https://randomuser.me/api/portraits/women/2.jpg"
            },
            {
                id: 1003,
                name: "Екатерина",
                age: 22,
                city: "Казань",
                gender: "female",
                bio: "Студентка, увлекаюсь искусством",
                photo: "https://randomuser.me/api/portraits/women/3.jpg"
            }
        ];
        
        // Сохраняем тестовых пользователей
        localStorage.setItem('sia_active_users', JSON.stringify(activeUsers));
    }
    
    // Фильтруем по противоположному полу и исключаем текущего пользователя
    const filteredUsers = activeUsers.filter(user => {
        const isOppositeGender = 
            (currentUser.gender === 'male' && user.gender === 'female') ||
            (currentUser.gender === 'female' && user.gender === 'male');
        
        const isNotCurrentUser = user.id !== currentUserId;
        
        return isOppositeGender && isNotCurrentUser;
    });
    
    console.log('✅ Отфильтровано пользователей:', filteredUsers.length);
    return filteredUsers;
}

// Функция для отладки
function debugAllApplications() {
    console.log('=== 🔍 ДЕБАГ: ВСЕ ЗАЯВКИ В СИСТЕМЕ ===');
    
    try {
        const stored = localStorage.getItem('sia_pending_users');
        console.log('📂 Сырые данные:', stored);
        
        if (stored && stored !== 'undefined' && stored !== 'null' && stored.trim() !== '') {
            const apps = JSON.parse(stored);
            console.log(`📊 Всего заявок: ${apps.length}`);
            
            if (apps.length === 0) {
                console.log('📭 Нет заявок в системе');
                return;
            }
            
            apps.forEach((app, index) => {
                console.log(`[${index + 1}] 📋 ${app.applicationId || 'Без ID'}`);
                console.log(`   👤 ${app.name}, ${app.age} лет`);
                console.log(`   🏙️ ${app.city}, ${app.gender === 'male' ? 'Мужчина' : 'Женщина'}`);
                console.log(`   📅 ${new Date(app.submittedAt).toLocaleString()}`);
                console.log(`   📊 Статус: ${app.status || 'pending'}`);
                console.log(`   🔑 ID: ${app.id}`);
                console.log('---');
            });
        } else {
            console.log('📭 Нет данных о заявках в localStorage');
        }
    } catch (e) {
        console.error('❌ Ошибка при отладке:', e);
    }
}

// Функция для проверки и восстановления данных
function repairAdminData() {
    console.log('🔧 Проверка и восстановление данных...');
    
    let pendingUsers = [];
    try {
        const stored = localStorage.getItem('sia_pending_users');
        if (stored && stored !== 'undefined') {
            pendingUsers = JSON.parse(stored);
            console.log('📂 Загружено заявок:', pendingUsers.length);
        }
    } catch (e) {
        console.error('❌ Ошибка при чтении, удаляем поврежденные данные...');
        localStorage.removeItem('sia_pending_users');
        pendingUsers = [];
    }
    
    // Проверяем структуру данных
    const repairedUsers = pendingUsers.map(user => {
        return {
            id: user.id || Date.now() + Math.random(),
            name: user.name || 'Неизвестно',
            age: user.age || 18,
            city: user.city || 'Не указан',
            gender: user.gender || 'unknown',
            status: user.status || 'pending',
            submittedAt: user.submittedAt || new Date().toISOString(),
            applicationId: user.applicationId || 'APP-' + Date.now().toString().slice(-6),
            mainPhoto: user.mainPhoto || '',
            selfie: user.selfie || '',
            bio: user.bio || 'Пользователь SiaMatch',
            moderatedAt: user.moderatedAt || null,
            moderator: user.moderator || null,
            rejectionReason: user.rejectionReason || null
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

// Автоматическая проверка авторизации при загрузке
document.addEventListener('DOMContentLoaded', checkAuth);

console.log("✅ Utils.js загружен успешно!");

// Экспортируем для отладки в консоли
window.debugAllApplications = debugAllApplications;
window.repairAdminData = repairAdminData;
window.getCurrentUser = getCurrentUser;
window.checkUserStatus = checkUserStatus;
