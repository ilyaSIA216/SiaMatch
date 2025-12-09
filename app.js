document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing app...');
  
  // ===== Telegram WebApp инициализация =====
  let tg = null;
  let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  
  try {
    if (window.Telegram && Telegram.WebApp) {
      tg = Telegram.WebApp;
      console.log('Telegram WebApp detected, platform:', tg.platform);
      tg.ready();
      
      // Принудительно расширяем на весь экран
      tg.expand();
      
      // Настраиваем для iOS
      if (isIOS || tg.platform === 'ios' || tg.platform === 'macos') {
        console.log('iOS detected, applying fixes...');
        document.body.classList.add('no-bounce');
        
        // Добавляем отступ для верхней панели Telegram
        const topInset = tg.viewportStableHeight || 0;
        if (topInset > 0) {
          document.documentElement.style.setProperty('--tg-top-inset', `${topInset}px`);
        }
        
        // Исправляем 100vh на iOS
        const setVH = () => {
          const vh = window.innerHeight * 0.01;
          document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', () => {
          setTimeout(setVH, 300);
        });
      }
      
      // Обновляем viewport
      setTimeout(() => {
        if (tg && typeof tg.requestViewport === 'function') {
          tg.requestViewport();
        }
      }, 500);
    } else {
      console.log('Telegram WebApp not found, running in browser mode');
    }
  } catch (e) {
    console.error("Telegram WebApp init error:", e);
  }

  // ===== DOM элементы =====
  const usernameElem = document.getElementById("username");
  const welcomeScreen = document.getElementById("welcome-screen");
  const startBtn = document.getElementById("startBtn");
  const onboardingScreen = document.getElementById("onboarding-screen");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const tabBar = document.getElementById("tab-bar");

  // ===== ИНИЦИАЛИЗАЦИЯ ПОЛЬЗОВАТЕЛЯ =====
  let user = tg?.initDataUnsafe?.user || null;
  console.log('User data:', user);
  
  if (user && usernameElem) {
    const name = user.first_name || user.username || "друг";
    usernameElem.textContent = `Привет, ${name}!`;
  } else {
    usernameElem.textContent = "Привет, друг! 👋";
    user = { id: 1, first_name: "Тестовый", username: "user" };
  }

  // ===== ОБРАБОТЧИК КНОПКИ "НАЧАТЬ ОБЩЕНИЕ" =====
  // FIX: Простой и надежный обработчик для iOS
  if (startBtn) {
    console.log('Start button found, adding event listener...');
    
    // Удаляем старые обработчики
    startBtn.onclick = null;
    startBtn.ontouchstart = null;
    
    // Добавляем новый обработчик
    startBtn.addEventListener('click', handleStartClick, { passive: true });
    
    // Также добавляем для touch устройств
    startBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      handleStartClick();
    }, { passive: false });
    
    // Добавляем визуальную обратную связь
    startBtn.addEventListener('touchstart', function() {
      this.style.transform = 'scale(0.97)';
      this.style.opacity = '0.9';
    }, { passive: true });
    
    startBtn.addEventListener('touchend', function() {
      this.style.transform = '';
      this.style.opacity = '1';
    }, { passive: true });
  }

  function handleStartClick() {
    console.log('Start button clicked!');
    
    // Визуальная обратная связь
    if (startBtn) {
      startBtn.style.transform = 'scale(0.95)';
      startBtn.style.opacity = '0.8';
      setTimeout(() => {
        if (startBtn) {
          startBtn.style.transform = '';
          startBtn.style.opacity = '1';
        }
      }, 150);
    }
    
    // Haptic feedback если доступно
    if (tg && tg.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('light');
      } catch (e) {
        console.log('Haptic feedback not available');
      }
    }
    
    // Показываем онбординг
    if (welcomeScreen) {
      welcomeScreen.classList.add("hidden");
      console.log('Welcome screen hidden');
    }
    
    if (onboardingScreen) {
      onboardingScreen.classList.remove("hidden");
      console.log('Onboarding screen shown');
    }
    
    if (tabBar) {
      tabBar.classList.add("hidden");
      console.log('Tab bar hidden');
    }
    
    // Прокручиваем к началу
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
    }, 100);
  }

  // ===== ОБРАБОТЧИК КНОПКИ "СОХРАНИТЬ ПРОФИЛЬ" =====
  if (saveProfileBtn) {
    saveProfileBtn.onclick = null;
    saveProfileBtn.addEventListener('click', handleSaveProfile, { passive: true });
    
    saveProfileBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      handleSaveProfile();
    }, { passive: false });
  }

  function handleSaveProfile() {
    console.log('Save profile button clicked');
    
    // Визуальная обратная связь
    if (saveProfileBtn) {
      saveProfileBtn.style.transform = 'scale(0.95)';
      saveProfileBtn.style.opacity = '0.8';
      setTimeout(() => {
        if (saveProfileBtn) {
          saveProfileBtn.style.transform = '';
          saveProfileBtn.style.opacity = '1';
        }
      }, 150);
    }
    
    // Получаем значения из формы
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

    // Сохраняем профиль
    const profileData = {
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

    try {
      localStorage.setItem("siamatch_profile", JSON.stringify(profileData));
      console.log('Profile saved to localStorage');
    } catch (e) {
      console.error('Error saving profile:', e);
    }

    // Haptic feedback
    if (tg && tg.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('medium');
      } catch (e) {
        // Игнорируем ошибки haptic
      }
    }

    // Показываем табы и ленту
    if (onboardingScreen) {
      onboardingScreen.classList.add("hidden");
    }
    if (tabBar) {
      tabBar.classList.remove("hidden");
    }
    
    // Инициализируем приложение
    initApp();
    
    // Показываем сообщение
    setTimeout(() => {
      alert("✅ Профиль сохранён! Добро пожаловать 🍀");
    }, 300);
  }

  // ===== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====
  function initApp() {
    console.log('Initializing app...');
    
    // Проверяем сохраненный профиль
    let profileData = null;
    try {
      const raw = localStorage.getItem("siamatch_profile");
      if (raw) {
        profileData = JSON.parse(raw);
        console.log('Loaded profile:', profileData);
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    }
    
    if (!profileData) {
      // Показываем приветственный экран
      if (welcomeScreen) welcomeScreen.classList.remove("hidden");
      if (onboardingScreen) onboardingScreen.classList.add("hidden");
      if (tabBar) tabBar.classList.add("hidden");
      return;
    }
    
    // Скрываем приветственный экран
    if (welcomeScreen) welcomeScreen.classList.add("hidden");
    if (onboardingScreen) onboardingScreen.classList.add("hidden");
    if (tabBar) tabBar.classList.remove("hidden");
    
    // Показываем ленту
    setActiveTab("feed");
  }

  // ===== УПРАВЛЕНИЕ ТАБАМИ =====
  function setActiveTab(tab) {
    console.log('Setting active tab:', tab);
    
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.add('hidden');
    });
    
    // Показываем выбранный экран
    const screenId = 'screen-' + tab;
    const screen = document.getElementById(screenId);
    if (screen) {
      screen.classList.remove('hidden');
    }
    
    // Обновляем активные кнопки табов
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Если это лента, инициализируем ее
    if (tab === 'feed') {
      initFeed();
    }
    
    // Прокручиваем вверх
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
  }

  // Инициализация обработчиков табов
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const tab = this.dataset.tab;
      setActiveTab(tab);
      
      // Haptic feedback
      if (tg && tg.HapticFeedback) {
        try {
          tg.HapticFeedback.selectionChanged();
        } catch (e) {
          // Игнорируем
        }
      }
    });
    
    // Touch feedback
    btn.addEventListener('touchstart', function() {
      this.style.opacity = '0.7';
    }, { passive: true });
    
    btn.addEventListener('touchend', function() {
      this.style.opacity = '1';
    }, { passive: true });
  });

  // ===== ЛЕНТА =====
  const candidates = [
    {id:1,name:"Алина",age:24,gender:"female",city:"Москва",bio:"Люблю кофе ☕ Москва ❤️",photo:"https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=800"},
    {id:2,name:"Дмитрий",age:28,gender:"male",city:"Санкт-Петербург",bio:"Инженер СПб",photo:"https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800"},
    {id:3,name:"Екатерина",age:26,gender:"female",city:"Москва",bio:"Фотограф ❤️",photo:"https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800"}
  ];

  let currentIndex = 0;
  let likedIds = [];

  function initFeed() {
    console.log('Initializing feed...');
    currentIndex = 0;
    likedIds = [];
    showCurrentCandidate();
    
    // Инициализация кнопок ленты
    const btnLike = document.getElementById("btn-like");
    const btnDislike = document.getElementById("btn-dislike");
    
    if (btnLike) {
      btnLike.onclick = null;
      btnLike.addEventListener('click', handleLike);
      btnLike.addEventListener('touchstart', function(e) {
        e.preventDefault();
        handleLike();
      }, { passive: false });
    }
    
    if (btnDislike) {
      btnDislike.onclick = null;
      btnDislike.addEventListener('click', handleDislike);
      btnDislike.addEventListener('touchstart', function(e) {
        e.preventDefault();
        handleDislike();
      }, { passive: false });
    }
  }

  function showCurrentCandidate() {
    const filteredCandidates = candidates.filter(c => !likedIds.includes(c.id));
    
    if (currentIndex >= filteredCandidates.length) {
      // Показываем сообщение, что кандидаты закончились
      document.getElementById("candidate-name").textContent = "";
      document.getElementById("candidate-age").textContent = "";
      document.getElementById("candidate-city").textContent = "";
      document.getElementById("candidate-bio").textContent = "";
      document.getElementById("candidate-photo").src = "";
      document.getElementById("feed-status").textContent = 
        "На сегодня всё! Загляните позже 🍀";
      return;
    }
    
    const candidate = filteredCandidates[currentIndex];
    
    document.getElementById("candidate-name").textContent = candidate.name;
    document.getElementById("candidate-age").textContent = candidate.age;
    document.getElementById("candidate-city").textContent = candidate.city;
    document.getElementById("candidate-bio").textContent = candidate.bio;
    document.getElementById("candidate-photo").src = candidate.photo;
    document.getElementById("feed-status").textContent = "";
  }

  function handleLike() {
    console.log('Like clicked');
    
    // Haptic feedback
    if (tg && tg.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('light');
      } catch (e) {
        // Игнорируем
      }
    }
    
    const filteredCandidates = candidates.filter(c => !likedIds.includes(c.id));
    if (currentIndex < filteredCandidates.length) {
      likedIds.push(filteredCandidates[currentIndex].id);
      currentIndex++;
      showCurrentCandidate();
    }
  }

  function handleDislike() {
    console.log('Dislike clicked');
    
    // Haptic feedback
    if (tg && tg.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('light');
      } catch (e) {
        // Игнорируем
      }
    }
    
    const filteredCandidates = candidates.filter(c => !likedIds.includes(c.id));
    if (currentIndex < filteredCandidates.length) {
      currentIndex++;
      showCurrentCandidate();
    }
  }

  // ===== ЗАГРУЗКА ФОТО ПРОФИЛЯ =====
  const profilePhotoInput = document.getElementById('profile-photo');
  if (profilePhotoInput) {
    profilePhotoInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
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
          alert('Фото загружено! 📸');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // ===== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ =====
  // Ждем немного чтобы все загрузилось
  setTimeout(() => {
    console.log('Initializing on load...');
    initApp();
    
    // FIX для iOS: принудительный ресайз
    if (isIOS) {
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.style.height = window.innerHeight + 'px';
      }, 500);
    }
  }, 300);

  // ===== FIX для клавиатуры на iOS =====
  if (isIOS) {
    // Скрываем клавиатуру при тапе вне поля ввода
    document.addEventListener('touchstart', function(e) {
      if (!e.target.closest('input, textarea, select')) {
        document.activeElement?.blur();
      }
    });
    
    // Прокручиваем поле ввода в видимую область
    document.addEventListener('focusin', function(e) {
      if (e.target.matches('input, textarea, select')) {
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    });
  }

  // ===== FIX для кнопок на iOS =====
  // Добавляем активные состояния для всех кнопок
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('touchstart', function() {
      this.style.transform = 'scale(0.97)';
      this.style.opacity = '0.9';
    }, { passive: true });
    
    btn.addEventListener('touchend', function() {
      this.style.transform = '';
      this.style.opacity = '1';
    }, { passive: true });
  });
});
