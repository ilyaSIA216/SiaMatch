// ========== ЛОГИКА РЕГИСТРАЦИИ SiaMatch ==========

// Объект для хранения данных пользователя
let userProfile = {
    name: '',
    age: '',
    city: '',
    mainPhoto: '',
    selfie: '',
    bio: '',
    interests: []
};

// Начало регистрации
function startOnboarding() {
    // Приветствие без использования данных Telegram
    document.getElementById('welcome-text').textContent = 
        'Привет, друг! Добро пожаловать в мир знакомств!';
    
    // Переходим к шагу 1
    goToStep(1);
}

// Переход между шагами
function goToStep(stepNumber) {
    // Скрываем все шаги
    document.querySelectorAll('.step').forEach(step => {
        step.classList.add('hidden');
    });
    
    // Показываем нужный шаг
    const stepElement = document.getElementById(`step-${stepNumber}`);
    stepElement.classList.remove('hidden');
    
    // Инициализируем шаг, если нужно
    switch(stepNumber) {
        case 2:
            initAgeSelect();
            break;
        case 3:
            initCitySelect();
            break;
        case 6:
            // На шаге 6 сразу запускаем процесс модерации
            setTimeout(showModerationInfo, 500);
            break;
    }
    
    // Прокрутка вверх
    window.scrollTo(0, 0);
}

// ========== ШАГ 1: ИМЯ ==========

function saveName() {
    const nameInput = document.getElementById('name-input');
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
    goToStep(2);
}

// ========== ШАГ 2: ВОЗРАСТ ==========

function initAgeSelect() {
    const ageSelect = document.getElementById('age-select');
    
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
    const ageSelect = document.getElementById('age-select');
    const age = ageSelect.value;
    
    if (!age) {
        showNotification('Пожалуйста, выберите ваш возраст', 'error');
        return;
    }
    
    userProfile.age = parseInt(age);
    goToStep(3);
}

// ========== ШАГ 3: ГОРОД ==========

function initCitySelect() {
    const citySelect = document.getElementById('city-select');
    
    // Очищаем, кроме первого option
    while (citySelect.options.length > 1) {
        citySelect.remove(1);
    }
    
    // Добавляем города России из utils.js
    russianCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
}

function saveCity() {
    const citySelect = document.getElementById('city-select');
    const city = citySelect.value;
    
    if (!city) {
        showNotification('Пожалуйста, выберите ваш город', 'error');
        return;
    }
    
    userProfile.city = city;
    goToStep(4);
}

// ========== ШАГ 4: ОСНОВНОЕ ФОТО ==========

function previewMainPhoto(event) {
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
        preview.src = e.target.result;
        preview.classList.add('show');
        userProfile.mainPhoto = e.target.result;
    };
    reader.readAsDataURL(file);
}

function saveMainPhoto() {
    if (!userProfile.mainPhoto) {
        showNotification('Пожалуйста, загрузите ваше фото', 'error');
        return;
    }
    
    goToStep(5);
}

// ========== ШАГ 5: СЕЛФИ ДЛЯ ПОДТВЕРЖДЕНИЯ ==========

function previewSelfie(event) {
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
        preview.src = e.target.result;
        preview.classList.add('show');
        userProfile.selfie = e.target.result;
    };
    reader.readAsDataURL(file);
}

function saveSelfie() {
    if (!userProfile.selfie) {
        showNotification('Пожалуйста, загрузите селфи для подтверждения', 'error');
        return;
    }
    
    // Сохраняем пользователя
    const userId = Date.now();
    userProfile.id = userId;
    userProfile.registrationDate = new Date().toISOString();
    userProfile.bio = "Пользователь SiaMatch"; // Можно добавить поле для биографии позже
    
    // Сохраняем в localStorage
    saveUser(userProfile);
    
    // Отправляем на модерацию
    const applicationId = submitForModeration(userProfile);
    
    // Сохраняем ID заявки для проверки статуса
    localStorage.setItem('sia_current_application_id', applicationId);
    
    // Переходим к шагу 6
    goToStep(6);
}

// ========== ШАГ 6: МОДЕРАЦИЯ ==========

