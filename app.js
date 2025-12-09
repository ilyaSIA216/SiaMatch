document.addEventListener('DOMContentLoaded', function() {
  // ===== iOS FIX: Принудительный сброс стилей =====
  document.body.style.height = '100vh';
  document.body.style.overflow = 'hidden';
  document.documentElement.style.height = '100vh';
  document.documentElement.style.overflow = 'hidden';
  
  // ===== Telegram WebApp инициализация =====
  let tg = null;
  let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  try {
    if (window.Telegram && Telegram.WebApp) {
      tg = Telegram.WebApp;
      tg.ready();
      
      // iOS FIX: Правильная инициализация
      if (isIOS || tg.platform === 'ios' || tg.platform === 'macos') {
        document.body.style.webkitOverflowScrolling = 'touch';
        document.body.style.overflowY = 'auto';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        
        // Предотвращаем bounce эффект
        document.addEventListener('touchmove', function(e) {
          if (e.target.closest('#card')) {
            const card = document.getElementById('card');
            const isAtTop = card.scrollTop === 0;
            const isAtBottom = card.scrollHeight - card.scrollTop === card.clientHeight;
            
            if (isAtTop && e.touches[0].pageY > e.touches[0].clientY) {
              e.preventDefault();
            }
            if (isAtBottom && e.touches[0].pageY < e.touches[0].clientY) {
              e.preventDefault();
            }
          }
        }, { passive: false });
      }
      
      tg.expand();
      
      // iOS FIX: Безопасный requestViewport
      setTimeout(() => {
        if (tg && typeof tg.requestViewport === 'function') {
          tg.requestViewport();
        }
      }, 300);
      
      // FIX для нижней панели на iOS
      tg.viewportStableHeight = true;
      
      // Применяем тему Telegram
      applyTelegramTheme();
    }
  } catch (e) {
    console.error("Telegram WebApp init error:", e);
  }

  // ===== iOS FIX: Принудительный ресайз =====
  function forceResize() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    const appRoot = document.getElementById('app-root');
    if (appRoot) {
      appRoot.style.height = window.innerHeight + 'px';
    }
    
    const card = document.getElementById('card');
    if (card) {
      card.style.maxHeight = (window.innerHeight - 70) + 'px';
    }
  }
  
  window.addEventListener('resize', forceResize);
  window.addEventListener('orientationchange', function() {
    setTimeout(forceResize, 300);
  });
  
  // Вызываем сразу
  setTimeout(forceResize, 100);
  setTimeout(forceResize, 500);

  // ===== Применение темы Telegram =====
  function applyTelegramTheme() {
    if (!tg) return;
    
    const themeParams = tg.themeParams;
    const root = document.documentElement;
    
    if (themeParams.bg_color) {
      root.style.setProperty('--tg-theme-bg-color', themeParams.bg_color);
    }
    if (themeParams.text_color) {
      root.style.setProperty('--tg-theme-text-color', themeParams.text_color);
    }
    if (themeParams.button_color) {
      root.style.setProperty('--siamatch-green', themeParams.button_color);
    }
  }

  // ===== DOM элементы =====
  const usernameElem = document.getElementById("username");
  const welcomeScreen = document.getElementById("welcome-screen");
  const startBtn = document.getElementById("startBtn");
  const onboardingScreen = document.getElementById("onboarding-screen");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const tabBar = document.getElementById("tab-bar");
  const tabButtons = document.querySelectorAll(".tab-btn");

  // Лента
  const candidatePhoto = document.getElementById("candidate-photo");
  const candidateName = document.getElementById("candidate-name");
  const candidateAge = document.getElementById("candidate-age");
  const candidateCity = document.getElementById("candidate-city");
  const candidateDistance = document.getElementById("candidate-distance");
  const candidateBio = document.getElementById("candidate-bio");
  const btnLike = document.getElementById("btn-like");
  const btnDislike = document.getElementById("btn-dislike");
  const feedStatus = document.getElementById("feed-status");

  // Профиль
  const profileAge = document.getElementById("profile-age");
  const profileGender = document.getElementById("profile-gender");
  const profileCity = document.getElementById("profile-city");
  const profileBio = document.getElementById("profile-bio");
  const profileMinAge = document.getElementById("profile-min-age");
  const profileMaxAge = document.getElementById("profile-max-age");
  const profileMaxDistance = document.getElementById("profile-max-distance");
  const updateProfileBtn = document.getElementById("updateProfileBtn");

  // ===== БЕЗОПАСНЫЕ ОБРАБОТЧИКИ =====
  const safeAddEvent = (el, event, handler) => {
    if (el) {
      el.removeEventListener(event, handler);
      el.addEventListener(event, handler, { passive: event !== 'touchstart' });
    }
  };

  // ===== ОБНОВЛЕННАЯ MAINBUTTON =====
  function updateMainButton() {
    if (!tg) return;

    const onboardingVisible = 
      onboardingScreen && 
      !onboardingScreen.classList.contains("hidden") &&
      onboardingScreen.style.display !== "none";
    
    const welcomeVisible = 
      welcomeScreen && 
      !welcomeScreen.classList.contains("hidden");

    if (onboardingVisible || welcomeVisible) {
      tg.MainButton.hide();
      return;
    }

    tg.MainButton.setText("🍀 SiaMatch");
    tg.MainButton.onClick(null);
    tg.MainButton.show();
  }

  // ===== Telegram user =====
  let user = tg?.initDataUnsafe?.user || null;
  if (user && usernameElem) {
    const name = user.first_name || user.username || "друг";
    usernameElem.textContent = `Привет, ${name}!`;
  } else {
    usernameElem.textContent = "Привет, друг! 👋";
    user = { id: 1, first_name: "Тестовый", username: "user" };
  }

  // Telegram фото автоматически
  if (user?.photo_url) {
    profileData = loadProfile() || {};
    profileData.telegram_photo_url = user.photo_url;
    saveProfile(profileData);
  }

  // ===== localStorage функции =====
  function loadProfile() {
    try {
      const raw = localStorage.getItem("siamatch_profile");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error("loadProfile error:", e);
      return null;
    }
  }

  function saveProfile(obj) {
    try {
      localStorage.setItem("siamatch_profile", JSON.stringify(obj));
      return true;
    } catch (e) {
      console.error("saveProfile error:", e);
      return false;
    }
  }

  // ===== Демо-данные с городами =====
  const candidates = [
    {id:1,name:"Алина",age:24,gender:"female",city:"Москва",latitude:55.7558,longitude:37.6176,bio:"Люблю кофе ☕ Москва ❤️",photo:"https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=800"},
    {id:2,name:"Дмитрий",age:28,gender:"male",city:"Санкт-Петербург",latitude:59.9343,longitude:30.3351,bio:"Инженер СПб",photo:"https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800"},
    {id:3,name:"Екатерина",age:26,gender:"female",city:"Москва",latitude:55.76,longitude:37.62,bio:"Фотограф ❤️",photo:"https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800"},
    {id:4,name:"Алексей",age:30,gender:"male",city:"Казань",latitude:55.8304,longitude:49.0661,bio:"Спортсмен Казань",photo:"https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=800"}
  ];

  let currentIndex = 0;
  let likedIds = [];
  let userLocation = null;
  let profileData = null;

  // ===== ФИЛЬТРАЦИЯ КАНДИДАТОВ =====
  function getFilteredCandidates() {
    if (!profileData) {
      return candidates.filter(c => !likedIds.includes(c.id));
    }
    
    let filtered = candidates.filter(c => {
      if (likedIds.includes(c.id)) return false;
      
      // Фильтр по возрасту
      if (c.age < profileData.min_age_filter || c.age > profileData.max_age_filter) {
        return false;
      }
      
      // Фильтр по расстоянию
      if (profileData.use_geolocation && userLocation && c.latitude && c.longitude) {
        const dist = calculateDistance(userLocation.lat, userLocation.lon, c.latitude, c.longitude);
        if (dist > profileData.max_distance_km) return false;
      }
      
      // Фильтр по полу (опционально)
      if (profileData.gender_preference && profileData.gender_preference !== c.gender) {
        return false;
      }
      
      return true;
    });
    
    return filtered;
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // ===== ГЕОЛОКАЦИЯ =====
  function requestUserLocation() {
    if (!navigator.geolocation) {
      alert("Геолокация не поддерживается");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        console.log(`📍 Геолокация получена: ${userLocation.lat}, ${userLocation.lon}`);
        showCurrentCandidate();
      },
      (error) => {
        console.error("Геолокация отклонена:", error);
        alert("Геолокация отклонена. Ищем по городу.");
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000,
        maximumAge: 0 
      }
    );
  }

  // ===== ЛЕНТА =====
  function showCurrentCandidate() {
    const filtered = getFilteredCandidates();
    
    if (currentIndex >= filtered.length) {
      candidatePhoto.src = "";
      candidateName.textContent = "";
      candidateAge.textContent = "";
      candidateCity.textContent = "";
      candidateDistance.textContent = "";
      candidateBio.textContent = "";
      feedStatus.textContent = filtered.length > 0 
        ? `На сегодня всё! Лайков: ${likedIds.length}.`
        : "Нет подходящих анкет по вашим фильтрам. Измените настройки в профиле.";
      btnLike.disabled = true;
      btnDislike.disabled = true;
      return;
    }

    const c = filtered[currentIndex];
    candidatePhoto.src = c.photo || 'https://via.placeholder.com/300x400/22c55e/f0fdf4?text=🍀';
    candidateName.textContent = c.name;
    candidateAge.textContent = c.age;
    candidateCity.textContent = c.city;
    
    // Расстояние
    if (profileData && profileData.use_geolocation && userLocation && c.latitude && c.longitude) {
      const dist = calculateDistance(userLocation.lat, userLocation.lon, c.latitude, c.longitude);
      candidateDistance.textContent = `${Math.round(dist)} км`;
    } else {
      candidateDistance.textContent = "";
    }
    
    candidateBio.textContent = c.bio;
    feedStatus.textContent = "";
    btnLike.disabled = false;
    btnDislike.disabled = false;
  }

  // ===== iOS FIX: Улучшенные обработчики кликов =====
  function addIOSClickFix(element) {
    if (!element) return;
    
    let touchStartTime;
    let touchStartX;
    let touchStartY;
    
    element.addEventListener('touchstart', function(e) {
      touchStartTime = Date.now();
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      this.style.transform = 'scale(0.95)';
    }, { passive: true });
    
    element.addEventListener('touchend', function(e) {
      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - touchStartTime;
      
      if (touchDuration < 500) {
        this.style.transform = '';
        setTimeout(() => {
          this.click();
        }, 50);
      }
    }, { passive: true });
    
    element.addEventListener('touchmove', function(e) {
      const deltaX = Math.abs(e.touches[0].clientX - touchStartX);
      const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
      
      if (deltaX > 10 || deltaY > 10) {
        this.style.transform = '';
      }
    }, { passive: true });
  }

  // Применяем iOS fix ко всем кнопкам
  document.querySelectorAll('button').forEach(addIOSClickFix);

  // Обработчики ленты
  safeAddEvent(btnLike, "click", () => {
    const filtered = getFilteredCandidates();
    if (currentIndex < filtered.length) {
      likedIds.push(filtered[currentIndex].id);
      currentIndex += 1;
      showCurrentCandidate();
      if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
      }
    }
  });

  safeAddEvent(btnDislike, "click", () => {
    const filtered = getFilteredCandidates();
    if (currentIndex < filtered.length) {
      currentIndex += 1;
      showCurrentCandidate();
      if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
      }
    }
  });

  // ===== ТАБЫ =====
  function setActiveTab(tab) {
    console.log("🔥 Активируем таб:", tab);
    
    // 1. СКРЫТЬ ВСЕ ЭКРАНЫ
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.add('hidden');
    });
    
    // 2. СКРЫТЬ ПРИВЕТСТВИЕ И ОНБОРДИНГ
    if (welcomeScreen) welcomeScreen.classList.add("hidden");
    if (onboardingScreen) onboardingScreen.classList.add("hidden");
    
    // 3. ПОКАЗАТЬ ВЫБРАННЫЙ ЭКРАН
    if (tab === 'chats') {
      document.getElementById('screen-chats').classList.remove('hidden');
    } else if (tab === 'feed') {
      document.getElementById('screen-feed').classList.remove('hidden');
      currentIndex = 0;
      showCurrentCandidate();
    } else if (tab === 'profile') {
      document.getElementById('screen-profile').classList.remove('hidden');
    }
    
    // 4. АКТИВНЫЙ ТАБ
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // 5. Показываем таб-бар
    if (tabBar) tabBar.classList.remove("hidden");
    
    // 6. Обновляем MainButton
    updateMainButton();
    
    // 7. iOS FIX: Принудительный ресайз после смены таба
    setTimeout(forceResize, 100);
  }

  // Обработчики табов
  tabButtons.forEach((btn) => {
    safeAddEvent(btn, "click", () => setActiveTab(btn.dataset.tab));
  });

  // ===== РЕДАКТИРОВАНИЕ ПРОФИЛЯ =====
  safeAddEvent(updateProfileBtn, "click", function() {
    if (!profileData) return alert("Сначала заполните профиль!");

    profileData.age = Number(profileAge.value);
    profileData.gender = profileGender.value;
    profileData.city = profileCity.value;
    profileData.bio = profileBio.value.trim();
    profileData.min_age_filter = Number(profileMinAge.value);
    profileData.max_age_filter = Number(profileMaxAge.value);
    profileData.max_distance_km = Number(profileMaxDistance.value);
    profileData.use_geolocation = document.getElementById("profile-use-geolocation").checked;

    if (profileData.use_geolocation && !userLocation) {
      requestUserLocation();
    }

    if (saveProfile(profileData)) {
      alert("Профиль обновлён! Фильтры применены ✏️");
    }
  });

  // ===== ОНБОРДИНГ =====
  safeAddEvent(startBtn, "click", function() {
    if (welcomeScreen) welcomeScreen.classList.add("hidden");
    if (onboardingScreen) {
      onboardingScreen.classList.remove("hidden");
    }
    if (tabBar) tabBar.classList.add("hidden");
    updateMainButton();
    
    // iOS FIX: Фокус на первое поле
    setTimeout(() => {
      document.getElementById("age")?.focus();
    }, 300);
  });

  // ===== СОХРАНЕНИЕ ПРОФИЛЯ =====
  safeAddEvent(saveProfileBtn, "click", function() {
    const ageValue = Number(document.getElementById("age").value);
    const gender = document.getElementById("gender").value;
    const city = document.getElementById("city").value;
    const bio = document.getElementById("bio").value.trim();

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

    profileData = {
      tg_id: user?.id || 1,
      first_name: user?.first_name || "Тестовый",
      username: user?.username || "user",
      age: ageValue,
      gender,
      city,
      bio,
      min_age_filter: 18,
      max_age_filter: 35,
      max_distance_km: 50,
      use_geolocation: false
    };

    saveProfile(profileData);

    // Заполняем экран профиля
    if (profileAge) profileAge.value = ageValue;
    if (profileGender) profileGender.value = gender;
    if (profileCity) profileCity.value = city;
    if (profileBio) profileBio.value = bio;
    if (profileMinAge) profileMinAge.value = 18;
    if (profileMaxAge) profileMaxAge.value = 35;
    if (profileMaxDistance) profileMaxDistance.value = 50;

    // Скрываем онбординг, показываем табы
    if (onboardingScreen) onboardingScreen.classList.add("hidden");
    if (tabBar) tabBar.classList.remove("hidden");
    
    // iOS FIX: Скрываем клавиатуру
    document.activeElement?.blur();
    
    setActiveTab("feed");
    alert("✅ Профиль сохранён! Добро пожаловать 🍀");
  });

  // ===== ИНИЦИАЛИЗАЦИЯ =====
  function initOnStart() {
    profileData = loadProfile();
    
    if (!profileData) {
      // Нет сохранённого профиля: показываем приветствие
      if (welcomeScreen) welcomeScreen.classList.remove("hidden");
      if (onboardingScreen) onboardingScreen.classList.add("hidden");
      if (tabBar) tabBar.classList.add("hidden");
      updateMainButton();
      return;
    }

    // Заполняем онбординг
    document.getElementById("age").value = profileData.age || "";
    document.getElementById("gender").value = profileData.gender || "";
    document.getElementById("city").value = profileData.city || "";
    document.getElementById("bio").value = profileData.bio || "";

    // Заполняем профиль
    profileAge.value = profileData.age || "";
    profileGender.value = profileData.gender || "";
    profileCity.value = profileData.city || "";
    profileBio.value = profileData.bio || "";
    profileMinAge.value = profileData.min_age_filter || 18;
    profileMaxAge.value = profileData.max_age_filter || 35;
    profileMaxDistance.value = profileData.max_distance_km || 50;
    
    if (profileData.use_geolocation !== undefined) {
      document.getElementById("profile-use-geolocation").checked = profileData.use_geolocation;
    }

    // Показываем фото из профиля если есть
    if (profileData.custom_photo_url) {
      const preview = document.getElementById('photo-preview');
      if (preview) {
        preview.src = profileData.custom_photo_url;
        preview.style.display = 'block';
      }
    }

    // Показываем ленту
    if (welcomeScreen) welcomeScreen.classList.add("hidden");
    if (onboardingScreen) onboardingScreen.classList.add("hidden");
    if (tabBar) tabBar.classList.remove("hidden");
    
    setActiveTab("feed");
    updateMainButton();
  }

  // Запускаем инициализацию
  setTimeout(initOnStart, 100);

  // ===== iOS FIX: Обработчик клавиатуры =====
  window.addEventListener('focusin', function(e) {
    if (isIOS && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
      setTimeout(() => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  });

  window.addEventListener('focusout', function() {
    if (isIOS) {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }
  });

  // ===== Обработчик геолокации =====
  safeAddEvent(document.getElementById("profile-use-geolocation"), "change", function(e) {
    if (profileData) {
      profileData.use_geolocation = e.target.checked;
      if (e.target.checked && !userLocation) {
        requestUserLocation();
      }
      saveProfile(profileData);
    }
  });

  // ===== Загрузка фото =====
  safeAddEvent(document.getElementById('profile-photo'), 'change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Фото слишком большое (максимум 5MB)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(ev) {
      profileData = profileData || {};
      profileData.custom_photo_url = ev.target.result;
      
      const preview = document.getElementById('photo-preview');
      if (preview) {
        preview.src = ev.target.result;
        preview.style.display = 'block';
      }
      
      if (saveProfile(profileData)) {
        alert('Фото загружено! 📸');
      }
    };
    reader.readAsDataURL(file);
  });

  // ===== iOS FIX: Предотвращаем bounce при скролле =====
  if (isIOS) {
    let startY;
    const card = document.getElementById('card');
    
    safeAddEvent(card, 'touchstart', function(e) {
      startY = e.touches[0].clientY;
    }, true);
    
    safeAddEvent(card, 'touchmove', function(e) {
      const currentY = e.touches[0].clientY;
      const isScrollingDown = currentY > startY;
      const isAtTop = this.scrollTop === 0;
      const isAtBottom = this.scrollHeight - this.scrollTop <= this.clientHeight + 1;
      
      if ((isAtTop && isScrollingDown) || (isAtBottom && !isScrollingDown)) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  // ===== iOS FIX: Автоматическое скрытие клавиатуры при тапе вне поля =====
  document.addEventListener('touchstart', function(e) {
    if (isIOS && !e.target.closest('input, textarea, select')) {
      document.activeElement?.blur();
    }
  });
});
