document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 SiaMatch запускается...');
  
  // ===== СОСТОЯНИЕ ПРИЛОЖЕНИЯ =====
  let tg = null;
  let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  let profileData = null;
  let currentIndex = 0;
  let likedIds = [];
  let hasInitialized = false;
  
  // Демо-данные
  const candidates = [
    {id:1,name:"Алина",age:24,gender:"female",city:"Москва",bio:"Люблю кофе ☕ Москва ❤️",photo:"https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=800"},
    {id:2,name:"Дмитрий",age:28,gender:"male",city:"Санкт-Петербург",bio:"Инженер СПб",photo:"https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800"},
    {id:3,name:"Екатерина",age:26,gender:"female",city:"Москва",bio:"Фотограф ❤️",photo:"https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800"},
  ];
  
  // ===== DOM ЭЛЕМЕНТЫ =====
  const welcomeScreen = document.getElementById("welcome-screen");
  const startBtn = document.getElementById("startBtn");
  const usernameElem = document.getElementById("username");
  const onboardingScreen = document.getElementById("onboarding-screen");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const tabBar = document.getElementById("tab-bar");
  
  // FIX: Удаляем старый заголовочный блок
  const oldHeader = document.querySelector('.header-block');
  if (oldHeader) {
    oldHeader.remove();
  }
  
  // ===== ИНИЦИАЛИЗАЦИЯ TELEGRAM =====
  function initTelegram() {
    try {
      if (window.Telegram && Telegram.WebApp) {
        tg = Telegram.WebApp;
        console.log('✅ Telegram WebApp обнаружен');
        
        tg.ready();
        tg.expand(); // Полноэкранный режим
        
        // Скрываем Telegram кнопку MainButton
        if (tg.MainButton) {
          tg.MainButton.hide();
        }
        
        // Настройки для iOS
        if (isIOS) {
          console.log('📱 iOS обнаружен');
          document.body.classList.add('no-bounce');
          
          // Исправляем высоту viewport
          fixIOSViewport();
          
          // Обработчики для клавиатуры
          setupKeyboardHandlers();
        }
        
        // Обновляем viewport
        setTimeout(() => {
          if (tg && typeof tg.requestViewport === 'function') {
            tg.requestViewport();
          }
        }, 500);
        
        return true;
      }
    } catch (e) {
      console.error("❌ Ошибка Telegram WebApp:", e);
    }
    return false;
  }
  
  // ===== FIX ДЛЯ iOS VIEWPORT =====
  function fixIOSViewport() {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      document.body.style.height = window.innerHeight + 'px';
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', () => {
      setTimeout(setVH, 300);
    });
  }
  
  // ===== ОБРАБОТЧИКИ КЛАВИАТУРЫ =====
  function setupKeyboardHandlers() {
    let originalHeight = window.innerHeight;
    
    window.addEventListener('resize', function() {
      const newHeight = window.innerHeight;
      
      if (newHeight < originalHeight) {
        // Клавиатура открылась
        document.body.classList.add('keyboard-open');
        
        // Прокручиваем активное поле ввода в видимую область
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          setTimeout(() => {
            activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      } else {
        // Клавиатура закрылась
        document.body.classList.remove('keyboard-open');
        
        // Прокручиваем обратно
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      }
      
      originalHeight = newHeight;
    });
    
    // Скрываем клавиатуру при тапе вне поля ввода
    document.addEventListener('touchstart', function(e) {
      if (!e.target.closest('input, textarea, select')) {
        document.activeElement?.blur();
      }
    });
  }
  
  // ===== LOCALSTORAGE ФУНКЦИИ =====
  function loadProfile() {
    try {
      const raw = localStorage.getItem("siamatch_profile");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error("❌ Ошибка загрузки профиля:", e);
      return null;
    }
  }
  
  function saveProfile(obj) {
    try {
      localStorage.setItem("siamatch_profile", JSON.stringify(obj));
      return true;
    } catch (e) {
      console.error("❌ Ошибка сохранения профиля:", e);
      return false;
    }
  }
  
  // ===== ОБРАБОТЧИК КНОПКИ "НАЧАТЬ ЗНАКОМСТВО" =====
  function setupStartButton() {
    if (!startBtn) return;
    
    console.log('✅ Настраиваю кнопку "Начать знакомство"');
    
    // Удаляем все старые обработчики
    startBtn.onclick = null;
    startBtn.ontouchstart = null;
    
    // Добавляем надежный обработчик
    startBtn.addEventListener('click', handleStartClick, { passive: true });
    
    // Touch обработчик для iOS
    startBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      handleStartClick();
    }, { passive: false });
  }
  
  function handleStartClick() {
    console.log('🎯 Кнопка "Начать знакомство" нажата');
    
    // Haptic feedback
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
    
    // Скрываем приветственный экран
    if (welcomeScreen) {
      welcomeScreen.classList.add("hidden");
    }
    
    // Проверяем, есть ли профиль
    profileData = loadProfile();
    
    if (profileData) {
      // Профиль есть - идем сразу в ленту
      console.log('📁 Профиль найден, переходим в ленту');
      showMainApp();
    } else {
      // Профиля нет - показываем анкету
      console.log('📝 Профиля нет, показываем анкету');
      showOnboarding();
    }
  }
  
  // ===== ПОКАЗАТЬ АНКЕТУ =====
  function showOnboarding() {
    if (onboardingScreen) {
      onboardingScreen.classList.remove("hidden");
    }
    if (tabBar) {
      tabBar.classList.add("hidden");
    }
    
    // FIX: Прокручиваем к началу
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    
    // Настраиваем кнопку сохранения
    setupSaveButton();
  }
  
  // ===== НАСТРОЙКА КНОПКИ "СОХРАНИТЬ ПРОФИЛЬ" =====
  function setupSaveButton() {
    if (!saveProfileBtn) return;
    
    console.log('✅ Настраиваю кнопку "Сохранить профиль"');
    
    // Удаляем старые обработчики
    saveProfileBtn.onclick = null;
    saveProfileBtn.ontouchstart = null;
    
    // Добавляем новый обработчик
    saveProfileBtn.addEventListener('click', handleSaveProfile, { passive: true });
    
    // Touch обработчик для iOS
    saveProfileBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      handleSaveProfile();
    }, { passive: false });
    
    // Делаем кнопку видимой и фиксированной
    saveProfileBtn.style.display = 'block';
  }
  
  function handleSaveProfile() {
    console.log('💾 Сохраняю профиль...');
    
    // Получаем значения
    const ageValue = Number(document.getElementById("age").value);
    const gender = document.getElementById("gender").value;
    const city = document.getElementById("city").value;
    const bio = document.getElementById("bio").value.trim();
    
    // Валидация
    if (!ageValue || ageValue < 18 || ageValue > 99) {
      alert("Возраст должен быть от 18 до 99 лет");
      return;
    }
    if (!gender) {
      alert("Выберите пол");
      return;
    }
    if (!city) {
      alert("Выберите город");
      return;
    }
    if (bio.length < 10) {
      alert("О себе минимум 10 символов");
      return;
    }
    
    // Создаем профиль
    const user = tg?.initDataUnsafe?.user || { id: 1, first_name: "Пользователь" };
    profileData = {
      tg_id: user.id,
      first_name: user.first_name || "Пользователь",
      username: user.username || "",
      age: ageValue,
      gender,
      city,
      bio,
      min_age_filter: 18,
      max_age_filter: 35,
      max_distance_km: 50,
      use_geolocation: false
    };
    
    // Сохраняем
    if (saveProfile(profileData)) {
      console.log('✅ Профиль сохранен');
      
      // Haptic feedback
      if (tg?.HapticFeedback) {
        try {
          tg.HapticFeedback.impactOccurred('medium');
        } catch (e) {}
      }
      
      // Переходим к основному приложению
      showMainApp();
      
      // Сообщение об успехе
      setTimeout(() => {
        alert("✅ Профиль сохранён! Добро пожаловать в SiaMatch 🍀");
      }, 300);
    } else {
      alert("❌ Ошибка при сохранении профиля");
    }
  }
  
  // ===== ПОКАЗАТЬ ОСНОВНОЕ ПРИЛОЖЕНИЕ =====
  function showMainApp() {
    console.log('🚀 Показываю основное приложение');
    
    // Скрываем все экраны кроме основного
    if (welcomeScreen) welcomeScreen.classList.add("hidden");
    if (onboardingScreen) onboardingScreen.classList.add("hidden");
    
    // Показываем таб-бар
    if (tabBar) {
      tabBar.classList.remove("hidden");
    }
    
    // Активируем ленту
    setActiveTab("feed");
  }
  
  // ===== УПРАВЛЕНИЕ ТАБАМИ =====
  function setActiveTab(tab) {
    console.log('🔘 Активирую таб:', tab);
    
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(screen => {
      if (screen.id !== 'welcome-screen') { // Не скрываем welcome screen
        screen.classList.add('hidden');
      }
    });
    
    // Показываем выбранный экран
    const screenId = 'screen-' + tab;
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.remove('hidden');
    }
    
    // Обновляем активные кнопки
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Инициализируем экран
    if (tab === 'feed') {
      initFeed();
    } else if (tab === 'profile') {
      initProfile();
    }
    
    // Прокручиваем вверх
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
  }
  
  // Настройка обработчиков табов
  function setupTabButtons() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const tab = this.dataset.tab;
        setActiveTab(tab);
        
        // Haptic feedback
        if (tg?.HapticFeedback) {
          try {
            tg.HapticFeedback.selectionChanged();
          } catch (e) {}
        }
      });
    });
  }
  
  // ===== ЛЕНТА СВАЙПОВ =====
  function initFeed() {
    console.log('🔄 Инициализирую ленту');
    
    currentIndex = 0;
    showCurrentCandidate();
    
    // Настраиваем кнопки ленты
    const btnLike = document.getElementById("btn-like");
    const btnDislike = document.getElementById("btn-dislike");
    
    if (btnLike) {
      btnLike.onclick = null;
      btnLike.addEventListener('click', handleLike);
    }
    
    if (btnDislike) {
      btnDislike.onclick = null;
      btnDislike.addEventListener('click', handleDislike);
    }
  }
  
  function showCurrentCandidate() {
    const filtered = candidates.filter(c => !likedIds.includes(c.id));
    
    if (currentIndex >= filtered.length) {
      // Кандидаты закончились
      document.getElementById("candidate-name").textContent = "";
      document.getElementById("candidate-age").textContent = "";
      document.getElementById("candidate-city").textContent = "";
      document.getElementById("candidate-bio").textContent = "";
      document.getElementById("candidate-photo").src = "";
      document.getElementById("feed-status").textContent = 
        "На сегодня всё! Загляните позже 🍀";
      return;
    }
    
    const candidate = filtered[currentIndex];
    
    document.getElementById("candidate-name").textContent = candidate.name;
    document.getElementById("candidate-age").textContent = candidate.age;
    document.getElementById("candidate-city").textContent = candidate.city;
    document.getElementById("candidate-bio").textContent = candidate.bio;
    document.getElementById("candidate-photo").src = candidate.photo;
    document.getElementById("feed-status").textContent = "";
  }
  
  function handleLike() {
    console.log('❤️ Лайк!');
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
    
    const filtered = candidates.filter(c => !likedIds.includes(c.id));
    if (currentIndex < filtered.length) {
      likedIds.push(filtered[currentIndex].id);
      currentIndex++;
      showCurrentCandidate();
    }
  }
  
  function handleDislike() {
    console.log('✖️ Дизлайк!');
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
    
    const filtered = candidates.filter(c => !likedIds.includes(c.id));
    if (currentIndex < filtered.length) {
      currentIndex++;
      showCurrentCandidate();
    }
  }
  
  // ===== ПРОФИЛЬ =====
  function initProfile() {
    console.log('👤 Инициализирую профиль');
    
    // Загружаем профиль
    profileData = loadProfile();
    
    if (profileData) {
      // Заполняем поля
      document.getElementById("profile-age").value = profileData.age || "";
      document.getElementById("profile-gender").value = profileData.gender || "";
      document.getElementById("profile-city").value = profileData.city || "";
      document.getElementById("profile-bio").value = profileData.bio || "";
      document.getElementById("profile-min-age").value = profileData.min_age_filter || 18;
      document.getElementById("profile-max-age").value = profileData.max_age_filter || 35;
      document.getElementById("profile-max-distance").value = profileData.max_distance_km || 50;
      
      const geoCheckbox = document.getElementById("profile-use-geolocation");
      if (geoCheckbox) {
        geoCheckbox.checked = profileData.use_geolocation || false;
      }
      
      // Фото профиля
      if (profileData.custom_photo_url) {
        const preview = document.getElementById('photo-preview');
        if (preview) {
          preview.src = profileData.custom_photo_url;
          preview.style.display = 'block';
        }
      }
    }
    
    // Настраиваем кнопку обновления
    const updateBtn = document.getElementById("updateProfileBtn");
    if (updateBtn) {
      updateBtn.onclick = null;
      updateBtn.addEventListener('click', handleUpdateProfile);
      updateBtn.style.display = 'block';
    }
    
    // Загрузка фото
    const photoInput = document.getElementById('profile-photo');
    if (photoInput) {
      photoInput.addEventListener('change', handlePhotoUpload);
    }
  }
  
  function handleUpdateProfile() {
    console.log('📝 Обновляю профиль...');
    
    if (!profileData) {
      alert("Сначала создайте профиль!");
      return;
    }
    
    // Обновляем данные
    profileData.age = Number(document.getElementById("profile-age").value);
    profileData.gender = document.getElementById("profile-gender").value;
    profileData.city = document.getElementById("profile-city").value;
    profileData.bio = document.getElementById("profile-bio").value.trim();
    profileData.min_age_filter = Number(document.getElementById("profile-min-age").value);
    profileData.max_age_filter = Number(document.getElementById("profile-max-age").value);
    profileData.max_distance_km = Number(document.getElementById("profile-max-distance").value);
    
    const geoCheckbox = document.getElementById("profile-use-geolocation");
    if (geoCheckbox) {
      profileData.use_geolocation = geoCheckbox.checked;
    }
    
    // Сохраняем
    if (saveProfile(profileData)) {
      alert("✅ Профиль обновлён!");
      
      if (tg?.HapticFeedback) {
        try {
          tg.HapticFeedback.impactOccurred('light');
        } catch (e) {}
      }
    } else {
      alert("❌ Ошибка при обновлении профиля");
    }
  }
  
  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Фото слишком большое (максимум 5MB)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
      const preview = document.getElementById('photo-preview');
      if (preview) {
        preview.src = event.target.result;
        preview.style.display = 'block';
      }
      
      // Сохраняем в профиль
      if (profileData) {
        profileData.custom_photo_url = event.target.result;
        saveProfile(profileData);
      }
      
      alert('Фото загружено! 📸');
    };
    reader.readAsDataURL(file);
  }
  
  // ===== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====
  function initApp() {
    if (hasInitialized) return;
    hasInitialized = true;
    
    console.log('🎬 Инициализация приложения...');
    
    // Инициализируем Telegram
    initTelegram();
    
    // Настраиваем UI
    setupStartButton();
    setupTabButtons();
    
    // Загружаем профиль
    profileData = loadProfile();
    
    // FIX: Всегда показываем приветственный экран сначала
    if (welcomeScreen) {
      welcomeScreen.classList.remove("hidden");
      console.log('👋 Показываю приветственный экран');
    }
    
    // Скрываем все остальные экраны
    if (onboardingScreen) onboardingScreen.classList.add("hidden");
    document.querySelectorAll('.screen').forEach(screen => {
      if (screen.id !== 'welcome-screen') {
        screen.classList.add('hidden');
      }
    });
    
    // Скрываем таб-бар
    if (tabBar) tabBar.classList.add("hidden");
    
    // FIX для iOS
    if (isIOS) {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 300);
    }
    
    console.log('✅ Приложение инициализировано');
  }
  
  // ===== ЗАПУСК =====
  // Ждем немного чтобы DOM полностью загрузился
  setTimeout(initApp, 100);
});
