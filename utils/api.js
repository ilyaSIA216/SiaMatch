// ===== UTILS/API.JS — ИНТЕГРАЦИЯ LOGIC.JS С НОВЫМ UI =====

// ✅ МОСТ МЕЖДУ НОВЫМ UI И ТВОИМ LOGIC.JS
window.APIBridge = {
  // ===== ЛЕНТА =====
  loadNextCandidate: showCurrentCandidate,
  getCurrentIndex: () => currentIndex,
  getCandidatesCount: () => candidates.length,
  
  // ===== ПРОФИЛЬ =====
  saveProfile: saveProfile,
  loadProfile: loadProfile,
  updateProfileDisplay: updateProfileDisplay,
  
  // ===== СВАЙПЫ =====
  useSwipe: useSwipe,
  getRemainingSwipes: () => remainingSwipes,
  updateSwipesUI: updateSwipesUI,
  
  // ===== ЛАЙКИ =====
  getLikesCount: () => usersWhoLikedMeCount,
  updateLikesUI: updateLikesUI,
  checkNewLikes: checkForNewLikes,
  
  // ===== ВЕРИФИКАЦИЯ =====
  getVerificationStatus: () => verificationStatus,
  updateVerificationUI: updateVerificationUI,
  
  // ===== БУСТ =====
  getBoostStatus: () => ({ active: boostActive, endTime: boostEndTime }),
  updateBoostUI: updateBoostUI,
  
  // ===== ИНТЕРЕСЫ =====
  getUserInterests: () => userInterests,
  updateInterestsDisplay: updateSelectedInterestsDisplay,
  
  // ===== ФИЛЬТРЫ =====
  getFilters: () => searchFilters,
  saveFilters: saveSearchFilters,
  
  // ===== ЧАТЫ =====
  getMatchedUsers: () => matchedUsers,
  updateChatsList: updateChatsList,
  
  // ===== БОНУСЫ =====
  getPendingBonuses: () => pendingBonusVerifications
};

// ✅ УНИВЕРСАЛЬНЫЙ UI UPDATER
function syncAllUI() {
  console.log('🔄 Синхронизация UI с logic.js...');
  
  // Обновляем все счетчики
  updateSwipesUI();
  updateLikesUI();
  updateVerificationUI();
  updateBoostUI();
  updateSelectedInterestsDisplay();
  
  // Чаты
  if (document.getElementById('screen-chats')) {
    updateChatsList();
  }
}

// ✅ ИНИЦИАЛИЗАЦИЯ ВСЕХ СИСТЕМ (из твоего logic.js)
function initAllSystems() {
  console.log('⚙️ Инициализация систем из logic.js...');
  
  // Твои системы
  initVerification();
  initLikesSystem();
  initInterestsSystem();
  initFiltersSystem();
  initBoostSystem();
  initSwipesSystem();
  initChatsSystem();
  initBonusSystem();
  
  // Новые UI системы
  syncAllUI();
  
  // Лента
  initFeed();
}