function showModerationInfo() {
    setTimeout(() => {
        const verificationScreen = document.querySelector('.verification-screen');
        if (!verificationScreen) return;
        
        const applicationId = localStorage.getItem('sia_current_application_id');
        const pendingUsers = JSON.parse(localStorage.getItem('sia_pending_users') || '[]');
        const userApp = pendingUsers.find(u => u.id === Number(applicationId));
        
        if (!userApp) return;
        
        const infoDiv = document.createElement('div');
        infoDiv.style.marginTop = '30px';
        infoDiv.style.padding = '20px';
        infoDiv.style.background = '#f0f7f0';
        infoDiv.style.borderRadius = '15px';
        infoDiv.style.fontSize = '15px';
        infoDiv.style.color = '#2E7D32';
        infoDiv.style.textAlign = 'left';
        infoDiv.style.boxShadow = '0 5px 15px rgba(76, 175, 80, 0.1)';
        
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
        
        const demoBtn = document.createElement('button');
        demoBtn.className = 'btn';
        demoBtn.style.background = '#2196F3';
        demoBtn.style.color = 'white';
        demoBtn.textContent = 'Тестовый режим (для демо)';
        demoBtn.onclick = simulateApproval;
        
        actionDiv.appendChild(checkBtn);
        // Раскомментируйте для демо-тестирования:
        // actionDiv.appendChild(demoBtn);
        
        verificationScreen.appendChild(infoDiv);
        verificationScreen.appendChild(actionDiv);
    }, 1000);
}

// Проверка статуса заявки
function checkApplicationStatus() {
    const applicationId = localStorage.getItem('sia_current_application_id');
    const status = checkUserStatus(Number(applicationId));
    
    if (status === 'approved') {
        showNotification('🎉 Ваша анкета одобрена! Перенаправляем...', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else if (status === 'rejected') {
        // Получаем причину отклонения
        const pendingUsers = JSON.parse(localStorage.getItem('sia_pending_users') || '[]');
        const user = pendingUsers.find(u => u.id === Number(applicationId));
        const reason = user && user.rejectionReason ? `Причина: ${user.rejectionReason}` : '';
        
        const message = reason ? 
            `❌ Анкета отклонена. ${reason}` : 
            '❌ Анкета отклонена. Пожалуйста, проверьте данные и попробуйте снова.';
        
        showNotification(message, 'error');
        
        // Предлагаем вернуться к редактированию
        setTimeout(() => {
            if (confirm('Хотите вернуться к редактированию анкеты?')) {
                goToStep(0);
            }
        }, 2000);
    } else if (status === 'pending') {
        showNotification('⏳ Анкета все еще на проверке. Попробуйте позже.', 'info');
    } else {
        showNotification('⚠️ Не удалось проверить статус. Попробуйте обновить страницу.', 'error');
    }
}

// Функция для демо-тестирования (одобрение без админа)
function simulateApproval() {
    if (confirm('Включить тестовый режим? Ваша анкета будет автоматически одобрена.')) {
        const applicationId = localStorage.getItem('sia_current_application_id');
        const pendingUsers = JSON.parse(localStorage.getItem('sia_pending_users') || '[]');
        const userIndex = pendingUsers.findIndex(u => u.id === Number(applicationId));
        
        if (userIndex !== -1) {
            pendingUsers[userIndex].status = 'approved';
            pendingUsers[userIndex].moderatedAt = new Date().toISOString();
            pendingUsers[userIndex].moderator = 'Тестовый режим';
            
            localStorage.setItem('sia_pending_users', JSON.stringify(pendingUsers));
            
            // Добавляем в активные пользователи
            const user = pendingUsers[userIndex];
            const activeUsers = JSON.parse(localStorage.getItem('sia_active_users') || '[]');
            activeUsers.push({
                id: user.id,
                name: user.name,
                age: user.age,
                city: user.city,
                photo: user.mainPhoto,
                bio: user.bio || 'Пользователь SiaMatch'
            });
            localStorage.setItem('sia_active_users', JSON.stringify(activeUsers));
            
            showNotification('✅ Тестовое одобрение выполнено! Перенаправляем...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Устанавливаем приветствие
    document.getElementById('welcome-text').textContent = 'Привет, друг! Добро пожаловать в мир знакомств!';
    
    // Добавляем обработчики для Enter на полях ввода
    document.getElementById('name-input')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') saveName();
    });
    
    // Инициализируем выпадающие списки
    initAgeSelect();
    initCitySelect();
});

console.log("✅ Auth.js загружен");
