document.addEventListener('DOMContentLoaded', function() {
  // ===== Весь твой код отсюда =====
  let tg = null;
  try {
    if (window.Telegram && Telegram.WebApp) {
      tg = Telegram.WebApp;
      tg.ready();
      
      // Telegram WebApp ПОЛНЫЙ ЭКРАН
      if (tg) {
        tg.expand();                    // ← Полноэкранный режим
        // ФИКС A: безопасный вызов requestViewport
        if (typeof tg.requestViewport === 'function') tg.requestViewport();
        document.body.style.padding = '0';
        document.body.style.margin = '0';
        document.body.style.alignItems = 'stretch';  // ← КРИТИЧНО!
      }
      
      // Адаптация под Telegram
      if (tg) {
        // УДАЛЕНО: tg.MainButton.setText('🍀 SiaMatch').show();
        window.addEventListener('resize', () => {
          document.body.style.height = window.innerHeight + 'px';
        });
      }
    }
  } catch (e) {
    console.error("Telegram WebApp init error:", e);
  }

  // DOM элементы
  const usernameElem = document.getElementById("username");
  const onboardingScreen = document.getElementById("onboarding-screen");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const tabBar = document.getElementById("tab-bar");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const screenChats = document.getElementById("screen-chats");
  const screenFeed = document.getElementById("screen-feed");
  const screenProfile = document.getElementById("screen-profile");

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

  // Чаты
  const chatsList = document.getElementById("chats-list");
  const chatsEmpty = document.getElementById("chats-empty");

  // 🚀 MainButton ДИНАМИЧЕСКИЙ ПЕРЕКЛЮЧАТЕЛЬ
  function updateMainButton() {
    if (tg) {
      tg.MainButton.hide();
      
      // Онбординг активен?
      const isOnboardingVisible = !onboardingScreen.classList.contains('hidden') && 
                                  onboardingScreen.style.display !== 'none';
      
      if (isOnboardingVisible) {
        tg.MainButton.setText('🍀 Сохранить профиль');
        tg.MainButton.onClick(() => {
          saveProfileBtn.click();
        });
        tg.MainButton.show();
      } else {
        tg.MainButton.setText('🍀 SiaMatch');
        tg.MainButton.onClick(null); // Очищаем предыдущий обработчик
        tg.MainButton.show();
      }
    }
  }

  // Инициализация
  updateMainButton();
  
  // Паддинг для карточки онбординга
  const onboardingCard = document.querySelector('#onboarding-screen #card');
  if (onboardingCard) {
    onboardingCard.style.paddingBottom = '120px';
  }

  // Telegram user - ФИКС 1
  let user = tg?.initDataUnsafe?.user || null;
  if (user && usernameElem) {
    const name = user.first_name || user.username || "друг";
    usernameElem.textContent = `Привет, ${name}!`;
  } else {
    usernameElem.textContent = "Привет, друг! 👋";
    user = { id: 1, first_name: "Тестовый", username: "user" }; // ДЕМО
  }

  // Telegram фото автоматически
  if (user?.photo_url) {
    profileData = loadProfile() || {};  // ← loadProfile() вместо null
    profileData.telegram_photo_url = user.photo_url;
    saveProfile(profileData);
  }

  // === localStorage ===
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
    } catch (e) {
      console.error("saveProfile error:", e);
    }
  }

  // === Демо-данные с городами ===
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

  // === ФИЛЬТРАЦИЯ КАНДИДАТОВ - ФИКС 3 ===
  function getFilteredCandidates() {
    if (!profileData) {
      console.log("❌ profileData пустой!");
      return []; 
    }
    
    // ДЕМО: всегда показывать всех для теста
    let filtered = candidates.filter(c => !likedIds.includes(c.id));
    console.log("📊 Найдено кандидатов:", filtered.length);
    return filtered;
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Радиус Земли в км
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // === ГЕОЛОКАЦИЯ ===
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
        alert(`📍 Геолокация: ${Math.round(position.coords.accuracy)}м точность`);
        showCurrentCandidate();
      },
      () => alert("Геолокация отклонена. Ищем по городу."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // === ЛЕНТА ===
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
    // ФИКС 2 - дефолт фото
    candidatePhoto.src = c.photo || 'https://via.placeholder.com/300x400/22c55e/f0fdf4?text=🍀';
    candidateName.textContent = c.name;
    candidateAge.textContent = c.age;
    candidateCity.textContent = c.city;
    
    // Расстояние
    if (profileData.use_geolocation && userLocation && c.latitude && c.longitude) {
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

  btnLike.addEventListener("click", () => {
    const filtered = getFilteredCandidates();
    if (currentIndex < filtered.length) {
      likedIds.push(filtered[currentIndex].id);
      currentIndex += 1;
      showCurrentCandidate();
    }
  });

  btnDislike.addEventListener("click", () => {
    const filtered = getFilteredCandidates();
    if (currentIndex < filtered.length) {
      currentIndex += 1;
      showCurrentCandidate();
    }
  });

  // === ТАБЫ ===
  function setActiveTab(tab) {
    console.log("🔥 TAB:", tab);
    
    // 1. СКРЫТЬ ОНБОРДИНГ
    document.getElementById('onboarding-screen').style.display = 'none';
    
    // 2. СКРЫТЬ ВСЕ ЭКРАНЫ display: none!
    document.querySelectorAll('.screen').forEach(screen => {
      screen.style.display = 'none';
    });
    
    // 3. ПОКАЗАТЬ ТОЛЬКО ОДИН
    if (tab === 'chats') {
      document.getElementById('screen-chats').style.display = 'block';
    } else if (tab === 'feed') {
      document.getElementById('screen-feed').style.display = 'block';
      currentIndex = 0;
      showCurrentCandidate();
    } else if (tab === 'profile') {
      document.getElementById('screen-profile').style.display = 'block';
    }
    
    // 4. АКТИВНЫЙ ТАБ
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    // Обновляем MainButton при смене табов
    updateMainButton();
  }

  // ДИАГНОСТИКА кнопок ПОСЛЕ объявления setActiveTab()
  console.log("Кнопок найдено:", tabButtons.length);
  tabButtons.forEach((btn, i) => {
    console.log(`Кнопка ${i}:`, btn.dataset.tab);
    btn.addEventListener("click", () => setActiveTab(btn.dataset.tab));
  });

  // === ОНБОРДИНГ ===
  saveProfileBtn.addEventListener("click", () => {
    const ageValue = Number(document.getElementById("age").value);
    const gender = document.getElementById("gender").value;
    const city = document.getElementById("city").value;
    const bio = document.getElementById("bio").value.trim();

    if (!ageValue || ageValue < 18 || ageValue > 99) return alert("Возраст 18-99");
    if (!gender) return alert("Выберите пол");
    if (!city) return alert("Выберите город");
    if (bio.length < 10) return alert("О себе минимум 10 символов");

    profileData = {
      tg_id: user ? user.id : null,
      first_name: user ? user.first_name : null,
      username: user ? user.username : null,
      age: ageValue, gender, city, bio,
      min_age_filter: 18, max_age_filter: 35, max_distance_km: 50,
      use_geolocation: false
    };

    saveProfile(profileData);

    // Заполняем профиль
    profileAge.value = ageValue;
    profileGender.value = gender;
    profileCity.value = city;
    profileBio.value = bio;
    profileMinAge.value = 18;
    profileMaxAge.value = 35;
    profileMaxDistance.value = 50;

    onboardingScreen.style.display = "none";
    tabBar.classList.remove("hidden");
    setActiveTab("feed");
    alert("Профиль сохранён! Добро пожаловать 🍀");
    
    // Переключить на SiaMatch после сохранения
    updateMainButton();
  });

  // === РЕДАКТИРОВАНИЕ ПРОФИЛЯ ===
  updateProfileBtn.addEventListener("click", () => {
    if (!profileData) return alert("Сначала заполните профиль!");

    profileData.age = Number(profileAge.value);
    profileData.gender = profileGender.value;
    profileData.city = profileCity.value;
    profileData.bio = profileBio.value.trim();
    profileData.min_age_filter = Number(profileMinAge.value);
    profileData.max_age_filter = Number(profileMaxAge.value);
    profileData.max_distance_km = Number(profileMaxDistance.value);
    profileData.use_geolocation = document.getElementById("profile-use-geolocation").checked;

    if (profileData.use_geolocation && !userLocation) requestUserLocation();

    saveProfile(profileData);
    alert("Профиль обновлён! Фильтры применены ✏️");
  });

  // === ИНИЦИАЛИЗАЦИЯ ===
  (function initOnStart() {
    profileData = loadProfile();
    if (!profileData) return;

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

    onboardingScreen.style.display = "none";
    tabBar.classList.remove("hidden");
    
    // Обновляем MainButton
    updateMainButton();
  })();

  // 🚀 СУПЕР КЛАВИАТУРА iOS
  ['click', 'touchend'].forEach(event => {
    document.addEventListener(event, (e) => {
      if (!e.target.closest('input, textarea, select, .primary')) {
        e.preventDefault();
        document.activeElement?.blur();
        if (tg) tg.HapticFeedback?.selectionChanged();
        setTimeout(() => window.scrollTo(0, 0), 100); // iOS scroll fix
      }
    }, true);
  });

  // iOS resize fix
  window.addEventListener('resize', () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.activeElement?.blur();
  });

  // Безопасные addEventListener
  const safeAddEvent = (el, event, handler) => {
    if (el) el.addEventListener(event, handler);
  };

  safeAddEvent(document.getElementById("profile-use-geolocation"), "change", (e) => {
    if (profileData) {
      profileData.use_geolocation = e.target.checked;
      if (e.target.checked && !userLocation) requestUserLocation();
    }
  });

  safeAddEvent(document.getElementById('profile-photo'), 'change', (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      alert('Фото слишком большое (макс 5MB)');
      return;
    }
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        profileData = profileData || {};
        profileData.custom_photo_url = ev.target.result;
        document.getElementById('photo-preview').src = ev.target.result;
        document.getElementById('photo-preview').style.display = 'block';
        saveProfile(profileData);
        alert('Фото загружено! 📸');
      };
      reader.readAsDataURL(file);
    }
  });

}); // Закрытие DOMContentLoaded
