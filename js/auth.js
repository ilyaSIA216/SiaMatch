// ========== ЛОГИКА РЕГИСТРАЦИИ SiaMatch ==========

// Объект для хранения данных пользователя
let userProfile = {
    name: '',
    age: '',
    city: '',
    mainPhoto: '',
    selfie: '',
    bio: '',
    gender: '', // Добавляем поле пола
    interests: []
};

// Начало регистрации
function startOnboarding() {
    console.log('Начинаем онбординг');
    
    // Приветствие без использования данных Telegram
    const welcomeText = document.getElementById('welcome-text');
    if (welcomeText) {
        welcomeText.textContent = 'Привет, друг! Добро пожаловать в мир знакомств!';
    }
    
    // Переходим к шагу 1 (имя)
    goToStep(1);
}

// Переход между шагами
function goToStep(stepNumber) {
    console.log(`Переход к шагу ${stepNumber}`);
    
    // Скрываем все шаги
    document.querySelectorAll('.step').forEach(step => {
        step.classList.add('hidden');
    });
    
    // Показываем нужный шаг
    const stepElement = document.getElementById(`step-${stepNumber}`);
    if (stepElement) {
        stepElement.classList.remove('hidden');
        
        // Обновляем индикатор прогресса
        updateProgressIndicator(stepNumber);
    } else {
        console.error(`Шаг ${stepNumber} не найден!`);
        return;
    }
    
    // Инициализируем шаг, если нужно
    switch(stepNumber) {
        case 3: // Возраст
            initAgeSelect();
            break;
        case 4: // Город
            initCitySelect();
            break;
        case 7: // Модерация
            setTimeout(showModerationInfo, 500);
            break;
    }
    
    // Прокрутка вверх
    window.scrollTo(0, 0);
}

