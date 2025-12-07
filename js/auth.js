// ========== ЛОГИКА РЕГИСТРАЦИИ SiaMatch ==========

// Объект для хранения данных пользователя
let userProfile = {
    name: '',
    age: '',
    city: '',
    mainPhoto: '',
    selfie: '',
    bio: '',
    gender: ''
};

// Начало регистрации
function startOnboarding() {
    goToStep(1);
}

// Переход между шагами
function goToStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.add('hidden');
    });
    
    const stepElement = document.getElementById(`step-${stepNumber}`);
    if (stepElement) {
        stepElement.classList.remove('hidden');
        updateProgressIndicator(stepNumber);
    }
    
    switch(stepNumber) {
        case 3:
            initAgeSelect();
            break;
        case 4:
            initCitySelect();
            break;
        case 7:
            setTimeout(showModerationInfo, 500);
            break;
    }
    
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
    const nameInput = document.getElementById('name-input');
    if (!nameInput) return;
    
    const name = nameInput.value.trim();
    
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

// ========== ШАГ 2: ВЫБОР ПОЛА ==========

function selectGender(gender) {
    document.querySelectorAll('.gender-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    if (gender === 'male') {
        document.querySelector('.gender-option:nth-child(1)').classList.add('selected');
    } else {
        document.querySelector('.gender-option:nth-child(2)').classList.add('selected');
    }
    
    userProfile.gender = gender;
}

function saveGender() {
    if (!userProfile.gender) {
        showNotification('Пожалуйста, выберите ваш пол', 'error');
        return;
    }
    
    goToStep(3);
}

// ========== ШАГ 3: ВОЗРАСТ ==========

function initAgeSelect() {
    const ageSelect = document.getElementById('age-select');
    if (!ageSelect) return;
    
    while (ageSelect.options.length > 1) {
        ageSelect.remove(1);
    }
    
    for (let age = 18; age <= 60; age++) {
        const option = document.createElement('option');
        option.value = age;
        option.textContent = `${age} лет`;
        ageSelect.appendChild(option);
    }
}

function saveAge() {
    const ageSelect = document.getElementById('age-select');
    if (!ageSelect) return;
    
    const age = ageSelect.value;
    
    if (!age) {
        showNotification('Пожалуйста, выберите ваш возраст', 'error');
        return;
    }
    
    userProfile.age = parseInt(age);
    goToStep(4);
}

// ========== ШАГ 4: ГОРОД ==========

function initCitySelect() {
    const citySelect = document.getElementById('city-select');
    if (!citySelect) return;
    
    while (citySelect.options.length > 1) {
        citySelect.remove(1);
    }
    
    if (typeof russianCities !== 'undefined' && russianCities.length > 0) {
        russianCities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }
}

function saveCity() {
    const citySelect = document.getElementById('city-select');
    if (!citySelect) return;
    
    const city = citySelect.value;
    
    if (!city) {
        showNotification('Пожалуйста, выберите ваш город', 'error');
        return;
    }
    
    userProfile.city = city;
    goToStep(5);
}

// ========== ШАГ 5: ОСНОВНОЕ ФОТО ==========

function previewMainPhoto(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Файл слишком большой (максимум 5MB)', 'error');
        event.target.value = '';
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        showNotification('Пожалуйста, выберите изображение', 'error');
        event.target.value = '';
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
    };
    reader.readAsDataURL(file);
}

function saveMainPhoto() {
    if (!userProfile.mainPhoto) {
        showNotification('Пожалуйста, загрузите ваше фото', 'error');
        return;
    }
    
    goToStep(6);
}

// ========== ШАГ 6: СЕЛФИ ДЛЯ ПОДТВЕРЖДЕНИЯ ==========

function previewSelfie(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Файл слишком большой (максимум 5MB)', 'error');
        event.target.value = '';
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        showNotification('Пожалуйста, выберите изображение', 'error');
        event.target.value = '';
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
        
        // На мобильных устройствах проверяем, что фото загрузилось
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            setTimeout(() => {
                if (userProfile.selfie) {
                    showNotification('✅ Фото загружено!', 'success');
                }
            }, 100);
        }
    };
    reader.readAsDataURL(file);
}

