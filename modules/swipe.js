// modules/swipe.js

window.AppSwipe = {
  // Состояние свайпов
  currentIndex: 0,
  likedIds: [],
  remainingSwipes: 20,
  maxSwipesPerDay: 20,
  
  // Демо-кандидаты (перенесены из оригинального app.js)
  candidates: [
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
    // ... остальные кандидаты
  ],
  
  // Переменные для свайпов
  candidatePhotos: [],
  currentPhotoIndex: 0,
  candidateInterests: [],
  swipeStartX: 0,
  swipeStartY: 0,
  isSwiping: false,
  currentCandidateId: null,
  
  // Функции
  init: function() {
    console.log('🔄 Инициализирую систему свайпов');
    this.loadSwipesCount();
    this.updateSwipesUI();
    this.initEventListeners();
  },
  
  initEventListeners: function() {
    const buySwipesBtn = document.getElementById('buy-swipes-btn');
    if (buySwipesBtn) {
      buySwipesBtn.addEventListener('click', this.handleBuySwipes.bind(this));
    }
    
    this.initSwipeSystem();
  },
  
  loadSwipesCount: function() {
    const saved = AppCore.loadLocalStorage("siamatch_swipes");
    if (saved) {
      const data = saved;
      const today = new Date().toDateString();
      
      if (data.date === today) {
        this.remainingSwipes = data.remaining || this.maxSwipesPerDay;
      } else {
        this.remainingSwipes = this.maxSwipesPerDay;
        this.saveSwipesCount();
      }
    }
  },
  
  saveSwipesCount: function() {
    const data = {
      date: new Date().toDateString(),
      remaining: this.remainingSwipes,
      totalUsed: this.maxSwipesPerDay - this.remainingSwipes
    };
    AppCore.saveLocalStorage("siamatch_swipes", data);
  },
  
  updateSwipesUI: function() {
    const remainingSwipesElement = document.getElementById('remaining-swipes');
    const swipesInfo = document.getElementById('swipes-info');
    
    if (remainingSwipesElement) {
      remainingSwipesElement.textContent = this.remainingSwipes;
    }
    
    if (swipesInfo) {
      if (this.remainingSwipes <= 5) {
        swipesInfo.classList.remove('hidden');
      } else {
        swipesInfo.classList.add('hidden');
      }
    }
  },
  
  useSwipe: function() {
    if (this.remainingSwipes > 0) {
      this.remainingSwipes--;
      this.saveSwipesCount();
      this.updateSwipesUI();
      
      if (this.remainingSwipes === 0) {
        setTimeout(() => {
          AppCore.showNotification('🎯 Свайпы на сегодня закончились!\n\nВы можете:\n1. Подождать до завтра\n2. Купить дополнительные свайпы\n3. Получить бонусные свайпы через верификацию или приглашение друзей!');
        }, 300);
      }
      
      return true;
    } else {
      AppCore.showNotification('🚫 Свайпы на сегодня закончились!\n\nВы можете:\n1. Купить дополнительные свайпы\n2. Подождать до завтра\n3. Получить +20 свайпов за верификацию анкеты\n4. Пригласить друга и получить +20 свайпов');
      return false;
    }
  },
  
  handleBuySwipes: function() {
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
      this.remainingSwipes += selected.count;
      this.saveSwipesCount();
      this.updateSwipesUI();
      
      AppCore.showNotification(`✅ Успешно!\n\nВы купили ${selected.count} дополнительных свайпов за ${selected.price} ₽.\nТеперь у вас ${this.remainingSwipes} свайпов.`);
      
      if (AppCore.tg?.HapticFeedback) {
        try {
          AppCore.tg.HapticFeedback.impactOccurred('medium');
        } catch (e) {}
      }
    }
  },
  
  // Основные функции свайпов
  initSwipeSystem: function() {
    const candidateCard = document.getElementById('candidate-card');
    const photosContainer = document.querySelector('.candidate-photos-container');
    
    if (!candidateCard || !photosContainer) return;
    
    const actions = document.querySelector('.actions');
    if (actions) {
      actions.style.display = 'none';
    }
    
    // Инициализируем свайпы
    this.initSwipeGestures(candidateCard);
    
    // Инициализируем переключение фото
    this.initPhotoSwitching(photosContainer);
  },
  
  initSwipeGestures: function(cardElement) {
    // Для тач-устройств
    cardElement.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    cardElement.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    cardElement.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    
    // Для десктопа
    cardElement.addEventListener('mousedown', this.handleMouseDown.bind(this));
    cardElement.addEventListener('mousemove', this.handleMouseMove.bind(this));
    cardElement.addEventListener('mouseup', this.handleMouseEnd.bind(this));
    cardElement.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
  },
  
  initPhotoSwitching: function(photosContainer) {
    photosContainer.addEventListener('click', this.handlePhotoClick.bind(this));
    this.createPhotoSwipeIndicators(photosContainer);
  },
  
  // ... остальные функции системы свайпов
  
  showCurrentCandidate: function() {
    const filtered = this.getFilteredCandidates();
    
    if (filtered.length === 0) {
      this.showEmptyFeed();
      return;
    }
    
    if (this.currentIndex >= filtered.length) {
      this.showEndOfFeed();
      return;
    }
    
    const candidate = filtered[this.currentIndex];
    this.currentCandidateId = candidate.id;
    
    this.candidatePhotos = candidate.photos || [candidate.photo];
    this.candidateInterests = candidate.interests || [];
    this.currentPhotoIndex = 0;
    
    this.updateCandidateDisplay(candidate);
  },
  
  updateCandidateDisplay: function(candidate) {
    document.getElementById("candidate-name").textContent = candidate.name;
    document.getElementById("candidate-age").textContent = candidate.age;
    document.getElementById("candidate-city").textContent = candidate.city;
    document.getElementById("candidate-bio").textContent = candidate.bio;
    document.getElementById("feed-status").textContent = "";
    
    this.updateCandidatePhoto();
    this.updateCandidateInterests();
    this.updatePhotoIndicators();
    
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
  },
  
  getFilteredCandidates: function() {
    // Используем фильтры из AppBonus, если они есть
    const searchFilters = window.AppBonus ? window.AppBonus.searchFilters : {
      minAge: 18,
      maxAge: 35,
      genders: [],
      interests: [],
      datingGoal: ''
    };
    
    let filtered = this.candidates.filter(c => !this.likedIds.includes(c.id));
    
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
  },
  
  handleLike: function() {
    if (!this.useSwipe()) return;
    
    if (AppCore.tg?.HapticFeedback) {
      try {
        AppCore.tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
    
    const filtered = this.getFilteredCandidates();
    if (this.currentIndex < filtered.length) {
      const likedUser = filtered[this.currentIndex];
      this.likedIds.push(likedUser.id);
      this.currentIndex++;
      this.showCurrentCandidate();
      
      this.checkForMatch(likedUser.id);
      
      console.log(`❤️ Лайк пользователю ${likedUser.name} (ID: ${likedUser.id})`);
    }
  },
  
  handleDislike: function() {
    if (!this.useSwipe()) return;
    
    if (AppCore.tg?.HapticFeedback) {
      try {
        AppCore.tg.HapticFeedback.impactOccurred('light');
      } catch (e) {}
    }
    
    const filtered = this.getFilteredCandidates();
    if (this.currentIndex < filtered.length) {
      const dislikedUser = filtered[this.currentIndex];
      this.currentIndex++;
      this.showCurrentCandidate();
      
      console.log(`✖️ Дизлайк пользователю ${dislikedUser.name} (ID: ${dislikedUser.id})`);
    }
  },
  
  checkForMatch: function(likedUserId) {
    if (Math.random() > 0.7) {
      if (window.AppChat && window.AppChat.usersWhoLikedMeCount > 0) {
        window.AppChat.usersWhoLikedMeCount--;
        window.AppChat.saveLikesData();
        window.AppChat.updateLikesUI();
        
        setTimeout(() => {
          AppCore.showNotification('🎉 У вас взаимная симпатия! Один из ваших тайных поклонников ответил вам взаимностью! Теперь вы можете начать общение в чатах.');
        }, 500);
      }
    }
  }
};
