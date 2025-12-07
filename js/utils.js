// ========== УТИЛИТЫ ДЛЯ SiaMatch ==========

// СИСТЕМА МОДЕРАЦИИ - ИСПРАВЛЕННАЯ ВЕРСИЯ ДЛЯ МОБИЛЬНЫХ
function submitForModeration(userData) {
    console.log('🚀 === ОТПРАВКА НА МОДЕРАЦИЮ ===');
    
    // Определяем устройство
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    console.log(`📱 Устройство: ${isMobile ? 'Мобильное' : 'Компьютер'}`);
    
    // 1. Гарантируем ID
    if (!userData.id) {
        userData.id = Date.now();
        console.log('📝 Создан ID:', userData.id);
    }
    
    // 2. Сохраняем текущего пользователя (БЕЗ ФОТО)
    const simpleUserData = {
        id: userData.id,
        name: userData.name,
        age: userData.age,
        city: userData.city,
        gender: userData.gender,
        bio: userData.bio || "Пользователь SiaMatch"
    };
    
    try {
        localStorage.setItem('sia_current_user', JSON.stringify(simpleUserData));
        localStorage.setItem('sia_current_user_id', userData.id.toString());
        console.log('✅ Пользователь сохранен (без фото)');
    } catch (e) {
        console.error('❌ Ошибка сохранения пользователя:', e);
    }
    
    // 3. Подготавливаем заявку ДЛЯ МОДЕРАЦИИ
    const newApplication = {
        id: userData.id,
        name: userData.name || 'Неизвестно',
        age: userData.age || 18,
        city: userData.city || 'Не указан',
        gender: userData.gender || 'unknown',
        bio: userData.bio || "Пользователь SiaMatch",
        status: 'pending',
        submittedAt: new Date().toISOString(),
        applicationId: 'APP-' + Date.now().toString().slice(-6)
    };
    
    // 4. ДЛЯ МОБИЛЬНЫХ: НЕ сохраняем base64 фото в заявке, только флаги
    if (isMobile) {
        newApplication.hasMainPhoto = !!userData.mainPhoto;
        newApplication.hasSelfie = !!userData.selfie;
        console.log('📱 Для мобильного: сохранены только флаги фото');
    } 
    // ДЛЯ КОМПЬЮТЕРА: сохраняем URL фото (не base64)
    else {
        if (userData.mainPhoto) {
            // Проверяем, не base64 ли это
            if (userData.mainPhoto.startsWith('data:image')) {
                console.log('💻 Для компьютера: base64 фото не сохраняется');
                newApplication.hasMainPhoto = true;
                newApplication.mainPhotoInfo = 'Фото загружено (base64)';
            } else if (userData.mainPhoto.startsWith('http')) {
                newApplication.mainPhoto = userData.mainPhoto;
            }
        }
        if (userData.selfie) {
            if (userData.selfie.startsWith('data:image')) {
                newApplication.hasSelfie = true;
                newApplication.selfieInfo = 'Селфи загружено (base64)';
            } else if (userData.selfie.startsWith('http')) {
                newApplication.selfie = userData.selfie;
            }
        }
    }
    
    console.log('📋 Заявка подготовлена:', newApplication);
    
    // 5. Получаем существующие заявки
    let pendingUsers = getPendingApplicationsSafe();
    console.log('📊 Существующих заявок:', pendingUsers.length);
    
    // 6. Проверяем дубликаты
    const existingIndex = pendingUsers.findIndex(u => u.id === userData.id);
    if (existingIndex !== -1) {
        console.log('⚠️ Заявка уже существует, обновляем');
        pendingUsers[existingIndex] = newApplication;
    } else {
        console.log('➕ Добавляем новую заявку');
        pendingUsers.push(newApplication);
    }
    
    // 7. Сохраняем заявки (ОБЯЗАТЕЛЬНО с обработкой ошибок)
    try {
        // ОГРАНИЧИВАЕМ размер данных
        const applicationsToSave = pendingUsers.slice(-100); // только последние 100 заявок
        
        // Удаляем большие base64 данные перед сохранением
        const cleanedApplications = applicationsToSave.map(app => {
            const cleaned = { ...app };
            
            // Удаляем большие base64 строки
            if (cleaned.mainPhoto && cleaned.mainPhoto.length > 1000) {
                cleaned.mainPhoto = '[ФОТО УДАЛЕНО ИЗ-ЗА РАЗМЕРА]';
            }
            if (cleaned.selfie && cleaned.selfie.length > 1000) {
                cleaned.selfie = '[СЕЛФИ УДАЛЕНО ИЗ-ЗА РАЗМЕРА]';
            }
            
            return cleaned;
        });
        
        localStorage.setItem('sia_pending_users', JSON.stringify(cleanedApplications));
        console.log('✅ Заявки сохранены (очищены от больших фото):', cleanedApplications.length);
        
        // Проверяем сохранение
        const verify = localStorage.getItem('sia_pending_users');
        if (verify) {
            console.log('✅ Проверка: данные сохранены, размер:', (verify.length / 1024).toFixed(1), 'KB');
        }
        
    } catch (e) {
        console.error('❌ Ошибка сохранения заявок:', e);
        
        // АВАРИЙНОЕ СОХРАНЕНИЕ - только основные данные
        try {
            const emergencyData = pendingUsers.slice(-20).map(app => ({
                id: app.id,
                name: app.name,
                age: app.age,
                city: app.city,
                gender: app.gender,
                status: app.status,
                submittedAt: app.submittedAt,
                applicationId: app.applicationId
            }));
            
            localStorage.setItem('sia_pending_users_emergency', JSON.stringify(emergencyData));
            console.log('⚠️ Аварийное сохранение:', emergencyData.length, 'заявок');
        } catch (e2) {
            console.error('❌ Критическая ошибка сохранения!');
        }
    }
    
    // 8. Создаем уведомление для админа
    createAdminNotification(newApplication);
    
    console.log('🎉 === ОТПРАВКА ЗАВЕРШЕНА ===');
    return userData.id;
}