// ✅ PROFILE SCREEN (динамическая генерация)
function initProfile() {
  const profileScreen = document.getElementById('screen-profile');
  if (profileScreen.children.length === 0) {
    profileScreen.innerHTML = `
      <div class="profile-container">
        <div id="profile-display" class="profile-display">
          <div class="profile-header">
            <h2>Ваш профиль</h2>
            <button id="editProfileBtn" class="edit-btn">✏️ Редактировать</button>
          </div>
          
          <!-- Фото -->
          <div id="profile-photos" class="profile-photos"></div>
          
          <!-- Информация -->
          <div id="profile-info" class="profile-info"></div>
          
          <!-- Счетчики -->
          <div class="profile-stats">
            <div class="stat">
              <span id="remaining-swipes" class="stat-number">20</span>
              <span>свайпов</span>
            </div>
            <div class="stat">
              <span id="likes-count" class="stat-number">0</span>
              <span>лайков</span>
            </div>
            <div class="stat">
              <span id="boost-status" class="stat-number">Не активен</span>
              <span>буст</span>
            </div>
          </div>
          
          <!-- Быстрые действия -->
          <div class="profile-actions">
            <button id="verifyProfileBtn" class="action-btn verify-btn">🔐 Верифицировать (+20 свайпов)</button>
            <button id="editInterestsBtn" class="action-btn interests-btn">🎯 Интересы</button>
            <button id="inviteFriendBtn" class="action-btn invite-btn">👥 Пригласить друга (+20 свайпов)</button>
            <button id="shareStoriesBtn" class="action-btn share-btn">📱 Stories (24ч буст)</button>
          </div>
        </div>
        
        <!-- Edit Form (скрыт) -->
        <div id="profile-edit" class="profile-edit hidden">
          <div class="edit-header">
            <button id="backToProfileBtn" class="back-btn">←</button>
            <h2>Редактировать профиль</h2>
          </div>
          <!-- Edit form будет заполнен динамически -->
        </div>
      </div>
    `;
    
    setupProfileEvents();
  }
  
  updateProfileDisplay();
  syncAllUI();
}

// ✅ PROFILE EVENTS
function setupProfileEvents() {
  // Edit profile
  document.getElementById('editProfileBtn')?.addEventListener('click', () => {
    document.getElementById('profile-display').classList.add('hidden');
    document.getElementById('profile-edit').classList.remove('hidden');
  });
  
  // Back to profile
  document.getElementById('backToProfileBtn')?.addEventListener('click', () => {
    document.getElementById('profile-display').classList.remove('hidden');
    document.getElementById('profile-edit').classList.add('hidden');
  });
  
  // Быстрые действия
  document.getElementById('verifyProfileBtn')?.addEventListener('click', handleVerificationRequest);
  document.getElementById('editInterestsBtn')?.addEventListener('click', openInterestsEditor);
  document.getElementById('inviteFriendBtn')?.addEventListener('click', handleShareStories);
  document.getElementById('shareStoriesBtn')?.addEventListener('click', handleShareStories);
}

// ✅ CHATS TAB
function initChatsTab() {
  const chatsScreen = document.getElementById('screen-chats');
  if (chatsScreen.children.length === 0) {
    chatsScreen.innerHTML = `
      <div class="chats-container">
        <div id="chats-list" class="chats-list"></div>
        <div id="chats-empty" class="empty-state">
          <div class="empty-icon">💬</div>
          <div class="empty-title">Нет мэтчей</div>
          <div class="empty-subtitle">Свайпайте в ленте чтобы найти интересных людей!</div>
        </div>
      </div>
    `;
  }
  updateChatsList();
  syncAllUI();
}

// ✅ FILTERS TAB (заглушка)
function initFiltersTab() {
  const filtersScreen = document.getElementById('screen-filters') || document.createElement('div');
  filtersScreen.id = 'screen-filters';
  filtersScreen.className = 'screen';
  filtersScreen.innerHTML = `
    <div class="filters-container">
      <h2>🔍 Фильтры поиска</h2>
      <div class="filter-group">
        <label>Возраст</label>
        <div class="range-inputs">
          <input id="search-min-age" type="number" min="18" max="60" value="18">
          <span>-</span>
          <input id="search-max-age" type="number" min="18" max="60" value="35">
        </div>
      </div>
      <button id="save-filters-btn" class="primary-btn">Применить фильтры</button>
    </div>
  `;
  
  initSearchFilters();
}

// ✅ START FEED
function initFeed() {
  currentIndex = 0;
  showCurrentCandidate();
}

// ✅ EXPORTS
window.APIUtils = {
  initAll: initAllSystems,
  syncUI: syncAllUI,
  initProfile: initProfile,
  initChats: initChatsTab,
  initFilters: initFiltersTab,
  initFeed: initFeed
};

// 🔥 АВТОСИНХРОНИЗАЦИЯ ПРИ ИЗМЕНЕНИЯХ
setInterval(syncAllUI, 5000);
