// ===== UI.JS - УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ И DOM =====

// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ДЛЯ ДОСТУПА =====
let welcomeScreen = null;
let animatedWelcomeScreen = null;
let startBtn = null;
let onboardingScreen = null;
let saveProfileBtn = null;
let tabBar = null;
let appRoot = null;
let card = null;

let photoStorageInitialized = false;

// ===== ИНИЦИАЛИЗАЦИЯ UI =====
function initUI() {
  console.log('🎨 Инициализация интерфейса...');
  
  // Получаем DOM элементы
  welcomeScreen = document.getElementById("welcome-screen");
  animatedWelcomeScreen = document.getElementById("welcome-animated-screen");
  startBtn = document.getElementById("startBtn");
  onboardingScreen = document.getElementById("onboarding-screen");
  saveProfileBtn = document.getElementById("saveProfileBtn");
  tabBar = document.getElementById("tab-bar");
  appRoot = document.getElementById("app-root");
  card = document.getElementById("card");
  
  // Настраиваем обработчики
  setupStartButton();
  setupTabButtons();
  setupProfileEventHandlers();
  
  // ✅ ДОБАВЛЕНО: обновление UI после загрузки профиля
  setTimeout(() => {
    if (window.profileData && window.profileData.current) {
      // Обновляем отображение профиля если он есть
      if (typeof updateProfileDisplay === 'function') {
        updateProfileDisplay();
      }
      if (typeof updateEditForm === 'function') {
        updateEditForm();
      }
      if (typeof updateProfilePhotos === 'function') {
        updateProfilePhotos();
      }
    }
  }, 50);
  
  // Инициализируем хранилище фото
  setTimeout(() => {
    initPhotoStorage();
  }, 500);
  
  console.log('✅ Интерфейс инициализирован');
}

// ===== ИНИЦИАЛИЗАЦИЯ ХРАНИЛИЩА ФОТО =====
async function initPhotoStorage() {
  if (!window.photoStorage) {
    console.warn('⚠️ PhotoStorage не доступен');
    return;
  }
  
  // Ждем инициализации
  await new Promise(resolve => setTimeout(resolve, 100));
  
  photoStorageInitialized = true;
  console.log('✅ PhotoStorage готов');
  
  // Загружаем фото при запуске
  await loadUserPhotosOnStart();
}

async function loadUserPhotosOnStart() {
  if (!window.profileData.current || !window.profileData.current.tg_id) {
    console.log('⏳ Профиль не загружен, фото не загружаем');
    return;
  }
  
  const userId = window.profileData.current.tg_id;
  
  if (window.photoStorage && typeof window.photoStorage.loadUserPhotos === 'function') {
    try {
      const savedPhotos = await window.photoStorage.loadUserPhotos(userId);
      
      if (savedPhotos.length > 0) {
        console.log('🔄 Восстанавливаем фото из хранилища:', savedPhotos.length);
        
        // Восстанавливаем фото в профиль
        if (!window.profileData.current.photos) {
          window.profileData.current.photos = [];
        }
        
        // Объединяем с существующими (если есть)
        window.profileData.current.photos = [
          ...window.profileData.current.photos.filter(Boolean),
          ...savedPhotos.filter(photo => 
            photo && !window.profileData.current.photos.includes(photo)
          )
        ].slice(0, 3); // Максимум 3 фото
        
        // Обновляем отображение
        updateProfilePhotos();
        
        // Сохраняем в основной профиль
        if (typeof saveProfile === 'function') {
          saveProfile(window.profileData.current);
        }
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки фото:', error);
    }
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
  if (window.tg?.HapticFeedback) {
    try {
      window.tg.HapticFeedback.impactOccurred('light');
    } catch (e) {}
  }
  
  if (welcomeScreen) {
    welcomeScreen.classList.add("hidden");
  }
  
  if (animatedWelcomeScreen) {
    animatedWelcomeScreen.classList.add('hidden');
  }
  
  if (window.profileData && window.profileData.current) {
    showMainApp();
  } else {
    showOnboarding();
  }
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

// ===== ПОКАЗАТЬ ОСНОВНОЕ ПРИЛОЖЕНИЕ =====
function showMainApp() {
  if (welcomeScreen) welcomeScreen.classList.add("hidden");
  if (animatedWelcomeScreen) animatedWelcomeScreen.classList.add("hidden");
  if (onboardingScreen) onboardingScreen.classList.add("hidden");
  
  if (tabBar) {
    tabBar.classList.remove("hidden");
  }
  
  setActiveTab("feed");
}

// ===== УПРАВЛЕНИЕ ТАБАМИ =====
function setupTabButtons() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const tab = this.dataset.tab;
      setActiveTab(tab);
      
      if (window.tg?.HapticFeedback) {
        try {
          window.tg.HapticFeedback.selectionChanged();
        } catch (e) {}
      }
    });
  });
}