// БЕЗОПАСНОЕ ПОЛУЧЕНИЕ ЗАЯВОК
function getPendingApplicationsSafe() {
    console.log('🔄 Безопасная загрузка заявок...');
    
    try {
        const stored = localStorage.getItem('sia_pending_users');
        if (!stored || stored === 'undefined' || stored === 'null') {
            console.log('📭 Нет данных о заявках');
            return [];
        }
        
        // Проверяем размер данных
        if (stored.length > 5000000) { // > 5MB
            console.warn('⚠️ Данные слишком большие, пытаемся восстановить...');
            return repairLargeData(stored);
        }
        
        const data = JSON.parse(stored);
        console.log(`✅ Загружено заявок: ${data.length}`);
        return data;
        
    } catch (error) {
        console.error('❌ Ошибка загрузки заявок:', error);
        
        // Пробуем загрузить аварийные данные
        try {
            const emergency = localStorage.getItem('sia_pending_users_emergency');
            if (emergency) {
                console.log('⚠️ Загружаем аварийные данные');
                return JSON.parse(emergency);
            }
        } catch (e2) {
            console.log('❌ Не удалось загрузить аварийные данные');
        }
        
        return [];
    }
}

// ВОССТАНОВЛЕНИЕ ПОВРЕЖДЕННЫХ ДАННЫХ
function repairLargeData(storedData) {
    try {
        // Пробуем найти и извлечь JSON
        const firstBracket = storedData.indexOf('[');
        const lastBracket = storedData.lastIndexOf(']');
        
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            const jsonData = storedData.substring(firstBracket, lastBracket + 1);
            const data = JSON.parse(jsonData);
            
            // Очищаем данные от больших base64
            const cleanedData = data.map(app => {
                const cleaned = { ...app };
                
                // Удаляем большие base64
                if (cleaned.mainPhoto && cleaned.mainPhoto.length > 1000) {
                    cleaned.mainPhoto = '';
                    cleaned.hasMainPhoto = true;
                }
                if (cleaned.selfie && cleaned.selfie.length > 1000) {
                    cleaned.selfie = '';
                    cleaned.hasSelfie = true;
                }
                
                return cleaned;
            });
            
            // Сохраняем очищенные данные
            localStorage.setItem('sia_pending_users', JSON.stringify(cleanedData));
            
            console.log(`✅ Данные восстановлены и очищены: ${cleanedData.length} заявок`);
            return cleanedData;
        }
    } catch (e) {
        console.error('❌ Не удалось восстановить данные:', e);
    }
    
    // Если не удалось восстановить, создаем новый массив
    localStorage.setItem('sia_pending_users', '[]');
    return [];
}

