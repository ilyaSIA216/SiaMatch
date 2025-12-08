// ===== SiaMatch app.js: онбординг + 3 вкладки =====

// Аккуратно инициализируем Telegram WebApp
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

// DOM
const usernameElem = document.getElementById("username");

// Onboarding
const onboardingScreen = document.getElementById("onboarding-screen");
const saveProfileBtn = document.getElementById("saveProfileBtn");

// Табы
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
const candidateBio = document.getElementById("candidate-bio");
const btnLike = document.getElementById("btn-like");
const btnDislike = document.getElementById("btn-dislike");
const feedStatus = document.getElementById("feed-status");

// Профиль/редактирование
const profileAge = document.getElementById("profile-age");
const profileGender = document.getElementById("profile-gender");
const profileBio = document.getElementById("profile-bio");
const updateProfileBtn = document.getElementById("updateProfileBtn");

// Чаты (заглушка)
const chatsList = document.getElementById("chats-list");
const chatsEmpty = document.getElementById("chats-empty");

// Пользователь Telegram
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
} else {
  usernameElem.textContent = "Информация о пользователе недоступна.";
}

// === Работа с localStorage ===

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

// === Мок-данные кандидатов ===

const candidates = [
  {
    id: 1,
    name: "Алина",
    age: 24,
    city: "Москва",
    bio: "Люблю путешествия, кофе и долгие разговоры.",
    photo:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&w=800"
  },
  {
    id: 2,
    name: "Дмитрий",
    age: 28,
    city: "Санкт-Петербург",
    bio: "Инженер, обожаю походы и настолки.",
    photo:
      "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&w=800"
  },
  {
    id: 3,
    name: "Екатерина",
    age: 26,
    city: "Казань",
    bio: "Фотограф, коты и книги — моя слабость.",
    photo:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&w=800"
  }
];

let currentIndex = 0;
const likedIds = [];

// === Лента ===

function showCurrentCandidate() {
  if (currentIndex >= candidates.length) {
    candidatePhoto.src = "";
    candidateName.textContent = "";
    candidateAge.textContent = "";
    candidateCity.textContent = "";
    candidateBio.textContent = "";
    feedStatus.textContent =
      likedIds.length > 0
        ? `На сегодня всё! Лайков: ${likedIds.length}.`
        : "На сегодня всё! Новые люди появятся позже.";
    btnLike.disabled = true;
    btnDislike.disabled = true;
    return;
  }

  const c = candidates[currentIndex];
  candidatePhoto.src = c.photo;
  candidateName.textContent = c.name;
  candidateAge.textContent = c.age;
  candidateCity.textContent = c.city;
  candidateBio.textContent = c.bio;
  feedStatus.textContent = "";
  btnLike.disabled = false;
  btnDislike.disabled = false;
}

btnLike.addEventListener("click", () => {
  if (currentIndex >= candidates.length) return;
  likedIds.push(candidates[currentIndex].id);
  currentIndex += 1;
  showCurrentCandidate();
});

btnDislike.addEventListener("click", () => {
  if (currentIndex >= candidates.length) return;
  currentIndex += 1;
  showCurrentCandidate();
});

// === Табы ===

function setActiveTab(tab) {
  // все экраны скрыть
  screenChats.classList.add("hidden");
  screenFeed.classList.add("hidden");
  screenProfile.classList.add("hidden");

  tabButtons.forEach((btn) => {
    if (btn.dataset.tab === tab) btn.classList.add("active");
    else btn.classList.remove("active");
  });

  if (tab === "chats") {
    screenChats.classList.remove("hidden");
  } else if (tab === "feed") {
    screenFeed.classList.remove("hidden");
  } else if (tab === "profile") {
    screenProfile.classList.remove("hidden");
  }
}

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    setActiveTab(tab);
  });
});

// === Переход из онбординга в полноценное приложение ===

saveProfileBtn.addEventListener("click", () => {
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

  saveProfile(profileData);

  // Заполняем поля в экране редактирования
  profileAge.value = ageValue;
  profileGender.value = gender;
  profileBio.value = bio;

  // Скрываем онбординг, показываем таб-бар и стартуем с ленты
  onboardingScreen.style.display = "none";
  tabBar.classList.remove("hidden");
  setActiveTab("feed");
  showCurrentCandidate();

  alert("Профиль сохранён! Добро пожаловать в SiaMatch 🍀");
});

// === Экран «Мой профиль» (редактирование) ===

updateProfileBtn.addEventListener("click", () => {
  const ageValue = Number(profileAge.value);
  const gender = profileGender.value;
  const bio = profileBio.value.trim();

  if (!ageValue || ageValue < 18 || ageValue > 99) {
    alert("Укажите возраст от 18 до 99 лет");
    return;
  }
  if (bio.length < 10) {
    alert("Напишите о себе хотя бы 10 символов");
    return;
  }

  const existing = loadProfile() || {};
  const updated = {
    ...existing,
    age: ageValue,
    gender,
    bio
  };
  saveProfile(updated);
  alert("Профиль обновлён ✏️");
});

// === При старте: если профиль уже есть, сразу показываем табы ===

(function initOnStart() {
  const stored = loadProfile();
  if (!stored) {
    // первый запуск — остаёмся на онбординге
    return;
  }

  // заполняем онбординг и экран профиля
  document.getElementById("age").value = stored.age || "";
  document.getElementById("gender").value = stored.gender || "other";
  document.getElementById("bio").value = stored.bio || "";

  profileAge.value = stored.age || "";
  profileGender.value = stored.gender || "other";
  profileBio.value = stored.bio || "";

  onboardingScreen.style.display = "none";
  tabBar.classList.remove("hidden");
  setActiveTab("feed");
  showCurrentCandidate();
})();
