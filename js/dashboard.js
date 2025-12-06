// ========== ЛОГИКА ОСНОВНОГО ПРИЛОЖЕНИЯ SiaMatch ==========

// Основной объект состояния
let appState = {
    currentTab: 'swipes',
    currentUser: null,
    swipeUsers: [],
    currentCardIndex: 0,
    matches: [],
    chats: []
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем доступ
    const access = checkDashboardAccess();
    
    if (!access.allowed) {
        showAccessDeniedScreen(access);
        return;
    }
    
    // Устанавливаем текущего пользователя
    appState.currentUser = access.user;
    
    // Загружаем основной интерфейс
    initDashboard();
    
    // Загружаем данные
    loadSwipes();
    loadMatches();
    loadChats();
    
    // Устанавливаем обработчики событий
    setupEventListeners();
});

// Экран отказа в доступе
function showAccessDeniedScreen(access) {
    const statusMessages = {
        'pending': {
            title: '⏳ Анкета на проверке',
            message: 'Ваша анкета находится на проверке у администратора.',
            details: 'Обычно это занимает от 15 минут до 24 часов.',
            button: 'Проверить статус',
            action: () => window.location.reload()
        },
        'rejected': {
            title: '❌ Анкета отклонена',
            message: 'Ваша анкета не прошла модерацию.',
            details: access.details || 'Пожалуйста, проверьте данные.',
            button: 'Вернуться к регистрации',
            action: () => window.location.href = 'index.html'
        },
        'no_user': {
            title: '👤 Пользователь не найден',
            message: 'Пожалуйста, пройдите регистрацию.',
            details: 'Для использования SiaMatch нужно создать анкету.',
            button: 'Зарегистрироваться',
            action: () => window.location.href = 'index.html'
        },
        'unknown': {
            title: '⚠️ Ошибка доступа',
            message: 'Не удалось определить статус вашей анкеты.',
            details: 'Пожалуйста, обратитесь в поддержку.',
            button: 'На главную',
            action: () => window.location.href = 'index.html'
        }
    };
    
    const status = statusMessages[access.code] || statusMessages['unknown'];
    
    document.body.innerHTML = `
        <div class="access-denied-screen">
            <div class="access-container">
                <div class="status-icon">${status.title.split(' ')[0]}</div>
                <h1 class="status-title">${status.title.split(' ').slice(1).join(' ')}</h1>
                <p class="status-message">${status.message}</p>
                <p class="status-details">${status.details}</p>
                <button class="action-button" onclick="(${status.action})()">
                    ${status.button}
                </button>
                <div class="support-info">
                    Нужна помощь? Обратитесь в поддержку SiaMatch
                </div>
            </div>
        </div>
        
        <style>
            .access-denied-screen {
                background: linear-gradient(135deg, #4CAF50, #45a049);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .access-container {
                background: white;
                border-radius: 25px;
                padding: 40px 30px;
                max-width: 400px;
                width: 100%;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            }
            
            .status-icon {
                font-size: 60px;
                margin-bottom: 20px;
            }
            
            .status-title {
                color: #333;
                font-size: 24px;
                margin-bottom: 15px;
                font-weight: bold;
            }
            
            .status-message {
                color: #666;
                font-size: 16px;
                margin-bottom: 15px;
                line-height: 1.5;
            }
            
            .status-details {
                color: #888;
                font-size: 14px;
                margin-bottom: 30px;
                line-height: 1.4;
            }
            
            .action-button {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 16px 30px;
                border-radius: 50px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                width: 100%;
                transition: all 0.3s;
                margin-bottom: 20px;
            }
            
            .action-button:hover {
                background: #45a049;
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(0,0,0,0.15);
            }
            
            .support-info {
                font-size: 12px;
                color: #999;
                border-top: 1px solid #eee;
                padding-top: 15px;
            }
        </style>
    `;
}

// Инициализация дашборда
function initDashboard() {
    // Устанавливаем имя пользователя
    if (appState.currentUser) {
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = appState.currentUser.name;
        }
    }
    
    // Устанавливаем активную вкладку
    setActiveTab('swipes');
}

