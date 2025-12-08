// Инициализация Telegram Mini App
Telegram.WebApp.ready();
Telegram.WebApp.expand();

// Применяем тему Telegram, если есть
const theme = Telegram.WebApp.themeParams || {};
if (theme.bg_color) {
  document.documentElement.style.setProperty("--tg-theme-bg-color", theme.bg_color);
}
if (theme.text_color) {
  document.documentElement.style.setProperty("--tg-theme-text-color", theme.text_color);
}

// Данные пользователя из Telegram
const user = Telegram.WebApp.initDataUnsafe
  ? Telegram.WebApp.initDataUnsafe.user
  : null;

const usernameElem = document.getElementById("username");
const profileForm = document.getElementById("profile-form");
const mainBtn = document.getElementById("mainButton");

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

// Приветствие
if (user) {
  const name = user.first_name || user.username || "друг";
  usernameElem.textContent = `Привет, ${name}!`;
} else {
  usernameElem.textContent = "Информация о пользователе недоступна.";
}

// Проверяем, есть ли уже сохранённый профиль
const storedProfile = loadProfileFromStorage();
if (storedProfile) {
  profileForm.style.display = "block";
  document.getElementById("age").value = storedProfile.age || "";
  document.getElementById("gender").value = storedProfile.gender || "other";
  document.getElementById("bio").value = storedProfile.bio || "";
  mainBtn.textContent = "Сохранить профиль 🍀";
  mainBtn.onclick = saveProfile;
} else {
  mainBtn.onclick = () => {
    profileForm.style.display = "block";
    mainBtn.textContent = "Сохранить профиль 🍀";
    mainBtn.onclick = saveProfile;
  };
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

  // Заглушка под будущий запрос к бэкенду
  // async function sendProfileToServer(profile) { ... }

  alert("Профиль сохранён! Дальше добавим ленту знакомств и мэтчи 🍀");
}