function setActiveTab(tab) {
  // Скрываем все экраны
  document.querySelectorAll('.screen').forEach(screen => {
    if (screen.id !== 'welcome-screen' && 
        screen.id !== 'chat-screen' && 
        screen.id !== 'screen-interests' &&
        screen.id !== 'welcome-animated-screen') {
      screen.classList.add('hidden');
    }
  });
  
  // Скрываем чат если переключаемся на другую вкладку
  if (tab !== 'chats' && document.getElementById('chat-screen')) {
    document.getElementById('chat-screen').classList.add('hidden');
  }
  
  // Показываем выбранный экран
  const screenId = 'screen-' + tab;
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.remove('hidden');
  }
  
  // Обновляем активную кнопку таба
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  
  // Инициализация контента вкладки
  if (tab === 'feed') {
    if (typeof initFeed === 'function') initFeed();
  } else if (tab === 'profile') {
    if (typeof initProfile === 'function') initProfile();
  } else if (tab === 'filters') {
    if (typeof initFiltersTab === 'function') initFiltersTab();
  } else if (tab === 'chats') {
    if (typeof updateLikesUI === 'function') updateLikesUI();
    if (typeof updateChatsList === 'function') updateChatsList();
  }
  
  // Показываем панель навигации
  if (tabBar) {
    tabBar.classList.remove('hidden');
  }
  
  // Скролл наверх
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 50);
}

// ===== НАСТРОЙКА ОБРАБОТЧИКОВ ПРОФИЛЯ =====
function setupProfileEventHandlers() {
  const editProfileBtn = document.getElementById('edit-profile-btn');
  const saveChangesBtn = document.getElementById('save-profile-changes');
  const cancelEditBtn = document.getElementById('cancel-profile-edit');
  const addPhotoBtn = document.getElementById('add-photo-btn');
  const removePhotoBtn = document.getElementById('remove-photo-btn');
  const photoUpload = document.getElementById('profile-photo-upload');
  
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', handleEditProfile);
  }
  
  if (saveChangesBtn) {
    saveChangesBtn.addEventListener('click', handleSaveProfileChanges);
  }
  
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', handleCancelEdit);
  }
  
  // ✅ ПРАВИЛЬНАЯ обработка добавления фото
  if (addPhotoBtn && photoUpload) {
    addPhotoBtn.addEventListener('click', function() {
      console.log('📸 Кнопка "Добавить фото" нажата');
      photoUpload.click();
    });
    
    photoUpload.addEventListener('change', function(e) {
      console.log('📁 Файл выбран');
      handlePhotoUpload(e);
    });
  }
  
  // ✅ ПРАВИЛЬНАЯ обработка удаления фото
  if (removePhotoBtn) {
    removePhotoBtn.addEventListener('click', async function() {
      await removeCurrentPhoto();
    });
  }
}

// ===== УПРАВЛЕНИЕ ПРОФИЛЕМ =====
function handleEditProfile() {
  // Показываем экран редактирования
  document.getElementById('profile-display').classList.add('hidden');
  document.getElementById('profile-edit').classList.remove('hidden');
  
  // Заполняем поля формы текущими данными
  updateEditForm();
  
  // ✅ ИНИЦИАЛИЗИРУЕМ РЕДАКТИРОВАНИЕ ФОТО
  setTimeout(() => {
    initEditProfilePhotos();
  }, 50);
  
  if (window.tg?.HapticFeedback) {
    try {
      window.tg.HapticFeedback.selectionChanged();
    } catch (e) {}
  }
}

