// ========== ПРОВЕРКА УСТРОЙСТВА ==========

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function checkDeviceAndRedirect() {
    const isMobile = isMobileDevice();
    console.log('📱 Проверка устройства:', isMobile ? 'Мобильное' : 'Десктоп');
    
    if (!isMobile) {
        // Показываем сообщение для десктопа
        const body = document.body;
        body.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                padding: 20px;
                text-align: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            ">
                <div style="font-size: 48px; margin-bottom: 20px;">📱</div>
                <h1 style="font-size: 24px; margin-bottom: 15px;">
                    SiaMatch - Приложение для мобильных устройств
                </h1>
                <p style="font-size: 16px; margin-bottom: 30px; max-width: 400px; opacity: 0.9;">
                    Это приложение оптимизировано для использования на смартфонах и планшетах.
                    Пожалуйста, откройте эту страницу на вашем мобильном устройстве.
                </p>
                <div style="
                    background: rgba(255,255,255,0.2);
                    padding: 15px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    max-width: 400px;
                ">
                    <p style="margin-bottom: 10px;">📲 <strong>Как открыть на телефоне:</strong></p>
                    <ol style="text-align: left; margin-left: 20px;">
                        <li>Отправьте эту ссылку себе в мессенджер</li>
                        <li>Или отсканируйте QR-код камерой телефона</li>
                        <li>Откройте ссылку в браузере телефона</li>
                    </ol>
                </div>
                <div id="qrcode" style="
                    background: white;
                    padding: 15px;
                    border-radius: 10px;
                    margin: 20px 0;
                "></div>
                <div style="
                    background: white;
                    color: #667eea;
                    padding: 12px 25px;
                    border-radius: 25px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 20px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                " onclick="copyCurrentURL()">
                    Скопировать ссылку
                </div>
                <div id="copy-message" style="margin-top: 10px; font-size: 14px; display: none;">
                    ✅ Ссылка скопирована!
                </div>
            </div>
        `;
        
        // Генерируем QR-код
        generateQRCode();
        return false;
    }
    
    return true;
}

function generateQRCode() {
    // Используем QRCode.js если доступна
    if (typeof QRCode !== 'undefined') {
        new QRCode(document.getElementById("qrcode"), {
            text: window.location.href,
            width: 150,
            height: 150
        });
    } else {
        document.getElementById("qrcode").innerHTML = `
            <div style="text-align: center; color: #333;">
                <div>QR-код не доступен</div>
                <div style="font-size: 12px; margin-top: 5px;">Откройте вручную: ${window.location.href}</div>
            </div>
        `;
    }
}

function copyCurrentURL() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        const message = document.getElementById('copy-message');
        message.style.display = 'block';
        setTimeout(() => {
            message.style.display = 'none';
        }, 3000);
    });
}

// Проверяем при загрузке
document.addEventListener('DOMContentLoaded', function() {
    const shouldContinue = checkDeviceAndRedirect();
    
    // Если мобильное устройство - продолжаем загрузку приложения
    if (shouldContinue) {
        console.log('✅ Мобильное устройство, запускаем приложение...');
        // Инициализация мобильных функций
        if (typeof initMobileFeatures === 'function') {
            initMobileFeatures();
        }
    }
});

// Экспортируем функции
window.isMobileDevice = isMobileDevice;
window.checkDeviceAndRedirect = checkDeviceAndRedirect;
