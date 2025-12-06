// ========== ЛОГИКА РЕГИСТРАЦИИ (index.html) ==========

let userProfile = {
    telegramId: null,
    username: null,
    firstName: null,
    age: null,
    city: null,
    mainPhoto: null,
    selfiePhoto: null,
    status: 'new',
    likes: 0,
    matches: 0,
    createdAt: null
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Страница регистрации загружена');
    
    // Приветствуем пользователя из Telegram
    const tgUser = tg.initDataUnsafe?.user;
    if (tgUser?.first_name) {
        document.getElementById('welcome-text').textContent = `Привет, ${tgUser.first_name}!`;
    }
});

// Функции регистрации
function startOnboarding() {
    console.log('Начало онбординга');
    NavigationUtils.goToStep(1);
    populateAgeSelect();
    populateCitySelect();
}

function populateAgeSelect() {
    const select = document.getElementById('age-select');
    
    // Очищаем, оставляя первый option
    while (select.options.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    // Добавляем возраста 18-60
    for (let age = 18; age <= 60; age++) {
        const option = document.createElement('option');
        option.value = age;
        option.textContent = `${age} лет`;
        select.appendChild(option);
    }
    
    console.log(`Добавлено ${select.options.length - 1} возрастов`);
}

function populateCitySelect() {
    const select = document.getElementById('city-select');
    
    // Очищаем, оставляя первый option
    while (select.options.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    // Добавляем города
    window.russianCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        select.appendChild(option);
    });
    
    console.log(`Добавлено ${select.options.length - 1} городов`);
}

function saveName() {
    const nameInput = document.getElementById('name-input');
    const name = nameInput.value.trim();
    
    if (!name) {
        NotificationUtils.show('Введите ваше имя', 'error');
        nameInput.focus();
        return;
    }
    
    if (name.length < 2) {
        NotificationUtils.show('Имя должно быть минимум 2 символа', 'error');
        nameInput.focus();
        return;
    }
    
    // Проверяем что только буквы
    const nameRegex = /^[A-Za-zА-Яа-яЁё\s\-]+$/;
    if (!nameRegex.test(name)) {
        NotificationUtils.show('Имя может содержать только буквы, пробелы и дефисы', 'error');
        nameInput.focus();
        return;
    }
    
    userProfile.firstName = name;
    console.log('Имя сохранено:', userProfile.firstName);
    NavigationUtils.goToStep(2);
}

function saveAge() {
    const ageSelect = document.getElementById('age-select');
    const age = parseInt(ageSelect.value);
    
    if (!age || age < 18 || age > 60) {
        NotificationUtils.show('Выберите возраст от 18 до 60 лет', 'error');
        ageSelect.focus();
        return;
    }
    
    userProfile.age = age;
    console.log('Возраст сохранен:', userProfile.age);
    NavigationUtils.goToStep(3);
}

function saveCity() {
    const citySelect = document.getElementById('city-select');
    const city = citySelect.value;
    
    if (!city) {
        NotificationUtils.show('Выберите ваш город', 'error');
        citySelect.focus();
        return;
    }
    
    userProfile.city = city;
    console.log('Город сохранен:', userProfile.city);
    NavigationUtils.goToStep(4);
}

function previewMainPhoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
        NotificationUtils.show('Пожалуйста, загрузите изображение', 'error');
        return;
    }
    
    // Проверка размера (5MB)
    if (file.size > 5 * 1024 * 1024) {
        NotificationUtils.show('Фото должно быть меньше 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('main-photo-preview');
        preview.src = e.target.result;
        preview.classList.add('show');
        
        userProfile.mainPhoto = e.target.result;
        console.log('Основное фото загружено');
        
        NotificationUtils.show('Фото успешно загружено!');
    };
    
    reader.onerror = function() {
        NotificationUtils.show('Ошибка загрузки файла', 'error');
    };
    
    reader.readAsDataURL(file);
}

function previewSelfie(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
        NotificationUtils.show('Пожалуйста, загрузите изображение', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('selfie-preview');
        preview.src = e.target.result;
        preview.classList.add('show');
        
        userProfile.selfiePhoto = e.target.result;
        console.log('Селфи загружено');
        
        NotificationUtils.show('Селфи успешно загружено!');
    };
    
    reader.onerror = function() {
        NotificationUtils.show('Ошибка загрузки файла', 'error');
    };
    
    reader.readAsDataURL(file);
}

function saveMainPhoto() {
    if (!userProfile.mainPhoto) {
        NotificationUtils.show('Загрузите ваше фото', 'error');
        return;
    }
    
    console.log('Основное фото сохранено');
    NavigationUtils.goToStep(5);
}

function saveSelfie() {
    if (!userProfile.selfiePhoto) {
        NotificationUtils.show('Загрузите селфи для подтверждения', 'error');
        return;
    }
    
    // Подтверждение отправки
    tg.showConfirm(
        'Отправить анкету на проверку?\n\nПосле отправки вы не сможете изменить данные в течение 24 часов.',
        function(confirmed) {
            if (confirmed) {
                // Сохраняем профиль
                userProfile.status = 'pending';
                userProfile.createdAt = new Date().toISOString();
                userProfile.telegramId = tg.initDataUnsafe.user.id;
                userProfile.username = tg.initDataUnsafe.user.username || 'user_' + Date.now();
                
                // Сохраняем в localStorage
                UserUtils.saveUser(userProfile);
                
                // Добавляем в общий список пользователей
                const allUsers = UserUtils.getAllUsers();
                allUsers.push(userProfile);
                UserUtils.saveAllUsers(allUsers);
                
                console.log('Анкета отправлена на проверку:', userProfile);
                
                // Переходим к экрану ожидания
                NavigationUtils.goToStep(6);
                
                // Имитируем проверку модерацией (3 секунды)
                setTimeout(() => {
                    // Одобряем анкету (в реальности это делает админ)
                    userProfile.status = 'approved';
                    userProfile.id = Date.now(); // Добавляем ID
                    UserUtils.saveUser(userProfile);
                    
                    // Обновляем в общем списке
                    const updatedUsers = UserUtils.getAllUsers();
                    const userIndex = updatedUsers.findIndex(u => u.telegramId === userProfile.telegramId);
                    if (userIndex !== -1) {
                        updatedUsers[userIndex] = { ...userProfile };
                        UserUtils.saveAllUsers(updatedUsers);
                    }
                    
                    // Через 3 секунды редирект на дашборд
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 3000);
                    
                }, 3000);
            }
        }
    );
}

// Экспорт функций для HTML
window.startOnboarding = startOnboarding;
window.saveName = saveName;
window.saveAge = saveAge;
window.saveCity = saveCity;
window.saveMainPhoto = saveMainPhoto;
window.saveSelfie = saveSelfie;
window.previewMainPhoto = previewMainPhoto;
window.previewSelfie = previewSelfie;
