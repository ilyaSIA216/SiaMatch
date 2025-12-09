document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 SiaMatch запускается...');
  
  // ===== СОСТОЯНИЕ ПРИЛОЖЕНИЯ =====
  let tg = null;
  let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  let profileData = null;
  let currentIndex = 0;
  let likedIds = [];
  let hasInitialized = false;
  let keyboardHeight = 0;
  let originalHeight = window.innerHeight;
  
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
  const appRoot = document.getElementById("app-root");
  const card = document.getElementById("card");
  
  // ===== ИНИЦИАЛИЗАЦИЯ TELEGRAM =====
  function initTelegram() {
    try {
      if (window.Telegram && Telegram.WebApp) {
        tg = Telegram.WebApp;
        console.log('✅ Telegram WebApp обнаружен');
        
        tg.ready();
        tg.expand();
        
        if (tg.MainButton) {
          tg.MainButton.hide();
        }
        
        if (isIOS) {
          console.log('📱 iOS обнаружен');
          document.body.classList.add('no-bounce');
          setupKeyboardHandlers();
        }
        
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
  
  // ===== FIX ДЛЯ КЛАВИАТУРЫ iOS =====
  function setupKeyboardHandlers() {
    console.log('⌨️ Настраиваю обработчики клавиатуры');
    
    // Сохраняем оригинальную высоту
    originalHeight = window.innerHeight;
    
    // Обработчик изменения размера окна (срабатывает при появлении/скрытии клавиатуры)
    window.addEventListener('resize', handleResize);
    
    // Обработчик фокуса на поле ввода
    document.addEventListener('focusin', handleFocusIn);
    
    // Обработчик потери фокуса
    document.addEventListener('focusout', handleFocusOut);
    
    // Обработчик тапа вне поля ввода
    document.addEventListener('touchstart', handleTouchOutside);
  }
  
  function handleResize() {
    const newHeight = window.innerHeight;
    const heightDiff = originalHeight - newHeight;
    
    console.log('📏 Изменение высоты окна:', {
      original: originalHeight,
      new: newHeight,
      diff: heightDiff
    });
    
    // Если разница значительная (> 100px) - это клавиатура
    if (heightDiff > 100) {
      keyboardHeight = heightDiff;
      console.log('⌨️ Клавиатура открылась, высота:', keyboardHeight);
      
      // Добавляем класс для стилей
      document.body.classList.add('keyboard-open');
      
      // Поднимаем контент над клавиатурой
      if (card) {
        card.style.transform = `translateY(-${Math.min(150, keyboardHeight - 100)}px)`;
      }
      
      // Прокручиваем активное поле в видимую область
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        setTimeout(() => {
          activeElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }, 100);
      }
    } 
    // Если высота вернулась к исходной - клавиатура закрылась
    else if (Math.abs(originalHeight - newHeight) < 50) {
      console.log('⌨️ Клавиатура закрылась');
      
      // Убираем класс для стилей
      document.body.classList.remove('keyboard-open');
      
      // Возвращаем контент на место
      if (card) {
        card.style.transform = 'translateY(0)';
      }
      
      // Прокручиваем обратно к началу
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (card) card.scrollTop = 0;
      }, 200);
      
      keyboardHeight = 0;
    }
    
    originalHeight = newHeight;
  }
  
  function handleFocusIn(e) {
    if (e.target.matches('input, textarea, select')) {
      console.log('🎯 Фокус на поле ввода:', e.target.id || e.target.name);
      
      // Для iOS сразу добавляем класс (на всякий случай)
      if (isIOS) {
        setTimeout(() => {
          document.body.classList.add('keyboard-open');
        }, 100);
      }
    }
  }
  
  function handleFocusOut(e) {
    if (e.target.matches('input, textarea, select')) {
      console.log('🎯 Потеря фокуса с поля ввода');
      
      // На iOS клавиатура закрывается не сразу, ждем немного
      if (isIOS) {
        setTimeout(() => {
          // Проверяем, есть ли еще активные поля ввода
          const activeElement = document.activeElement;
          if (!activeElement || !activeElement.matches('input, textarea, select')) {
            console.log('✅ Все поля ввода потеряли фокус, закрываем клавиатуру');
            document.body.classList.remove('keyboard-open');
            if (card) card.style.transform = 'translateY(0)';
          }
        }, 500);
      }
    }
  }
  
  function handleTouchOutside(e) {
    // Если тап не на поле ввода и не на кнопке, скрываем клавиатуру
    if (!e.target.closest('input, textarea, select, button')) {
      document.activeElement?.blur();
    }
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
    
    startBtn.onclick = null;
    startBtn.ontouchstart = null;
    
    startBtn.addEventListener('click', handleStartClick, { passive: true });
    
    startBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      handleStartClick();
    }, { passive: false });
  }
  
  function handleStartClick() {
    console.log('🎯 Кнопка "Начать знакомство" нажата');
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
    
    if (welcomeScreen) {
      welcomeScreen.classList.add("hidden");
    }
    
    profileData = loadProfile();
    
    if (profileData) {
      console.log('📁 Профиль найден, переходим в ленту');
      showMainApp();
    } else {
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
    
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    
    setupSaveButton();
  }
  
  // ===== НАСТРОЙКА КНОПКИ "СОХРАНИТЬ ПРОФИЛЬ" =====
  function setupSaveButton() {
    if (!saveProfileBtn) return;
    
    console.log('✅ Настраиваю кнопку "Сохранить профиль"');
    
    saveProfileBtn.onclick = null;
    saveProfileBtn.ontouchstart = null;
    
    saveProfileBtn.addEventListener('click', handleSaveProfile, { passive: true });
    
    saveProfileBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      handleSaveProfile();
    }, { passive: false });
    
    saveProfileBtn.style.display = 'block';
  }
  
  function handleSaveProfile() {
    console.log('💾 Сохраняю профиль...');
    
    // Сначала скрываем клавиатуру если открыта
    document.activeElement?.blur();
    document.body.classList.remove('keyboard-open');
    if (card) card.style.transform = 'translateY(0)';
    
    // Ждем немного чтобы клавиатура закрылась
    setTimeout(() => {
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
        
        if (tg?.HapticFeedback) {
          try {
            tg.HapticFeedback.impactOccurred('medium');
          } catch (e) {}
        }
        
        showMainApp();
        
        setTimeout(() => {
          alert("✅ Профиль сохранён! Добро пожаловать в SiaMatch 🍀");
        }, 300);
      } else {
        alert("❌ Ошибка при сохранении профиля");
      }
    }, 300);
  }
  
  // ===== ПОКАЗАТЬ ОСНОВНОЕ ПРИЛОЖЕНИЕ =====
  function showMainApp() {
    console.log('🚀 Показываю основное приложение');
    
    if (welcomeScreen) welcomeScreen.classList.add("hidden");
    if (onboardingScreen) onboardingScreen.classList.add("hidden");
    
    if (tabBar) {
      tabBar.classList.remove("hidden");
    }
    
    setActiveTab("feed");
  }
  
  // ===== УПРАВЛЕНИЕ ТАБАМИ =====
  function setActiveTab(tab) {
    console.log('🔘 Активирую таб:', tab);
    
    document.querySelectorAll('.screen').forEach(screen => {
      if (screen.id !== 'welcome-screen') {
        screen.classList.add('hidden');
      }
    });
    
    const screenId = 'screen-' + tab;
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.remove('hidden');
    }
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    if (tab === 'feed') {
      initFeed();
    } else if (tab === 'profile') {
      initProfile();
    }
    
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
  }
  
  function setupTabButtons() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const tab = this.dataset.tab;
        setActiveTab(tab);
        
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
    
    profileData = loadProfile();
    
    if (profileData) {
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
      
      if (profileData.custom_photo_url) {
        const preview = document.getElementById('photo-preview');
        if (preview) {
          preview.src = profileData.custom_photo_url;
          preview.style.display = 'block';
        }
      }
    }
    
    const updateBtn = document.getElementById("updateProfileBtn");
    if (updateBtn) {
      updateBtn.onclick = null;
      updateBtn.addEventListener('click', handleUpdateProfile);
      updateBtn.style.display = 'block';
    }
    
    const photoInput = document.getElementById('profile-photo');
    if (photoInput) {
      photoInput.addEventListener('change', handlePhotoUpload);
    }
  }
  
  function handleUpdateProfile() {
    console.log('📝 Обновляю профиль...');
    
    // Сначала скрываем клавиатуру если открыта
    document.activeElement?.blur();
    document.body.classList.remove('keyboard-open');
    if (card) card.style.transform = 'translateY(0)';
    
    setTimeout(() => {
      if (!profileData) {
        alert("Сначала создайте профиль!");
        return;
      }
      
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
    }, 300);
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
    
    initTelegram();
    setupStartButton();
    setupTabButtons();
    
    profileData = loadProfile();
    
    // ВСЕГДА показываем приветственный экран первым
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
    
    if (tabBar) tabBar.classList.add("hidden");
    
    if (isIOS) {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 300);
    }
    
    console.log('✅ Приложение инициализировано');
  }
  
  // ===== ЗАПУСК =====
  setTimeout(initApp, 100);
});
