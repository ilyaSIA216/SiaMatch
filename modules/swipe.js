// modules/swipe.js

window.AppSwipe = (function() {
  // Состояние свайпов - приватные переменные
  let currentIndex = 0;
  let likedIds = [];
  let remainingSwipes = 20;
  const maxSwipesPerDay = 20;
  
  // Переменные для свайпов
  let candidatePhotos = [];
  let currentPhotoIndex = 0;
  let candidateInterests = [];
  let swipeStartX = 0;
  let swipeStartY = 0;
  let isSwiping = false;
  let currentCandidateId = null;
  
  // Демо-кандидаты
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
  
  // Вспомогательные функции для свайпов
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    swipeStartX = touch.clientX;
    swipeStartY = touch.clientY;
    isSwiping = false;
    
    const candidateCard = document.getElementById('candidate-card');
    if (candidateCard) {
      candidateCard.style.transition = 'none';
    }
  };
  
  const handleTouchMove = (e) => {
    if (!swipeStartX && !swipeStartY) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeStartX;
    const deltaY = touch.clientY - swipeStartY;
    
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
      
      if (candidateCard) {
        candidateCard.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.1}deg)`;
        candidateCard.style.opacity = Math.max(opacity, 0.5);
      }
      
      // Показываем подсказку
      if (deltaX > 50) {
        showSwipeFeedback('like');
      } else if (deltaX < -50) {
        showSwipeFeedback('dislike');
      }
    }
  };
  
  const handleTouchEnd = (e) => {
    if (!swipeStartX && !swipeStartY) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - swipeStartX;
    
    const candidateCard = document.getElementById('candidate-card');
    if (candidateCard) {
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
    }
    
    // Сбрасываем переменные
    swipeStartX = 0;
    swipeStartY = 0;
    isSwiping = false;
  };
  
  const handleMouseDown = (e) => {
    swipeStartX = e.clientX;
    swipeStartY = e.clientY;
    isSwiping = false;
    
    const candidateCard = document.getElementById('candidate-card');
    if (candidateCard) {
      candidateCard.style.transition = 'none';
    }
  };
  
  const handleMouseMove = (e) => {
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
      
      if (candidateCard) {
        candidateCard.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.1}deg)`;
        candidateCard.style.opacity = Math.max(opacity, 0.5);
      }
      
      if (deltaX > 50) {
        showSwipeFeedback('like');
      } else if (deltaX < -50) {
        showSwipeFeedback('dislike');
      }
    }
  };
  
  const handleMouseEnd = (e) => {
    if (!swipeStartX && !swipeStartY) return;
    
    const deltaX = e.clientX - swipeStartX;
    
    const candidateCard = document.getElementById('candidate-card');
    if (candidateCard) {
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
    }
    
    swipeStartX = 0;
    swipeStartY = 0;
    isSwiping = false;
  };
  
  const handleMouseLeave = (e) => {
    if (!isSwiping) return;
    
    const candidateCard = document.getElementById('candidate-card');
    if (candidateCard) {
      candidateCard.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      candidateCard.style.transform = 'translateX(0) rotate(0deg)';
      candidateCard.style.opacity = 1;
    }
    
    swipeStartX = 0;
    swipeStartY = 0;
    isSwiping = false;
  };
  
  const handleSwipeRight = () => {
    showSwipeAnimation('right');
    
    setTimeout(() => {
      handleLike();
    }, 300);
  };
  
  const handleSwipeLeft = () => {
    showSwipeAnimation('left');
    
    setTimeout(() => {
      handleDislike();
    }, 300);
  };
  
  const showSwipeAnimation = (direction) => {
    const candidateCard = document.getElementById('candidate-card');
    
    if (candidateCard) {
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
  };
  
  const showSwipeFeedback = (type) => {
    const feedback = document.getElementById('swipe-feedback');
    
    if (!feedback) return;
    
    feedback.textContent = type === 'like' ? '❤️' : '✖️';
    feedback.className = `swipe-feedback ${type}`;
    feedback.classList.remove('hidden');
    
    setTimeout(() => {
      feedback.classList.add('hidden');
    }, 800);
  };
  
  // Основные функции модуля
  return {
    // Публичные свойства
    getRemainingSwipes: () => remainingSwipes,
    
    // Публичные методы
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
    },
    
    initSwipeGestures: function(cardElement) {
      // Для тач-устройств
      cardElement.addEventListener('touchstart', handleTouchStart, { passive: true });
      cardElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      cardElement.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      // Для десктопа
      cardElement.addEventListener('mousedown', handleMouseDown);
      cardElement.addEventListener('mousemove', handleMouseMove);
      cardElement.addEventListener('mouseup', handleMouseEnd);
      cardElement.addEventListener('mouseleave', handleMouseLeave);
    },
    
    loadSwipesCount: function() {
      const saved = AppCore.loadLocalStorage("siamatch_swipes");
      if (saved) {
        const today = new Date().toDateString();
        
        if (saved.date === today) {
          remainingSwipes = saved.remaining || maxSwipesPerDay;
        } else {
          remainingSwipes = maxSwipesPerDay;
          this.saveSwipesCount();
        }
      }
    },
    
    saveSwipesCount: function() {
      const data = {
        date: new Date().toDateString(),
        remaining: remainingSwipes,
        totalUsed: maxSwipesPerDay - remainingSwipes
      };
      AppCore.saveLocalStorage("siamatch_swipes", data);
    },
    
    updateSwipesUI: function() {
      const remainingSwipesElement = document.getElementById('remaining-swipes');
      const swipesInfo = document.getElementById('swipes-info');
      
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
    },
    
    useSwipe: function() {
      if (remainingSwipes > 0) {
        remainingSwipes--;
        this.saveSwipesCount();
        this.updateSwipesUI();
        
        if (remainingSwipes === 0) {
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
        remainingSwipes += selected.count;
        this.saveSwipesCount();
        this.updateSwipesUI();
        
        AppCore.showNotification(`✅ Успешно!\n\nВы купили ${selected.count} дополнительных свайпов за ${selected.price} ₽.\nТеперь у вас ${remainingSwipes} свайпов.`);
        
        if (AppCore.tg?.HapticFeedback) {
          try {
            AppCore.tg.HapticFeedback.impactOccurred('medium');
          } catch (e) {}
        }
      }
    },
    
    showCurrentCandidate: function() {
      const filtered = this.getFilteredCandidates();
      
      if (filtered.length === 0) {
        this.showEmptyFeed();
        return;
      }
      
      if (currentIndex >= filtered.length) {
        this.showEndOfFeed();
        return;
      }
      
      const candidate = filtered[currentIndex];
      currentCandidateId = candidate.id;
      
      candidatePhotos = candidate.photos || [candidate.photo];
      candidateInterests = candidate.interests || [];
      currentPhotoIndex = 0;
      
      this.updateCandidateDisplay(candidate);
    },
    
    updateCandidateDisplay: function(candidate) {
      document.getElementById("candidate-name").textContent = candidate.name;
      document.getElementById("candidate-age").textContent = candidate.age;
      document.getElementById("candidate-city").textContent = candidate.city;
      document.getElementById("candidate-bio").textContent = candidate.bio;
      
      const feedStatus = document.getElementById("feed-status");
      if (feedStatus) {
        feedStatus.textContent = "";
      }
      
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
    
    updateCandidatePhoto: function() {
      if (candidatePhotos.length > 0 && currentPhotoIndex < candidatePhotos.length) {
        const photoUrl = candidatePhotos[currentPhotoIndex];
        const photoElement = document.getElementById("candidate-photo");
        
        if (photoElement) {
          photoElement.src = photoUrl;
        }
      }
    },
    
    updateCandidateInterests: function() {
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
    },
    
    updatePhotoIndicators: function() {
      const indicatorsContainer = document.querySelector('.photo-indicators');
      if (!indicatorsContainer) return;
      
      indicatorsContainer.innerHTML = '';
      
      for (let i = 0; i < candidatePhotos.length; i++) {
        const indicator = document.createElement('div');
        indicator.className = `photo-indicator ${i === currentPhotoIndex ? 'active' : ''}`;
        indicator.dataset.index = i;
        
        indicator.addEventListener('click', (e) => {
          e.stopPropagation();
          currentPhotoIndex = i;
          this.updateCandidatePhoto();
          this.updatePhotoIndicators();
        });
        
        indicatorsContainer.appendChild(indicator);
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
    },
    
    handleLike: function() {
      if (!this.useSwipe()) return;
      
      if (AppCore.tg?.HapticFeedback) {
        try {
          AppCore.tg.HapticFeedback.impactOccurred('light');
        } catch (e) {}
      }
      
      const filtered = this.getFilteredCandidates();
      if (currentIndex < filtered.length) {
        const likedUser = filtered[currentIndex];
        likedIds.push(likedUser.id);
        currentIndex++;
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
      if (currentIndex < filtered.length) {
        const dislikedUser = filtered[currentIndex];
        currentIndex++;
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
    },
    
    showEmptyFeed: function() {
      document.getElementById("candidate-name").textContent = "";
      document.getElementById("candidate-age").textContent = "";
      document.getElementById("candidate-city").textContent = "";
      document.getElementById("candidate-bio").textContent = "";
      
      const candidatePhoto = document.getElementById("candidate-photo");
      if (candidatePhoto) {
        candidatePhoto.src = "";
      }
      
      const candidateInterests = document.getElementById("candidate-interests");
      if (candidateInterests) {
        candidateInterests.innerHTML = "";
      }
      
      const verifiedBadge = document.getElementById('candidate-verified');
      if (verifiedBadge) verifiedBadge.classList.add('hidden');
      
      const boostBadge = document.getElementById('candidate-boost');
      if (boostBadge) boostBadge.classList.add('hidden');
      
      const feedStatus = document.getElementById("feed-status");
      if (feedStatus) {
        feedStatus.textContent = "Нет подходящих анкет по вашим фильтрам. Попробуйте изменить параметры поиска 🍀";
      }
      
      candidatePhotos = [];
      currentPhotoIndex = 0;
      this.updatePhotoIndicators();
    },
    
    showEndOfFeed: function() {
      document.getElementById("candidate-name").textContent = "";
      document.getElementById("candidate-age").textContent = "";
      document.getElementById("candidate-city").textContent = "";
      document.getElementById("candidate-bio").textContent = "";
      
      const candidatePhoto = document.getElementById("candidate-photo");
      if (candidatePhoto) {
        candidatePhoto.src = "";
      }
      
      const candidateInterests = document.getElementById("candidate-interests");
      if (candidateInterests) {
        candidateInterests.innerHTML = "";
      }
      
      const verifiedBadge = document.getElementById('candidate-verified');
      if (verifiedBadge) verifiedBadge.classList.add('hidden');
      
      const boostBadge = document.getElementById('candidate-boost');
      if (boostBadge) boostBadge.classList.add('hidden');
      
      const feedStatus = document.getElementById("feed-status");
      if (feedStatus) {
        feedStatus.textContent = "На сегодня всё! Загляните позже 🍀";
      }
      
      candidatePhotos = [];
      currentPhotoIndex = 0;
      this.updatePhotoIndicators();
    },
    
    // Добавьте эти функции для интерфейса
    addSwipes: function(count) {
      remainingSwipes += count;
      this.saveSwipesCount();
      this.updateSwipesUI();
    }
  };
})();
