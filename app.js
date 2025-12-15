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
  
  // Новые переменные для перетаскивания фотографий
  let draggedPhotoIndex = null;
  let draggedOverPhotoIndex = null;
  
  // Фильтры поиска
  let searchFilters = {
    minAge: 18,
    maxAge: 35,
    genders: [],
    interests: [],
    datingGoal: ''
  };
  
  // Верификация
  let verificationStatus = 'not_verified';
  let verificationPhoto = null;
  
  // Система лайков
  let usersWhoLikedMeCount = 0;
  let lastLikesCount = 0;
  let newLikesReceived = false;
  
  // Интересы пользователя
  let userInterests = [];
  let datingGoal = '';
  let maxInterests = 5;
  
  // Система буста
  let boostActive = false;
  let boostEndTime = null;
  
  // Система свайпов
  let remainingSwipes = 20;
  let maxSwipesPerDay = 20;
  
  // Система чатов и жалоб
  let matchedUsers = [];
  let currentChatId = null;
  let chatMessages = {};
  let userReports = [];
  
  // Ожидающие подтверждения бонусы
  let pendingBonusVerifications = [];
  
  // Система свайпов и фотографий
  let candidatePhotos = [];
  let currentPhotoIndex = 0;
  let candidateInterests = [];
  let swipeStartX = 0;
  let swipeStartY = 0;
  let isSwiping = false;
  let currentCandidateId = null;
  
  // Демо-данные кандидатов
  const candidates = [
    {
      id: 1,
      name: "Алина",
      age: 24,
      gender: "female",
      city: "Москва",
      bio: "Люблю кофе ☕ Москва ❤️. Ищу серьезные отношения.",
      photos: [
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=800"
      ],
      verified: true,
      verification_status: 'verified',
      interests: ["travel", "movies", "photography", "tattoos", "wine"],
      dating_goal: "marriage",
      boosted: true,
      boost_end: Date.now() + 24 * 60 * 60 * 1000
    },
    {
      id: 2,
      name: "Дмитрий",
      age: 28,
      gender: "male",
      city: "Санкт-Петербург",
      bio: "Инженер, люблю спорт и путешествия. Ищу активную девушку.",
      photos: [
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800"
      ],
      verified: false,
      verification_status: 'pending',
      interests: ["sport", "travel", "cars", "workout", "photography"],
      dating_goal: "dating",
      boosted: false
    },
    {
      id: 3,
      name: "Екатерина",
      age: 26,
      gender: "female",
      city: "Москва",
      bio: "Фотограф, люблю искусство и природу. Ищу творческого человека.",
      photos: [
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=800",
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=800"
      ],
      verified: true,
      verification_status: 'verified',
      interests: ["art", "photography", "travel", "wine", "tattoos"],
      dating_goal: "friendship",
      boosted: false
    }
  ];
  
  // Демо-данные мэтчей для чатов
  const demoMatches = [
    {
      id: 101,
      name: "Алексей",
      age: 28,
      gender: "male",
      city: "Москва",
      bio: "Дизайнер, люблю искусство и путешествия",
      photo: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=800",
      verified: true,
      interests: ["art", "travel", "photography", "tattoos"],
      matched_date: "2024-01-15",
      unread: 2
    },
    {
      id: 102,
      name: "Мария",
      age: 25,
      gender: "female",
      city: "Санкт-Петербург",
      bio: "Программист, увлекаюсь спортом и музыкой",
      photo: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=800",
      verified: true,
      interests: ["sport", "music", "gaming", "workout"],
      matched_date: "2024-01-14",
      unread: 0
    }
  ];
  
  // Демо сообщения для чатов
  const demoMessages = {
    101: [
      { id: 1, sender: 'other', text: 'Привет! Как дела?', time: '10:30', date: '2024-01-15' },
      { id: 2, sender: 'me', text: 'Привет! Всё отлично, а у тебя?', time: '10:32', date: '2024-01-15' },
      { id: 3, sender: 'other', text: 'Тоже хорошо! Вижу, ты любишь искусство?', time: '10:35', date: '2024-01-15' },
      { id: 4, sender: 'me', text: 'Да, очень! Часто хожу на выставки', time: '10:40', date: '2024-01-15' },
      { id: 5, sender: 'other', text: 'Круто! Может сходим вместе когда-нибудь?', time: '10:45', date: '2024-01-15' }
    ],
    102: [
      { id: 1, sender: 'me', text: 'Привет! Вижу, ты программист?', time: '14:20', date: '2024-01-14' },
      { id: 2, sender: 'other', text: 'Да! Занимаюсь веб-разработкой 3 года', time: '14:25', date: '2024-01-14' },
      { id: 3, sender: 'me', text: 'Круто! Я тоже в IT сфере', time: '14:30', date: '2024-01-14' },
      { id: 4, sender: 'other', text: 'Отлично! Есть о чём поговорить 😊', time: '14:35', date: '2024-01-14' }
    ]
  };
  
  // ===== DOM ЭЛЕМЕНТЫ =====
  const welcomeScreen = document.getElementById("welcome-screen");
  const animatedWelcomeScreen = document.getElementById("welcome-animated-screen");
  const startBtn = document.getElementById("startBtn");
  const usernameElem = document.getElementById("username");
  const onboardingScreen = document.getElementById("onboarding-screen");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const tabBar = document.getElementById("tab-bar");
  const appRoot = document.getElementById("app-root");
  const card = document.getElementById("card");
  
  // Элементы для системы лайков
  const likesBadge = document.getElementById('likes-badge');
  const likesCountElement = document.getElementById('likes-count');
  const likesCountBadge = document.getElementById('likes-count-badge');
  const newLikesNotification = document.getElementById('new-likes-notification');
  const tabChatsBadge = document.getElementById('tab-chats-badge');
  
  // Фильтры поиска
  const saveFiltersBtn = document.getElementById('save-filters-btn');
  const searchMinAge = document.getElementById('search-min-age');
  const searchMaxAge = document.getElementById('search-max-age');
  
  // Интересы пользователя
  const datingGoalSelect = document.getElementById('dating-goal');
  const saveDatingGoalBtn = document.getElementById('save-dating-goal');
  
  // Система свайпов
  const swipesInfo = document.getElementById('swipes-info');
  const remainingSwipesElement = document.getElementById('remaining-swipes');
  const buySwipesBtn = document.getElementById('buy-swipes-btn');
  
  // ===== ✅ СИНХРОНИЗАЦИЯ С CLOUDSTORAGE =====
  async function saveProfile(obj) {
    if (!tg) return localSave(obj); // fallback
    
    try {
      const cloudData = {...obj, photos: obj.photos || []};
      await tg.CloudStorage.setItem('siamatch_profile', JSON.stringify(cloudData));
      localStorage.setItem('siamatchprofile', JSON.stringify(cloudData)); // дублируем
      console.log('✅ CloudStorage сохранено:', cloudData.photos?.length);
      return true;
    } catch(e) {
      console.error('CloudStorage ошибка:', e);
      return localSave(obj);
    }
  }

  async function loadProfile() {
    if (!tg || tg.version < '6.1') {
    console.log('📱 Telegram <6.1 → только localStorage');
    return localLoad();
  }
    
    if (!tg) return localLoad();
    
    try {
      const cloudData = await tg.CloudStorage.getItem('siamatch_profile');
      if (cloudData.value) {
        const profile = JSON.parse(cloudData.value);
        localStorage.setItem('siamatchprofile', cloudData.value);
        console.log('✅ Загружено из CloudStorage:', profile.photos?.length);
        return profile;
      }
    } catch(e) {
      console.error('CloudStorage загрузка:', e);
    }
    return localLoad();
  }

  // Локальные заглушки
  function localSave(obj) {
    try {
      console.log('🔄 Локальное сохранение профиля...', obj);
      
      if (!obj || typeof obj !== 'object') {
        console.error('❌ Некорректный объект профиля');
        return false;
      }
      
      // Убедимся, что photos - это правильный массив
      if (!obj.photos || !Array.isArray(obj.photos)) {
        console.warn('⚠️ photos не является массивом, исправляем...');
        obj.photos = [];
      }
      
      // iOS ОПТИМИЗАЦИЯ: Обработка Data URL для iOS
      let photosToSave = [];
      
      if (obj.photos.length > 0) {
        console.log(`📸 iOS: Обработка ${obj.photos.length} фото...`);
        
        obj.photos.forEach((photo, index) => {
          if (typeof photo === 'string' && photo.startsWith('data:image')) {
            // Для iOS сохраняем фото в отдельном ключе localStorage
            const photoKey = `siamatch_photo_${obj.tg_id || 1}_${index}`;
            
            try {
              // Проверяем размер Data URL
              if (photo.length > 1000000) { // Более 1MB
                console.warn(`⚠️ Фото ${index} слишком большое для iOS: ${Math.round(photo.length / 1024)}KB`);
                
                // Сжимаем фото для iOS
                const compressedPhoto = compressImageForIOS(photo);
                if (compressedPhoto) {
                  localStorage.setItem(photoKey, compressedPhoto);
                  photosToSave.push(`local:${photoKey}`);
                  console.log(`✅ Фото ${index} сжато и сохранено в отдельном ключе`);
                } else {
                  // Если не удалось сжать, сохраняем ссылку
                  photosToSave.push(photo.substring(0, 50000)); // Обрезаем для безопасности
                }
              } else {
                // Нормальный размер, сохраняем целиком
                localStorage.setItem(photoKey, photo);
                photosToSave.push(`local:${photoKey}`);
                console.log(`✅ Фото ${index} сохранено в отдельном ключе`);
              }
            } catch (photoError) {
              console.error(`❌ Ошибка сохранения фото ${index}:`, photoError);
              // Сохраняем как обычный URL если есть
              photosToSave.push(photo.substring(0, 50000));
            }
          } else if (typeof photo === 'string' && photo.startsWith('http')) {
            // Внешние URL сохраняем как есть
            photosToSave.push(photo);
          } else {
            // Другие типы - пропускаем
            console.warn(`⚠️ Неизвестный тип фото ${index}:`, typeof photo);
          }
        });
      } else {
        photosToSave = [];
      }
      
      // Создаем профиль с оптимизированными фото
      const profileToSave = {
        tg_id: obj.tg_id || 1,
        first_name: obj.first_name || "Пользователь",
        age: obj.age || 18,
        gender: obj.gender || "",
        city: obj.city || "",
        bio: obj.bio || "",
        photos: photosToSave, // Используем оптимизированный массив
        verification_status: obj.verification_status || 'not_verified',
        last_save: Date.now()
      };
      
      // Сохраняем основную информацию профиля
      const jsonString = JSON.stringify(profileToSave);
      localStorage.setItem("siamatch_profile", jsonString);
      
      // iOS: Сохраняем дополнительную информацию о фото
      if (isIOS) {
        localStorage.setItem("siamatch_ios_photos_count", photosToSave.length.toString());
        console.log(`📱 iOS: сохранено ${photosToSave.length} фото в отдельных ключах`);
      }
      
      console.log('✅ Профиль сохранен для iOS');
      return true;
      
    } catch (e) {
      console.error("❌ Критическая ошибка сохранения профиля для iOS:", e);
      
      // Аварийное сохранение без фото
      try {
        const fallbackProfile = {
          tg_id: obj.tg_id || 1,
          first_name: obj.first_name || "Пользователь",
          age: obj.age || 18,
          gender: obj.gender || "",
          city: obj.city || "",
          bio: obj.bio || "",
          photos: [], // Пустой массив для iOS
          verification_status: obj.verification_status || 'not_verified',
          emergency_save: true
        };
        localStorage.setItem("siamatch_profile", JSON.stringify(fallbackProfile));
        console.log('✅ Аварийное сохранение профиля без фото для iOS');
        return true;
      } catch (e2) {
        console.error("❌ Не удалось сохранить даже упрощенный профиль:", e2);
        return false;
      }
    }
  }

  function localLoad() {
    try {
      const raw = localStorage.getItem("siamatch_profile");
      if (!raw) return null;
      
      let profile = JSON.parse(raw);
      
      console.log('📂 iOS: Загружен профиль:', {
        hasPhotos: !!profile.photos,
        photosCount: profile.photos ? profile.photos.length : 0,
        structure: Object.keys(profile)
      });
      
      // iOS: Восстанавливаем фото из отдельных ключей
      if (isIOS && profile.photos && Array.isArray(profile.photos)) {
        const restoredPhotos = [];
        
        profile.photos.forEach((photoRef, index) => {
          if (typeof photoRef === 'string' && photoRef.startsWith('local:')) {
            // Фото сохранено в отдельном ключе
            const photoKey = photoRef.replace('local:', '');
            try {
              const photoData = localStorage.getItem(photoKey);
              if (photoData && photoData.startsWith('data:image')) {
                restoredPhotos.push(photoData);
                console.log(`✅ iOS: Восстановлено фото ${index} из ключа ${photoKey}`);
              } else {
                console.warn(`⚠️ iOS: Не удалось восстановить фото из ключа ${photoKey}`);
              }
            } catch (e) {
              console.error(`❌ iOS: Ошибка загрузки фото ${index}:`, e);
            }
          } else if (typeof photoRef === 'string' && photoRef.startsWith('data:image')) {
            // Прямой Data URL
            restoredPhotos.push(photoRef);
          } else if (typeof photoRef === 'string' && photoRef.startsWith('http')) {
            // Внешний URL
            restoredPhotos.push(photoRef);
          }
        });
        
        profile.photos = restoredPhotos;
        console.log(`📱 iOS: Восстановлено ${restoredPhotos.length} фото`);
      }
      
      // Убедимся, что photos - это массив
      if (!profile.photos || !Array.isArray(profile.photos)) {
        profile.photos = [];
      }
      
      // Переносим старое фото в массив если нужно
      if (profile.custom_photo_url && !profile.photos.includes(profile.custom_photo_url)) {
        profile.photos.push(profile.custom_photo_url);
        delete profile.custom_photo_url;
        console.log('📸 Перенесено старое фото в массив');
      }
      
      return profile;
    } catch (e) {
      console.error("❌ Ошибка загрузки профиля для iOS:", e);
      return null;
    }
  }

  // ===== ФУНКЦИИ ДЛЯ iOS LOCALSTORAGE =====
  function checkIOSStorage() {
    if (!isIOS) return;
    
    console.log('📱 Проверка localStorage для iOS...');
    
    try {
      const keys = Object.keys(localStorage);
      let totalSize = 0;
      
      keys.forEach(key => {
        const itemSize = localStorage.getItem(key).length;
        totalSize += itemSize;
        
        if (itemSize > 500000) { // Больше 500KB
          console.warn(`📱 Большой элемент: ${key} - ${Math.round(itemSize / 1024)}KB`);
          
          if (key === 'siamatch_profile') {
            const data = JSON.parse(localStorage.getItem(key));
            if (data.photos && Array.isArray(data.photos)) {
              // Оставляем только первое фото для iOS
              if (data.photos.length > 1) {
                data.photos = [data.photos[0]];
                localStorage.setItem(key, JSON.stringify(data));
                console.log('📱 Очищены фото для iOS, оставлено только первое');
              }
            }
          }
        }
      });
      
      console.log(`📱 Общий размер localStorage: ${Math.round(totalSize / 1024)}KB`);
      
      if (totalSize > 2000000) { // Более 2MB
        console.warn('📱 localStorage слишком большой для iOS, очищаем...');
        // Очищаем старые данные
        localStorage.removeItem('siamatch_admin_pending_bonuses');
        localStorage.removeItem('siamatch_admin_reports');
      }
    } catch (e) {
      console.error('📱 Ошибка проверки хранилища iOS:', e);
    }
  }
  
  function autoSaveForIOS() {
    if (!isIOS || !profileData) return;
    
    console.log('📱 Автосохранение для iOS...');
    
    try {
      // Используем обычное сохранение, которое уже оптимизировано для iOS
      saveProfile(profileData);
      console.log('📱 Автосохранение завершено для iOS');
    } catch (e) {
      console.error('📱 Ошибка автосохранения iOS:', e);
    }
  }
  
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
    
    originalHeight = window.innerHeight;
    window.addEventListener('resize', handleResize);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    document.addEventListener('touchstart', handleTouchOutside);
  }
  
  function handleResize() {
    const newHeight = window.innerHeight;
    const heightDiff = originalHeight - newHeight;
    
    if (heightDiff > 100) {
      keyboardHeight = heightDiff;
      document.body.classList.add('keyboard-open');
      
      if (card) {
        card.style.transform = `translateY(-${Math.min(150, keyboardHeight - 100)}px)`;
      }
      
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
    else if (Math.abs(originalHeight - newHeight) < 50) {
      document.body.classList.remove('keyboard-open');
      
      if (card) {
        card.style.transform = 'translateY(0)';
      }
      
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
      if (isIOS) {
        setTimeout(() => {
          document.body.classList.add('keyboard-open');
        }, 100);
      }
    }
  }
  
  function handleFocusOut(e) {
    if (e.target.matches('input, textarea, select')) {
      if (isIOS) {
        setTimeout(() => {
          const activeElement = document.activeElement;
          if (!activeElement || !activeElement.matches('input, textarea, select')) {
            document.body.classList.remove('keyboard-open');
            if (card) card.style.transform = 'translateY(0)';
          }
        }, 500);
      }
    }
  }
  
  function handleTouchOutside(e) {
    if (!e.target.closest('input, textarea, select, button')) {
      document.activeElement?.blur();
    }
  }
  
  // Функция для сжатия изображений на iOS
  function compressImageForIOS(dataUrl) {
    if (!dataUrl.startsWith('data:image')) {
      return dataUrl;
    }
    
    try {
      // Простое обрезание для iOS - на клиенте полноценное сжатие сложно
      // В реальном приложении нужно загружать фото на сервер
      if (dataUrl.length > 500000) {
        return dataUrl.substring(0, 300000) + '...[обрезано для iOS]';
      }
      return dataUrl;
    } catch (e) {
      console.error('❌ Ошибка обработки фото для iOS:', e);
      return dataUrl.substring(0, 200000);
    }
  }
  
  // Функция очистки старых фото для iOS
  function cleanupIOSPhotos() {
    if (!isIOS) return;
    
    console.log('🧹 iOS: Очистка старых фото...');
    
    try {
      // Получаем все ключи localStorage
      const keys = Object.keys(localStorage);
      const photoKeys = keys.filter(key => key.startsWith('siamatch_photo_'));
      
      // Получаем текущие используемые фото
      const profile = localLoad();
      const usedPhotoKeys = [];
      
      if (profile && profile.photos) {
        profile.photos.forEach(photoRef => {
          if (typeof photoRef === 'string' && photoRef.startsWith('local:')) {
            usedPhotoKeys.push(photoRef.replace('local:', ''));
          }
        });
      }
      
      // Удаляем неиспользуемые фото
      photoKeys.forEach(key => {
        if (!usedPhotoKeys.includes(key)) {
          localStorage.removeItem(key);
          console.log(`🗑️ iOS: Удален неиспользуемый ключ фото ${key}`);
        }
      });
      
      console.log(`🧹 iOS: Очищено ${photoKeys.length - usedPhotoKeys.length} неиспользуемых фото`);
    } catch (e) {
      console.error('❌ Ошибка очистки iOS фото:', e);
    }
  }
  
  // ===== ОТЛАДКА LOCALSTORAGE =====
  function debugLocalStorage() {
    console.log('🔍 Проверка localStorage:');
    
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('siamatch')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          console.log(`📦 ${key}:`, {
            тип: typeof data,
            размер: localStorage.getItem(key).length,
            фото: data.photos ? `${data.photos.length} шт` : 'нет',
            ключи: Object.keys(data)
          });
        } catch (e) {
          console.log(`📦 ${key}:`, localStorage.getItem(key).substring(0, 100) + '...');
        }
      }
    });
  }
  
  // ===== ПРИНУДИТЕЛЬНОЕ СОХРАНЕНИЕ И ПЕРЕЗАГРУЗКА =====
  function forceSaveAndReload() {
    console.log('💾 Принудительное сохранение...');
    
    if (!profileData) {
      showNotification('Нет данных профиля для сохранения');
      return;
    }
    
    // Сохраняем текущее состояние
    if (saveProfile(profileData)) {
      console.log('✅ Профиль сохранен принудительно');
      
      // Перезагружаем данные
      profileData = loadProfile();
      
      // Обновляем интерфейс
      updateProfilePhotos();
      
      showNotification('✅ Данные сохранены и перезагружены');
      
      // Показываем отладку
      debugLocalStorage();
    } else {
      showNotification('❌ Ошибка при сохранении');
    }
  }
  
  // ===== КНОПКА ОТЛАДКИ =====
  function addDebugButton() {
    const debugBtn = document.createElement('button');
    debugBtn.textContent = '🐛 Отладка';
    debugBtn.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      background: #ff4757;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 20px;
      z-index: 9999;
      font-size: 12px;
      opacity: 0.7;
    `;
    debugBtn.addEventListener('click', forceSaveAndReload);
    document.body.appendChild(debugBtn);
  }
  
  // ===== НОВАЯ СИСТЕМА: ОЖИДАЮЩИЕ ПОДТВЕРЖДЕНИЯ БОНУСЫ =====
  function loadPendingBonuses() {
    try {
      const saved = localStorage.getItem("siamatch_pending_bonuses");
      if (saved) {
        pendingBonusVerifications = JSON.parse(saved);
        console.log('📂 Загружено ожидающих бонусов:', pendingBonusVerifications.length);
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки ожидающих бонусов:", e);
    }
  }
  
  function savePendingBonuses() {
    try {
      localStorage.setItem("siamatch_pending_bonuses", JSON.stringify(pendingBonusVerifications));
      
      // Также сохраняем в админскую базу для проверки
      const adminBonuses = JSON.parse(localStorage.getItem('siamatch_admin_pending_bonuses') || '[]');
      const newPendingBonuses = pendingBonusVerifications.filter(pb => 
        !adminBonuses.some(ab => ab.id === pb.id)
      );
      
      if (newPendingBonuses.length > 0) {
        localStorage.setItem('siamatch_admin_pending_bonuses', 
          JSON.stringify([...adminBonuses, ...newPendingBonuses])
        );
      }
    } catch (e) {
      console.error("❌ Ошибка сохранения ожидающих бонусов:", e);
    }
  }
  
  function submitShareForVerification(screenshotData) {
    const verificationRequest = {
      id: Date.now(),
      userId: profileData?.tg_id,
      userName: profileData?.first_name,
      type: 'share_stories',
      screenshot: screenshotData,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      reward: {
        type: 'boost',
        value: 24,
        description: '24-часовой буст за шеринг в Stories'
      }
    };
    
    pendingBonusVerifications.push(verificationRequest);
    savePendingBonuses();
    
    showNotification('📱 Скриншот отправлен на проверку!\n\nАдминистратор проверит вашу публикацию в течение 24 часов. После подтверждения вы получите 24-часовой буст!');
  }
  
  function submitInviteForVerification(invitedUserId) {
    const verificationRequest = {
      id: Date.now(),
      userId: profileData?.tg_id,
      userName: profileData?.first_name,
      type: 'invite_friend',
      invitedUserId: invitedUserId,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      reward: {
        type: 'swipes',
        value: 20,
        description: '+20 свайпов за приглашение друга'
      }
    };
    
    pendingBonusVerifications.push(verificationRequest);
    savePendingBonuses();
    
    showNotification('👥 Запрос на проверку приглашения отправлен!\n\nАдминистратор проверит регистрацию вашего друга. После подтверждения вы получите +20 свайпов!');
  }
  
  // ===== СИСТЕМА ЧАТОВ И ЖАЛОБ =====
  function initChatsSystem() {
    console.log('💬 Инициализирую систему чатов и жалоб');
    
    loadMatchedUsers();
    loadChatMessages();
    loadUserReports();
    
    if (matchedUsers.length === 0) {
      matchedUsers = demoMatches;
      saveMatchedUsers();
    }
    
    Object.keys(demoMessages).forEach(chatId => {
      if (!chatMessages[chatId]) {
        chatMessages[chatId] = demoMessages[chatId];
      }
    });
    
    saveChatMessages();
    updateChatsList();
  }
  
  function loadMatchedUsers() {
    try {
      const saved = localStorage.getItem("siamatch_matches");
      if (saved) {
        matchedUsers = JSON.parse(saved);
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки мэтчей:", e);
    }
  }
  
  function saveMatchedUsers() {
    try {
      localStorage.setItem("siamatch_matches", JSON.stringify(matchedUsers));
    } catch (e) {
      console.error("❌ Ошибка сохранения мэтчей:", e);
    }
  }
  
  function loadChatMessages() {
    try {
      const saved = localStorage.getItem("siamatch_chat_messages");
      if (saved) {
        chatMessages = JSON.parse(saved);
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки сообщений:", e);
    }
  }
  
  function saveChatMessages() {
    try {
      localStorage.setItem("siamatch_chat_messages", JSON.stringify(chatMessages));
    } catch (e) {
      console.error("❌ Ошибка сохранения сообщений:", e);
    }
  }
  
  function loadUserReports() {
    try {
      const saved = localStorage.getItem("siamatch_user_reports");
      if (saved) {
        userReports = JSON.parse(saved);
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки жалоб:", e);
    }
  }
  
  function saveUserReports() {
    try {
      localStorage.setItem("siamatch_user_reports", JSON.stringify(userReports));
    } catch (e) {
      console.error("❌ Ошибка сохранения жалоб:", e);
    }
  }
  
  function updateChatsList() {
    const chatsList = document.getElementById('chats-list');
    const chatsEmpty = document.getElementById('chats-empty');
    
    if (!chatsList || !chatsEmpty) return;
    
    chatsList.innerHTML = '';
    
    if (matchedUsers.length === 0) {
      chatsEmpty.classList.remove('hidden');
      return;
    }
    
    chatsEmpty.classList.add('hidden');
    
    matchedUsers.forEach(user => {
      const chatItem = document.createElement('li');
      chatItem.className = 'chat-item';
      chatItem.dataset.userId = user.id;
      chatItem.innerHTML = `
        <div class="chat-item-content">
          <img src="${user.photo}" alt="${user.name}" class="chat-user-photo" />
          <div class="chat-user-info">
            <div class="chat-user-name">${user.name}, ${user.age}</div>
            <div class="chat-user-last-message">${user.city} • ${user.interests.slice(0, 2).join(', ')}</div>
          </div>
          <div class="chat-meta">
            <div class="chat-time">${user.matched_date}</div>
            ${user.unread > 0 ? `<div class="chat-unread">${user.unread}</div>` : ''}
          </div>
        </div>
      `;
      
      chatItem.addEventListener('click', () => {
        openChat(user.id);
      });
      
      chatsList.appendChild(chatItem);
    });
  }
  
  function openChat(userId) {
    currentChatId = userId;
    
    const user = matchedUsers.find(u => u.id === parseInt(userId));
    if (!user) return;
    
    if (!document.getElementById('chat-screen')) {
      createChatScreen();
    }
    
    document.getElementById('screen-chats').classList.add('hidden');
    document.getElementById('chat-screen').classList.remove('hidden');
    document.getElementById('tab-bar').classList.add('hidden');
    
    document.getElementById('chat-user-name').textContent = `${user.name}, ${user.age}`;
    document.getElementById('chat-user-city').textContent = user.city;
    document.getElementById('chat-user-photo').src = user.photo;
    document.getElementById('chat-user-bio').textContent = user.bio;
    
    loadMessagesForChat(userId);
    
    user.unread = 0;
    saveMatchedUsers();
    updateChatsList();
  }
  
  function createChatScreen() {
    const chatScreen = document.createElement('div');
    chatScreen.id = 'chat-screen';
    chatScreen.className = 'screen hidden';
    chatScreen.innerHTML = `
      <div class="chat-header">
        <button id="back-to-chats" class="back-btn">←</button>
        <div class="chat-header-info">
          <img id="chat-user-photo" class="chat-header-photo" />
          <div>
            <div id="chat-user-name" class="chat-header-name"></div>
            <div id="chat-user-city" class="chat-header-status"></div>
          </div>
        </div>
        <button id="chat-report-btn" class="report-btn">⚠️</button>
      </div>
      
      <div class="chat-messages-container">
        <div class="chat-messages" id="chat-messages"></div>
      </div>
      
      <div class="chat-input-container">
        <input type="text" id="chat-message-input" placeholder="Напишите сообщение..." />
        <button id="send-message-btn" class="send-btn">➤</button>
      </div>
      
      <div id="report-modal" class="modal-overlay hidden">
        <div class="modal" style="max-width: 500px;">
          <div class="modal-header">
            <h3>⚠️ Отправить жалобу</h3>
            <button class="close-btn" id="close-report-modal-btn">×</button>
          </div>
          <div id="report-modal-content">
            <div style="margin-bottom: 20px;">
              <div style="font-size: 14px; color: var(--muted); margin-bottom: 10px;">
                Жалоба на пользователя: <span id="report-user-name">-</span><br>
                Все сообщения из этого диалога будут скопированы в жалобу.
              </div>
              
              <div class="field">
                <label for="report-reason">Причина жалобы *</label>
                <select id="report-reason" class="filter-select" style="width: 100%;">
                  <option value="">Выберите причину</option>
                  <option value="spam">Спам, реклама</option>
                  <option value="harassment">Оскорбления, харассмент</option>
                  <option value="fake">Фейковая анкета</option>
                  <option value="scam">Мошенничество</option>
                  <option value="inappropriate">Неуместный контент</option>
                  <option value="other">Другое</option>
                </select>
              </div>
              
              <div id="custom-report-reason" class="hidden">
                <div class="field">
                  <label for="custom-reason-text">Опишите проблему подробно *</label>
                  <textarea id="custom-reason-text" rows="3" placeholder="Опишите причину жалобы..." style="width: 100%; padding: 12px; border-radius: 10px; border: 2px solid #bbf7d0; background: #ffffff; color: #000; font-size: 14px; resize: none;"></textarea>
                </div>
              </div>
              
              <div class="field">
                <label for="report-additional">Дополнительные комментарии (опционально)</label>
                <textarea id="report-additional" rows="2" placeholder="Любая дополнительная информация..." style="width: 100%; padding: 12px; border-radius: 10px; border: 2px solid #bbf7d0; background: #ffffff; color: #000; font-size: 14px; resize: none;"></textarea>
              </div>
              
              <div class="field" style="margin-top: 15px;">
                <label style="color: var(--danger-red); font-size: 13px;">
                  ⚠️ Внимание: После отправки жалобы диалог может быть заблокирован для проверки модератором.
                </label>
              </div>
            </div>
            
            <div class="modal-actions">
              <button id="submit-report-btn" class="primary danger-btn">Отправить жалобу</button>
              <button id="cancel-report-btn" class="secondary-btn">Отмена</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('card').appendChild(chatScreen);
    setupChatEventHandlers();
  }
  
  function setupChatEventHandlers() {
    document.getElementById('back-to-chats').addEventListener('click', () => {
      document.getElementById('chat-screen').classList.add('hidden');
      document.getElementById('screen-chats').classList.remove('hidden');
      document.getElementById('tab-bar').classList.remove('hidden');
      currentChatId = null;
    });
    
    document.getElementById('send-message-btn').addEventListener('click', sendMessage);
    
    document.getElementById('chat-message-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
    
    document.getElementById('chat-report-btn').addEventListener('click', openReportModal);
    
    document.getElementById('close-report-modal-btn').addEventListener('click', () => {
      document.getElementById('report-modal').classList.add('hidden');
    });
    
    document.getElementById('cancel-report-btn').addEventListener('click', () => {
      document.getElementById('report-modal').classList.add('hidden');
    });
    
    document.getElementById('report-reason').addEventListener('change', function() {
      const customReasonDiv = document.getElementById('custom-report-reason');
      if (this.value === 'other') {
        customReasonDiv.classList.remove('hidden');
      } else {
        customReasonDiv.classList.add('hidden');
      }
    });
    
    document.getElementById('submit-report-btn').addEventListener('click', submitReport);
    
    document.getElementById('report-modal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('report-modal')) {
        document.getElementById('report-modal').classList.add('hidden');
      }
    });
  }
  
  function loadMessagesForChat(userId) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';
    
    const messages = chatMessages[userId] || [];
    
    if (messages.length === 0) {
      messagesContainer.innerHTML = `
        <div class="no-messages">
          <div class="no-messages-icon">💬</div>
          <div class="no-messages-text">Начните общение первым!</div>
        </div>
      `;
      return;
    }
    
    messages.forEach(msg => {
      const messageElement = document.createElement('div');
      messageElement.className = `message ${msg.sender === 'me' ? 'message-out' : 'message-in'}`;
      messageElement.innerHTML = `
        <div class="message-content">${msg.text}</div>
        <div class="message-time">${msg.time}</div>
      `;
      messagesContainer.appendChild(messageElement);
    });
    
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
  }
  
  function sendMessage() {
    const input = document.getElementById('chat-message-input');
    const messageText = input.value.trim();
    
    if (!messageText || !currentChatId) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toISOString().split('T')[0];
    
    const newMessage = {
      id: Date.now(),
      sender: 'me',
      text: messageText,
      time: timeString,
      date: dateString
    };
    
    if (!chatMessages[currentChatId]) {
      chatMessages[currentChatId] = [];
    }
    
    chatMessages[currentChatId].push(newMessage);
    saveChatMessages();
    
    const messagesContainer = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message message-out';
    messageElement.innerHTML = `
      <div class="message-content">${messageText}</div>
      <div class="message-time">${timeString}</div>
    `;
    messagesContainer.appendChild(messageElement);
    
    input.value = '';
    
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
    
    setTimeout(() => {
      simulateResponse(currentChatId);
    }, 1000 + Math.random() * 2000);
  }
  
  function simulateResponse(chatId) {
    const responses = [
      "Интересно!",
      "Расскажи подробнее",
      "Согласен с тобой",
      "Как дела?",
      "Что нового?",
      "Понял тебя",
      "Спасибо за ответ!"
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toISOString().split('T')[0];
    
    const responseMessage = {
      id: Date.now(),
      sender: 'other',
      text: response,
      time: timeString,
      date: dateString
    };
    
    if (!chatMessages[chatId]) {
      chatMessages[chatId] = [];
    }
    
    chatMessages[chatId].push(responseMessage);
    saveChatMessages();
    
    if (currentChatId === chatId) {
      const messagesContainer = document.getElementById('chat-messages');
      if (messagesContainer) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-in';
        messageElement.innerHTML = `
          <div class="message-content">${response}</div>
          <div class="message-time">${timeString}</div>
        `;
        messagesContainer.appendChild(messageElement);
        
        setTimeout(() => {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
      }
    } else {
      const user = matchedUsers.find(u => u.id === parseInt(chatId));
      if (user) {
        user.unread = (user.unread || 0) + 1;
        saveMatchedUsers();
        updateChatsList();
      }
    }
  }
  
  function openReportModal() {
    if (!currentChatId) return;
    
    const user = matchedUsers.find(u => u.id === parseInt(currentChatId));
    if (!user) return;
    
    document.getElementById('report-user-name').textContent = `${user.name}, ${user.age}`;
    
    document.getElementById('report-reason').value = '';
    document.getElementById('custom-report-reason').classList.add('hidden');
    document.getElementById('custom-reason-text').value = '';
    document.getElementById('report-additional').value = '';
    
    document.getElementById('report-modal').classList.remove('hidden');
  }
  
  function submitReport() {
    const reason = document.getElementById('report-reason').value;
    const customReason = document.getElementById('custom-reason-text').value;
    const additional = document.getElementById('report-additional').value;
    
    if (!reason) {
      showNotification('Выберите причину жалобы');
      return;
    }
    
    if (reason === 'other' && !customReason.trim()) {
      showNotification('Опишите причину жалобы');
      return;
    }
    
    const user = matchedUsers.find(u => u.id === parseInt(currentChatId));
    if (!user) return;
    
    const reportData = {
      id: Date.now(),
      reporterId: profileData?.tg_id || 1,
      reporterName: profileData?.first_name || 'Пользователь',
      reportedUserId: user.id,
      reportedUserName: user.name,
      reason: reason === 'other' ? customReason : reason,
      additionalInfo: additional,
      chatMessages: chatMessages[currentChatId] || [],
      reporterProfile: profileData,
      reportedUserProfile: user,
      createdAt: new Date().toISOString(),
      status: 'pending',
      adminResponse: null
    };
    
    userReports.push(reportData);
    saveUserReports();
    
    saveReportToAdmin(reportData);
    
    showNotification('✅ Жалоба отправлена!\n\nВаша жалоба будет рассмотрена администратором в течение 24 часов. Диалог сохранён для проверки.');
    
    document.getElementById('report-modal').classList.add('hidden');
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('medium');
      } catch (e) {}
    }
  }
  
  function saveReportToAdmin(reportData) {
    try {
      const existingReports = JSON.parse(localStorage.getItem('siamatch_admin_reports') || '[]');
      existingReports.push(reportData);
      localStorage.setItem('siamatch_admin_reports', JSON.stringify(existingReports));
    } catch (e) {
      console.error('❌ Ошибка сохранения жалобы для админа:', e);
    }
  }
  
  // ===== СИСТЕМА ФИЛЬТРОВ =====
  function initFiltersSystem() {
    console.log('🔍 Инициализирую систему фильтров');
    
    loadSearchFilters();
    
    // УДАЛЯЕМ КНОПКУ ФИЛЬТРОВ ИЗ ЗАГОЛОВКА ЛЕНТЫ
    const openFiltersBtn = document.getElementById("open-filters-btn");
    if (openFiltersBtn && openFiltersBtn.parentNode) {
      openFiltersBtn.parentNode.removeChild(openFiltersBtn);
    }
    
    initSearchFilters();
  }
  
  function initSearchFilters() {
    loadSearchFilters();
    
    if (searchMinAge) {
      searchMinAge.value = searchFilters.minAge;
      searchMinAge.addEventListener('change', function() {
        searchFilters.minAge = parseInt(this.value) || 18;
      });
    }
    
    if (searchMaxAge) {
      searchMaxAge.value = searchFilters.maxAge;
      searchMaxAge.addEventListener('change', function() {
        searchFilters.maxAge = parseInt(this.value) || 35;
      });
    }
    
    const genderMaleCheckbox = document.getElementById('filter-gender-male');
    const genderFemaleCheckbox = document.getElementById('filter-gender-female');
    
    if (genderMaleCheckbox) {
      genderMaleCheckbox.checked = searchFilters.genders.includes('male');
      genderMaleCheckbox.addEventListener('change', function() {
        if (this.checked) {
          if (!searchFilters.genders.includes('male')) {
            searchFilters.genders.push('male');
          }
        } else {
          const index = searchFilters.genders.indexOf('male');
          if (index > -1) {
            searchFilters.genders.splice(index, 1);
          }
        }
      });
    }
    
    if (genderFemaleCheckbox) {
      genderFemaleCheckbox.checked = searchFilters.genders.includes('female');
      genderFemaleCheckbox.addEventListener('change', function() {
        if (this.checked) {
          if (!searchFilters.genders.includes('female')) {
            searchFilters.genders.push('female');
          }
        } else {
          const index = searchFilters.genders.indexOf('female');
          if (index > -1) {
            searchFilters.genders.splice(index, 1);
          }
        }
      });
    }
    
    document.querySelectorAll('.search-interest').forEach(checkbox => {
      checkbox.checked = searchFilters.interests.includes(checkbox.value);
      
      checkbox.addEventListener('change', function() {
        const interest = this.value;
        if (this.checked) {
          if (!searchFilters.interests.includes(interest)) {
            searchFilters.interests.push(interest);
          }
        } else {
          const index = searchFilters.interests.indexOf(interest);
          if (index > -1) {
            searchFilters.interests.splice(index, 1);
          }
        }
      });
    });
    
    const searchDatingGoalSelect = document.getElementById('search-dating-goal');
    if (searchDatingGoalSelect) {
      searchDatingGoalSelect.value = searchFilters.datingGoal;
      searchDatingGoalSelect.addEventListener('change', function() {
        searchFilters.datingGoal = this.value;
      });
    }
    
    if (saveFiltersBtn) {
      saveFiltersBtn.addEventListener('click', function() {
        saveSearchFilters();
        setActiveTab("feed");
        
        showNotification('✅ Фильтры применены!\n\nТеперь в ленте будут показываться только подходящие анкеты. 🎯');
        
        if (tg?.HapticFeedback) {
          try {
            tg.HapticFeedback.impactOccurred('medium');
          } catch (e) {}
        }
      });
    }
  }
  
  function loadSearchFilters() {
    try {
      const saved = localStorage.getItem("siamatch_search_filters");
      if (saved) {
        const data = JSON.parse(saved);
        searchFilters.minAge = data.minAge || 18;
        searchFilters.maxAge = data.maxAge || 35;
        searchFilters.genders = data.genders || [];
        searchFilters.interests = data.interests || [];
        searchFilters.datingGoal = data.datingGoal || '';
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки фильтров:", e);
    }
  }
  
  function saveSearchFilters() {
    try {
      localStorage.setItem("siamatch_search_filters", JSON.stringify(searchFilters));
    } catch (e) {
      console.error("❌ Ошибка сохранения фильтров:", e);
    }
  }
  
  // ===== СИСТЕМА БУСТА =====
  function initBoostSystem() {
    console.log('🚀 Инициализирую систему буста');
    
    loadBoostStatus();
    updateBoostUI();
    setInterval(updateBoostTimer, 1000);
  }
  
  function loadBoostStatus() {
    try {
      const saved = localStorage.getItem("siamatch_boost");
      if (saved) {
        const data = JSON.parse(saved);
        boostActive = data.active || false;
        boostEndTime = data.endTime || null;
        
        if (boostActive && boostEndTime) {
          if (Date.now() > boostEndTime) {
            boostActive = false;
            saveBoostStatus();
          }
        }
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки статуса буста:", e);
    }
  }
  
  function saveBoostStatus() {
    try {
      const data = {
        active: boostActive,
        endTime: boostEndTime,
        timestamp: Date.now()
      };
      localStorage.setItem("siamatch_boost", JSON.stringify(data));
    } catch (e) {
      console.error("❌ Ошибка сохранения статуса буста:", e);
    }
  }
  
  function updateBoostUI() {
    const boostStatusElement = document.getElementById('boost-status');
    if (boostStatusElement) {
      updateBoostStatusElement(boostStatusElement);
    }
  }
  
  function updateBoostStatusElement(element) {
    if (boostActive && boostEndTime) {
      const timeLeft = boostEndTime - Date.now();
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      
      element.textContent = `Активен (осталось ${hours}ч ${minutes}м)`;
      element.className = 'boost-status boosted';
    } else {
      element.textContent = 'Не активен';
      element.className = 'boost-status not-boosted';
    }
  }
  
  function updateBoostTimer() {
    if (!boostActive || !boostEndTime) return;
    
    const now = Date.now();
    if (now >= boostEndTime) {
      boostActive = false;
      saveBoostStatus();
      updateBoostUI();
      return;
    }
    
    const timeLeft = boostEndTime - now;
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    const boostTimerElement = document.getElementById('boost-timer');
    if (boostTimerElement) {
      boostTimerElement.textContent = `Осталось: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }
  
  // ===== СИСТЕМА СВАЙПОВ =====
  function initSwipesSystem() {
    console.log('🔄 Инициализирую систему свайпов');
    
    loadSwipesCount();
    updateSwipesUI();
    
    if (buySwipesBtn) {
      buySwipesBtn.addEventListener('click', handleBuySwipes);
    }
  }
  
  function loadSwipesCount() {
    try {
      const saved = localStorage.getItem("siamatch_swipes");
      if (saved) {
        const data = JSON.parse(saved);
        const today = new Date().toDateString();
        
        if (data.date === today) {
          remainingSwipes = data.remaining || maxSwipesPerDay;
        } else {
          remainingSwipes = maxSwipesPerDay;
          saveSwipesCount();
        }
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки количества свайпов:", e);
    }
  }
  
  function saveSwipesCount() {
    try {
      const data = {
        date: new Date().toDateString(),
        remaining: remainingSwipes,
        totalUsed: maxSwipesPerDay - remainingSwipes
      };
      localStorage.setItem("siamatch_swipes", JSON.stringify(data));
    } catch (e) {
      console.error("❌ Ошибка сохранения количества свайпов:", e);
    }
  }
  
  function updateSwipesUI() {
    if (remainingSwipesElement) {
      remainingSwipesElement.textContent = remainingSwipes;
    }
    
    if (swipesInfo) {
      if (remainingSwipes <= 5) {
        swipesInfo.classList.remove('hidden');
      } else {
        swipesInfo.classList.add('hidden');
      }
    }
  }
  
  function useSwipe() {
    if (remainingSwipes > 0) {
      remainingSwipes--;
      saveSwipesCount();
      updateSwipesUI();
      
      if (remainingSwipes === 0) {
        setTimeout(() => {
          showNotification('🎯 Свайпы на сегодня закончились!\n\nВы можете:\n1. Подождать до завтра\n2. Купить дополнительные свайпы\n3. Получить бонусные свайпы через верификацию или приглашение друзей!');
        }, 300);
      }
      
      return true;
    } else {
      showNotification('🚫 Свайпы на сегодня закончились!\n\nВы можете:\n1. Купить дополнительные свайпы\n2. Подождать до завтра\n3. Получить +20 свайпов за верификацию анкеты\n4. Пригласить друга и получить +20 свайпов');
      return false;
    }
  }
  
  function handleBuySwipes() {
    const options = [
      { count: 10, price: 99 },
      { count: 25, price: 199 },
      { count: 50, price: 349 },
      { count: 100, price: 599 }
    ];
    
    let message = '🛒 Купить дополнительные свайпы:\n\n';
    options.forEach((option, index) => {
      message += `${index + 1}. ${option.count} свайпов - ${option.price} ₽\n`;
    });
    message += '\nВыберите пакет:';
    
    const choice = prompt(message);
    if (choice && ['1', '2', '3', '4'].includes(choice)) {
      const selected = options[parseInt(choice) - 1];
      remainingSwipes += selected.count;
      saveSwipesCount();
      updateSwipesUI();
      
      showNotification(`✅ Успешно!\n\nВы купили ${selected.count} дополнительных свайпов за ${selected.price} ₽.\nТеперь у вас ${remainingSwipes} свайпов.`);
      
      if (tg?.HapticFeedback) {
        try {
          tg.HapticFeedback.impactOccurred('medium');
        } catch (e) {}
      }
    }
  }
  
  // ===== СИСТЕМА БОНУСНЫХ СВАЙПОВ И БУСТОВ =====
  function initBonusSystem() {
    console.log('🎁 Инициализирую систему бонусов');
    
    loadPendingBonuses();
    
    const inviteFriendBtn = document.getElementById('inviteFriendBtn');
    const shareStoriesBtn = document.getElementById('shareStoriesBtn');
    
    if (inviteFriendBtn) {
      inviteFriendBtn.addEventListener('click', handleInviteFriend);
    }
    
    if (shareStoriesBtn) {
      shareStoriesBtn.addEventListener('click', handleShareStories);
    }
    
    const verifyBtn = document.getElementById('verifyProfileBtn');
    if (verifyBtn) {
      verifyBtn.textContent = '🔐 Верифицировать анкету (+20 свайпов)';
      verifyBtn.classList.add('with-bonus');
    }
  }
  
  function handleInviteFriend() {
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('medium');
      } catch (e) {}
    }
    
    const referralCode = generateReferralCode();
    const referralLink = `https://t.me/SiaMatchBot?start=${referralCode}`;
    
    showInviteVerificationModal(referralLink);
  }
  
  function handleShareStories() {
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('medium');
      } catch (e) {}
    }
    
    showShareVerificationModal();
  }
  
  function showInviteVerificationModal(referralLink) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal" style="max-width: 500px;">
        <div class="modal-header">
          <h3>👥 Приглашение друга</h3>
          <button class="close-btn" id="close-invite-modal-btn">×</button>
        </div>
        <div style="padding: 20px;">
          <div style="margin-bottom: 20px;">
            <p>Для получения бонуса +20 свайпов необходимо:</p>
            <ol style="margin-left: 20px; margin-top: 10px;">
              <li>Отправьте эту ссылку другу: <strong>${referralLink}</strong></li>
              <li>Друг должен зарегистрироваться по вашей ссылке</li>
              <li>После регистрации вашего друга, администратор проверит приглашение</li>
              <li>После проверки вы получите +20 свайпов!</li>
            </ol>
          </div>
          
          <div class="field">
            <label>ID вашего друга (если он уже зарегистрировался)</label>
            <input type="number" id="friend-id-input" placeholder="Введите ID друга" style="width: 100%; padding: 10px; border-radius: 10px; border: 2px solid #bbf7d0;" />
          </div>
          
          <div class="field" style="margin-top: 20px;">
            <label>Или загрузите скриншот переписки с другом</label>
            <input type="file" id="invite-screenshot-input" accept="image/*" style="width: 100%; padding: 10px;" />
            <div class="hint">Скриншот вашего приглашения в Telegram</div>
          </div>
          
          <div class="modal-actions" style="margin-top: 20px;">
            <button id="submit-invite-verification" class="primary">📤 Отправить на проверку</button>
            <button id="cancel-invite-verification" class="secondary-btn">Отмена</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('close-invite-modal-btn').onclick = () => {
      document.body.removeChild(modal);
    };
    
    document.getElementById('cancel-invite-verification').onclick = () => {
      document.body.removeChild(modal);
    };
    
    document.getElementById('submit-invite-verification').onclick = () => {
      const friendIdInput = document.getElementById('friend-id-input');
      const screenshotInput = document.getElementById('invite-screenshot-input');
      
      const friendId = friendIdInput.value.trim();
      const screenshotFile = screenshotInput.files[0];
      
      if (!friendId && !screenshotFile) {
        showNotification('Заполните хотя бы одно поле: ID друга или загрузите скриншот');
        return;
      }
      
      if (friendId) {
        submitInviteForVerification(parseInt(friendId));
        document.body.removeChild(modal);
      } else if (screenshotFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const screenshotData = event.target.result;
          
          const verificationRequest = {
            id: Date.now(),
            userId: profileData?.tg_id,
            userName: profileData?.first_name,
            type: 'invite_friend_screenshot',
            screenshot: screenshotData,
            requestedAt: new Date().toISOString(),
            status: 'pending',
            reward: {
              type: 'swipes',
              value: 20,
              description: '+20 свайпов за приглашение друга'
            }
          };
          
          pendingBonusVerifications.push(verificationRequest);
          savePendingBonuses();
          
          document.body.removeChild(modal);
          showNotification('📤 Скриншот отправлен на проверку!\n\nАдминистратор проверит ваше приглашение в течение 24 часов. После подтверждения вы получите +20 свайпов!');
        };
        reader.readAsDataURL(screenshotFile);
      }
    };
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }
  
  function showShareVerificationModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal" style="max-width: 500px;">
        <div class="modal-header">
          <h3>📱 Шеринг в Stories</h3>
          <button class="close-btn" id="close-share-modal-btn">×</button>
        </div>
        <div style="padding: 20px;">
          <div style="margin-bottom: 20px;">
            <p>Для получения 24-часового буста необходимо:</p>
            <ol style="margin-left: 20px; margin-top: 10px;">
              <li>Сделайте скриншот приложения SiaMatch</li>
              <li>Опубликуйте в Stories Telegram или Instagram</li>
              <li>Сделайте скриншот вашей публикации</li>
              <li>Загрузите скриншот для проверка</li>
              <li>После проверки вы получите 24-часовой буст!</li>
            </ol>
          </div>
          
          <div class="field">
            <label>Загрузите скриншот вашей публикации в Stories</label>
            <input type="file" id="share-screenshot-input" accept="image/*" style="width: 100%; padding: 10px;" />
            <div class="hint">Скриншот должен показывать вашу публикацию в Stories с хэштегом #SiaMatch</div>
          </div>
          
          <div id="screenshot-preview" style="margin-top: 15px; display: none;">
            <img id="preview-image" style="max-width: 200px; border-radius: 10px; border: 2px solid #bbf7d0;" />
          </div>
          
          <div class="modal-actions" style="margin-top: 20px;">
            <button id="submit-share-verification" class="primary" disabled>📤 Отправить на проверку</button>
            <button id="cancel-share-verification" class="secondary-btn">Отмена</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeBtn = document.getElementById('close-share-modal-btn');
    const cancelBtn = document.getElementById('cancel-share-verification');
    const submitBtn = document.getElementById('submit-share-verification');
    const screenshotInput = document.getElementById('share-screenshot-input');
    const previewDiv = document.getElementById('screenshot-preview');
    const previewImg = document.getElementById('preview-image');
    
    closeBtn.onclick = () => {
      document.body.removeChild(modal);
    };
    
    cancelBtn.onclick = () => {
      document.body.removeChild(modal);
    };
    
    screenshotInput.addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          previewImg.src = e.target.result;
          previewDiv.style.display = 'block';
          submitBtn.disabled = false;
        };
        reader.readAsDataURL(file);
      }
    });
    
    submitBtn.onclick = () => {
      const file = screenshotInput.files[0];
      if (!file) {
        showNotification('Сначала загрузите скриншот');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = function(event) {
        const screenshotData = event.target.result;
        submitShareForVerification(screenshotData);
        document.body.removeChild(modal);
      };
      reader.readAsDataURL(file);
    };
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }
  
  function generateReferralCode() {
    const userId = profileData?.tg_id || Math.floor(Math.random() * 1000000);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `REF_${userId}_${code}`;
  }
  
  function showBonusNotification(title, message, link, type) {
    const notification = document.createElement('div');
    notification.className = 'bonus-notification';
    notification.innerHTML = `
      <h3>${title}</h3>
      <p>${message}</p>
      ${link ? `<div class="referral-link">${link}</div>` : ''}
      <button class="primary" id="bonus-copy-btn" style="margin-top: 15px; font-size: 16px;">
        ${link ? '📋 Скопировать ссылку' : 'Понятно'}
      </button>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, ${type === 'invite' ? '#3b82f6, #1d4ed8' : '#8b5cf6, #7c3aed'});
      color: white;
      padding: 25px 30px;
      border-radius: 20px;
      z-index: 2000;
      text-align: center;
      max-width: 85%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: bonusAppear 0.5s ease;
      border: 3px solid white;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes bonusAppear {
        from { opacity: 0; transform: translate(-50%, -60%) scale(0.9); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
      @keyframes bonusDisappear {
        from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        to { opacity: 0; transform: translate(-50%, -40%) scale(0.9); }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    const copyBtn = document.getElementById('bonus-copy-btn');
    copyBtn.addEventListener('click', () => {
      if (link) {
        navigator.clipboard.writeText(link).then(() => {
          showNotification('✅ Ссылка скопирована в буфер обмена!');
        }).catch(() => {
          const textArea = document.createElement('textarea');
          textArea.value = link;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          showNotification('✅ Ссылка скопирована!');
        });
      }
      
      notification.style.animation = 'bonusDisappear 0.3s ease forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      }, 300);
    });
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'bonusDisappear 0.3s ease forwards';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
          if (style.parentNode) {
            style.parentNode.removeChild(style);
          }
        }, 300);
      }
    }, 10000);
    
    notification.addEventListener('click', (e) => {
      if (e.target === notification) {
        notification.style.animation = 'bonusDisappear 0.3s ease forwards';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
          if (style.parentNode) {
            style.parentNode.removeChild(style);
          }
        }, 300);
      }
    });
  }
  
  // ===== СИСТЕМА ЛАЙКОВ =====
  function initLikesSystem() {
    console.log('💗 Инициализирую систему лайков');
    
    loadLikesData();
    updateLikesUI();
    
    if (likesBadge) {
      likesBadge.addEventListener('click', handleLikesBadgeClick);
    }
    
    simulateNewLikes();
  }
  
  function loadLikesData() {
    try {
      const saved = localStorage.getItem("siamatch_likes");
      if (saved) {
        const data = JSON.parse(saved);
        usersWhoLikedMeCount = data.count || 0;
        lastLikesCount = data.lastCount || 0;
        console.log('📂 Загружено количество лайков:', usersWhoLikedMeCount);
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки данных о лайках:", e);
    }
  }
  
  function saveLikesData() {
    try {
      const data = {
        count: usersWhoLikedMeCount,
        lastCount: lastLikesCount,
        lastUpdated: Date.now()
      };
      localStorage.setItem("siamatch_likes", JSON.stringify(data));
      console.log('💾 Сохранены данные о лайков:', usersWhoLikedMeCount);
    } catch (e) {
      console.error("❌ Ошибка сохранения данных о лайках:", e);
    }
  }
  
  function updateLikesUI() {
    const count = usersWhoLikedMeCount;
    
    if (likesCountElement) {
      const currentCount = parseInt(likesCountElement.textContent) || 0;
      if (currentCount !== count) {
        likesCountElement.classList.remove('counter-animation');
        void likesCountElement.offsetWidth;
        likesCountElement.classList.add('counter-animation');
        likesCountElement.textContent = count;
      }
    }
    
    if (likesCountBadge) {
      const currentBadgeCount = parseInt(likesCountBadge.textContent) || 0;
      if (currentBadgeCount !== count) {
        likesCountBadge.textContent = count;
        likesCountBadge.style.animation = 'none';
        setTimeout(() => {
          likesCountBadge.style.animation = 'countPulse 2s infinite';
        }, 10);
      }
    }
    
    updateTabChatsBadge();
    checkForNewLikes();
  }
  
  function updateTabChatsBadge() {
    if (!tabChatsBadge) return;
    
    const count = usersWhoLikedMeCount;
    
    if (count > 0) {
      tabChatsBadge.textContent = count > 99 ? '99+' : count.toString();
      tabChatsBadge.classList.remove('hidden');
      
      if (newLikesReceived) {
        tabChatsBadge.style.animation = 'badgePulse 1.5s infinite';
      }
    } else {
      tabChatsBadge.classList.add('hidden');
    }
  }
  
  function checkForNewLikes() {
    if (usersWhoLikedMeCount > lastLikesCount) {
      newLikesReceived = true;
      showNewLikesNotification();
      lastLikesCount = usersWhoLikedMeCount;
      saveLikesData();
    }
  }
  
  function showNewLikesNotification() {
    if (!newLikesNotification || !newLikesReceived) return;
    
    newLikesNotification.classList.remove('hidden');
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
    
    setTimeout(() => {
      newLikesNotification.classList.add('hidden');
      newLikesReceived = false;
    }, 5000);
  }
  
  function handleLikesBadgeClick() {
    console.log('💗 Клик на бадж с лайками');
    
    if (usersWhoLikedMeCount > 0) {
      const messages = [
        `🎯 У вас ${usersWhoLikedMeCount} тайных поклонников! Продолжайте свайпать, чтобы найти их в ленте.`,
        `✨ ${usersWhoLikedMeCount} человек уже оценили вашу анкету. Они где-то рядом!`,
        `💝 Кто-то уже заинтересовался вами! Продолжайте свайпать, чтобы найти взаимную симпатию.`,
        `🌟 У вас ${usersWhoLikedMeCount} потенциальных мэтчей! Они появятся в ленте впереди.`
      ];
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      showNotification(randomMessage);
    } else {
      showNotification('Пока нет лайков, но это временно! Продолжайте активно использовать приложение, и скоро появятся первые симпатии! 💕');
    }
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.selectionChanged();
      } catch (e) {}
    }
  }
  
  function simulateNewLikes() {
    if (usersWhoLikedMeCount === 0) {
      setTimeout(() => {
        usersWhoLikedMeCount = Math.floor(Math.random() * 5) + 3;
        saveLikesData();
        updateLikesUI();
        console.log('🎲 Демо: добавлены лайки для мотивации');
      }, 3000);
    }
    
    setInterval(() => {
      if (Math.random() > 0.7) {
        const newLikes = Math.floor(Math.random() * 2) + 1;
        usersWhoLikedMeCount += newLikes;
        newLikesReceived = true;
        saveLikesData();
        updateLikesUI();
        console.log(`🎲 Демо: добавлено ${newLikes} новых лайков`);
      }
    }, 30000);
  }
  
  // ===== СИСТЕМА ВЕРИФИКАЦИИ =====
  function initVerification() {
    console.log('🔐 Инициализирую систему верификации');
    
    loadVerificationStatus();
    
    const verifyBtn = document.getElementById('verifyProfileBtn');
    const verificationPhotoInput = document.getElementById('verification-photo');
    const submitBtn = document.getElementById('submit-verification');
    const cancelBtn = document.getElementById('cancel-verification');
    const retryBtn = document.getElementById('retry-verification');
    
    if (verifyBtn) verifyBtn.addEventListener('click', handleVerificationRequest);
    if (verificationPhotoInput) verificationPhotoInput.addEventListener('change', handleVerificationPhotoUpload);
    if (submitBtn) submitBtn.addEventListener('click', submitVerification);
    if (cancelBtn) cancelBtn.addEventListener('click', cancelVerification);
    if (retryBtn) retryBtn.addEventListener('click', retryVerification);
    
    updateVerificationUI();
  }
  
  function loadVerificationStatus() {
    try {
      const saved = localStorage.getItem("siamatch_verification");
      if (saved) {
        const data = JSON.parse(saved);
        verificationStatus = data.status || 'not_verified';
        verificationPhoto = data.photo || null;
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки статуса верификации:", e);
    }
  }
  
  function saveVerificationStatus() {
    try {
      const data = {
        status: verificationStatus,
        photo: verificationPhoto,
        timestamp: Date.now()
      };
      localStorage.setItem("siamatch_verification", JSON.stringify(data));
    } catch (e) {
      console.error("❌ Ошибка сохранения статуса верификации:", e);
    }
  }
  
  function updateVerificationUI() {
    const verifyBtn = document.getElementById('verifyProfileBtn');
    const verificationStatusElem = document.getElementById('verification-status');
    const verificationSection = document.getElementById('verification-form-section');
    const verificationPendingSection = document.getElementById('verification-pending-section');
    const verificationVerifiedSection = document.getElementById('verification-verified-section');
    const verificationRejectedSection = document.getElementById('verification-rejected-section');
    
    if (!verifyBtn || !verificationStatusElem) return;
    
    if (verificationSection) verificationSection.classList.add('hidden');
    if (verificationPendingSection) verificationPendingSection.classList.add('hidden');
    if (verificationVerifiedSection) verificationVerifiedSection.classList.add('hidden');
    if (verificationRejectedSection) verificationRejectedSection.classList.add('hidden');
    
    verifyBtn.style.display = verificationStatus === 'not_verified' || verificationStatus === 'rejected' ? 'block' : 'none';
    
    switch(verificationStatus) {
      case 'not_verified':
        verificationStatusElem.textContent = 'Анкета не верифицирована';
        verificationStatusElem.className = 'profile-verification-status not-verified';
        break;
        
      case 'pending':
        verificationStatusElem.textContent = '⏳ На проверке';
        verificationStatusElem.className = 'profile-verification-status pending';
        if (verificationPendingSection) verificationPendingSection.classList.remove('hidden');
        break;
        
      case 'verified':
        verificationStatusElem.textContent = '✅ Верифицирована';
        verificationStatusElem.className = 'profile-verification-status verified';
        if (verificationVerifiedSection) verificationVerifiedSection.classList.remove('hidden');
        break;
        
      case 'rejected':
        verificationStatusElem.textContent = '❌ Отклонена';
        verificationStatusElem.className = 'profile-verification-status rejected';
        if (verificationRejectedSection) verificationRejectedSection.classList.remove('hidden');
        break;
    }
  }
  
  function handleVerificationRequest() {
    const verificationSection = document.getElementById('verification-form-section');
    const verifyBtn = document.getElementById('verifyProfileBtn');
    
    if (verificationSection && verifyBtn) {
      verificationSection.classList.remove('hidden');
      verifyBtn.style.display = 'none';
      
      const preview = document.getElementById('verification-preview');
      if (preview) preview.style.display = 'none';
    }
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.selectionChanged();
      } catch (e) {}
    }
  }
  
  function handleVerificationPhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Фото слишком большое (максимум 5MB)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
      verificationPhoto = event.target.result;
      
      const preview = document.getElementById('verification-preview');
      if (preview) {
        preview.src = verificationPhoto;
        preview.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  }
  
  function submitVerification() {
    if (!verificationPhoto) {
      showNotification('Сначала загрузите селфи фото');
      return;
    }
    
    verificationStatus = 'pending';
    saveVerificationStatus();
    updateVerificationUI();
    
    const verificationSection = document.getElementById('verification-form-section');
    if (verificationSection) verificationSection.classList.add('hidden');
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('medium');
      } catch (e) {}
    }
    
    showNotification('✅ Запрос на верификацию отправлен!\n\nАнкета будет проверена администратором в течение 24 часов.\n\nПосле успешной верификации вы получите +20 свайпов! 🎁');
    
    setTimeout(() => {
      if (verificationStatus === 'pending') {
        completeVerificationWithBonus();
      }
    }, 3000);
  }
  
  function completeVerificationWithBonus() {
    verificationStatus = 'verified';
    saveVerificationStatus();
    updateVerificationUI();
    
    remainingSwipes += 20;
    saveSwipesCount();
    updateSwipesUI();
    
    showNotification('✅ Анкета верифицирована!\n\n🎁 Вы получили +20 свайпов! Теперь у вас ' + remainingSwipes + ' свайпов.');
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('heavy');
      } catch (e) {}
    }
  }
  
  function cancelVerification() {
    verificationPhoto = null;
    verificationStatus = 'not_verified';
    saveVerificationStatus();
    updateVerificationUI();
    
    const verificationPhotoInput = document.getElementById('verification-photo');
    if (verificationPhotoInput) verificationPhotoInput.value = '';
    
    const preview = document.getElementById('verification-preview');
    if (preview) preview.style.display = 'none';
    
    const verificationSection = document.getElementById('verification-form-section');
    if (verificationSection) verificationSection.classList.add('hidden');
    
    const verifyBtn = document.getElementById('verifyProfileBtn');
    if (verifyBtn) verifyBtn.style.display = 'block';
  }
  
  function retryVerification() {
    verificationPhoto = null;
    verificationStatus = 'not_verified';
    saveVerificationStatus();
    updateVerificationUI();
    
    const verificationPhotoInput = document.getElementById('verification-photo');
    if (verificationPhotoInput) verificationPhotoInput.value = '';
    
    const preview = document.getElementById('verification-preview');
    if (preview) preview.style.display = 'none';
    
    const verificationRejectedSection = document.getElementById('verification-rejected-section');
    if (verificationRejectedSection) verificationRejectedSection.classList.add('hidden');
    
    const verifyBtn = document.getElementById('verifyProfileBtn');
    if (verifyBtn) verifyBtn.style.display = 'block';
  }
  
  // ===== СИСТЕМА ИНТЕРЕСОВ =====
  function initInterestsSystem() {
    console.log('🎯 Инициализирую систему интересов');
    
    loadUserInterests();
    updateSelectedInterestsDisplay();
    
    const editInterestsBtn = document.getElementById('edit-interests-btn');
    const saveInterestsBtn = document.getElementById('save-interests-btn');
    const backToProfileBtn = document.getElementById('back-to-profile-btn');
    
    if (editInterestsBtn) {
      editInterestsBtn.addEventListener('click', openInterestsEditor);
    }
    
    if (saveInterestsBtn) {
      saveInterestsBtn.addEventListener('click', saveUserInterests);
    }
    
    if (backToProfileBtn) {
      backToProfileBtn.addEventListener('click', () => {
        document.getElementById('screen-interests').classList.add('hidden');
        document.getElementById('screen-profile').classList.remove('hidden');
        document.getElementById('tab-bar').classList.remove('hidden');
      });
    }
    
    initInterestsCheckboxes();
    
    if (datingGoalSelect) {
      datingGoalSelect.value = datingGoal;
      datingGoalSelect.addEventListener('change', function() {
        datingGoal = this.value;
      });
    }
    
    if (saveDatingGoalBtn) {
      saveDatingGoalBtn.addEventListener('click', saveDatingGoal);
    }
  }
  
  function initInterestsCheckboxes() {
    const checkboxes = document.querySelectorAll('.interest-checkbox');
    
    checkboxes.forEach(checkbox => {
      checkbox.checked = userInterests.includes(checkbox.value);
      
      checkbox.addEventListener('change', function() {
        const selectedCount = document.querySelectorAll('.interest-checkbox:checked').length;
        
        if (selectedCount > maxInterests) {
          this.checked = false;
          showNotification(`Можно выбрать не более ${maxInterests} интересов`);
          return;
        }
        
        updateInterestsCounter();
      });
    });
    
    updateInterestsCounter();
  }
  
  function updateInterestsCounter() {
    const selectedCount = document.querySelectorAll('.interest-checkbox:checked').length;
    const counterEditor = document.getElementById('selected-count-editor');
    const counterDisplay = document.getElementById('selected-count');
    const saveBtn = document.getElementById('save-interests-btn');
    
    if (counterEditor) {
      counterEditor.textContent = `Выбрано: ${selectedCount}/5 интересов`;
      
      if (selectedCount >= maxInterests) {
        counterEditor.classList.add('limit-reached');
      } else {
        counterEditor.classList.remove('limit-reached');
      }
    }
    
    if (counterDisplay) {
      counterDisplay.textContent = selectedCount;
    }
    
    if (saveBtn) {
      saveBtn.disabled = selectedCount === 0;
    }
  }
  
  function openInterestsEditor() {
    document.getElementById('screen-profile').classList.add('hidden');
    document.getElementById('screen-interests').classList.remove('hidden');
    document.getElementById('tab-bar').classList.add('hidden');
    
    document.querySelectorAll('.interest-checkbox').forEach(checkbox => {
      checkbox.checked = userInterests.includes(checkbox.value);
    });
    
    updateInterestsCounter();
  }
  
  function saveUserInterests() {
    const selectedCheckboxes = document.querySelectorAll('.interest-checkbox:checked');
    userInterests = Array.from(selectedCheckboxes).map(cb => cb.value);
    
    if (userInterests.length === 0) {
      showNotification('Выберите хотя бы один интерес');
      return;
    }
    
    if (userInterests.length > maxInterests) {
      showNotification(`Можно выбрать не более ${maxInterests} интересов`);
      return;
    }
    
    try {
      const data = {
        interests: userInterests,
        datingGoal: datingGoal,
        timestamp: Date.now()
      };
      localStorage.setItem("siamatch_interests", JSON.stringify(data));
      
      showNotification('✅ Интересы сохранены!');
      
      document.getElementById('screen-interests').classList.add('hidden');
      document.getElementById('screen-profile').classList.remove('hidden');
      document.getElementById('tab-bar').classList.remove('hidden');
      
      updateSelectedInterestsDisplay();
      
      if (tg?.HapticFeedback) {
        try {
        tg.HapticFeedback.impactOccurred('light');
        } catch (e) {}
      }
    } catch (e) {
      console.error("❌ Ошибка сохранения интересов:", e);
      showNotification('❌ Ошибка при сохранении интересов');
    }
  }
  
  function updateSelectedInterestsDisplay() {
    const selectedList = document.getElementById('selected-interests-list');
    const noInterestsHint = document.getElementById('no-interests-hint');
    const interestsCounter = document.getElementById('interests-counter');
    const selectedCount = document.getElementById('selected-count');
    
    if (!selectedList || !noInterestsHint) return;
    
    selectedList.innerHTML = '';
    
    if (userInterests.length === 0) {
      noInterestsHint.classList.remove('hidden');
      if (interestsCounter) interestsCounter.classList.add('hidden');
      return;
    }
    
    noInterestsHint.classList.add('hidden');
    if (interestsCounter) interestsCounter.classList.remove('hidden');
    
    const interestLabels = {
      'travel': 'Путешествия',
      'movies': 'Кино',
      'art': 'Искусство',
      'sport': 'Спорт',
      'photography': 'Фотография',
      'dancing': 'Танцы',
      'music': 'Музыка',
      'cooking': 'Кулинария',
      'business': 'Бизнес',
      'gaming': 'Гейминг',
      'cars': 'Автомобили',
      'anime': 'Аниме',
      'tattoos': 'Татуировки',
      'piercing': 'Пирсинг',
      'workout': 'Тренировки',
      'wine': 'Вино',
      'boardgames': 'Настольные игры'
    };
    
    userInterests.forEach(interest => {
      const tag = document.createElement('div');
      tag.className = 'interest-tag';
      tag.textContent = interestLabels[interest] || interest;
      selectedList.appendChild(tag);
    });
    
    if (selectedCount) {
      selectedCount.textContent = userInterests.length;
    }
  }
  
  function loadUserInterests() {
    try {
      const saved = localStorage.getItem("siamatch_interests");
      if (saved) {
        const data = JSON.parse(saved);
        userInterests = data.interests || [];
        datingGoal = data.datingGoal || '';
      }
    } catch (e) {
      console.error("❌ Ошибка загрузки интересов:", e);
    }
  }
  
  function saveDatingGoal() {
    if (!datingGoal) {
      showNotification('Выберите цель знакомства');
      return;
    }
    
    const data = {
      interests: userInterests,
      datingGoal: datingGoal,
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem("siamatch_interests", JSON.stringify(data));
      showNotification('✅ Цель знакомства сохранена!');
      
      if (tg?.HapticFeedback) {
        try {
          tg.HapticFeedback.impactOccurred('light');
        } catch (e) {}
      }
    } catch (e) {
      console.error("❌ Ошибка сохранения цели:", e);
      showNotification('❌ Ошибка при сохранении цели');
    }
  }

  // ===== СИСТЕМА СВАЙПОВ И УПРАВЛЕНИЯ ФОТОГРАФИЯМИ =====
  function initSwipeSystem() {
    console.log('🔄 Инициализирую систему свайпов и фотографий');
    
    const candidateCard = document.getElementById('candidate-card');
    const photosContainer = document.querySelector('.candidate-photos-container');
    
    if (!candidateCard || !photosContainer) return;
    
    const actions = document.querySelector('.actions');
    if (actions) {
      actions.style.display = 'none';
    }
    
    // Инициализируем свайпы
    initSwipeGestures(candidateCard);
    
    // Инициализируем переключение фото по клику/тапу
    initPhotoSwitching(photosContainer);
  }

  function initSwipeGestures(cardElement) {
    // Для тач-устройств
    cardElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    cardElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    cardElement.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Для десктопа
    cardElement.addEventListener('mousedown', handleMouseDown);
    cardElement.addEventListener('mousemove', handleMouseMove);
    cardElement.addEventListener('mouseup', handleMouseEnd);
    cardElement.addEventListener('mouseleave', handleMouseLeave);
  }

  function initPhotoSwitching(photosContainer) {
    // Добавляем обработчики кликов на фото
    photosContainer.addEventListener('click', handlePhotoClick);
    photosContainer.addEventListener('touchstart', handlePhotoTouchStart, { passive: true });
    photosContainer.addEventListener('touchend', handlePhotoTouchEnd, { passive: true });
    
    // Создаем индикаторы свайпов для фото
    createPhotoSwipeIndicators(photosContainer);
  }

  function createPhotoSwipeIndicators(container) {
    // Добавляем подсказки для свайпа по фото
    const leftIndicator = document.createElement('div');
    leftIndicator.className = 'photo-swipe-indicator left';
    leftIndicator.innerHTML = '◀';
    leftIndicator.style.cssText = `
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 30px;
      color: white;
      background: rgba(0,0,0,0.3);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      pointer-events: none;
      z-index: 5;
    `;
    
    const rightIndicator = document.createElement('div');
    rightIndicator.className = 'photo-swipe-indicator right';
    rightIndicator.innerHTML = '▶';
    rightIndicator.style.cssText = `
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 30px;
      color: white;
      background: rgba(0,0,0,0.3);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      pointer-events: none;
      z-index: 5;
    `;
    
    container.appendChild(leftIndicator);
    container.appendChild(rightIndicator);
  }

  // Переменные для обработки свайпов
  let touchStartTime = 0;
  let isTouchForPhoto = false;
  let photoSwipeStartX = 0;
  let photoSwipeStartY = 0;

  function handlePhotoTouchStart(e) {
    const touch = e.touches[0];
    photoSwipeStartX = touch.clientX;
    photoSwipeStartY = touch.clientY;
    touchStartTime = Date.now();
    isTouchForPhoto = true;
  }

  function handlePhotoTouchEnd(e) {
    if (!isTouchForPhoto) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - photoSwipeStartX;
    const deltaY = touch.clientY - photoSwipeStartY;
    const touchDuration = Date.now() - touchStartTime;
    
    // Если тап был короткий (не свайп) и смещение маленькое - это клик
    if (touchDuration < 200 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      handlePhotoClick(e);
    } else if (Math.abs(deltaX) > 30 && Math.abs(deltaY) < 50) {
      // Это свайп по горизонтали
      if (deltaX > 0) {
        switchPhoto(-1); // Свайп вправо - предыдущее фото
      } else {
        switchPhoto(1); // Свайп влево - следующее фото
      }
    }
    
    isTouchForPhoto = false;
  }

  function handlePhotoClick(e) {
    if (e.target.classList.contains('photo-swipe-indicator')) return;
    
    const photoRect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX || (e.touches && e.touches[0].clientX);
    
    if (clickX) {
      const photoWidth = photoRect.width;
      const clickPosition = clickX - photoRect.left;
      
      // Определяем, в какую часть фото кликнули
      if (clickPosition < photoWidth / 3) {
        // Левая треть - предыдущее фото
        switchPhoto(-1);
      } else if (clickPosition > (photoWidth / 3) * 2) {
        // Правая треть - следующее фото
        switchPhoto(1);
      }
      // Центральная треть - ничего не делаем (можно добавить зум в будущем)
    }
  }

  function handleTouchStart(e) {
    const touch = e.touches[0];
    swipeStartX = touch.clientX;
    swipeStartY = touch.clientY;
    isSwiping = false; // Сбрасываем флаг свайпа
    
    const candidateCard = document.getElementById('candidate-card');
    candidateCard.style.transition = 'none';
  }

  function handleTouchMove(e) {
    if (!swipeStartX && !swipeStartY) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeStartX;
    const deltaY = touch.clientY - swipeStartY;
    
    // Если вертикальное движение значительное - это скролл страницы
    if (Math.abs(deltaY) > 10 && Math.abs(deltaY) > Math.abs(deltaX)) {
      isSwiping = false;
      return; // Позволяем странице скроллиться
    }
    
    // Если горизонтальное движение значительное - это свайп карточки
    if (Math.abs(deltaX) > 10) {
      e.preventDefault(); // Предотвращаем скролл только для горизонтальных свайпов
      isSwiping = true;
      
      const candidateCard = document.getElementById('candidate-card');
      const opacity = 1 - Math.abs(deltaX) / 300;
      
      candidateCard.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.1}deg)`;
      candidateCard.style.opacity = Math.max(opacity, 0.5);
      
      // Показываем подсказку
      if (deltaX > 50) {
        showSwipeFeedback('like');
      } else if (deltaX < -50) {
        showSwipeFeedback('dislike');
      }
    }
  }

  function handleTouchEnd(e) {
    if (!swipeStartX && !swipeStartY) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - swipeStartX;
    
    const candidateCard = document.getElementById('candidate-card');
    candidateCard.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    
    if (isSwiping && Math.abs(deltaX) > 100) {
      // Свайп выполнен
      if (deltaX > 0) {
        handleSwipeRight();
      } else {
        handleSwipeLeft();
      }
    } else {
      // Возвращаем на место
      candidateCard.style.transform = 'translateX(0) rotate(0deg)';
      candidateCard.style.opacity = 1;
    }
    
    // Сбрасываем переменные
    swipeStartX = 0;
    swipeStartY = 0;
    isSwiping = false;
  }

  // Обработчики для мыши
  function handleMouseDown(e) {
    swipeStartX = e.clientX;
    swipeStartY = e.clientY;
    isSwiping = false;
    
    const candidateCard = document.getElementById('candidate-card');
    candidateCard.style.transition = 'none';
  }

  function handleMouseMove(e) {
    if (!swipeStartX && !swipeStartY) return;
    
    const deltaX = e.clientX - swipeStartX;
    const deltaY = e.clientY - swipeStartY;
    
    // Если вертикальное движение значительное - это скролл страницы
    if (Math.abs(deltaY) > 10 && Math.abs(deltaY) > Math.abs(deltaX)) {
      isSwiping = false;
      return;
    }
    
    // Если горизонтальное движение значительное - это свайп карточки
    if (Math.abs(deltaX) > 10) {
      e.preventDefault();
      isSwiping = true;
      
      const candidateCard = document.getElementById('candidate-card');
      const opacity = 1 - Math.abs(deltaX) / 300;
      
      candidateCard.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.1}deg)`;
      candidateCard.style.opacity = Math.max(opacity, 0.5);
      
      if (deltaX > 50) {
        showSwipeFeedback('like');
      } else if (deltaX < -50) {
        showSwipeFeedback('dislike');
      }
    }
  }

  function handleMouseEnd(e) {
    if (!swipeStartX && !swipeStartY) return;
    
    const deltaX = e.clientX - swipeStartX;
    
    const candidateCard = document.getElementById('candidate-card');
    candidateCard.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    
    if (isSwiping && Math.abs(deltaX) > 100) {
      if (deltaX > 0) {
        handleSwipeRight();
      } else {
        handleSwipeLeft();
      }
    } else {
      candidateCard.style.transform = 'translateX(0) rotate(0deg)';
      candidateCard.style.opacity = 1;
    }
    
    swipeStartX = 0;
    swipeStartY = 0;
    isSwiping = false;
  }

  function handleMouseLeave(e) {
    if (!isSwiping) return;
    
    const candidateCard = document.getElementById('candidate-card');
    candidateCard.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    candidateCard.style.transform = 'translateX(0) rotate(0deg)';
    candidateCard.style.opacity = 1;
    
    swipeStartX = 0;
    swipeStartY = 0;
    isSwiping = false;
  }

  function handleSwipeRight() {
    showSwipeAnimation('right');
    
    setTimeout(() => {
      handleLike();
    }, 300);
  }

  function handleSwipeLeft() {
    showSwipeAnimation('left');
    
    setTimeout(() => {
      handleDislike();
    }, 300);
  }

  function showSwipeAnimation(direction) {
    const candidateCard = document.getElementById('candidate-card');
    
    if (direction === 'left') {
      candidateCard.classList.add('swipe-left');
    } else {
      candidateCard.classList.add('swipe-right');
    }
    
    setTimeout(() => {
      candidateCard.classList.remove('swipe-left', 'swipe-right');
      candidateCard.style.transform = 'translateX(0) rotate(0deg)';
      candidateCard.style.opacity = 1;
    }, 500);
  }

  function showSwipeFeedback(type) {
    const feedback = document.getElementById('swipe-feedback');
    
    if (!feedback) return;
    
    feedback.textContent = type === 'like' ? '❤️' : '✖️';
    feedback.className = `swipe-feedback ${type}`;
    feedback.classList.remove('hidden');
    
    setTimeout(() => {
      feedback.classList.add('hidden');
    }, 800);
  }

  function switchPhoto(direction) {
    if (candidatePhotos.length <= 1) return;
    
    const oldIndex = currentPhotoIndex;
    currentPhotoIndex += direction;
    
    if (currentPhotoIndex < 0) {
      currentPhotoIndex = candidatePhotos.length - 1;
    } else if (currentPhotoIndex >= candidatePhotos.length) {
      currentPhotoIndex = 0;
    }
    
    updateCandidatePhoto();
    updatePhotoIndicators();
    
    // Анимация переключения
    const photoElement = document.getElementById('candidate-photo');
    photoElement.style.transition = 'opacity 0.3s ease';
    photoElement.style.opacity = '0';
    
    setTimeout(() => {
      photoElement.style.opacity = '1';
    }, 50);
    
    // Вибрация (если доступно)
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    console.log(`🔄 Переключение фото: ${oldIndex} → ${currentPhotoIndex}`);
  }

  function updateCandidatePhoto() {
    if (candidatePhotos.length > 0 && currentPhotoIndex < candidatePhotos.length) {
      const photoUrl = candidatePhotos[currentPhotoIndex];
      const photoElement = document.getElementById("candidate-photo");
      
      // Предзагрузка следующего фото для плавного переключения
      if (candidatePhotos.length > 1) {
        const nextIndex = (currentPhotoIndex + 1) % candidatePhotos.length;
        const nextPhotoUrl = candidatePhotos[nextIndex];
        const img = new Image();
        img.src = nextPhotoUrl;
      }
      
      photoElement.src = photoUrl;
    }
  }

  function updateCandidateInterests() {
    const interestsContainer = document.getElementById('candidate-interests');
    if (!interestsContainer) return;
    
    interestsContainer.innerHTML = '';
    
    const interestLabels = {
      'travel': 'Путешествия',
      'movies': 'Кино',
      'art': 'Искусство',
      'sport': 'Спорт',
      'photography': 'Фотография',
      'dancing': 'Танцы',
      'music': 'Музыка',
      'cooking': 'Кулинария',
      'business': 'Бизнес',
      'gaming': 'Гейминг',
      'cars': 'Автомобили',
      'anime': 'Аниме',
      'tattoos': 'Татуировки',
      'piercing': 'Пирсинг',
      'workout': 'Тренировки',
      'wine': 'Вино',
      'boardgames': 'Настольные игры'
    };
    
    candidateInterests.forEach(interest => {
      const tag = document.createElement('div');
      tag.className = 'interest-tag-small';
      tag.textContent = interestLabels[interest] || interest;
      interestsContainer.appendChild(tag);
    });
  }

  function updatePhotoIndicators() {
    const indicatorsContainer = document.querySelector('.photo-indicators');
    if (!indicatorsContainer) return;
    
    indicatorsContainer.innerHTML = '';
    
    for (let i = 0; i < candidatePhotos.length; i++) {
      const indicator = document.createElement('div');
      indicator.className = `photo-indicator ${i === currentPhotoIndex ? 'active' : ''}`;
      indicator.dataset.index = i;
      
      indicator.addEventListener('click', (e) => {
        e.stopPropagation(); // Предотвращаем срабатывание клика на фото
        currentPhotoIndex = i;
        updateCandidatePhoto();
        updatePhotoIndicators();
      });
      
      indicatorsContainer.appendChild(indicator);
    }
  }
  
  // ===== ОБРАБОТЧИК КНОПКИ "НАЧАТЬ ЗНАКОМСТВО" =====
  function setupStartButton() {
    if (!startBtn) return;
    
    startBtn.addEventListener('click', handleStartClick, { passive: true });
    startBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      handleStartClick();
    }, { passive: false });
  }
  
  function handleStartClick() {
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
    
    if (welcomeScreen) {
      welcomeScreen.classList.add("hidden");
    }
    
    if (animatedWelcomeScreen) {
      animatedWelcomeScreen.classList.add('hidden');
    }
    
    profileData = loadProfile();
    
    if (profileData) {
      showMainApp();
    } else {
      showOnboarding();
    }
  }

  // ===== ПОКАЗАТЬ АНИМИРОВАННЫЙ ЭКРАН ПРИВЕТСТВИЯ =====
  function showAnimatedWelcomeScreen() {
    if (!animatedWelcomeScreen) return;
    
    if (welcomeScreen) {
      welcomeScreen.classList.add('hidden');
    }
    
    animatedWelcomeScreen.classList.remove('hidden');
    
    const animatedSubtitle = document.getElementById('animated-subtitle');
    if (animatedSubtitle) {
      setTimeout(() => {
        hideAnimatedWelcomeScreen();
      }, 6500);
      
      animatedSubtitle.addEventListener('animationend', function() {
        setTimeout(hideAnimatedWelcomeScreen, 2000);
      }, { once: true });
    }
  }
  
  function hideAnimatedWelcomeScreen() {
    if (!animatedWelcomeScreen) return;
    
    animatedWelcomeScreen.style.animation = 'fadeOutScreen 0.8s ease forwards';
    
    setTimeout(() => {
      animatedWelcomeScreen.classList.add('hidden');
      animatedWelcomeScreen.style.animation = '';
      
      showMainApp();
      
      initVerification();
      initLikesSystem();
      initInterestsSystem();
      initFiltersSystem();
      initBoostSystem();
      initSwipesSystem();
      initChatsSystem();
      initBonusSystem();
      
      setActiveTab("feed");
      
      setTimeout(() => {
        showNotification("🍀 С возвращением в SiaMatch!\n\nЖелаем вам найти свою идеальную пару! ❤️");
      }, 500);
    }, 800);
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
    
    saveProfileBtn.addEventListener('click', handleSaveProfile, { passive: true });
    saveProfileBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      handleSaveProfile();
    }, { passive: false });
    
    saveProfileBtn.style.display = 'block';
  }
  
  function handleSaveProfile() {
    document.activeElement?.blur();
    document.body.classList.remove('keyboard-open');
    if (card) card.style.transform = 'translateY(0)';
    
    setTimeout(() => {
      const ageValue = Number(document.getElementById("age").value);
      const gender = document.getElementById("gender").value;
      const city = document.getElementById("city").value;
      const bio = document.getElementById("bio").value.trim();
      
      if (!ageValue || ageValue < 18 || ageValue > 99) {
        showNotification("Возраст должен быть от 18 до 99 лет");
        return;
      }
      if (!gender) {
        showNotification("Выберите пол");
        return;
      }
      if (!city) {
        showNotification("Выберите город");
        return;
      }
      if (bio.length < 10) {
        showNotification("О себе минимум 10 символов");
        return;
      }
      
      const user = tg?.initDataUnsafe?.user || { id: 1, first_name: "Пользователь" };
      profileData = {
        tg_id: user.id,
        first_name: user.first_name || "Пользователь",
        username: user.username || "",
        age: ageValue,
        gender,
        city,
        bio,
        photos: [],
        verification_status: 'not_verified'
      };
      
      if (saveProfile(profileData)) {
        if (tg?.HapticFeedback) {
          try {
            tg.HapticFeedback.impactOccurred('medium');
          } catch (e) {}
        }
        
        loadPendingBonuses();
        
        initVerification();
        initLikesSystem();
        initInterestsSystem();
        initFiltersSystem();
        initBoostSystem();
        initSwipesSystem();
        initChatsSystem();
        initBonusSystem();
        showMainApp();
        
        setTimeout(() => {
          showNotification("✅ Профиль сохранён! Добро пожаловать в SiaMatch 🍀\n\nТеперь вы можете:\n1. Пройти верификацию анкеты (+20 свайпов)\n2. Выбрать свои интересы\n3. Настроить фильтры поиска\n4. Познакомиться с людьми в чатах\n5. Получить бонусные свайпы и бусты!");
        }, 300);
      } else {
        showNotification("❌ Ошибка при сохранении профиля");
      }
    }, 300);
  }
  
  // ===== ИНИЦИАЛИЗАЦИЯ СВАЙПИНГА =====
  function initSwiping() {
    console.log('🔄 Инициализация системы свайпов');
    initSwipeSystem();
    showCurrentCandidate();
  }
  
  // ===== ЛЕНТА СВАЙПОВ С ФИЛЬТРАЦИЕЙ =====
  function initFeed() {
    currentIndex = 0;
    initSearchFilters();
    initSwipeSystem();
    showCurrentCandidate();
  }
  
  function initFiltersTab() {
    initSearchFilters();
  }
  
  function getFilteredCandidates() {
    let filtered = candidates.filter(c => !likedIds.includes(c.id));
    
    filtered = filtered.filter(c => {
      return c.age >= searchFilters.minAge && c.age <= searchFilters.maxAge;
    });
    
    if (searchFilters.genders.length > 0) {
      filtered = filtered.filter(c => {
        return searchFilters.genders.includes(c.gender);
      });
    }
    
    if (searchFilters.interests.length > 0) {
      filtered = filtered.filter(c => {
        return searchFilters.interests.some(interest => 
          c.interests.includes(interest)
        );
      });
    }
    
    if (searchFilters.datingGoal) {
      filtered = filtered.filter(c => {
        return c.dating_goal === searchFilters.datingGoal;
      });
    }
    
    filtered.sort((a, b) => {
      if (a.boosted && !b.boosted) return -1;
      if (!a.boosted && b.boosted) return 1;
      return 0;
    });
    
    return filtered;
  }
  
  function showCurrentCandidate() {
    const filtered = getFilteredCandidates();
    
    if (filtered.length === 0) {
      document.getElementById("candidate-name").textContent = "";
      document.getElementById("candidate-age").textContent = "";
      document.getElementById("candidate-city").textContent = "";
      document.getElementById("candidate-bio").textContent = "";
      document.getElementById("candidate-photo").src = "";
      document.getElementById("candidate-interests").innerHTML = "";
      
      const verifiedBadge = document.getElementById('candidate-verified');
      if (verifiedBadge) verifiedBadge.classList.add('hidden');
      
      const boostBadge = document.getElementById('candidate-boost');
      if (boostBadge) boostBadge.classList.add('hidden');
      
      document.getElementById("feed-status").textContent = 
        "Нет подходящих анкет по вашим фильтрам. Попробуйте изменить параметры поиска 🍀";
      
      candidatePhotos = [];
      candidateInterests = [];
      currentPhotoIndex = 0;
      updatePhotoIndicators();
      return;
    }
    
    if (currentIndex >= filtered.length) {
      document.getElementById("candidate-name").textContent = "";
      document.getElementById("candidate-age").textContent = "";
      document.getElementById("candidate-city").textContent = "";
      document.getElementById("candidate-bio").textContent = "";
      document.getElementById("candidate-photo").src = "";
      document.getElementById("candidate-interests").innerHTML = "";
      
      const verifiedBadge = document.getElementById('candidate-verified');
      if (verifiedBadge) verifiedBadge.classList.add('hidden');
      
      const boostBadge = document.getElementById('candidate-boost');
      if (boostBadge) boostBadge.classList.add('hidden');
      
      document.getElementById("feed-status").textContent = 
        "На сегодня всё! Загляните позже 🍀";
      
      candidatePhotos = [];
      candidateInterests = [];
      currentPhotoIndex = 0;
      updatePhotoIndicators();
      return;
    }
    
    const candidate = filtered[currentIndex];
    currentCandidateId = candidate.id;
    
    candidatePhotos = candidate.photos || [candidate.photo];
    candidateInterests = candidate.interests || [];
    currentPhotoIndex = 0;
    
    document.getElementById("candidate-name").textContent = candidate.name;
    document.getElementById("candidate-age").textContent = candidate.age;
    document.getElementById("candidate-city").textContent = candidate.city;
    document.getElementById("candidate-bio").textContent = candidate.bio;
    document.getElementById("feed-status").textContent = "";
    
    updateCandidatePhoto();
    updateCandidateInterests();
    updatePhotoIndicators();
    
    const verifiedBadge = document.getElementById('candidate-verified');
    if (verifiedBadge) {
      if (candidate.verified) {
        verifiedBadge.classList.remove('hidden');
      } else {
        verifiedBadge.classList.add('hidden');
      }
    }
    
    const boostBadge = document.getElementById('candidate-boost');
    if (boostBadge) {
      if (candidate.boosted) {
        boostBadge.classList.remove('hidden');
      } else {
        boostBadge.classList.add('hidden');
      }
    }
  }

  function handleLike() {
    if (!useSwipe()) return;
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
    
    const filtered = getFilteredCandidates();
    if (currentIndex < filtered.length) {
      const likedUser = filtered[currentIndex];
      likedIds.push(likedUser.id);
      currentIndex++;
      showCurrentCandidate();
      
      checkForMatch(likedUser.id);
      
      console.log(`❤️ Лайк пользователю ${likedUser.name} (ID: ${likedUser.id})`);
    }
  }
  
  function handleDislike() {
    if (!useSwipe()) return;
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
    
    const filtered = getFilteredCandidates();
    if (currentIndex < filtered.length) {
      const dislikedUser = filtered[currentIndex];
      currentIndex++;
      showCurrentCandidate();
      
      console.log(`✖️ Дизлайк пользователю ${dislikedUser.name} (ID: ${dislikedUser.id})`);
    }
  }
  
  function checkForMatch(likedUserId) {
    if (Math.random() > 0.7) {
      if (usersWhoLikedMeCount > 0) {
        usersWhoLikedMeCount--;
        saveLikesData();
        updateLikesUI();
        
        setTimeout(() => {
          showNotification('🎉 У вас взаимная симпатия! Один из ваших тайных поклонников ответил вам взаимностью! Теперь вы можете начать общение в чатах.');
        }, 500);
      }
    }
  }
  
  // ===== ПРОФИЛЬ =====
  function initProfile() {
    // Сначала загружаем профиль
    profileData = loadProfile();
    
    if (!profileData) {
      console.error('❌ Нет данных профиля');
      return;
    }
    
    console.log('👤 Инициализация профиля:', {
      имя: profileData.first_name,
      фото: profileData.photos ? `${profileData.photos.length} шт` : 'нет',
      все_данные: profileData
    });
    
    if (profileData) {
      updateProfileDisplay();
      updateEditForm();
    }
    
    // ВАЖНО: Инициализируем фото ПЕРЕД обновлением UI
    initProfilePhotos();
    
    updateVerificationUI();
    updateBoostUI();
    initInterestsSystem();
  }

  function initProfilePhotos() {
    const addPhotoBtn = document.getElementById('add-photo-btn');
    const removePhotoBtn = document.getElementById('remove-photo-btn');
    const photoUpload = document.getElementById('profile-photo-upload');
    
    // ИНИЦИАЛИЗИРУЕМ МАССИВ ФОТО ПРАВИЛЬНО
    if (!profileData.photos || !Array.isArray(profileData.photos)) {
      profileData.photos = [];
      
      // Если есть старое фото, добавляем его
      if (profileData.custom_photo_url) {
        profileData.photos.push(profileData.custom_photo_url);
        // Очищаем старое поле, чтобы не было дублирования
        delete profileData.custom_photo_url;
        saveProfile(profileData);
      }
    }
    
    updateProfilePhotos();
    
    if (addPhotoBtn) {
      addPhotoBtn.addEventListener('click', () => {
        photoUpload.click();
      });
    }
    
    if (removePhotoBtn) {
      removePhotoBtn.addEventListener('click', removeCurrentPhoto);
    }
    
    if (photoUpload) {
      photoUpload.addEventListener('change', handleProfilePhotoUpload);
    }
    
    const profilePhotosContainer = document.querySelector('.profile-photos-container');
    if (profilePhotosContainer) {
      profilePhotosContainer.addEventListener('touchstart', handleProfilePhotoTouchStart);
      profilePhotosContainer.addEventListener('touchend', handleProfilePhotoTouchEnd);
    }
  }

  function handleProfilePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 3 * 1024 * 1024) { // Уменьшили лимит для iOS
      showNotification('Фото слишком большое (максимум 3MB)');
      return;
    }
    
    if (profileData.photos.length >= 3) {
      showNotification('Можно добавить не более 3 фото');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
      let photoUrl = event.target.result;
      
      // iOS: Обрабатываем фото перед сохранением
      if (isIOS) {
        console.log('📱 iOS: Обработка загруженного фото...');
        
        // Сжимаем фото для iOS
        const compressedPhoto = compressImageForIOS(photoUrl);
        if (compressedPhoto) {
          photoUrl = compressedPhoto;
          
          // Убедимся, что photos - это массив
          if (!Array.isArray(profileData.photos)) {
            profileData.photos = [];
          }
          
          profileData.photos.push(photoUrl);
          
          // Сохраняем с специальной обработкой для iOS
          if (saveProfile(profileData)) {
            updateProfilePhotos();
            
            // Дополнительное сохранение для iOS
            if (isIOS) {
              setTimeout(() => {
                // Пересохраняем для надежности
                saveProfile(profileData);
                showNotification('✅ Фото добавлено (iOS оптимизация) 📸');
              }, 500);
            } else {
              showNotification('Фото добавлено! 📸');
            }
          } else {
            showNotification('Ошибка при сохранении фото');
          }
        }
      } else {
        // Не iOS - обычная обработка
        if (!Array.isArray(profileData.photos)) {
          profileData.photos = [];
        }
        
        profileData.photos.push(photoUrl);
        
        if (saveProfile(profileData)) {
          updateProfilePhotos();
          showNotification('Фото добавлено! 📸');
        } else {
          showNotification('Ошибка при сохранении фото');
        }
      }
    };
    
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function updateProfilePhotos() {
    if (!profileData || !profileData.photos || profileData.photos.length === 0) {
      console.log('🖼️ Нет фото для отображения');
      return;
    }
    
    const container = document.querySelector('.profile-photos-container');
    const indicators = document.querySelector('.profile-photo-indicators');
    const photosCount = document.getElementById('photos-count');
    const removeBtn = document.getElementById('remove-photo-btn');
    
    if (!container || !indicators) {
      console.warn('⚠️ Нет элементов для отображения фото');
      return;
    }
    
    console.log('🖼️ Отображение фото:', profileData.photos.length);
    
    container.innerHTML = '';
    
    // Отображаем только первое фото (главное)
    if (profileData.photos[0]) {
      const img = document.createElement('img');
      img.className = 'profile-main-photo active';
      img.src = profileData.photos[0];
      img.alt = 'Главное фото';
      container.appendChild(img);
    }
    
    indicators.innerHTML = '';
    // Показываем индикаторы для всех фото
    profileData.photos.forEach((_, index) => {
      const indicator = document.createElement('div');
      indicator.className = `profile-photo-indicator ${index === 0 ? 'active' : ''}`;
      indicator.dataset.index = index;
      indicators.appendChild(indicator);
    });
    
    if (photosCount) {
      photosCount.textContent = `${profileData.photos.length}/3 фото`;
    }
    
    if (removeBtn) {
      removeBtn.disabled = profileData.photos.length <= 1;
    }
  }

  function removeCurrentPhoto() {
    if (!profileData.photos || profileData.photos.length <= 1) {
      showNotification('Нужно оставить хотя бы одно фото');
      return;
    }
    
    // Удаляем текущее (первое) фото
    profileData.photos.shift();
    
    if (saveProfile(profileData)) {
      updateProfilePhotos();
      showNotification('Фото удалено');
    } else {
      showNotification('Ошибка при удалении фото');
    }
  }

  function handleProfilePhotoTouchStart(e) {
    const touch = e.touches[0];
    swipeStartX = touch.clientX;
  }

  function handleProfilePhotoTouchEnd(e) {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - swipeStartX;
    
    if (Math.abs(deltaX) > 30 && profileData.photos && profileData.photos.length > 1) {
      const currentIndex = 0;
      const nextIndex = deltaX > 0 ? 
        (currentIndex - 1 + profileData.photos.length) % profileData.photos.length :
        (currentIndex + 1) % profileData.photos.length;
      
      const temp = profileData.photos[currentIndex];
      profileData.photos[currentIndex] = profileData.photos[nextIndex];
      profileData.photos[nextIndex] = temp;
      
      saveProfile(profileData);
      updateProfilePhotos();
      
      showNotification('Фото изменено местами');
    }
  }
  
  function updateProfileDisplay() {
    const profileNameElem = document.getElementById('profile-name');
    const profileAgeElem = document.getElementById('profile-age-display');
    const profileGenderElem = document.getElementById('profile-gender-display');
    const profileCityElem = document.getElementById('profile-city-display');
    const profilePhotoElem = document.getElementById('profile-photo-preview');
    
    if (!profileData) {
      console.warn('⚠️ Нет данных профиля для отображения');
      return;
    }
    
    console.log('🔄 Обновление отображения профиля:', {
      имя: profileData.first_name,
      фото: profileData.photos?.length || 0
    });
    
    if (profileNameElem) {
      profileNameElem.textContent = profileData.first_name || "Пользователь";
    }
    
    if (profileAgeElem) {
      profileAgeElem.textContent = profileData.age ? `${profileData.age} лет` : "";
    }
    
    if (profileGenderElem) {
      const genderMap = {
        'male': 'Мужской',
        'female': 'Женский'
      };
      profileGenderElem.textContent = profileData.gender ? genderMap[profileData.gender] || profileData.gender : "";
    }
    
    if (profileCityElem) {
      profileCityElem.textContent = profileData.city || "";
    }
    
    // Удалите эту часть - фото теперь отображаются через updateProfilePhotos
    if (profilePhotoElem) {
      profilePhotoElem.style.display = 'none';
    }
  }
  
  function updateEditForm() {
    const editAgeElem = document.getElementById("edit-age");
    const editGenderElem = document.getElementById("edit-gender");
    const editCityElem = document.getElementById("edit-city");
    const editBioElem = document.getElementById("edit-bio");
    const editPhotoElem = document.getElementById('edit-photo-preview');
    
    if (editAgeElem) editAgeElem.value = profileData.age || "";
    if (editGenderElem) editGenderElem.value = profileData.gender || "";
    if (editCityElem) editCityElem.value = profileData.city || "";
    if (editBioElem) editBioElem.value = profileData.bio || "";
    
    if (editPhotoElem && profileData.custom_photo_url) {
      editPhotoElem.src = profileData.custom_photo_url;
      editPhotoElem.style.display = 'block';
    }
  }
  
  function handleEditProfile() {
    document.getElementById('profile-display').classList.add('hidden');
    document.getElementById('profile-edit').classList.remove('hidden');
    
    // Инициализируем перетаскивание фото
    initPhotoDragAndDrop();
    
    if (tg?.HapticFeedback) {
      try {
        tg.HapticFeedback.selectionChanged();
      } catch (e) {}
    }
  }
  
  function handleSaveProfileChanges() {
    document.activeElement?.blur();
    document.body.classList.remove('keyboard-open');
    if (card) card.style.transform = 'translateY(0)';
    
    setTimeout(() => {
      if (!profileData) {
        showNotification("Сначала создайте профиль!");
        return;
      }
      
      try {
        // Получаем данные из формы
        const age = Number(document.getElementById("edit-age").value);
        const gender = document.getElementById("edit-gender").value;
        const city = document.getElementById("edit-city").value;
        const bio = document.getElementById("edit-bio").value.trim();
        
        // Проверяем данные
        if (!age || age < 18 || age > 99) {
          showNotification("Возраст должен быть от 18 до 99 лет");
          return;
        }
        
        if (!gender) {
          showNotification("Выберите пол");
          return;
        }
        
        if (!city) {
          showNotification("Выберите город");
          return;
        }
        
        if (!bio || bio.length < 10) {
          showNotification("О себе минимум 10 символов");
          return;
        }
        
        // Важно: сохраняем фото отдельно, они не в форме
        const currentPhotos = profileData.photos || [];
        
        // Создаем обновленный объект профиля
        const updatedProfile = {
          ...profileData,
          age: age,
          gender: gender,
          city: city,
          bio: bio,
          photos: currentPhotos // Сохраняем текущие фото
        };
        
        // Сохраняем
        if (saveProfile(updatedProfile)) {
          // Обновляем глобальную переменную
          profileData = updatedProfile;
          
          updateProfileDisplay();
          updateProfilePhotos(); // Важно: обновляем отображение фото
          
          // iOS автосохранение
          if (isIOS) {
            autoSaveForIOS();
          }
          
          // Плавно скрываем режим редактирования
          document.getElementById('profile-edit').style.opacity = '0';
          setTimeout(() => {
            document.getElementById('profile-display').classList.remove('hidden');
            document.getElementById('profile-edit').classList.add('hidden');
            document.getElementById('profile-edit').style.opacity = '1';
          }, 300);
          
          showNotification("✅ Профиль обновлён!");
          
          if (tg?.HapticFeedback) {
            try {
              tg.HapticFeedback.impactOccurred('light');
            } catch (e) {}
          }
        } else {
          showNotification("❌ Ошибка при сохранении профиля");
        }
      } catch (error) {
        console.error('Ошибка при сохранении профиля:', error);
        showNotification("❌ Ошибка при обновлении профиля: " + error.message);
      }
    }, 300);
  }
  
  function handleCancelEdit() {
    document.getElementById('profile-display').classList.remove('hidden');
    document.getElementById('profile-edit').classList.add('hidden');
  }
  
  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      showNotification('Фото слишком большое (максимум 5MB)');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
      const isEditMode = !document.getElementById('profile-edit').classList.contains('hidden');
      
      if (isEditMode) {
        const preview = document.getElementById('edit-photo-preview');
        if (preview) {
          preview.src = event.target.result;
          preview.style.display = 'block';
        }
        
        profileData.custom_photo_url = event.target.result;
      } else {
        const preview = document.getElementById('profile-photo-preview');
        if (preview) {
          preview.src = event.target.result;
          preview.style.display = 'block';
        }
        
        profileData.custom_photo_url = event.target.result;
        saveProfile(profileData);
        showNotification('Фото загружено! 📸');
      }
    };
    reader.readAsDataURL(file);
  }
  
  // ===== ФУНКЦИИ ПЕРЕТАСКИВАНИЯ ФОТОГРАФИЙ =====
  
  function initPhotoDragAndDrop() {
    const container = document.getElementById('all-photos-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!profileData.photos || profileData.photos.length === 0) {
      container.innerHTML = `
        <div class="no-photos-message">
          <div class="no-photos-icon">📸</div>
          <div class="no-photos-text">У вас нет фотографий</div>
        </div>
      `;
      return;
    }
    
    // Отображаем все фото
    profileData.photos.forEach((photoUrl, index) => {
      const photoItem = document.createElement('div');
      photoItem.className = `photo-item`;
      photoItem.draggable = true;
      photoItem.dataset.index = index;
      
      // Пометим первое фото как главное
      if (index === 0) {
        photoItem.classList.add('main-photo');
      }
      
      photoItem.innerHTML = `
        <div class="photo-number">${index + 1}</div>
        <img src="${photoUrl}" alt="Фото ${index + 1}" />
      `;
      
      // События для перетаскивания
      photoItem.addEventListener('dragstart', handleDragStart);
      photoItem.addEventListener('dragover', handleDragOver);
      photoItem.addEventListener('dragenter', handleDragEnter);
      photoItem.addEventListener('dragleave', handleDragLeave);
      photoItem.addEventListener('drop', handleDrop);
      photoItem.addEventListener('dragend', handleDragEnd);
      
      // Обработчик клика для выбора главного фото
      photoItem.addEventListener('click', (e) => {
        if (e.target.closest('.photo-number')) return; // Не сработает на номере
        
        // Снимаем выделение со всех фото
        document.querySelectorAll('.photo-item').forEach(item => {
          item.classList.remove('main-photo');
        });
        
        // Выделяем текущее фото
        photoItem.classList.add('main-photo');
      });
      
      container.appendChild(photoItem);
    });
    
    // Создаем кнопки управления
    createPhotoControls();
  }

  function handleDragStart(e) {
    draggedPhotoIndex = parseInt(e.target.dataset.index);
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    
    // Для мобильных устройств
    if (isIOS) {
      e.dataTransfer.setData('text/plain', draggedPhotoIndex.toString());
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDragEnter(e) {
    e.preventDefault();
    if (e.target.classList.contains('photo-item')) {
      draggedOverPhotoIndex = parseInt(e.target.dataset.index);
      e.target.style.border = '3px dashed var(--siamatch-green)';
    }
  }

  function handleDragLeave(e) {
    if (e.target.classList.contains('photo-item')) {
      e.target.style.border = '3px solid transparent';
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    
    if (e.target.classList.contains('photo-item')) {
      draggedOverPhotoIndex = parseInt(e.target.dataset.index);
      
      if (draggedPhotoIndex !== null && draggedOverPhotoIndex !== null && 
          draggedPhotoIndex !== draggedOverPhotoIndex) {
        // Меняем фото местами
        swapPhotos(draggedPhotoIndex, draggedOverPhotoIndex);
      }
      
      e.target.style.border = '3px solid transparent';
    }
  }

  function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    
    // Сбрасываем стили всех фото
    document.querySelectorAll('.photo-item').forEach(item => {
      item.style.border = '3px solid transparent';
    });
    
    draggedPhotoIndex = null;
    draggedOverPhotoIndex = null;
  }

  function swapPhotos(index1, index2) {
    if (!profileData.photos || profileData.photos.length < 2) return;
    
    // Проверяем индексы
    if (index1 < 0 || index1 >= profileData.photos.length || 
        index2 < 0 || index2 >= profileData.photos.length) {
      return;
    }
    
    // Меняем местами
    const temp = profileData.photos[index1];
    profileData.photos[index1] = profileData.photos[index2];
    profileData.photos[index2] = temp;
    
    // Сохраняем изменения
    saveProfile(profileData);
    
    // iOS автосохранение
    if (isIOS) {
      autoSaveForIOS();
    }
    
    // Обновляем отображение
    initPhotoDragAndDrop();
    
    // Показываем уведомление
    showNotification(`🔄 Фото ${index1 + 1} и ${index2 + 1} поменялись местами!`);
    
    // Вибрация (если доступно)
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }
  
  function createPhotoControls() {
    const controlsContainer = document.getElementById('photo-controls');
    if (!controlsContainer) return;
    
    controlsContainer.innerHTML = '';
    
    if (!profileData.photos || profileData.photos.length < 2) return;
    
    const controls = document.createElement('div');
    controls.className = 'photo-buttons';
    controls.innerHTML = `
      <div style="display: flex; gap: 10px; margin-top: 15px; justify-content: center; flex-wrap: wrap;">
        <button id="move-up-btn" class="primary" style="flex: 1; min-width: 120px; padding: 12px;">⬆ Поднять</button>
        <button id="move-down-btn" class="primary" style="flex: 1; min-width: 120px; padding: 12px;">⬇ Опустить</button>
        <button id="set-main-btn" class="primary" style="flex: 1; min-width: 140px; padding: 12px;">⭐ Главное</button>
      </div>
    `;
    
    controlsContainer.appendChild(controls);
    
    // Обработчики для кнопок
    document.getElementById('move-up-btn').addEventListener('click', function() {
      movePhotoUp();
    });
    
    document.getElementById('move-down-btn').addEventListener('click', function() {
      movePhotoDown();
    });
    
    document.getElementById('set-main-btn').addEventListener('click', function() {
      setAsMainPhoto();
    });
  }

  function movePhotoUp() {
    const activePhoto = document.querySelector('.photo-item.main-photo');
    if (!activePhoto) {
      showNotification('Сначала выберите фото, нажав на него');
      return;
    }
    
    const currentIndex = parseInt(activePhoto.dataset.index);
    if (currentIndex <= 0) {
      showNotification('Фото уже наверху');
      return;
    }
    
    swapPhotos(currentIndex, currentIndex - 1);
  }

  function movePhotoDown() {
    const activePhoto = document.querySelector('.photo-item.main-photo');
    if (!activePhoto) {
      showNotification('Сначала выберите фото, нажав на него');
      return;
    }
    
    const currentIndex = parseInt(activePhoto.dataset.index);
    if (currentIndex >= profileData.photos.length - 1) {
      showNotification('Фото уже внизу');
      return;
    }
    
    swapPhotos(currentIndex, currentIndex + 1);
  }

  function setAsMainPhoto() {
    const activePhoto = document.querySelector('.photo-item.main-photo');
    if (!activePhoto) {
      showNotification('Сначала выберите фото, нажав на него');
      return;
    }
    
    const currentIndex = parseInt(activePhoto.dataset.index);
    
    // Если фото уже первое, ничего не делаем
    if (currentIndex === 0) {
      showNotification('Это фото уже главное');
      return;
    }
    
    // Перемещаем фото на первую позицию
    const photoToMove = profileData.photos[currentIndex];
    profileData.photos.splice(currentIndex, 1); // Удаляем с текущей позиции
    profileData.photos.unshift(photoToMove); // Добавляем в начало
    
    // Сохраняем изменения
    saveProfile(profileData);
    
    // iOS автосохранение
    if (isIOS) {
      autoSaveForIOS();
    }
    
    // Обновляем отображение
    initPhotoDragAndDrop();
    
    showNotification(`📸 Фото ${currentIndex + 1} теперь главное!`);
    
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }
  
  function setupPhotoTouchEvents() {
    if (!isIOS) return;
    
    let touchStartIndex = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoveThreshold = 50;
    
    document.addEventListener('touchstart', function(e) {
      const photoItem = e.target.closest('.photo-item');
      if (photoItem) {
        touchStartIndex = parseInt(photoItem.dataset.index);
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
      if (touchStartIndex === null) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = Math.abs(touchEndX - touchStartX);
      const deltaY = Math.abs(touchEndY - touchStartY);
      
      const photoItem = e.target.closest('.photo-item');
      if (photoItem && deltaX > touchMoveThreshold && deltaY < touchMoveThreshold) {
        const touchEndIndex = parseInt(photoItem.dataset.index);
        
        if (touchStartIndex !== touchEndIndex) {
          swapPhotos(touchStartIndex, touchEndIndex);
        }
      }
      
      touchStartIndex = null;
    }, { passive: true });
  }
  
  // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-text">${message.replace(/\n/g, '<br>')}</div>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 20px 25px;
      border-radius: 15px;
      z-index: 9999;
      text-align: center;
      max-width: 80%;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      animation: fadeIn 0.3s ease;
    `;
    
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `;
    
    const text = notification.querySelector('.notification-text');
    text.style.cssText = `
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 15px;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, -60%); }
        to { opacity: 1; transform: translate(-50%, -50%); }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translate(-50%, -50%); }
        to { opacity: 0; transform: translate(-50%, -40%); }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      }, 300);
    }, 3000);
    
    notification.addEventListener('click', () => {
      notification.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      }, 300);
    });
  }
  
  // ===== ФУНКЦИЯ ДЛЯ ОЧИСТКИ СЛИШКОМ БОЛЬШИХ ФОТО =====
  function cleanupLargePhotos() {
    try {
      const saved = localStorage.getItem("siamatch_profile");
      if (saved) {
        const data = JSON.parse(saved);
        
        if (data.photos && Array.isArray(data.photos)) {
          let hasLargePhotos = false;
          
          data.photos = data.photos.filter(photo => {
            if (typeof photo === 'string' && photo.startsWith('data:image')) {
              if (photo.length > 500000) { // Более 500KB
                console.warn('⚠️ Удаляем слишком большое фото:', photo.length);
                hasLargePhotos = true;
                return false;
              }
            }
            return true;
          });
          
          if (hasLargePhotos) {
            localStorage.setItem("siamatch_profile", JSON.stringify(data));
            console.log('✅ Очищены слишком большие фото');
            showNotification('⚠️ Некоторые фото были слишком большими и удалены для стабильной работы приложения');
          }
        }
      }
    } catch (e) {
      console.error('❌ Ошибка при очистке фото:', e);
    }
  }
  
  // ===== ФУНКЦИИ ДЛЯ УПРАВЛЕНИЯ ЭКРАНАМИ =====
  function showWelcomeScreen() {
    console.log('🖥️ Показан экран приветствия');
    if (welcomeScreen) welcomeScreen.classList.remove('hidden');
    if (animatedWelcomeScreen) animatedWelcomeScreen.classList.remove('hidden');
    if (appRoot) appRoot.classList.add('hidden');
    if (tabBar) tabBar.classList.add('hidden');
  }
  
  function hideWelcomeScreen() {
    console.log('🖥️ Скрыт экран приветствия');
    if (welcomeScreen) welcomeScreen.classList.add('hidden');
    if (animatedWelcomeScreen) animatedWelcomeScreen.classList.add('hidden');
    if (appRoot) appRoot.classList.remove('hidden');
  }
  
  function showMainApp() {
    console.log('🖥️ Показано главное приложение');
    if (tabBar) tabBar.classList.remove('hidden');
    // Активируем первую вкладку
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-feed')?.classList.add('active');
  }
  
  function updateTabBar() {
    console.log('🔄 Обновление панели вкладок');
    const tabs = document.querySelectorAll('.tab-btn');
    tabs?.forEach((tab, index) => {
      tab.onclick = () => switchTab(index);
    });
    console.log('✅ TabBar активирован');
  }
  