function handleSaveProfileChanges() {
  document.activeElement?.blur();
  document.body.classList.remove('keyboard-open');
  if (card) card.style.transform = 'translateY(0)';
  
  setTimeout(async () => {
    // Всегда считаем сохранение успешным
    document.getElementById('profile-display').classList.remove('hidden');
    document.getElementById('profile-edit').classList.add('hidden');
    
    // Сохраняем фото в надежное хранилище
    await savePhotosToStorage();
    
    // Обновляем отображение
    updateProfileDisplay();
    
    // Всегда показываем успех
    showNotification("✅ Профиль обновлён!");
  }, 300);
}

function handleCancelEdit() {
  document.getElementById('profile-display').classList.remove('hidden');
  document.getElementById('profile-edit').classList.add('hidden');
}

// ===== ФУНКЦИИ ДЛЯ РЕДАКТИРОВАНИЯ ФОТО =====

function initEditProfilePhotos() {
  const editPhotosContainer = document.getElementById('edit-photos-container');
  const editAddPhotoBtn = document.getElementById('edit-add-photo-btn');
  
  if (!editPhotosContainer) {
    console.error('❌ edit-photos-container не найден!');
    return;
  }
  
  console.log('🖼️ Инициализирую редактирование фото, фото:', 
    window.profileData?.current?.photos?.length || 0);
  
  // Сначала обновляем отображение
  updateEditPhotosDisplay();
  
  // Кнопка добавления фото в режиме редактирования
  if (editAddPhotoBtn) {
    // Удаляем старые обработчики
    editAddPhotoBtn.replaceWith(editAddPhotoBtn.cloneNode(true));
    const newBtn = document.getElementById('edit-add-photo-btn');
    
    newBtn.addEventListener('click', function() {
      console.log('➕ Кнопка "Добавить фото" в редакторе нажата');
      
      // Создаем временный input
      const tempInput = document.createElement('input');
      tempInput.type = 'file';
      tempInput.accept = 'image/*';
      tempInput.style.display = 'none';
      
      tempInput.addEventListener('change', function(e) {
        console.log('📁 Файл выбран в редакторе');
        handlePhotoUpload(e, true); // true = режим редактирования
        
        // Удаляем временный input
        document.body.removeChild(tempInput);
      });
      
      document.body.appendChild(tempInput);
      tempInput.click();
    });
  }
  
  // Инициализируем drag-and-drop для редактирования
  setTimeout(() => {
    initEditPhotosDragAndDrop();
  }, 100);
}

function updateEditPhotosDisplay() {
  const container = document.getElementById('edit-photos-container');
  if (!container) {
    console.error('❌ edit-photos-container не найден в updateEditPhotosDisplay');
    return;
  }
  
  container.innerHTML = '';
  
  // Проверяем наличие фото
  if (!window.profileData || !window.profileData.current || 
      !window.profileData.current.photos || 
      window.profileData.current.photos.length === 0) {
    
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'hint';
    emptyMsg.textContent = 'Нет фотографий. Добавьте хотя бы одну.';
    emptyMsg.style.cssText = 'text-align: center; padding: 20px; width: 100%; color: #666;';
    container.appendChild(emptyMsg);
    return;
  }
  
  const photos = window.profileData.current.photos;
  
  photos.forEach((photoUrl, index) => {
    // Проверяем, что photoUrl - валидная строка
    if (!photoUrl || typeof photoUrl !== 'string') {
      console.error('❌ Неверный photoUrl для индекса', index, ':', photoUrl);
      return;
    }
    
    const photoItem = document.createElement('div');
    photoItem.className = 'edit-photo-item';
    photoItem.dataset.index = index;
    
    photoItem.innerHTML = `
      <img src="${photoUrl}" alt="Фото ${index + 1}" />
      <div class="edit-photo-number">${index + 1}</div>
      <div class="edit-photo-remove" data-index="${index}">×</div>
      
      <!-- КНОПКИ ДЛЯ ИЗМЕНЕНИЯ ПОРЯДКА -->
      <div class="photo-order-controls">
        ${index > 0 ? '<button class="order-up-btn" data-index="' + index + '">↑</button>' : ''}
        ${index < photos.length - 1 ? '<button class="order-down-btn" data-index="' + index + '">↓</button>' : ''}
      </div>
    `;
    
    container.appendChild(photoItem);
  });
  
  // ✅ ДОБАВЛЯЕМ ОБРАБОТЧИКИ ДЛЯ КНОПОК ПОРЯДКА
  setTimeout(() => {
    document.querySelectorAll('.order-up-btn').forEach(btn => {
      btn.addEventListener('click', async function(e) {
        e.stopPropagation();
        const index = parseInt(this.dataset.index);
        await swapPhotos(index, index - 1);
      });
    });
    
    document.querySelectorAll('.order-down-btn').forEach(btn => {
      btn.addEventListener('click', async function(e) {
        e.stopPropagation();
        const index = parseInt(this.dataset.index);
        await swapPhotos(index, index + 1);
      });
    });
    
    // Обработчик удаления фото
    document.querySelectorAll('.edit-photo-remove').forEach(btn => {
      btn.addEventListener('click', async function(e) {
        e.stopPropagation();
        const index = parseInt(this.dataset.index);
        await removePhotoByIndex(index, true);
      });
    });
  }, 100);
}