// Установка активной вкладки
function setActiveTab(tabName) {
    appState.currentTab = tabName;
    
    // Обновляем навигацию
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.nav-item[data-tab="${tabName}"]`)?.classList.add('active');
    
    // Обновляем контент
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`)?.classList.add('active');
    
    // Обновляем заголовок
    const titles = {
        'swipes': '🍀 Найди свою пару',
        'chats': '💬 Сообщения',
        'profile': '👤 Профиль'
    };
    const titleElement = document.getElementById('page-title');
    if (titleElement) {
        titleElement.textContent = titles[tabName] || 'SiaMatch';
    }
}

// Загрузка пользователей для свайпов
function loadSwipes() {
    if (!appState.currentUser) return;
    
    appState.swipeUsers = getActiveUsers(appState.currentUser.id);
    appState.currentCardIndex = 0;
    
    renderSwipeCards();
}

// Отображение карточек для свайпов
function renderSwipeCards() {
    const container = document.querySelector('.cards-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (appState.swipeUsers.length === 0) {
        container.innerHTML = `
            <div class="no-users-message">
                <div class="no-users-icon">😔</div>
                <h3>Пока никого нет рядом</h3>
                <p>Попробуйте изменить настройки поиска или зайти позже</p>
                <button class="btn-refresh" onclick="loadSwipes()">
                    Обновить
                </button>
            </div>
        `;
        return;
    }
    
    // Показываем только первые 3 карточки
    const cardsToShow = appState.swipeUsers.slice(0, 3);
    
    cardsToShow.forEach((user, index) => {
        const card = createSwipeCard(user, index);
        container.appendChild(card);
    });
}

