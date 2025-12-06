// ========== ЛОГИКА ДАШБОРДА (dashboard.html) ==========

let currentUser = null;
let swipeProfiles = [];
let currentSwipeIndex = 0;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Дашборд загружен');
    
    // Получаем текущего пользователя
    currentUser = UserUtils.getCurrentUser();
    
    if (!currentUser) {
        // Нет пользователя - редирект на регистрацию
        NavigationUtils.goToPage('index.html');
        return;
    }
    
    // Обновляем информацию о пользователе
    updateUserInfo();
    
    // Загружаем профили для свайпа
    loadSwipeProfiles();
    
    // Инициализируем чаты
    loadChats();
});

// Обновление информации пользователя
function updateUserInfo() {
    if (!currentUser) return;
    
    // Аватар
    const avatar = document.getElementById('user-avatar');
    if (currentUser.firstName) {
        avatar.textContent = currentUser.firstName.charAt(0).toUpperCase();
    }
    
    // Основное фото в профиле
    const myPhoto = document.getElementById('my-profile-photo');
    if (currentUser.mainPhoto) {
        myPhoto.style.backgroundImage = `url(${currentUser.mainPhoto})`;
    } else {
        myPhoto.style.backgroundColor = '#4CAF50';
    }
    
    // Информация в профиле
    document.getElementById('my-name').textContent = currentUser.firstName || '-';
    document.getElementById('my-age-city').textContent = 
        `${currentUser.age || '?'} лет, ${currentUser.city || 'Не указан'}`;
    document.getElementById('my-likes').textContent = currentUser.likes || 0;
    document.getElementById('my-matches').textContent = currentUser.matches || 0;
}

// Загрузка профилей для свайпа
function loadSwipeProfiles() {
    // Получаем всех пользователей
    const allUsers = UserUtils.getAllUsers();
    
    // Фильтруем: только одобренные и не текущий пользователь
    swipeProfiles = allUsers.filter(user => 
        user.status === 'approved' && 
        user.telegramId !== currentUser.telegramId
    );
    
    console.log(`Загружено ${swipeProfiles.length} профилей для свайпа`);
    
    // Если есть профили - показываем первый
    if (swipeProfiles.length > 0) {
        showCurrentProfile();
    } else {
        // Нет профилей - показываем сообщение
        document.getElementById('current-profile').innerHTML = `
            <div style="text-align: center; padding: 100px 20px;">
                <div style="font-size: 60px; margin-bottom: 20px;">😔</div>
                <h3>Пока никого рядом</h3>
                <p>Вернитесь позже, когда появятся новые пользователи</p>
            </div>
        `;
    }
}

// Показать текущий профиль
function showCurrentProfile() {
    if (currentSwipeIndex >= swipeProfiles.length) {
        // Все профили просмотрены
        document.getElementById('current-profile').innerHTML = `
            <div style="text-align: center; padding: 100px 20px;">
                <div style="font-size: 60px; margin-bottom: 20px;">🎉</div>
                <h3>Вы просмотрели всех!</h3>
                <p>Вернитесь позже, когда появятся новые пользователи</p>
            </div>
        `;
        return;
    }
    
    const profile = swipeProfiles[currentSwipeIndex];
    
    // Обновляем информацию в карточке
    document.getElementById('profile-name').textContent = `${profile.firstName}, ${profile.age}`;
    document.getElementById('profile-city').textContent = `📍 ${profile.city}`;
    
    // Фото профиля
    const photoElement = document.getElementById('profile-photo');
    if (profile.mainPhoto) {
        photoElement.style.backgroundImage = `url(${profile.mainPhoto})`;
    } else {
        // Цветной градиент если нет фото
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        photoElement.style.background = randomColor;
    }
    
    // Биография (тестовая)
    const bios = [
        "Люблю путешествия и кофе. Ищу серьезные отношения.",
        "Спорт, книги, кино. Хочу найти близкого по духу человека.",
        "Работаю в IT, увлекаюсь фотографией. Ищу того, с кем можно разделить интересы.",
        "Обожаю природу и активный отдых. Ищу партнера для приключений."
    ];
    const randomBio = bios[Math.floor(Math.random() * bios.length)];
    document.getElementById('profile-bio').textContent = randomBio;
}

// Свайп вправо (лайк)
function swipeRight() {
    if (currentSwipeIndex >= swipeProfiles.length) return;
    
    const profile = swipeProfiles[currentSwipeIndex];
    const card = document.getElementById('current-profile');
    
    // Анимация свайпа
    card.classList.add('swipe-right');
    
    // Обновляем статистику текущего пользователя
    currentUser.likes = (currentUser.likes || 0) + 1;
    UserUtils.updateUserStats(currentUser.telegramId, { likes: currentUser.likes });
    
    console.log(`Лайк профилю: ${profile.firstName}`);
    NotificationUtils.show(`Вы понравились ${profile.firstName}!`, 'success');
    
    // Переходим к следующему профилю через 500ms
    setTimeout(() => {
        currentSwipeIndex++;
        card.classList.remove('swipe-right');
        showCurrentProfile();
    }, 500);
}

// Свайп влево (дизлайк)
function swipeLeft() {
    if (currentSwipeIndex >= swipeProfiles.length) return;
    
    const profile = swipeProfiles[currentSwipeIndex];
    const card = document.getElementById('current-profile');
    
    // Анимация свайпа
    card.classList.add('swipe-left');
    
    console.log(`Дизлайк профилю: ${profile.firstName}`);
    
    // Переходим к следующему профилю через 500ms
    setTimeout(() => {
        currentSwipeIndex++;
        card.classList.remove('swipe-left');
        showCurrentProfile();
    }, 500);
}

// Загрузка чатов
function loadChats() {
    // В будущем здесь будет загрузка реальных чатов
    // Пока просто обновляем количество
    console.log('Чаты загружены');
}

// Переключение вкладок
function showTab(tabName) {
    // Скрываем все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.add('hidden');
    });
    
    // Деактивируем все кнопки
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показываем нужную вкладку
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Активируем кнопку
    const activeBtn = document.querySelector(`.nav-btn[onclick*="${tabName}"]`);
    if (activeBtn) activeBtn.classList.add('active');
}

// Редактирование профиля
function editProfile() {
    if (confirm('Редактирование профиля сбросит верификацию. Продолжить?')) {
        currentUser.status = 'new';
        UserUtils.saveUser(currentUser);
        NavigationUtils.goToPage('index.html');
    }
}

// Настройки
function showSettings() {
    alert('Настройки будут доступны в следующем обновлении!');
}

// Выход
function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.removeItem('sia_user');
        NavigationUtils.goToPage('index.html');
    }
}

// Экспорт функций для HTML
window.swipeLeft = swipeLeft;
window.swipeRight = swipeRight;
window.showTab = showTab;
window.editProfile = editProfile;
window.showSettings = showSettings;
window.logout = logout;
