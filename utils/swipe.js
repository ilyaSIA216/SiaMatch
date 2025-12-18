// ===== UTILS/SWIPE.JS — TINDER СВАЙПЫ (БЕЗ ДУБЛЕЙ) =====

// ✅ ИСПОЛЬЗУЕМ ГЛОБАЛЬНЫЕ ИЗ logic.js (НЕ ОБЪЯВЛЯЕМ ЗАНОВО)
// swipeStartX, swipeStartY, isSwiping, currentPhotoIndex и т.д. — уже есть в logic.js

// ✅ ИНИЦИАЛИЗАЦИЯ СВАЙПОВ
function initSwipeSystem() {
  console.log('👆 Tinder свайпы инициализированы');
  
  const card = document.getElementById('profileCard');
  if (!card) return;
  
  card.addEventListener('touchstart', handleTouchStart, { passive: true });
  card.addEventListener('touchmove', handleTouchMove, { passive: false });
  card.addEventListener('touchend', handleTouchEnd, { passive: true });
  
  card.addEventListener('mousedown', handleMouseDown);
  card.addEventListener('mousemove', handleMouseMove);
  card.addEventListener('mouseup', handleMouseEnd);
  card.addEventListener('mouseleave', handleMouseLeave);
  
  document.getElementById('dislikeBtn')?.addEventListener('click', handleDislike);
  document.getElementById('likeBtn')?.addEventListener('click', handleLike);
}

// ===== TOUCH =====
function handleTouchStart(e) {
  swipeStartX = e.touches[0].clientX;
  swipeStartY = e.touches[0].clientY;
  isSwiping = false;
  
  const card = document.getElementById('profileCard');
  card.style.transition = 'none';
}

function handleTouchMove(e) {
  if (!swipeStartX || !swipeStartY) return;
  
  const touch = e.touches[0];
  const deltaX = touch.clientX - swipeStartX;
  const deltaY = touch.clientY - swipeStartY;
  
  if (Math.abs(deltaY) > 10 && Math.abs(deltaY) > Math.abs(deltaX)) {
    isSwiping = false; return;
  }
  
  if (Math.abs(deltaX) > 10) {
    e.preventDefault(); isSwiping = true;
    
    const card = document.getElementById('profileCard');
    const opacity = 1 - Math.abs(deltaX) / 300;
    
    card.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.1}deg)`;
    card.style.opacity = Math.max(opacity, 0.5);
    
    if (deltaX > 50) showSwipeFeedback('like');
    else if (deltaX < -50) showSwipeFeedback('dislike');
  }
}

function handleTouchEnd(e) {
  if (!swipeStartX || !swipeStartY) return;
  
  const touch = e.changedTouches[0];
  const deltaX = touch.clientX - swipeStartX;
  
  const card = document.getElementById('profileCard');
  card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease';
  
  if (isSwiping && Math.abs(deltaX) > 100) {
    if (deltaX > 0) handleSwipeRight();
    else handleSwipeLeft();
  } else {
    card.style.transform = 'translateX(0) rotate(0deg)';
    card.style.opacity = 1;
  }
  
  resetSwipeState();
}

// ===== MOUSE =====
function handleMouseDown(e) {
  swipeStartX = e.clientX; swipeStartY = e.clientY; isSwiping = false;
  const card = document.getElementById('profileCard');
  card.style.transition = 'none'; card.style.cursor = 'grabbing';
}

function handleMouseMove(e) {
  if (!swipeStartX || !swipeStartY) return;
  const deltaX = e.clientX - swipeStartX;
  const deltaY = e.clientY - swipeStartY;
  
  if (Math.abs(deltaY) > 10 && Math.abs(deltaY) > Math.abs(deltaX)) {
    isSwiping = false; return;
  }
  
  if (Math.abs(deltaX) > 10) {
    e.preventDefault(); isSwiping = true;
    const card = document.getElementById('profileCard');
    const opacity = 1 - Math.abs(deltaX) / 300;
    
    card.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.1}deg)`;
    card.style.opacity = Math.max(opacity, 0.5);
    
    if (deltaX > 50) showSwipeFeedback('like');
    else if (deltaX < -50) showSwipeFeedback('dislike');
  }
}

function handleMouseEnd(e) {
  if (!swipeStartX || !swipeStartY) return;
  const deltaX = e.clientX - swipeStartX;
  const card = document.getElementById('profileCard');
  card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease';
  card.style.cursor = 'grab';
  
  if (isSwiping && Math.abs(deltaX) > 100) {
    if (deltaX > 0) handleSwipeRight();
    else handleSwipeLeft();
  } else {
    card.style.transform = 'translateX(0) rotate(0deg)';
    card.style.opacity = 1;
  }
  resetSwipeState();
}

function handleMouseLeave() {
  if (!isSwiping) return;
  const card = document.getElementById('profileCard');
  card.style.transition = 'transform 0.4s ease, opacity 0.3s ease';
  card.style.cursor = 'grab';
  card.style.transform = 'translateX(0) rotate(0deg)';
  card.style.opacity = 1;
  resetSwipeState();
}

// ===== СВАЙПЫ =====
function handleSwipeRight() {
  showSwipeAnimation('right');
  setTimeout(() => handleLike(), 300);
}

function handleSwipeLeft() {
  showSwipeAnimation('left');
  setTimeout(() => handleDislike(), 300);
}

function handleLike() {
  if (typeof useSwipe === 'function' && !useSwipe()) return;
  likedIds.push(currentCandidateId);
  
  setTimeout(() => {
    currentIndex++; showCurrentCandidate();
    if (Math.random() < 0.3) setTimeout(showMatchAnimation, 500);
  }, 400);
}

function handleDislike() {
  if (typeof useSwipe === 'function' && !useSwipe()) return;
  setTimeout(() => {
    currentIndex++; showCurrentCandidate();
  }, 400);
}

// ===== ФИДБЕК =====
function showSwipeFeedback(type) {
  const feedback = document.createElement('div');
  feedback.id = 'swipe-feedback';
  feedback.className = `swipe-feedback ${type}`;
  feedback.textContent = type === 'like' ? '❤️' : '❌';
  feedback.style.cssText = `
    position: fixed; font-size: 80px; pointer-events: none; z-index: 200;
    top: 50%; left: 50%; transform: translate(-50%, -50%);
    opacity: 0; transition: all 0.3s ease;
  `;
  document.body.appendChild(feedback);
  
  requestAnimationFrame(() => {
    feedback.style.opacity = '1';
    feedback.style.transform = 'translate(-50%, -50%) scale(1.2)';
  });
  
  setTimeout(() => {
    feedback.style.opacity = '0';
    feedback.style.transform = 'translate(-50%, -50%) scale(1.5)';
    setTimeout(() => feedback.remove(), 300);
  }, 800);
}

function resetSwipeState() {
  swipeStartX = 0; swipeStartY = 0; isSwiping = false;
}

// ✅ ЭКСПОРТ
window.SwipeUtils = { init: initSwipeSystem };