// Создание карточки для свайпа
function createSwipeCard(user, index) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.zIndex = 100 - index;
    card.style.transform = `translateY(${index * 5}px)`;
    
    // Определяем расстояние (для демо)
    const distances = ['2 км', '5 км', '10 км', '15 км'];
    const distance = distances[Math.floor(Math.random() * distances.length)];
    
    // Определяем общие интересы (для демо)
    const commonInterests = user.interests ? 
        user.interests.slice(0, 2) : ['Путешествия', 'Кофе'];
    
    card.innerHTML = `
        <div class="card-img" style="background-image: url('${user.photo}')"></div>
        <div class="card-content">
            <div class="card-header">
                <div class="card-info">
                    <h3 class="card-name">${user.name}, ${user.age}</h3>
                    <div class="card-location">
                        <span class="location-icon">📍</span>
                        ${user.city} • ${distance}
                    </div>
                </div>
                <div class="card-actions">
                    <button class="card-action-btn" onclick="showProfile(${user.id})">
                        <span>👁</span>
                    </button>
                </div>
            </div>
            
            <div class="card-bio">
                ${user.bio || 'Пользователь SiaMatch'}
            </div>
            
            ${user.interests && user.interests.length > 0 ? `
            <div class="card-interests">
                <div class="interests-label">Интересы:</div>
                <div class="interests-tags">
                    ${user.interests.slice(0, 3).map(interest => 
                        `<span class="interest-tag">${interest}</span>`
                    ).join('')}
                </div>
            </div>
            ` : ''}
            
            <div class="card-footer">
                <button class="swipe-btn dislike-btn" onclick="swipeLeft(${user.id})">
                    <span>👎</span>
                </button>
                <button class="swipe-btn like-btn" onclick="swipeRight(${user.id})">
                    <span>❤️</span>
                </button>
            </div>
        </div>
    `;
    
    // Добавляем обработчики свайпа
    let isDragging = false;
    let startX, startY, currentX, currentY;
    
    card.addEventListener('mousedown', startDrag);
    card.addEventListener('touchstart', startDrag);
    
    function startDrag(e) {
        isDragging = true;
        const touch = e.type === 'touchstart' ? e.touches[0] : e;
        startX = touch.clientX;
        startY = touch.clientY;
        currentX = startX;
        currentY = startY;
        
        card.style.transition = 'none';
        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        const touch = e.type === 'touchmove' ? e.touches[0] : e;
        currentX = touch.clientX;
        currentY = touch.clientY;
        
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        const rotation = deltaX * 0.1;
        
        card.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotation}deg)`;
        
        // Изменяем цвет в зависимости от направления
        if (deltaX > 50) {
            card.style.borderColor = '#4CAF50';
        } else if (deltaX < -50) {
            card.style.borderColor = '#f44336';
        }
    }
    
    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchend', endDrag);
        
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;
        
        card.style.transition = 'transform 0.3s, opacity 0.3s';
        
        // Если свайп достаточно сильный
        if (Math.abs(deltaX) > 100) {
            card.style.transform = `translate(${deltaX * 2}px, ${deltaY}px) rotate(${deltaX * 0.2}deg)`;
            card.style.opacity = '0';
            
            setTimeout(() => {
                if (deltaX > 0) {
                    swipeRight(user.id);
                } else {
                    swipeLeft(user.id);
                }
                card.remove();
            }, 300);
        } else {
            // Возвращаем на место
            card.style.transform = `translateY(${index * 5}px)`;
            card.style.borderColor = '#ddd';
        }
    }
    
    return card;
}

// Свайп вправо (лайк)
function swipeRight(userId) {
    const user = appState.swipeUsers.find(u => u.id === userId);
    if (!user) return;
    
    // Анимация свайпа
    const card = document.querySelector(`.card[data-user-id="${userId}"]`) || 
                 document.querySelector('.card:last-child');
    
    if (card) {
        card.style.transition = 'transform 0.5s, opacity 0.5s';
        card.style.transform = 'translateX(500px) rotate(30deg)';
        card.style.opacity = '0';
        
        setTimeout(() => {
            card.remove();
        }, 500);
    }
    
    // Показываем уведомление
    showSwipeNotification('❤️ Вы понравились ' + user.name);
    
    // Добавляем в матчи (с вероятностью 30% для демо)
    if (Math.random() < 0.3) {
        addMatch(appState.currentUser.id, userId);
        showMatchNotification(user);
    }
    
    // Удаляем пользователя из списка
    appState.swipeUsers = appState.swipeUsers.filter(u => u.id !== userId);
    appState.currentCardIndex = Math.max(0, appState.currentCardIndex - 1);
    
    // Обновляем карточки
    setTimeout(renderSwipeCards, 500);
}

// Свайп влево (дизлайк)
function swipeLeft(userId) {
    const user = appState.swipeUsers.find(u => u.id === userId);
    
    // Анимация свайпа
    const card = document.querySelector(`.card[data-user-id="${userId}"]`) || 
                 document.querySelector('.card:last-child');
    
    if (card) {
        card.style.transition = 'transform 0.5s, opacity 0.5s';
        card.style.transform = 'translateX(-500px) rotate(-30deg)';
        card.style.opacity = '0';
        
        setTimeout(() => {
            card.remove();
        }, 500);
    }
    
    // Показываем уведомление
    if (user) {
        showSwipeNotification('👎 Вы пропустили ' + user.name);
    }
    
    // Удаляем пользователя из списка
    appState.swipeUsers = appState.swipeUsers.filter(u => u.id !== userId);
    appState.currentCardIndex = Math.max(0, appState.currentCardIndex - 1);
    
    // Обновляем карточки
    setTimeout(renderSwipeCards, 500);
}

// Показ уведомления о свайпе
function showSwipeNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'swipe-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 15px 25px;
        border-radius: 50px;
        z-index: 1000;
        animation: fadeInOut 2s ease;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
    
    // Добавляем стили для анимации
    if (!document.querySelector('#swipe-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'swipe-notification-styles';
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                20% { opacity: 1; transform: translateX(-50%) translateY(0); }
                80% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Показ уведомления о матче
function showMatchNotification(user) {
    const notification = document.createElement('div');
    notification.className = 'match-notification';
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 30px;">🎉</div>
            <div>
                <div style="font-weight: bold; margin-bottom: 5px;">Это взаимно!</div>
                <div>У вас совпадение с ${user.name}</div>
            </div>
        </div>
        <button onclick="openChat(${user.id})" style="
            background: white;
            color: #4CAF50;
            border: none;
            padding: 8px 15px;
            border-radius: 20px;
            font-weight: bold;
            cursor: pointer;
        ">
            Написать
        </button>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 20px;
        border-radius: 20px;
        z-index: 1000;
        animation: slideDown 0.5s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.5s ease';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
    
    // Добавляем стили для анимации
    if (!document.querySelector('#match-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'match-notification-styles';
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-100px); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateX(-50%) translateY(0); opacity: 1; }
                to { transform: translateX(-50%) translateY(-100px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Загрузка матчей
function loadMatches() {
    if (!appState.currentUser) return;
    
    const matchesData = JSON.parse(localStorage.getItem(`sia_matches_${appState.currentUser.id}`) || '[]');
    const activeUsers = JSON.parse(localStorage.getItem('sia_active_users') || '[]');
    
    appState.matches = matchesData.map(match => {
        const user = activeUsers.find(u => u.id === match.userId);
        return {
            ...match,
            user: user || { name: 'Неизвестный', id: match.userId }
        };
    });
    
    renderMatches();
}

// Отображение матчей
function renderMatches() {
    const container = document.getElementById('matches-container');
    if (!container) return;
    
    if (appState.matches.length === 0) {
        container.innerHTML = `
            <div class="no-matches">
                <div class="no-matches-icon">💔</div>
                <h3>Пока нет совпадений</h3>
                <p>Продолжайте свайпать, чтобы найти свою пару!</p>
            </div>
        `;
        return;
    }
    
    let html = '<h3 class="matches-title">Ваши совпадения</h3>';
    
    appState.matches.forEach(match => {
        const timeAgo = getTimeAgo(match.matchedAt);
        
        html += `
            <div class="match-card" onclick="openChat(${match.userId})">
                <div class="match-avatar" style="background-image: url('${match.user.photo || 'https://via.placeholder.com/50'}')"></div>
                <div class="match-info">
                    <div class="match-name">${match.user.name}</div>
                    <div class="match-time">${timeAgo}</div>
                </div>
                ${match.unread ? '<div class="match-unread"></div>' : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Загрузка чатов
function loadChats() {
    // Демо-чаты
    appState.chats = [
        {
            id: 1,
            userId: 100001,
            name: "Анна",
            lastMessage: "Привет! Как твои дела?",
            time: "10:30",
            unread: 2,
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop"
        },
        {
            id: 2,
            userId: 100002,
            name: "Мария",
            lastMessage: "Давай встретимся в субботу?",
            time: "Вчера",
            unread: 0,
            avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop"
        },
        {
            id: 3,
            userId: 100003,
            name: "Екатерина",
            lastMessage: "👋",
            time: "2 дня назад",
            unread: 1,
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
        }
    ];
    
    renderChats();
}

// Отображение чатов
function renderChats() {
    const container = document.getElementById('chats-container');
    if (!container) return;
    
    if (appState.chats.length === 0) {
        container.innerHTML = `
            <div class="no-chats">
                <div class="no-chats-icon">💬</div>
                <h3>Нет сообщений</h3>
                <p>Найдите совпадения, чтобы начать общение</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    appState.chats.forEach(chat => {
        html += `
            <div class="chat-item" onclick="openChat(${chat.userId})">
                <div class="chat-avatar" style="background-image: url('${chat.avatar}')"></div>
                <div class="chat-info">
                    <div class="chat-header">
                        <div class="chat-name">${chat.name}</div>
                        <div class="chat-time">${chat.time}</div>
                    </div>
                    <div class="chat-message">${chat.lastMessage}</div>
                </div>
                ${chat.unread > 0 ? `
                <div class="chat-unread">${chat.unread}</div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Открытие чата
function openChat(userId) {
    setActiveTab('chats');
    // В реальном приложении здесь будет загрузка конкретного чата
    showNotification('Чат с пользователем будет доступен в полной версии', 'info');
}

// Показ профиля пользователя
function showProfile(userId) {
    const user = appState.swipeUsers.find(u => u.id === userId) ||
                appState.matches.find(m => m.userId === userId)?.user;
    
    if (!user) return;
    
    const modal = document.createElement('div');
    modal.className = 'profile-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
            
            <div class="profile-header">
                <div class="profile-avatar" style="background-image: url('${user.photo}')"></div>
                <div class="profile-info">
                    <h2 class="profile-name">${user.name}, ${user.age}</h2>
                    <div class="profile-location">
                        <span class="location-icon">📍</span>
                        ${user.city}
                    </div>
                </div>
            </div>
            
            <div class="profile-section">
                <h3>О себе</h3>
                <p class="profile-bio">${user.bio || 'Пользователь SiaMatch'}</p>
            </div>
            
            ${user.interests && user.interests.length > 0 ? `
            <div class="profile-section">
                <h3>Интересы</h3>
                <div class="profile-interests">
                    ${user.interests.map(interest => 
                        `<span class="interest-tag">${interest}</span>`
                    ).join('')}
                </div>
            </div>
            ` : ''}
            
            <div class="profile-actions">
                <button class="profile-action-btn dislike-btn" onclick="swipeLeft(${user.id}); this.parentElement.parentElement.parentElement.remove()">
                    <span>👎</span> Пропустить
                </button>
                <button class="profile-action-btn like-btn" onclick="swipeRight(${user.id}); this.parentElement.parentElement.parentElement.remove()">
                    <span>❤️</span> Лайк
                </button>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(modal);
    
    // Добавляем стили для анимации
    if (!document.querySelector('#modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .modal-content {
                background: white;
                border-radius: 25px;
                padding: 30px;
                max-width: 400px;
                width: 100%;
                max-height: 80vh;
                overflow-y: auto;
                position: relative;
                animation: slideUp 0.3s ease;
            }
            
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .modal-close {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                font-size: 30px;
                color: #666;
                cursor: pointer;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s;
            }
            
            .modal-close:hover {
                background: #f0f0f0;
                color: #333;
            }
            
            .profile-header {
                display: flex;
                gap: 20px;
                margin-bottom: 25px;
            }
            
            .profile-avatar {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                background-size: cover;
                background-position: center;
                border: 3px solid #4CAF50;
            }
            
            .profile-name {
                color: #333;
                margin-bottom: 8px;
            }
            
            .profile-location {
                color: #666;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .profile-section {
                margin-bottom: 20px;
            }
            
            .profile-section h3 {
                color: #333;
                margin-bottom: 10px;
                font-size: 18px;
            }
            
            .profile-bio {
                color: #666;
                line-height: 1.5;
            }
            
            .profile-interests {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .interest-tag {
                background: #E8F5E9;
                color: #2E7D32;
                padding: 5px 12px;
                border-radius: 15px;
                font-size: 14px;
            }
            
            .profile-actions {
                display: flex;
                gap: 10px;
                margin-top: 30px;
            }
            
            .profile-action-btn {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.3s;
            }
            
            .profile-action-btn:hover {
                transform: translateY(-2px);
            }
            
            .dislike-btn {
                background: #FFEBEE;
                color: #C62828;
            }
            
            .like-btn {
                background: #E8F5E9;
                color: #2E7D32;
            }
        `;
        document.head.appendChild(style);
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Навигация
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            if (tab) {
                setActiveTab(tab);
            }
        });
    });
    
    // Кнопка выхода
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Кнопка редактирования профиля
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', editProfile);
    }
    
    // Обновление свайпов
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadSwipes);
    }
}

// Выход из аккаунта
function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.removeItem('sia_current_user');
        localStorage.removeItem('sia_current_application_id');
        showNotification('До свидания!', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }
}

// Редактирование профиля
function editProfile() {
    showNotification('Редактирование профиля будет доступно в полной версии', 'info');
}

// Вспомогательная функция для форматирования времени
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
        return `${diffMins} мин назад`;
    } else if (diffHours < 24) {
        return `${diffHours} ч назад`;
    } else {
        return `${diffDays} дн назад`;
    }
}

console.log("✅ Dashboard.js загружен");
