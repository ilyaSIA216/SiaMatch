// ========== КОНСТАНТЫ ==========
const API_URL = 'https://laughing-space-fiesta-x57vjp5qgg4rc667v-3000.app.github.dev';
const DEBUG_MODE = true;

// ========== МОК TELEGRAM ==========
if (!window.Telegram || !Telegram.WebApp) {
    console.log('🔧 Режим разработки: Имитируем Telegram WebApp');
    window.Telegram = {
        WebApp: {
            initDataUnsafe: {
                user: {
                    id: Math.floor(Math.random() * 1000000000),
                    username: 'test_user',
                    first_name: 'Тест',
                    last_name: 'Пользователь'
                }
            },
            expand: () => console.log('[DEBUG] Telegram expanded'),
            ready: () => console.log('[DEBUG] Telegram ready'),
            showAlert: (msg) => alert(msg),
            showConfirm: (msg, callback) => {
                if (confirm(msg)) callback(true);
                else callback(false);
            }
        }
    };
}

const tg = window.Telegram.WebApp;

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let currentUser = null;
let usersList = [];
let currentChatPartner = null;

// ========== ИНИЦИАЛИЗАЦИЯ ==========
async function initApp() {
    console.log('🚀 Инициализация приложения...');
    
    try {
        // Инициализация Telegram
        tg.expand();
        tg.ready();
        
        // Загружаем или создаем пользователя
        await loadCurrentUser();
        
        // Проверяем на какой странице мы
        const page = window.location.pathname.split('/').pop();
        
        if (page === 'admin.html') {
            initAdminPanel();
        } else if (page === 'chat.html') {
            initChat();
        } else {
            initMainApp();
        }
        
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
        alert('Ошибка загрузки приложения');
    }
}

// ========== ОСНОВНОЕ ПРИЛОЖЕНИЕ ==========
function initMainApp() {
    const tgUser = tg.initDataUnsafe?.user;
    
    // Приветствуем пользователя
    if (tgUser?.first_name) {
        document.getElementById('welcome-text').textContent = 
            `Привет, ${tgUser.first_name}!`;
    }
    
    // Проверяем статус пользователя
    if (currentUser?.status === 'approved') {
        // Пользователь уже одобрен - показываем дашборд
        goToStep(7);
        showTab('swipe');
    } else if (currentUser?.status === 'pending') {
        // На проверке
        goToStep(6);
    } else {
        // Новая регистрация
        goToStep(0);
    }
}

// ========== АДМИН-ПАНЕЛЬ ==========
async function initAdminPanel() {
    console.log('🛠 Инициализация админ-панели');
    
    try {
        // Загружаем пользователей
        await loadAllUsers();
        
        // Обновляем статистику
        updateAdminStats();
        
    } catch (error) {
        console.error('Ошибка загрузки админ-панели:', error);
        document.getElementById('users-list').innerHTML = 
            '<div style="color: #f44336; padding: 20px; text-align: center;">Ошибка загрузки данных</div>';
    }
}

async function loadAllUsers() {
    try {
        // Имитируем загрузку (в реальности - запрос к API)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Тестовые данные
        usersList = [
            {
                id: 1,
                telegramId: 123456789,
                firstName: 'Анна',
                age: 24,
                city: 'Москва',
                status: 'approved',
                mainPhoto: 'https://via.placeholder.com/150',
                selfiePhoto: 'https://via.placeholder.com/150',
                createdAt: '2024-01-15'
            },
            {
                id: 2,
                telegramId: 987654321,
                firstName: 'Иван',
                age: 28,
                city: 'Санкт-Петербург',
                status: 'pending',
                mainPhoto: 'https://via.placeholder.com/150',
                selfiePhoto: 'https://via.placeholder.com/150',
                createdAt: '2024-01-16'
            },
            // Добавьте больше тестовых пользователей...
        ];
        
        renderUsersList(usersList);
        
    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
        throw error;
    }
}

