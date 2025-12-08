// ===== SiaMatch app.js: онбординг + фильтры + 3 вкладки =====

let tg = null;
try {
  if (window.Telegram && Telegram.WebApp) {
    tg = Telegram.WebApp;
    tg.ready();
    
    // Telegram WebApp ПОЛНЫЙ ЭКРАН
    if (tg) {
      tg.expand();                    // ← Полноэкранный режим
      tg.requestViewport();          // ← Telegram viewport
      document.body.style.padding = '0';
      document.body.style.margin = '0';
      document.body.style.alignItems = 'stretch';  // ← КРИТИЧНО!
    }
    
    // Адаптация под Telegram
    if (tg) {
      tg.MainButton.setText('🍀 SiaMatch').show();
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

// Telegram user
let user = null;
try {
  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    user = tg.initDataUnsafe.user;
  }
} catch (e) {
  console.error("Cannot read initDataUnsafe.user:", e);
}

if (user) {
  const name = user.first_name || user.username || "друг";
  usernameElem.textContent = `Привет, ${name}!`;
  
  // Telegram фото автоматически
  if (user && user.photo_url) {
    profileData = profileData || {};
    profileData.telegram_photo_url = user.photo_url;
    saveProfile(profileData);
  }
} else {
  usernameElem.textContent = "Информация о пользователе недоступна.";
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

// === ФИЛЬТРАЦИЯ КАНДИДАТОВ ===
function getFilteredCandidates() {
  if (!profileData) return [];
  
  const oppositeGender = profileData.gender === 'male' ? 'female' : 'male';
  let filtered = candidates.filter(c => 
    c.gender === oppositeGender &&
    c.age >= profileData.min_age_filter &&
    c.age <= profileData.max_age_filter &&
    !likedIds.includes(c.id)
  );

  // ГЕОЛОКАЦИЯ ВКЛЮЧЕНА
  if (profileData.use_geolocation && userLocation && profileData.max_distance_km) {
    filtered = filtered.filter(c => {
      if (!c.latitude || !c.longitude) return false;
      const dist = calculateDistance(userLocation.lat, userLocation.lon, c.latitude, c.longitude);
      return dist <= profileData.max_distance_km;
    });
  } else {
    filtered = filtered.filter(c => c.city === profileData.city);
  }
  
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
  candidatePhoto.src = c.custom_photo_url || c.telegram_photo_url || 'default-avatar.png';
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
  console.log("🔄 setActiveTab:", tab);
  
  // ✅ СБРОСИТЬ currentIndex при переключении
  if (tab === "feed") currentIndex = 0;
  
  // ✅ 1. УБРАТЬ hidden КЛАССЫ СО ВСЕХ
  screenChats.classList.remove("hidden");
  screenFeed.classList.remove("hidden");
  screenProfile.classList.remove("hidden");
  
  // ✅ 2. display: none ВСЕМ
  screenChats.style.display = 'none';
  screenFeed.style.display = 'none';
  screenProfile.style.display = 'none';
  
  // ✅ 3. СКРЫТЬ ХЕДЕР
  document.querySelector('.logo').style.display = 'none';
  document.querySelector('.app-name').style.display = 'none';
  document.querySelector('h1').style.display = 'none';
  document.getElementById('username').style.display = 'none';

  // ✅ 4. АКТИВНАЯ КНОПКА
  tabButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });

  // ✅ 5. ПОКАЗАТЬ ТОЛЬКО ОДИН
  if (tab === "chats") {
    screenChats.style.display = 'block';
  } else if (tab === "feed") {
    screenFeed.style.display = 'block';
    showCurrentCandidate();
  } else if (tab === "profile") {
    screenProfile.style.display = 'block';
  }
}

tabButtons.forEach(btn => {
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
  
  // ✅ УБРАНО setActiveTab("feed") — табы работают по кнопкам!
})();

// === СЛУШАТЕЛЬ ЧЕКБОКСА ГЕОЛОКАЦИИ ===
document.getElementById("profile-use-geolocation").addEventListener("change", (e) => {
  profileData.use_geolocation = e.target.checked;
  if (e.target.checked && !userLocation) requestUserLocation();
});

// Скрытие клавиатуры при клике вне input
document.addEventListener('click', (e) => {
  if (!e.target.closest('input, textarea, select')) {
    document.activeElement?.blur();
  }
});

// Загрузка фото
document.getElementById('profile-photo').addEventListener('change', (e) => {
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