function saveSelfie() {
    console.log('=== Проверка данных перед отправкой ===');
    
    // Проверка для мобильных устройств
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // Даем дополнительное время для обработки файла
        setTimeout(() => {
            processSubmission();
        }, 300);
    } else {
        processSubmission();
    }
}

function processSubmission() {
    if (!userProfile.selfie) {
        showNotification('Пожалуйста, загрузите селфи для подтверждения', 'error');
        return;
    }
    
    if (!userProfile.name || !userProfile.age || !userProfile.city || !userProfile.gender || !userProfile.mainPhoto) {
        showNotification('Пожалуйста, заполните все обязательные поля', 'error');
        return;
    }
    
    // Добавляем ID и другие данные
    userProfile.id = Date.now();
    userProfile.registrationDate = new Date().toISOString();
    userProfile.bio = "Пользователь SiaMatch";
    
    // Простая проверка для мобильных устройств
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // Упрощаем данные для мобильных (убираем большие base64 строки временно)
        const userDataForMobile = {
            id: userProfile.id,
            name: userProfile.name,
            age: userProfile.age,
            city: userProfile.city,
            gender: userProfile.gender,
            bio: userProfile.bio,
            registrationDate: userProfile.registrationDate,
            hasPhotos: !!userProfile.mainPhoto && !!userProfile.selfie
        };
        
        // Сохраняем упрощенные данные
        localStorage.setItem('sia_current_user', JSON.stringify(userDataForMobile));
        localStorage.setItem('sia_current_user_id', userProfile.id.toString());
        
        // Для фото сохраняем отдельно, чтобы избежать проблем с localStorage
        try {
            localStorage.setItem(`sia_photo_main_${userProfile.id}`, userProfile.mainPhoto);
            localStorage.setItem(`sia_photo_selfie_${userProfile.id}`, userProfile.selfie);
        } catch (e) {
            console.log('Фото сохранены в упрощенном виде для мобильных');
        }
    } else {
        // Для десктопа сохраняем все данные
        saveUser(userProfile);
        localStorage.setItem('sia_current_user_id', userProfile.id.toString());
    }
    
    // Отправляем на модерацию
    const returnedUserId = submitForModeration(userProfile);
    
    showNotification('✅ Анкета успешно отправлена на модерацию!', 'success');
    
    // Переходим к шагу модерации
    goToStep(7);
}

// ========== ШАГ 7: МОДЕРАЦИЯ ==========

function showModerationInfo() {
    setTimeout(() => {
        const userId = Number(localStorage.getItem('sia_current_user_id'));
        const pendingUsers = JSON.parse(localStorage.getItem('sia_pending_users') || '[]');
        const userApp = pendingUsers.find(u => u.id === userId);
        
        if (!userApp) {
            console.log('Заявка еще не отображается в списке, это нормально');
            return;
        }
    }, 1000);
}

function checkApplicationStatus() {
    const userId = Number(localStorage.getItem('sia_current_user_id'));
    
    if (!userId) {
        showNotification('⚠️ Не удалось найти информацию о вашей заявке', 'error');
        return;
    }
    
    const status = checkUserStatus(userId);
    
    if (status === 'approved') {
        showNotification('🎉 Ваша анкета одобрена! Перенаправляем...', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else if (status === 'rejected') {
        showNotification('❌ Анкета отклонена. Проверьте данные и попробуйте снова.', 'error');
    } else if (status === 'pending') {
        showNotification('⏳ Анкета все еще на проверке. Попробуйте позже.', 'info');
    } else {
        showNotification('⚠️ Не удалось проверить статус', 'error');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const nameInput = document.getElementById('name-input');
    if (nameInput) {
        nameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') saveName();
        });
    }
    
    initAgeSelect();
    initCitySelect();
});
