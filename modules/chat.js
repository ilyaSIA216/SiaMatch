// modules/chat.js

window.AppChat = {
  // Состояние чатов
  matchedUsers: [],
  currentChatId: null,
  chatMessages: {},
  userReports: [],
  usersWhoLikedMeCount: 0,
  lastLikesCount: 0,
  newLikesReceived: false,
  
  // Демо-данные
  demoMatches: [
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
    // ... остальные мэтчи
  ],
  
  demoMessages: {
    101: [
      { id: 1, sender: 'other', text: 'Привет! Как дела?', time: '10:30', date: '2024-01-15' },
      // ... остальные сообщения
    ],
    // ... остальные чаты
  },
  
  // Функции
  init: function() {
    console.log('💬 Инициализирую систему чатов');
    this.loadMatchedUsers();
    this.loadChatMessages();
    this.loadUserReports();
    this.loadLikesData();
    this