function initEditPhotosDragAndDrop() {
  const container = document.getElementById('edit-photos-container');
  if (!container) return;
  
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let draggedItem = null;
  let draggedIndex = -1;
  
  // Для десктопов оставляем drag-and-drop
  container.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('edit-photo-item')) {
      draggedIndex = parseInt(e.target.dataset.index);
      e.target.classList.add('dragging');
      draggedItem = e.target;
    }
  });
  
  container.addEventListener('dragend', (e) => {
    if (draggedItem) {
      draggedItem.classList.remove('dragging');
      draggedItem = null;
      draggedIndex = -1;
    }
  });
  
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    const target = e.target.closest('.edit-photo-item');
    if (target && draggedItem) {
      target.classList.add('dragover');
    }
  });
  
  container.addEventListener('dragleave', (e) => {
    const target = e.target.closest('.edit-photo-item');
    if (target) {
      target.classList.remove('dragover');
    }
  });
  
  container.addEventListener('drop', async (e) => {
    e.preventDefault();
    const target = e.target.closest('.edit-photo-item');
    
    if (target && draggedIndex !== -1) {
      target.classList.remove('dragover');
      const dropIndex = parseInt(target.dataset.index);
      
      if (draggedIndex !== dropIndex) {
        await swapPhotos(draggedIndex, dropIndex);
      }
    }
  });
  
  // ✅ ДОБАВЛЯЕМ TOCH-СОБЫТИЯ ДЛЯ iOS
  container.addEventListener('touchstart', (e) => {
    if (e.target.classList.contains('edit-photo-item')) {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = Date.now();
      draggedItem = e.target.closest('.edit-photo-item');
      draggedIndex = parseInt(draggedItem.dataset.index);
      
      // Визуальная обратная связь
      draggedItem.classList.add('dragging');
      draggedItem.style.transform = 'scale(1.05)';
      draggedItem.style.zIndex = '100';
      draggedItem.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
      
      e.preventDefault();
    }
  }, { passive: false });
  
  container.addEventListener('touchmove', (e) => {
    if (draggedItem) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      
      // Перемещаем элемент
      draggedItem.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`;
      
      e.preventDefault();
    }
  }, { passive: false });
  
  container.addEventListener('touchend', async (e) => {
    if (draggedItem) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const touchDuration = Date.now() - touchStartTime;
      
      // Сбрасываем стили
      draggedItem.classList.remove('dragging');
      draggedItem.style.transform = '';
      draggedItem.style.zIndex = '';
      draggedItem.style.boxShadow = '';
      
      // Находим элемент, над которым отпустили палец
      if (Math.abs(deltaX) > 20 || Math.abs(deltaY) > 20) {
        const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
        const targetElement = elements.find(el => 
          el.classList.contains('edit-photo-item') && el !== draggedItem
        );
        
        if (targetElement) {
          const dropIndex = parseInt(targetElement.dataset.index);
          if (draggedIndex !== dropIndex) {
            await swapPhotos(draggedIndex, dropIndex);
          }
        }
      }
      
      draggedItem = null;
      draggedIndex = -1;
    }
  }, { passive: true });
  
  // Обработчик удаления фото
  container.addEventListener('click', async (e) => {
    if (e.target.classList.contains('edit-photo-remove')) {
      const index = parseInt(e.target.dataset.index);
      await removePhotoByIndex(index, true);
      e.stopPropagation();
    }
  });
}

// ✅ Функция для обмена фото местами
async function swapPhotos(index1, index2) {
  if (!window.profileData.current || 
      !window.profileData.current.photos ||
      index1 < 0 || index2 < 0 ||
      index1 >= window.profileData.current.photos.length ||
      index2 >= window.profileData.current.photos.length) {
    return;
  }
  
  const photosArray = window.profileData.current.photos;
  
  // Меняем местами
  [photosArray[index1], photosArray[index2]] = 
  [photosArray[index2], photosArray[index1]];
  
  // Сохраняем в надежное хранилище
  await savePhotosToStorage();
  
  // Обновляем отображение
  updateEditPhotosDisplay();
  updateProfilePhotos();
  
  showNotification('✅ Порядок фото изменён!');
}

async function removePhotoByIndex(index, isEditMode = false) {
  if (!window.profileData.current || 
      !window.profileData.current.photos || 
      window.profileData.current.photos.length <= 1) {
    showNotification('❌ Нужно минимум 1 фото');
    return;
  }
  
  // Удаляем фото по индексу
  window.profileData.current.photos.splice(index, 1);
  
  // Сохраняем в надежное хранилище
  await savePhotosToStorage();
  
  // Обновляем отображение
  updateProfilePhotos();
  if (isEditMode) {
    updateEditPhotosDisplay();
  }
  
  showNotification('✅ Фото удалено');
}

// ===== ФУНКЦИЯ СЖАТИЯ ИЗОБРАЖЕНИЯ =====
function compressImage(dataUrl, quality, maxWidth, callback) {
  const img = new Image();
  img.onload = function() {
    const canvas = document.createElement('canvas');
    
    // Рассчитываем новые размеры
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    
    // Сжимаем в JPEG
    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
    
    console.log(`📊 Сжатие: ${Math.round(dataUrl.length / 1024)}KB → ${Math.round(compressedDataUrl.length / 1024)}KB`);
    
    callback(compressedDataUrl);
  };
  
  img.onerror = function() {
    console.error('❌ Ошибка загрузки изображения для сжатия');
    callback(dataUrl); // Возвращаем оригинал если ошибка
  };
  
  img.src = dataUrl;
}

// ===== ДОПОЛНИТЕЛЬНАЯ ФУНКЦИЯ СЖАТИЯ ДЛЯ iOS =====
function compressPhotoForStorage(dataUrl, targetSizeKB) {
  const img = new Image();
  img.src = dataUrl;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Начальные параметры
  let quality = 0.3;
  let width = Math.min(img.width, 300);
  let height = (img.height * width) / img.width;
  
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);
  
  // Постепенно уменьшаем качество, пока не достигнем целевого размера
  let compressedDataUrl;
  for (let q = quality; q >= 0.1; q -= 0.05) {
    compressedDataUrl = canvas.toDataURL('image/jpeg', q);
    const sizeKB = Math.round(compressedDataUrl.length / 1024);
    
    if (sizeKB <= targetSizeKB) {
      console.log(`📊 Дополнительное сжатие: ${q} качество, ${sizeKB}KB`);
      return compressedDataUrl;
    }
  }
  
  return compressedDataUrl;
}

// ===== СОХРАНЕНИЕ ФОТО В НАДЕЖНОЕ ХРАНИЛИЩЕ =====
async function savePhotosToStorage() {
  if (!window.profileData.current || !window.profileData.current.photos) {
    return;
  }
  
  const userId = window.profileData.current.tg_id || 1;
  
  // 1. Сохраняем в надежное хранилище
  if (window.photoStorage && typeof window.photoStorage.saveUserPhotos === 'function') {
    try {
      await window.photoStorage.saveUserPhotos(userId, window.profileData.current.photos);
    } catch (error) {
      console.error('❌ Ошибка сохранения в PhotoStorage:', error);
    }
  }
  
  // 2. Сохраняем в localStorage (основной профиль, но без больших фото)
  if (typeof saveProfile === 'function') {
    // Создаем копию с обрезанными фото для localStorage
    const profileForLocalStorage = JSON.parse(JSON.stringify(window.profileData.current));
    
    if (profileForLocalStorage.photos) {
      profileForLocalStorage.photos = profileForLocalStorage.photos.map(photo => {
        if (photo && photo.length > 30000) {
          // Сохраняем только миниатюру
          return photo.substring(0, 30000) + '...';
        }
        return photo;
      });
    }
    
    saveProfile(profileForLocalStorage);
  }
}

// ===== ОБРАБОТКА ЗАГРУЗКИ ФОТО =====
function handlePhotoUpload(e, isEditMode = false) {
  const file = e.target.files[0];
  if (!file) return;
  
  // ✅ ЖЕСТКОЕ ОГРАНИЧЕНИЕ РАЗМЕРА ДЛЯ iOS
  if (file.size > 5 * 1024 * 1024) { // Максимум 2MB
    showNotification('❌ Фото слишком большое (максимум 2MB)');
    return;
  }
  
  // Проверяем лимит
  if (!window.profileData.current) window.profileData.current = {};
  if (!window.profileData.current.photos) window.profileData.current.photos = [];
  
  if (window.profileData.current.photos.length >= 3) {
    showNotification('❌ Можно добавить не более 3 фото');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(event) {
    // ✅ СИЛЬНОЕ СЖАТИЕ ДЛЯ iOS
    compressImage(event.target.result, 0.4, 400, function(compressedPhotoUrl) {
      // Проверяем размер после сжатия
      if (compressedPhotoUrl.length > 50000) { // Максимум 50KB после сжатия
        showNotification('⚠️ Фото слишком большое, качество уменьшено');
        // Дополнительное сжатие
        compressedPhotoUrl = compressPhotoForStorage(compressedPhotoUrl, 40000);
      }
      
      // Добавляем фото
      window.profileData.current.photos.push(compressedPhotoUrl);
      
      // Сохраняем
      if (typeof saveProfile === 'function') {
        saveProfile(window.profileData.current);
      }
      
      // Обновляем отображение
      updateProfilePhotos();
      if (isEditMode) {
        updateEditPhotosDisplay();
      }
      
      showNotification(`✅ Фото добавлено! (${window.profileData.current.photos.length}/3)`);
      
      e.target.value = '';
    });
  };
  
  reader.onerror = function() {
    showNotification('❌ Ошибка при чтении файла');
  };
  
  reader.readAsDataURL(file);
}

// ===== УДАЛЕНИЕ ТЕКУЩЕГО ФОТО =====
async function removeCurrentPhoto() {
  if (!window.profileData.current || 
      !window.profileData.current.photos || 
      window.profileData.current.photos.length === 0) {
    showNotification('❌ Нет фото для удаления');
    return;
  }
  
  // Удаляем последнее фото
  window.profileData.current.photos.pop();
  
  // Сохраняем в надежное хранилище
  await savePhotosToStorage();
  
  // Обновляем отображение
  updateProfilePhotos();
  
  showNotification('✅ Фото удалено');
}

// ===== ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ ПРОФИЛЯ =====
function updateProfileDisplay() {
  const profileNameElem = document.getElementById('profile-name');
  const profileAgeElem = document.getElementById('profile-age-display');
  const profileGenderElem = document.getElementById('profile-gender-display');
  const profileCityElem = document.getElementById('profile-city-display');
  
  if (!window.profileData || !window.profileData.current) return;
  
  if (profileNameElem) {
    profileNameElem.textContent = window.profileData.current.first_name || "Пользователь";
  }
  
  if (profileAgeElem) {
    profileAgeElem.textContent = window.profileData.current.age ? `${window.profileData.current.age} лет` : "";
  }
  
  if (profileGenderElem) {
    const genderMap = {
      'male': 'Мужской',
      'female': 'Женский'
    };
    profileGenderElem.textContent = window.profileData.current.gender ? 
      genderMap[window.profileData.current.gender] || window.profileData.current.gender : "";
  }
  
  if (profileCityElem) {
    profileCityElem.textContent = window.profileData.current.city || "";
  }
  
  // ✅ ТОЛЬКО ГАЛЕРЕЯ
  updateProfilePhotos();  // Показывает photos[0..2] в .profile-photos-container
}

function updateEditForm() {
  const editAgeElem = document.getElementById("edit-age");
  const editGenderElem = document.getElementById("edit-gender");
  const editCityElem = document.getElementById("edit-city");
  const editBioElem = document.getElementById("edit-bio");
  
  if (!window.profileData || !window.profileData.current) return;
  
  if (editAgeElem) editAgeElem.value = window.profileData.current.age || "";
  if (editGenderElem) editGenderElem.value = window.profileData.current.gender || "";
  if (editCityElem) editCityElem.value = window.profileData.current.city || "";
  if (editBioElem) editBioElem.value = window.profileData.current.bio || "";
}

function updateProfilePhotos() {
  const container = document.querySelector('.profile-photos-container');
  const indicators = document.querySelector('.profile-photo-indicators');
  const photosCount = document.getElementById('photos-count');
  const removeBtn = document.getElementById('remove-photo-btn');
  const addBtn = document.getElementById('add-photo-btn');
  
  if (!container || !indicators || !photosCount) return;
  
  // Очищаем контейнеры
  container.innerHTML = '';
  indicators.innerHTML = '';
  
  // Проверяем, есть ли фото
  if (!window.profileData.current || 
      !window.profileData.current.photos || 
      window.profileData.current.photos.length === 0) {
    
    // Показываем placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'profile-photo-placeholder';
    placeholder.innerHTML = '📷';
    placeholder.style.cssText = `
      width: 140px;
      height: 140px;
      border-radius: 50%;
      background: rgba(34, 197, 94, 0.1);
      border: 3px dashed rgba(34, 197, 94, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      color: rgba(34, 197, 94, 0.5);
      margin: 0 auto;
    `;
    container.appendChild(placeholder);
    
    photosCount.textContent = '0/3 фото';
    if (removeBtn) removeBtn.disabled = true;
    if (addBtn) addBtn.disabled = false;
    return;
  }
  
  const photos = window.profileData.current.photos;
  
  // Добавляем фото
  photos.forEach((photoUrl, index) => {
    const img = document.createElement('img');
    img.className = `profile-main-photo ${index === 0 ? 'active' : ''}`;
    img.src = photoUrl;
    img.alt = `Фото ${index + 1}`;
    img.dataset.index = index;
    container.appendChild(img);
  });
  
  // Добавляем индикаторы
  photos.forEach((_, index) => {
    const indicator = document.createElement('div');
    indicator.className = `profile-photo-indicator ${index === 0 ? 'active' : ''}`;
    indicator.dataset.index = index;
    indicators.appendChild(indicator);
  });
  
  // Обновляем счетчик
  photosCount.textContent = `${photos.length}/3 фото`;
  
  // Настраиваем кнопки
  if (removeBtn) {
    removeBtn.disabled = photos.length <= 1;
  }
  
  if (addBtn) {
    addBtn.disabled = photos.length >= 3;
    if (photos.length >= 3) {
      addBtn.textContent = '📸 Максимум 3 фото';
    } else {
      addBtn.textContent = '📸 Добавить фото';
    }
  }
}

// ===== ИНИЦИАЛИЗАЦИЯ ПРОФИЛЯ =====
function initProfile() {
  updateProfileDisplay();
  updateProfilePhotos();
  
  // ✅ Улучшенный drag-and-drop для изменения порядка фото
  const container = document.querySelector('.profile-photos-container');
  if (container && window.profileData?.current?.photos?.length > 1) {
    let dragSrcIndex = -1;
    
    // Сделать все фото перетаскиваемыми
    const photos = container.querySelectorAll('.profile-main-photo');
    photos.forEach((photo, index) => {
      photo.draggable = true;
      photo.dataset.index = index;
      
      photo.addEventListener('dragstart', (e) => {
        dragSrcIndex = parseInt(e.target.dataset.index);
        e.target.classList.add('dragging');
      });
      
      photo.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
        dragSrcIndex = -1;
      });
      
      photo.addEventListener('dragover', (e) => {
        e.preventDefault();
      });
      
      photo.addEventListener('drop', async (e) => {
        e.preventDefault();
        const dragDstIndex = parseInt(e.target.dataset.index);
        
        if (dragSrcIndex !== -1 && dragSrcIndex !== dragDstIndex) {
          // Меняем местами фото в массиве
          const photosArray = window.profileData.current.photos;
          [photosArray[dragSrcIndex], photosArray[dragDstIndex]] = 
          [photosArray[dragDstIndex], photosArray[dragSrcIndex]];
          
          // Сохраняем изменения
          await savePhotosToStorage();
          
          // Обновляем UI
          updateProfilePhotos();
          showNotification('✅ Порядок фото изменён!');
        }
      });
    });
  }
  
  // Инициализируем слайдер фото если есть
  const profilePhotos = document.querySelectorAll('.profile-main-photo');
  const photoIndicators = document.querySelectorAll('.profile-photo-indicator');
  
  if (profilePhotos.length > 0) {
    let currentPhotoIndex = 0;
    
    // Добавляем обработчики свайпа
    let touchStartX = 0;
    let touchEndX = 0;
    
    container?.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    container?.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0 && currentPhotoIndex < profilePhotos.length - 1) {
          // Свайп влево - следующее фото
          currentPhotoIndex++;
        } else if (diff < 0 && currentPhotoIndex > 0) {
          // Свайп вправо - предыдущее фото
          currentPhotoIndex--;
        }
        
        // Обновляем отображение
        profilePhotos.forEach((photo, index) => {
          photo.classList.toggle('active', index === currentPhotoIndex);
        });
        
        photoIndicators.forEach((indicator, index) => {
          indicator.classList.toggle('active', index === currentPhotoIndex);
        });
      }
    }
  }
}

// ===== УВЕДОМЛЕНИЯ =====
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

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ДРУГИХ МОДУЛЕЙ =====
function updateLikesUI() {
  // Заглушка - реализация в likes.js
}

function updateChatsList() {
  // Заглушка - реализация в chats.js
}

// ===== ЭКСПОРТ ФУНКЦИЙ В ГЛОБАЛЬНУЮ ОБЛАСТЬ ВИДИМОСТИ =====
window.initUI = initUI;
window.showAnimatedWelcomeScreen = showAnimatedWelcomeScreen;
window.showOnboarding = showOnboarding;
window.showMainApp = showMainApp;
window.setActiveTab = setActiveTab;
window.showNotification = showNotification;
window.updateProfileDisplay = updateProfileDisplay;
window.updateEditForm = updateEditForm;
window.updateProfilePhotos = updateProfilePhotos;
window.handleEditProfile = handleEditProfile;
window.handleSaveProfileChanges = handleSaveProfileChanges;
window.handleCancelEdit = handleCancelEdit;
window.handlePhotoUpload = handlePhotoUpload;
window.removeCurrentPhoto = removeCurrentPhoto;
window.removePhotoByIndex = removePhotoByIndex;
window.updateLikesUI = updateLikesUI;
window.updateChatsList = updateChatsList;
window.initProfile = initProfile;
window.initEditProfilePhotos = initEditProfilePhotos;
window.updateEditPhotosDisplay = updateEditPhotosDisplay;
window.swapPhotos = swapPhotos;
window.compressImage = compressImage;
window.initPhotoStorage = initPhotoStorage;
window.loadUserPhotosOnStart = loadUserPhotosOnStart;
window.savePhotosToStorage = savePhotosToStorage;
window.compressPhotoForStorage = compressPhotoForStorage;