// СОЗДАНИЕ УВЕДОМЛЕНИЯ ДЛЯ АДМИНА
function createAdminNotification(userData) {
    try {
        let notifications = [];
        const stored = localStorage.getItem('sia_admin_notifications');
        if (stored && stored !== 'undefined') {
            notifications = JSON.parse(stored);
        }
        
        const notification = {
            id: Date.now(),
            userId: userData.id,
            applicationId: userData.applicationId || 'APP-' + Date.now().toString().slice(-8),
            name: userData.name,
            gender: userData.gender === 'male' ? 'Мужчина' : 'Женщина',
            age: userData.age,
            city: userData.city,
            time: new Date().toLocaleString('ru-RU'),
            type: 'new_application',
            read: false,
            hasPhoto: userData.hasMainPhoto || userData.mainPhoto,
            hasSelfie: userData.hasSelfie || userData.selfie
        };
        
        notifications.push(notification);
        
        // Сохраняем только последние 20 уведомлений
        localStorage.setItem('sia_admin_notifications', JSON.stringify(notifications.slice(-20)));
        console.log('📢 Уведомление для админа создано');
    } catch (e) {
        console.log('⚠️ Не удалось создать уведомление для админа');
    }
}

// ФУНКЦИЯ ДЛЯ АДМИН-ПАНЕЛИ: ПОЛУЧИТЬ ВСЕ ЗАЯВКИ
function getAllApplicationsForAdmin() {
    console.log('👨‍💼 Загрузка данных для админ-панели...');
    
    const applications = getPendingApplicationsSafe();
    
    // Добавляем информацию о фото
    const enrichedApplications = applications.map(app => {
        const enriched = { ...app };
        
        // Проверяем наличие фото
        if (!enriched.hasMainPhoto && enriched.mainPhoto) {
            enriched.hasMainPhoto = !!enriched.mainPhoto;
        }
        if (!enriched.hasSelfie && enriched.selfie) {
            enriched.hasSelfie = !!enriched.selfie;
        }
        
        // Очищаем большие данные для отображения
        if (enriched.mainPhoto && enriched.mainPhoto.length > 500) {
            enriched.mainPhoto = '[ФОТО - ДАННЫЕ СЛИШКОМ БОЛЬШИЕ]';
        }
        if (enriched.selfie && enriched.selfie.length > 500) {
            enriched.selfie = '[СЕЛФИ - ДАННЫЕ СЛИШКОМ БОЛЬШИЕ]';
        }
        
        return enriched;
    });
    
    console.log(`✅ Для админа: ${enrichedApplications.length} заявок`);
    return enrichedApplications;
}

// ФУНКЦИЯ ДЛЯ СОХРАНЕНИЯ ФОТО ОТДЕЛЬНО
function savePhotoSeparately(userId, photoType, base64Data) {
    // Для мобильных - НЕ сохраняем большие base64
    if (base64Data.length > 10000) { // > 10KB
        console.log(`⚠️ ${photoType}: фото слишком большое, не сохраняем base64`);
        return 'too_large';
    }
    
    const photoKey = `sia_photo_${userId}_${photoType}`;
    try {
        localStorage.setItem(photoKey, base64Data);
        console.log(`✅ ${photoType} сохранено отдельно: ${(base64Data.length / 1024).toFixed(1)} KB`);
        return 'saved';
    } catch (e) {
        console.log(`❌ Не удалось сохранить ${photoType}`);
        return 'error';
    }
}