function renderUsersList(users) {
    const container = document.getElementById('users-list');
    
    if (!users.length) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Нет пользователей</div>';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="user-item" onclick="openUserProfile(${user.id})">
            <div class="user-avatar">${user.firstName?.charAt(0) || '?'}</div>
            <div class="user-info">
                <h4>${user.firstName || 'Без имени'}, ${user.age || '?'}</h4>
                <p>📍 ${user.city || 'Не указан'} • ID: ${user.telegramId || user.id}</p>
                <p style="font-size: 12px; color: ${getStatusColor(user.status)};">
                    ${getStatusText(user.status)}
                </p>
            </div>
        </div>
    `).join('');
}

function searchUsers(query) {
    if (!query.trim()) {
        renderUsersList(usersList);
        return;
    }
    
    const filtered = usersList.filter(user => 
        (user.firstName?.toLowerCase().includes(query.toLowerCase())) ||
        (user.city?.toLowerCase().includes(query.toLowerCase())) ||
        (user.telegramId?.toString().includes(query)) ||
        (user.id?.toString().includes(query))
    );
    
    renderUsersList(filtered);
}

function updateAdminStats() {
    const total = usersList.length;
    const pending = usersList.filter(u => u.status === 'pending').length;
    const active = usersList.filter(u => u.status === 'approved').length;
    
    document.getElementById('total-users').textContent = total;
    document.getElementById('pending-users').textContent = pending;
    document.getElementById('active-users').textContent = active;
}

function openUserProfile(userId) {
    const user = usersList.find(u => u.id === userId);
    if (!user) return;
    
    currentChatPartner = user;
    
    const modal = document.getElementById('profile-modal');
    const details = document.getElementById('profile-details');
    
    details.innerHTML = `
        <h2>${user.firstName}, ${user.age}</h2>
        <p><strong>Город:</strong> ${user.city || 'Не указан'}</p>
        <p><strong>Telegram ID:</strong> ${user.telegramId || 'Не указан'}</p>
        <p><strong>Статус:</strong> <span style="color: ${getStatusColor(user.status)}">
            ${getStatusText(user.status)}
        </span></p>
        <p><strong>Дата регистрации:</strong> ${formatDate(user.createdAt)}</p>
        
        <div class="photos-grid">
            <div>
                <p><strong>Основное фото:</strong></p>
                <img src="${user.mainPhoto || 'https://via.placeholder.com/200'}" alt="Основное фото">
            </div>
            <div>
                <p><strong>Селфи:</strong></p>
                <img src="${user.selfiePhoto || 'https://via.placeholder.com/200'}" alt="Селфи">
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function openChatWithUser() {
    if (!currentChatPartner) return;
    
    // Сохраняем данные для чата
    localStorage.setItem('chat_partner', JSON.stringify(currentChatPartner));
    
    // Открываем чат
    window.open(`chat.html?userId=${currentChatPartner.id}`, '_blank');
}

// ========== ЧАТ ==========
function initChat() {
    // Получаем данные собеседника
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    
    // Ищем пользователя в списке
    const partner = usersList.find(u => u.id == userId) || 
                   JSON.parse(localStorage.getItem('chat_partner'));
    
    if (!partner) {
        alert('Пользователь не найден');
        window.history.back();
        return;
    }
    
    currentChatPartner = partner;
    
    // Обновляем шапку чата
    document.getElementById('chat-partner-avatar').textContent = 
        partner.firstName?.charAt(0) || '?';
    document.getElementById('chat-partner-name').textContent = 
        `${partner.firstName}, ${partner.age}`;
    
    // Загружаем сообщения
    loadMessages();
}

function loadMessages() {
    const container = document.getElementById('chat-messages');
    
    // Тестовые сообщения
    const messages = [
        { id: 1, text: 'Привет! Как дела?', senderId: currentChatPartner.id, time: '10:30', sent: false },
        { id: 2, text: 'Привет! Всё отлично, а у тебя?', senderId: currentUser.id, time: '10:32', sent: true },
        { id: 3, text: 'Тоже всё хорошо! Хочешь познакомиться поближе?', senderId: currentChatPartner.id, time: '10:35', sent: false }
    ];
    
    container.innerHTML = messages.map(msg => `
        <div class="message ${msg.sent ? 'sent' : 'received'}">
            <div class="message-content">${msg.text}</div>
            <div class="message-time">${msg.time}</div>
        </div>
    `).join('');
    
    // Прокручиваем вниз
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    
    if (!text) return;
    
    const container = document.getElementById('chat-messages');
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // Добавляем сообщение
    container.innerHTML += `
        <div class="message sent">
            <div class="message-content">${text}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    // Очищаем поле
    input.value = '';
    
    // Прокручиваем вниз
    container.scrollTop = container.scrollHeight;
    
    // Имитируем ответ
    setTimeout(() => {
        const responses = [
            'Интересно!',
            'Расскажи подробнее',
            'Здорово!',
            'Понятно, спасибо',
            'Давай продолжим общение'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        container.innerHTML += `
            <div class="message received">
                <div class="message-content">${randomResponse}</div>
                <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
        `;
        
        container.scrollTop = container.scrollHeight;
    }, 1000);
}

// ========== УТИЛИТЫ ==========
function getStatusColor(status) {
    const colors = {
        'pending': '#ff9800',
        'approved': '#4caf50',
        'rejected': '#f44336',
        'banned': '#9e9e9e'
    };
    return colors[status] || '#666';
}

function getStatusText(status) {
    const texts = {
        'pending': 'На проверке',
        'approved': 'Одобрен',
        'rejected': 'Отклонен',
        'banned': 'Заблокирован'
    };
    return texts[status] || 'Неизвестно';
}

function formatDate(dateString) {
    if (!dateString) return 'Не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

async function loadCurrentUser() {
    // Пробуем загрузить из localStorage
    const saved = localStorage.getItem('sia_user');
    
    if (saved) {
        currentUser = JSON.parse(saved);
        return;
    }
    
    // Создаем нового пользователя
    const tgUser = tg.initDataUnsafe?.user;
    
    currentUser = {
        id: Date.now(),
        telegramId: tgUser?.id || Math.floor(Math.random() * 1000000000),
        username: tgUser?.username || 'user_' + Date.now(),
        firstName: tgUser?.first_name || null,
        status: 'new',
        createdAt: new Date().toISOString()
    };
    
    saveCurrentUser();
}

function saveCurrentUser() {
    localStorage.setItem('sia_user', JSON.stringify(currentUser));
}

// ========== НАВИГАЦИЯ ==========
function goToStep(step) {
    // Логика навигации по шагам
    for (let i = 0; i <= 7; i++) {
        const element = document.getElementById(`step-${i}`);
        if (element) element.classList.add('hidden');
    }
    
    const target = document.getElementById(`step-${step}`);
    if (target) target.classList.remove('hidden');
}

function showTab(tabName) {
    // Скрываем все вкладки
    document.querySelectorAll('.tab-pane').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Деактивируем все кнопки
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показываем нужную вкладку
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    
    // Активируем кнопку
    document.querySelector(`[onclick*="${tabName}"]`).classList.add('active');
}

function goBack() {
    window.history.back();
}

// ========== ЗАПУСК ==========
document.addEventListener('DOMContentLoaded', initApp);

// Экспорт функций в глобальную область видимости
window.searchUsers = searchUsers;
window.openUserProfile = openUserProfile;
window.openChatWithUser = openChatWithUser;
window.sendMessage = sendMessage;
window.goBack = goBack;
window.closeProfile = () => document.getElementById('profile-modal').classList.add('hidden');