// Обновление индикатора прогресса
function updateProgressIndicator(currentStep) {
    const progressDots = document.querySelectorAll('.progress-indicator .step-dot');
    progressDots.forEach((dot, index) => {
        if (index < currentStep) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// ========== ШАГ 1: ИМЯ ==========

function saveName() {
    console.log('Сохранение имени');
    const nameInput = document.getElementById('name-input');
    if (!nameInput) {
        console.error('Поле имени не найдено');
        return;
    }
    
    const name = nameInput.value.trim();
    
    // Проверка имени
    if (!name || name.length < 2) {
        showNotification('Введите ваше имя (минимум 2 буквы)', 'error');
        return;
    }
    
    if (!/^[а-яА-ЯёЁa-zA-Z\s-]+$/.test(name)) {
        showNotification('Имя может содержать только буквы, пробелы и дефисы', 'error');
        return;
    }
    
    userProfile.name = name;
    console.log('Имя сохранено:', name);
    
    // Переходим к выбору пола
    goToStep(2);
}

// ========== ШАГ 2: ВЫБОР ПОЛА ==========

// Выбор пола при клике на опцию
function selectGender(gender) {
    console.log('Выбран пол:', gender);
    
    // Снимаем выделение со всех опций
    document.querySelectorAll('.gender-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Выделяем выбранную опцию
    if (gender === 'male') {
        document.querySelector('.gender-option:nth-child(1)').classList.add('selected');
    } else {
        document.querySelector('.gender-option:nth-child(2)').classList.add('selected');
    }
    
    userProfile.gender = gender;
}

function saveGender() {
    console.log('Сохранение пола');
    
    if (!userProfile.gender) {
        showNotification('Пожалуйста, выберите ваш пол', 'error');
        return;
    }
    
    console.log('Пол сохранен:', userProfile.gender);
    
    // Переходим к возрасту
    goToStep(3);
}

// ========== ШАГ 3: ВОЗРАСТ ==========

function initAgeSelect() {
    console.log('Инициализация выбора возраста');
    const ageSelect = document.getElementById('age-select');
    if (!ageSelect) {
        console.error('Элемент выбора возраста не найден');
        return;
    }
    
    // Очищаем, кроме первого option
    while (ageSelect.options.length > 1) {
        ageSelect.remove(1);
    }
    
    // Добавляем возрасты от 18 до 60
    for (let age = 18; age <= 60; age++) {
        const option = document.createElement('option');
        option.value = age;
        option.textContent = `${age} лет`;
        ageSelect.appendChild(option);
    }
}

function saveAge() {
    console.log('Сохранение возраста');
    const ageSelect = document.getElementById('age-select');
    if (!ageSelect) {
        console.error('Поле выбора возраста не найдено');
        return;
    }
    
    const age = ageSelect.value;
    
    if (!age) {
        showNotification('Пожалуйста, выберите ваш возраст', 'error');
        return;
    }
    
    userProfile.age = parseInt(age);
    console.log('Возраст сохранен:', age);
    
    // Переходим к городу
    goToStep(4);
}

// ========== ШАГ 4: ГОРОД ==========

function initCitySelect() {
    console.log('Инициализация выбора города');
    const citySelect = document.getElementById('city-select');
    if (!citySelect) {
        console.error('Элемент выбора города не найден');
        return;
    }
    
    // Очищаем, кроме первого option
    while (citySelect.options.length > 1) {
        citySelect.remove(1);
    }
    
    // Добавляем города России из utils.js
    if (typeof russianCities !== 'undefined' && russianCities.length > 0) {
        russianCities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    } else {
        console.error('Список городов не загружен');
        // Добавляем хотя бы несколько городов
        const cities = ["Москва", "Санкт-Петербург", "Казань", "Новосибирск", "Екатеринбург"];
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
}

function saveCity() {
    console.log('Сохранение города');
    const citySelect = document.getElementById('city-select');
    if (!citySelect) {
        console.error('Поле выбора города не найдено');
        return;
    }
    
    const city = citySelect.value;
    
    if (!city) {
        showNotification('Пожалуйста, выберите ваш город', 'error');
        return;
    }
    
    userProfile.city = city;
    console.log('Город сохранен:', city);
    
    // Переходим к основному фото
    goToStep(5);
}

// ========== ШАГ 5: ОСНОВНОЕ ФОТО ==========

function previewMainPhoto(event) {
    console.log('Предпросмотр основного фото');
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Проверка размера (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Файл слишком большой (максимум 5MB)', 'error');
        return;
    }
    
    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
        showNotification('Пожалуйста, выберите изображение', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('main-photo-preview');
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        userProfile.mainPhoto = e.target.result;
        console.log('Основное фото загружено');
    };
    reader.readAsDataURL(file);
}

function saveMainPhoto() {
    console.log('Сохранение основного фото');
    
    if (!userProfile.mainPhoto) {
        showNotification('Пожалуйста, загрузите ваше фото', 'error');
        return;
    }
    
    console.log('Основное фото сохранено');
    
    // Переходим к селфи
    goToStep(6);
}

// ========== ШАГ 6: СЕЛФИ ДЛЯ ПОДТВЕРЖДЕНИЯ ==========

function previewSelfie(event) {
    console.log('Предпросмотр селфи');
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Проверка размера (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Файл слишком большой (максимум 5MB)', 'error');
        return;
    }
    
    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
        showNotification('Пожалуйста, выберите изображение', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('selfie-preview');
        if (preview) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        userProfile.selfie = e.target.result;
        console.log('Селфи загружено');
    };
    reader.readAsDataURL(file);
}

function saveSelfie() {
    console.log('=== Начинаем сохранение и отправку анкеты ===');
    console.log('Данные пользователя перед отправкой:', userProfile);
    
    if (!userProfile.selfie) {
        showNotification('Пожалуйста, загрузите селфи для подтверждения', 'error');
        return;
    }
    
    // Проверяем все обязательные поля
    if (!userProfile.name || !userProfile.age || !userProfile.city || !userProfile.gender || !userProfile.mainPhoto) {
        showNotification('Пожалуйста, заполните все обязательные поля', 'error');
        return;
    }
    
    // Сохраняем пользователя
    const userId = Date.now();
    userProfile.id = userId;
    userProfile.registrationDate = new Date().toISOString();
    userProfile.bio = "Пользователь SiaMatch";
    
    console.log('ID пользователя создан:', userId);
    console.log('Данные для сохранения:', userProfile);
    
    // Сохраняем в localStorage
    saveUser(userProfile);
    console.log('Пользователь сохранен в localStorage как sia_current_user');
    
    // Проверяем доступность функции submitForModeration
    if (typeof submitForModeration !== 'function') {
        console.error('Функция submitForModeration не найдена!');
        showNotification('Ошибка системы. Пожалуйста, обновите страницу.', 'error');
        return;
    }
    
    // Отправляем на модерацию
    console.log('Вызываю submitForModeration...');
    try {
        const returnedUserId = submitForModeration(userProfile);
        console.log('submitForModeration вернула ID:', returnedUserId);
        
        // Храним userId
        localStorage.setItem('sia_current_user_id', returnedUserId.toString());
        console.log('sia_current_user_id сохранен:', returnedUserId);
        
        // Проверяем, что заявка действительно сохранилась
        const pendingUsers = JSON.parse(localStorage.getItem('sia_pending_users') || '[]');
        console.log('Всего заявок в системе после отправки:', pendingUsers.length);
        console.log('Последняя заявка:', pendingUsers[pendingUsers.length - 1]);
        
        showNotification('✅ Анкета успешно отправлена на модерацию!', 'success');
        
        // Переходим к шагу модерации
        goToStep(7);
        
    } catch (error) {
        console.error('Ошибка при отправке на модерацию:', error);
        showNotification('Ошибка при отправке анкеты. Попробуйте еще раз.', 'error');
    }
}

// ========== ШАГ 7: МОДЕРАЦИЯ ==========

function showModerationInfo() {
    console.log('Показываем информацию о модерации');
    
    setTimeout(() => {
        const verificationScreen = document.querySelector('.verification-screen');
        if (!verificationScreen) {
            console.error('Экран верификации не найден');
            return;
        }
        
        // Ищем заявку по userId
        const userId = Number(localStorage.getItem('sia_current_user_id'));
        console.log('Ищем заявку с userId:', userId);
        
        const pendingUsers = JSON.parse(localStorage.getItem('sia_pending_users') || '[]');
        console.log('Всего заявок в системе:', pendingUsers.length);
        
        const userApp = pendingUsers.find(u => u.id === userId);
        
        if (!userApp) {
            console.error('Заявка не найдена для userId:', userId);
            // Показываем общую информацию
            verificationScreen.innerHTML += `
                <div style="margin-top: 30px; padding: 20px; background: #f0f7f0; border-radius: 15px;">
                    <p>Ваша анкета отправлена на проверку администратору.</p>
                    <p>Обычно проверка занимает от 15 минут до 24 часов.</p>
                    <button class="btn" onclick="checkApplicationStatus()" style="margin-top: 15px;">Проверить статус</button>
                </div>
            `;
            return;
        }
        
        console.log('Заявка найдена:', userApp);
        
        const infoDiv = document.createElement('div');
        infoDiv.style.marginTop = '30px';
        infoDiv.style.padding = '20px';
        infoDiv.style.background = '#f0f7f0';
        infoDiv.style.borderRadius = '15px';
        infoDiv.style.fontSize = '15px';
        infoDiv.style.color = '#2E7D32';
        infoDiv.style.textAlign = 'left';
        
        infoDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 20px;">📋</span>
                <span>Информация о вашей заявке</span>
            </div>
            
            <div style="margin-bottom: 15px;">
                <div style="font-weight: 600; color: #555; margin-bottom: 5px;">Номер заявки:</div>
                <div style="background: white; padding: 8px 12px; border-radius: 8px; font-family: monospace; font-weight: bold;">
                    ${userApp.applicationId || 'APP-' + userApp.id.toString().slice(-6)}
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <div>
                    <div style="font-weight: 600; color: #555; margin-bottom: 3px;">Имя:</div>
                    <div>${userApp.name}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: #555; margin-bottom: 3px;">Пол:</div>
                    <div>${userApp.gender === 'male' ? 'Мужчина' : 'Женщина'}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: #555; margin-bottom: 3px;">Возраст:</div>
                    <div>${userApp.age} лет</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: #555; margin-bottom: 3px;">Город:</div>
                    <div>${userApp.city}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: #555; margin-bottom: 3px;">Дата подачи:</div>
                    <div>${new Date(userApp.submittedAt).toLocaleDateString()}</div>
                </div>
                <div>
                    <div style="font-weight: 600; color: #555; margin-bottom: 3px;">Статус:</div>
                    <div>${userApp.status === 'pending' ? '⏳ На проверке' : userApp.status === 'approved' ? '✅ Одобрено' : '❌ Отклонено'}</div>
                </div>
            </div>
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #C8E6C9;">
                <div style="font-weight: 600; color: #555; margin-bottom: 8px;">Что происходит сейчас:</div>
                <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px;">
                    <li>Ваша анкета отправлена администратору на проверку</li>
                    <li>Проверяются фото и соответствие данных</li>
                    <li>Обычно проверка занимает от 15 минут до 24 часов</li>
                    <li>Вы получите уведомление о результате</li>
                </ul>
            </div>
        `;
        
        const actionDiv = document.createElement('div');
        actionDiv.style.marginTop = '25px';
        actionDiv.style.display = 'flex';
        actionDiv.style.flexDirection = 'column';
        actionDiv.style.gap = '10px';
        
        const checkBtn = document.createElement('button');
        checkBtn.className = 'btn';
        checkBtn.style.background = '#4CAF50';
        checkBtn.style.color = 'white';
        checkBtn.textContent = 'Проверить статус сейчас';
        checkBtn.onclick = checkApplicationStatus;
        
        actionDiv.appendChild(checkBtn);
        
        verificationScreen.appendChild(infoDiv);
        verificationScreen.appendChild(actionDiv);
        
        console.log('Информация о модерации отображена');
    }, 1000);
}

// Проверка статуса заявки
function checkApplicationStatus() {
    console.log('Проверка статуса заявки');
    const userId = Number(localStorage.getItem('sia_current_user_id'));
    console.log('ID пользователя для проверки:', userId);
    
    if (!userId) {
        showNotification('⚠️ Не удалось найти информацию о вашей заявке', 'error');
        return;
    }
    
    const status = checkUserStatus(userId);
    console.log('Статус заявки:', status);
    
    if (status === 'approved') {
        showNotification('🎉 Ваша анкета одобрена! Перенаправляем...', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else if (status === 'rejected') {
        // Получаем причину отклонения
        const pendingUsers = JSON.parse(localStorage.getItem('sia_pending_users') || '[]');
        const user = pendingUsers.find(u => u.id === userId);
        const reason = user && user.rejectionReason ? `Причина: ${user.rejectionReason}` : '';
        
        const message = reason ? 
            `❌ Анкета отклонена. ${reason}` : 
            '❌ Анкета отклонена. Пожалуйста, проверьте данные и попробуйте снова.';
        
        showNotification(message, 'error');
        
        // Предлагаем вернуться к редактированию
        setTimeout(() => {
            if (confirm('Хотите вернуться к редактированию анкеты?')) {
                goToStep(1);
            }
        }, 2000);
    } else if (status === 'pending') {
        showNotification('⏳ Анкета все еще на проверке. Попробуйте позже.', 'info');
    } else if (status === 'not_found') {
        showNotification('⚠️ Ваша заявка не найдена. Попробуйте заполнить анкету заново.', 'error');
    } else {
        showNotification('⚠️ Не удалось проверить статус. Попробуйте обновить страницу.', 'error');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth.js инициализирован');
    
    // Устанавливаем приветствие
    const welcomeText = document.getElementById('welcome-text');
    if (welcomeText) {
        welcomeText.textContent = 'Привет, друг! Добро пожаловать в мир знакомств!';
    }
    
    // Добавляем обработчики для Enter на полях ввода
    const nameInput = document.getElementById('name-input');
    if (nameInput) {
        nameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') saveName();
        });
    }
    
    // Инициализируем выпадающие списки заранее
    initAgeSelect();
    initCitySelect();
});

console.log("✅ Auth.js загружен");