// ФУНКЦИЯ ДЛЯ ЗАГРУЗКИ ФОТО ИЗ ОТДЕЛЬНОГО ХРАНИЛИЩА
function loadPhoto(userId, photoType) {
    const photoKey = `sia_photo_${userId}_${photoType}`;
    try {
        const photo = localStorage.getItem(photoKey);
        if (photo && photo.length < 10000) { // Проверяем размер
            return photo;
        }
    } catch (e) {
        console.log(`❌ Не удалось загрузить ${photoType}`);
    }
    return null;
}

// ОЧИСТКА СТАРЫХ ФОТО
function cleanupOldPhotos() {
    console.log('🧹 Очистка старых фото...');
    
    let cleaned = 0;
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    // Очищаем по ключам
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('sia_photo_')) {
            try {
                // Пробуем получить ID из ключа
                const parts = key.split('_');
                if (parts.length >= 3) {
                    const userId = parseInt(parts[2]);
                    if (userId && userId < oneDayAgo) {
                        localStorage.removeItem(key);
                        cleaned++;
                    }
                }
            } catch (e) {
                // Игнорируем ошибки
            }
        }
    }
    
    console.log(`✅ Очищено фото: ${cleaned}`);
    return cleaned;
}

// СОЗДАНИЕ ТЕСТОВОЙ ЗАЯВКИ С МОБИЛЬНОГО
function createMobileTest() {
    const testUser = {
        id: Date.now(),
        name: "Мобильный Тест " + Math.floor(Math.random() * 1000),
        age: 20 + Math.floor(Math.random() * 20),
        city: ["Москва", "СПб", "Казань"][Math.floor(Math.random() * 3)],
        gender: Math.random() > 0.5 ? "male" : "female",
        bio: "Тест с мобильного " + new Date().toLocaleTimeString()
    };
    
    console.log('📱 Создаем тестовую заявку с мобильного...');
    const result = submitForModeration(testUser);
    
    if (result) {
        console.log('✅ Тестовая заявка создана!');
        alert('✅ Тестовая заявка создана! Проверьте админ-панель.');
        return result;
    } else {
        console.error('❌ Ошибка создания тестовой заявки');
        alert('❌ Ошибка создания тестовой заявки');
        return null;
    }
}

// ОСТАЛЬНЫЕ ФУНКЦИИ (без изменений)
function getCurrentUser() {
    try {
        const stored = localStorage.getItem('sia_current_user');
        if (!stored || stored === 'undefined' || stored === 'null') {
            return null;
        }
        return JSON.parse(stored);
    } catch (e) {
        console.error('Ошибка получения пользователя:', e);
        return null;
    }
}

function checkUserStatus(userId) {
    if (!userId) return 'not_found';
    
    try {
        const applications = getPendingApplicationsSafe();
        const user = applications.find(u => u.id == userId);
        
        if (user) {
            return user.status || 'pending';
        }
        
        return 'not_found';
    } catch (e) {
        console.error('Ошибка проверки статуса:', e);
        return 'not_found';
    }
}

// ЭКСПОРТ ДЛЯ ОТЛАДКИ
window.submitForModeration = submitForModeration;
window.getAllApplicationsForAdmin = getAllApplicationsForAdmin;
window.getPendingApplicationsSafe = getPendingApplicationsSafe;
window.createMobileTest = createMobileTest;
window.cleanupOldPhotos = cleanupOldPhotos;
window.loadPhoto = loadPhoto;

console.log("✅ Utils.js загружен (исправленная версия для мобильных)");
console.log("📱 Доступные команды:");
console.log("  - createMobileTest() - создать тестовую заявку");
console.log("  - getAllApplicationsForAdmin() - получить заявки для админа");
console.log("  - cleanupOldPhotos() - очистить старые фото");
