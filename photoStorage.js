// photoStorage.js - Надежное хранилище для фото на iOS
class PhotoStorage {
  constructor() {
    this.db = null;
    this.isIndexedDBSupported = false;
    this.init();
  }
  
  async init() {
    // Проверяем поддержку IndexedDB
    this.isIndexedDBSupported = !!window.indexedDB;
    console.log('📦 IndexedDB поддерживается:', this.isIndexedDBSupported);
    
    if (this.isIndexedDBSupported) {
      await this.initIndexedDB();
    }
  }
  
  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SiaMatchPhotos', 1);
      
      request.onerror = (event) => {
        console.error('❌ Ошибка IndexedDB:', event.target.error);
        this.isIndexedDBSupported = false;
        reject(event.target.error);
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('✅ IndexedDB инициализирован');
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Создаем хранилище для фото пользователя
        if (!db.objectStoreNames.contains('user_photos')) {
          const store = db.createObjectStore('user_photos', { keyPath: 'id' });
          store.createIndex('by_user', 'userId');
        }
        
        // Создаем хранилище для миниатюр
        if (!db.objectStoreNames.contains('thumbnails')) {
          db.createObjectStore('thumbnails', { keyPath: 'id' });
        }
      };
    });
  }
  
  // Сохраняем фото пользователя
  async saveUserPhotos(userId, photos) {
    if (!photos || !Array.isArray(photos)) return false;
    
    // 1. Пробуем сохранить в IndexedDB
    if (this.isIndexedDBSupported && this.db) {
      try {
        const success = await this.saveToIndexedDB(userId, photos);
        if (success) {
          console.log('✅ Фото сохранены в IndexedDB');
          
          // 2. Дублируем в localStorage (только 1 фото для быстрого доступа)
          this.saveToLocalStorageFallback(photos);
          return true;
        }
      } catch (error) {
        console.warn('⚠️ IndexedDB ошибка, используем fallback:', error);
        this.isIndexedDBSupported = false;
      }
    }
    
    // 3. Fallback на localStorage (сжатые)
    return this.saveToLocalStorageFallback(photos);
  }
  
  async saveToIndexedDB(userId, photos) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['user_photos'], 'readwrite');
      const store = transaction.objectStore('user_photos');
      
      // Удаляем старые фото пользователя
      const index = store.index('by_user');
      const request = index.openCursor(IDBKeyRange.only(userId));
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      
      // Сохраняем новые фото
      photos.forEach((photo, index) => {
        if (photo && typeof photo === 'string' && photo.length > 0) {
          const item = {
            id: `${userId}_${index}_${Date.now()}`,
            userId: userId,
            photoIndex: index,
            data: photo,
            timestamp: Date.now()
          };
          store.put(item);
        }
      });
      
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = (event) => reject(event.target.error);
    });
  }
  
  saveToLocalStorageFallback(photos) {
    try {
      // Сохраняем только миниатюры (первые 50KB каждого фото)
      const compressedPhotos = photos.map(photo => {
        if (!photo || typeof photo !== 'string') return '';
        
        // Берем только начало base64 для миниатюры
        if (photo.length > 50000) {
          return photo.substring(0, 50000) + '... [TRUNCATED]';
        }
        return photo;
      });
      
      localStorage.setItem('siamatch_photos_fallback', JSON.stringify(compressedPhotos));
      console.log('✅ Фото сохранены в localStorage (fallback)');
      return true;
    } catch (e) {
      console.error('❌ Ошибка сохранения в localStorage:', e);
      return false;
    }
  }
  
  // Загружаем фото пользователя
  async loadUserPhotos(userId) {
    // 1. Пробуем загрузить из IndexedDB
    if (this.isIndexedDBSupported && this.db) {
      try {
        const photos = await this.loadFromIndexedDB(userId);
        if (photos.length > 0) {
          console.log('✅ Фото загружены из IndexedDB:', photos.length);
          return photos;
        }
      } catch (error) {
        console.warn('⚠️ Ошибка загрузки из IndexedDB:', error);
      }
    }
    
    // 2. Fallback на localStorage
    return this.loadFromLocalStorageFallback();
  }
  
  async loadFromIndexedDB(userId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['user_photos'], 'readonly');
      const store = transaction.objectStore('user_photos');
      const index = store.index('by_user');
      const request = index.getAll(IDBKeyRange.only(userId));
      
      request.onsuccess = (event) => {
        const items = event.target.result;
        
        // Сортируем по индексу фото
        items.sort((a, b) => a.photoIndex - b.photoIndex);
        
        // Извлекаем данные фото
        const photos = items.map(item => item.data).filter(Boolean);
        resolve(photos);
      };
      
      request.onerror = (event) => reject(event.target.error);
    });
  }
  
  loadFromLocalStorageFallback() {
    try {
      const saved = localStorage.getItem('siamatch_photos_fallback');
      if (saved) {
        const photos = JSON.parse(saved);
        console.log('✅ Фото загружены из localStorage (fallback):', photos.length);
        return photos.filter(photo => photo && typeof photo === 'string' && photo.length > 100);
      }
    } catch (e) {
      console.error('❌ Ошибка загрузки из localStorage:', e);
    }
    return [];
  }
  
  // Очищаем фото пользователя
  async clearUserPhotos(userId) {
    if (this.isIndexedDBSupported && this.db) {
      try {
        const transaction = this.db.transaction(['user_photos'], 'readwrite');
        const store = transaction.objectStore('user_photos');
        const index = store.index('by_user');
        const request = index.openCursor(IDBKeyRange.only(userId));
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };
      } catch (error) {
        console.error('❌ Ошибка очистки IndexedDB:', error);
      }
    }
    
    // Очищаем localStorage
    localStorage.removeItem('siamatch_photos_fallback');
  }
}

// Создаем глобальный экземпляр
window.photoStorage = new PhotoStorage();
