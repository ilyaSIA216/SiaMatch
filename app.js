// ===== SiaMatch app.js (боевой вариант без лишней сложности) =====

// Пытаемся аккуратно инициализировать Telegram WebApp
let tg = null;
try {
  if (window.Telegram && Telegram.WebApp) {
    tg = Telegram.WebApp;
    tg.ready();
    tg.expand();
  }
} catch (e) {
  console.error("Telegram WebApp init error:", e);
}

// DOM-элементы
const usernameElem = document.getElementById("username");
const profileForm = document.getElementById("profile-form");
const mainBtn = document.getElementById("mainButton");

// Берём пользователя из Telegram, если доступен
let user = null;
try {
  if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    user = tg.initDataUnsafe.user;
  }
} catch (e) {
  console.error("Cannot read initDataUnsafe.user:", e);
}

// Приветствие
if (user) {
  const name = user.first_name || user.username || "друг";
  usernameElem.textContent = `Привет, ${name}!`;
} else {
  usernameElem.textContent = "Информация о пользователе недоступна.";
}

// Работа с localStorage
function loadProfileFromStorage() {
  try {
    const raw = localStorage.getItem("siamatch_profile");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse profile from storage", e);
    return null;
  }
}

function saveProfileToStorage(profile) {
  try {
    localStorage.setItem("siamatch_profile", JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile", e);
  }
}

// Основная логика

function setupWithStoredProfile(profile) {
  profileForm.style.display = "block";
  document.getElementById("age").value = profile.age || "";
  document.getElementById("gender").value = profile.gender || "other";
  document.getElementById("bio").value = profile.bio || "";
  mainBtn.textContent = "Сохранить профиль 🍀";
  mainBtn.onclick = saveProfile;
}

function setupInitial() {
  mainBtn.onclick = () => {
    profileForm.style.display = "block";
    mainBtn.textContent = "Сохранить профиль 🍀";
    mainBtn.onclick = saveProfile;
  };
}

// Проверяем, есть ли уже сохранённый профиль
const storedProfile = loadProfileFromStorage();
if (storedProfile) {
  setupWithStoredProfile(storedProfile);
} else {
  setupInitial();
}

function saveProfile() {
  const ageValue = Number(document.getElementById("age").value);
  const gender = document.getElementById("gender").value;
  const bio = document.getElementById("bio").value.trim();

  if (!ageValue || ageValue < 18 || ageValue > 99) {
    alert("Укажите возраст от 18 до 99 лет");
    return;
  }

  if (bio.length < 10) {
    alert("Напишите о себе хотя бы 10 символов");
    return;
  }

  const profileData = {
    tg_id: user ? user.id : null,
    first_name: user ? user.first_name : null,
    username: user ? user.username : null,
    age: ageValue,
    gender,
    bio
  };

  console.log("Profile data:", profileData);
  saveProfileToStorage(profileData);

  alert("Профиль сохранён! Дальше добавим ленту знакомств и мэтчи 🍀");
}