function switchTab(index) {
  console.log('🔄 Переключение вкладки:', index);
  
  // Скрываем все экраны
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
    screen.classList.add('hidden');
  });
  
  // Деактивируем все вкладки
  document.querySelectorAll('.tab-item').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Показываем нужный экран
  const screens = ['screen-swipes', 'screen-likes', 'screen-chats', 'screen-profile'];
  const targetScreen = document.getElementById(screens[index]);
  
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
    targetScreen.classList.add('active');
    document.querySelectorAll('.tab-item')[index].classList.add('active');
    
    // Инициализируем контент экрана
    switch(index) {
      case 0: initSwiping(); break;      // Свайпы
      case 1: updateLikesScreen(); break; // Лайки
      case 2: updateChatsList(); break;   // Чаты
      case 3: updateProfileScreen(); break; // Профиль
    }
  }
}

  function updateLikesScreen() {
  console.log('❤️ Обновление экрана лайков');
  // Твоя логика лайков
}

function updateProfileScreen() {
  console.log('👤 Обновление экрана профиля');
  // Твоя логика профиля
}
  // ===== ИСПРАВЛЕННАЯ ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====
  async function initApp() {
    console.log('🚀 Инициализация SiaMatch...');
    
    if (hasInitialized) return;
    hasInitialized = true;
    
    initTelegram();
    if (isIOS) checkIOSStorage();
    
    // Добавить кнопку отладки
    addDebugButton();
    
    // Отладка
    debugLocalStorage();
    
    // Очистка слишком больших фото перед началом
    cleanupLargePhotos();
    
    profileData = await loadProfile();
    console.log('Профиль:', profileData ? 'найден' : 'отсутствует');
    
    // ✅ ИСПРАВЛЕНИЕ: правильная логика экранов
    if (!profileData || !profileData.first_name || profileData.photos?.length === 0) {
      showWelcomeScreen();
    } else {
      hideWelcomeScreen();
      showMainApp();
      updateTabBar();  // ← ВАЖНО!
      initSwiping();
    }
    
    // Настраиваем обработчики
    setupStartButton();
    updateTabBar();
    
    // Инициализируем все системы
    setTimeout(() => {
      initVerification();
      initLikesSystem();
      initInterestsSystem();
      initFiltersSystem();
      initBoostSystem();
      initSwipesSystem();
      initChatsSystem();
      initBonusSystem();
      
      console.log('✅ Все системы инициализированы');
    }, 100);
  }
  
  // ===== ЗАПУСК =====
  setTimeout(initApp, 100);
});
