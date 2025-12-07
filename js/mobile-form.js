// ========== ОБРАБОТКА ФОРМЫ ДЛЯ МОБИЛЬНЫХ ==========

document.addEventListener('DOMContentLoaded', function() {
    // Находим форму отправки
    const submitBtn = document.querySelector('button[type="submit"], .submit-btn, #submit-btn');
    
    if (submitBtn) {
        // Заменяем обработчик клика
        submitBtn.addEventListener('click', function(e) {
            if (this.disabled) return;
            
            // Предотвращаем стандартное поведение
            if (e.preventDefault) e.preventDefault();
            
            // Блокируем кнопку
            this.disabled = true;
            const originalText = this.textContent;
            this.textContent = '⏳ Отправка...';
            
            console.log('📱 Начата отправка с мобильного...');
            
            // Собираем данные формы
            const formData = collectFormData();
            
            // Проверяем данные
            if (!formData.name || !formData.age) {
                alert('⚠️ Заполните обязательные поля');
                this.disabled = false;
                this.textContent = originalText;
                return;
            }
            
            // Обрабатываем фото (асинхронно)
            processPhotos(formData)
                .then(processedData => {
                    // Отправляем на модерацию
                    const userId = submitForModeration(processedData);
                    
                    if (userId) {
                        console.log('✅ Заявка отправлена, ID:', userId);
                        
                        // Показываем уведомление
                        showSuccessMessage();
                        
                        // Перенаправляем через 2 секунды
                        setTimeout(() => {
                            window.location.href = 'waiting.html';
                        }, 2000);
                        
                    } else {
                        throw new Error('Ошибка отправки');
                    }
                })
                .catch(error => {
                    console.error('❌ Ошибка:', error);
                    
                    // Восстанавливаем кнопку
                    this.disabled = false;
                    this.textContent = originalText;
                    
                    // Показываем ошибку
                    alert('❌ Ошибка отправки. Попробуйте еще раз.');
                });
            
            return false;
        });
    }
});

// СБОР ДАННЫХ ИЗ ФОРМЫ
function collectFormData() {
    const formData = {
        id: Date.now(),
        name: getValue('#name, [name="name"], input[name="name"]'),
        age: parseInt(getValue('#age, [name="age"], input[name="age"]')) || 18,
        city: getValue('#city, [name="city"], select[name="city"]'),
        gender: getValue('#gender, [name="gender"], select[name="gender"]'),
        bio: getValue('#bio, [name="bio"], textarea[name="bio"]')
    };
    
    console.log('📝 Данные формы:', formData);
    return formData;
}

// ОБРАБОТКА ФОТО (СЖАТИЕ ДЛЯ МОБИЛЬНЫХ)
async function processPhotos(formData) {
    const processedData = { ...formData };
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    // Основное фото
    const mainPhotoInput = document.querySelector('#mainPhoto, input[type="file"][accept*="image"]:first-of-type');
    if (mainPhotoInput && mainPhotoInput.files[0]) {
        try {
            if (isMobile) {
                // На мобильном - сжимаем
                const compressed = await compressMobilePhoto(mainPhotoInput.files[0]);
                processedData.mainPhoto = compressed;
            } else {
                // На компьютере - создаем URL
                processedData.mainPhoto = URL.createObjectURL(mainPhotoInput.files[0]);
            }
        } catch (error) {
            console.log('⚠️ Не удалось обработать основное фото');
        }
    }
    
    // Селфи
    const selfieInput = document.querySelector('#selfie, input[type="file"][accept*="image"]:last-of-type');
    if (selfieInput && selfieInput.files[0]) {
        try {
            if (isMobile) {
                const compressed = await compressMobilePhoto(selfieInput.files[0]);
                processedData.selfie = compressed;
            } else {
                processedData.selfie = URL.createObjectURL(selfieInput.files[0]);
            }
        } catch (error) {
            console.log('⚠️ Не удалось обработать селфи');
        }
    }
    
    return processedData;
}

// СЖАТИЕ ФОТО НА МОБИЛЬНОМ
function compressMobilePhoto(file) {
    return new Promise((resolve, reject) => {
        console.log('📱 Сжатие фото для мобильного:', file.name);
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Создаем canvas
                const canvas = document.createElement('canvas');
                const maxSize = 400; // Маленький размер для мобильных
                
                let width = img.width;
                let height = img.height;
                
                // Изменяем размер
                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    } else {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Рисуем
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Конвертируем в base64 с низким качеством
                const compressed = canvas.toDataURL('image/jpeg', 0.5);
                
                console.log('✅ Фото сжато для мобильного:', 
                    Math.round(compressed.length / 1024), 'KB');
                
                resolve(compressed);
            };
            
            img.onerror = () => {
                console.log('⚠️ Ошибка загрузки изображения, пропускаем фото');
                resolve(null);
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = () => {
            console.log('⚠️ Ошибка чтения файла, пропускаем фото');
            resolve(null);
        };
        
        reader.readAsDataURL(file);
    });
}

// ПОЛУЧЕНИЕ ЗНАЧЕНИЯ ПО СЕЛЕКТОРУ
function getValue(selector) {
    const element = document.querySelector(selector);
    return element ? element.value : '';
}

// СООБЩЕНИЕ ОБ УСПЕХЕ
function showSuccessMessage() {
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #4CAF50;
        color: white;
        padding: 30px;
        border-radius: 10px;
        text-align: center;
        z-index: 10000;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        animation: fadeIn 0.3s;
    `;
    
    notification.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
        <div style="font-size: 18px; font-weight: bold;">Заявка отправлена!</div>
        <div style="margin-top: 10px;">Ваша анкета отправлена на модерацию</div>
    `;
    
    document.body.appendChild(notification);
    
    // Убираем через 2 секунды
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 1500);
}
