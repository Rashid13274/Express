// DOM Elements
const createUserForm = document.getElementById('create-user');
const userInfoSection = document.getElementById('user-info');
const onlineUsersList = document.getElementById('online-users');
const roomsList = document.getElementById('rooms-list');
const createRoomBtn = document.getElementById('create-room-btn');
const roomNameInput = document.getElementById('room-name');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const fileBtn = document.getElementById('file-btn');
const fileInput = document.getElementById('file-input');
const currentChatTitle = document.getElementById('current-chat-title');
const typingIndicator = document.getElementById('typing-indicator');
const blockUserBtn = document.getElementById('block-user-btn');
const blockUserSelect = document.getElementById('block-user-select');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

// State
let currentUser = null;
let selectedUser = null;
let selectedRoom = null;
let socket = null;
let typingTimeout = null;

// Initialize Socket.IO connection
function initSocket() {
  socket = io();
  
  // Socket event listeners
  socket.on('connect', () => {
    console.log('Connected to server');
  });
  
  socket.on('user-created', (user) => {
    currentUser = user;
    showUserInfo(user);
    updateOnlineStatus(true);
  });
  
  socket.on('user-updated', (user) => {
    if (currentUser && currentUser._id === user._id) {
      currentUser = user;
      showUserInfo(user);
    }
  });
  
  socket.on('user-online', (user) => {
    updateUserList(user, true);
  });
  
  socket.on('user-offline', (user) => {
    updateUserList(user, false);
  });
  
  socket.on('room-created', (room) => {
    addRoomToList(room);
  });
  
  socket.on('room-joined', (room) => {
    selectedRoom = room;
    currentChatTitle.textContent = `Room: ${room.name}`;
    loadRoomMessages(room._id);
  });
  
  socket.on('room-left', (room) => {
    if (selectedRoom && selectedRoom._id === room._id) {
      selectedRoom = null;
      selectedUser = null;
      currentChatTitle.textContent = 'Select a chat';
      messagesContainer.innerHTML = '';
      messageInput.disabled = true;
      sendBtn.disabled = true;
    }
  });
  
  socket.on('user-joined-room', ({ userId, roomId }) => {
    if (selectedRoom && selectedRoom._id === roomId) {
      const message = document.createElement('div');
      message.className = 'notification';
      message.textContent = `User ${userId} joined the room`;
      messagesContainer.appendChild(message);
    }
  });
  
  socket.on('user-left-room', ({ userId, roomId }) => {
    if (selectedRoom && selectedRoom._id === roomId) {
      const message = document.createElement('div');
      message.className = 'notification';
      message.textContent = `User ${userId} left the room`;
      messagesContainer.appendChild(message);
    }
  });
  
  socket.on('private-message', (message) => {
    if (
      (message.sender._id === selectedUser?._id && message.recipient === currentUser._id) ||
      (message.sender._id === currentUser._id && message.recipient === selectedUser?._id)
    ) {
      addMessageToUI(message, message.sender._id === currentUser._id);
    }
  });
  
  socket.on('room-message', (message) => {
    if (selectedRoom && message.room === selectedRoom._id) {
      addMessageToUI(message, message.sender._id === currentUser._id);
    }
  });
  
  socket.on('file-received', (message) => {
    if (message.recipient && (
      (message.sender._id === selectedUser?._id && message.recipient === currentUser._id) ||
      (message.sender._id === currentUser._id && message.recipient === selectedUser?._id)
    )) {
      addFileMessageToUI(message, message.sender._id === currentUser._id);
    } else if (message.room && selectedRoom && message.room === selectedRoom._id) {
      addFileMessageToUI(message, message.sender._id === currentUser._id);
    }
  });
  
  socket.on('message-edited', (message) => {
    const messageElement = document.getElementById(`message-${message._id}`);
    if (messageElement) {
      const contentElement = messageElement.querySelector('.content');
      contentElement.textContent = message.text;
      contentElement.innerHTML += ' <span class="edited">(edited)</span>';
    }
  });
  
  socket.on('message-deleted', (messageId) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.innerHTML = '<div class="deleted-message">Message deleted</div>';
    }
  });
  
  socket.on('typing', (userId) => {
    if (selectedUser && selectedUser._id === userId) {
      typingIndicator.textContent = `${selectedUser.nickname} is typing...`;
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        typingIndicator.textContent = '';
      }, 2000);
    }
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
    alert(`Error: ${error}`);
  });
  
  socket.on('message-blocked', ({ recipient, reason }) => {
    alert(`Message blocked: ${reason}`);
  });
}

// Initialize the app
function initApp() {
  initSocket();
  setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
  // Create user form
  createUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(createUserForm);
    const userData = {
      name: formData.get('name'),
      age: parseInt(formData.get('age')),
      nickname: formData.get('nickname'),
      city: formData.get('city')
    };
    socket.emit('create-user', userData);
  });
  
  // Create room
  createRoomBtn.addEventListener('click', () => {
    const roomName = roomNameInput.value.trim();
    if (roomName && currentUser) {
      socket.emit('create-room', { name: roomName, creatorId: currentUser._id });
      roomNameInput.value = '';
    }
  });
  
  // Send message
  sendBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  
  // Typing indicator
  messageInput.addEventListener('input', () => {
    if (selectedUser) {
      socket.emit('typing', selectedUser._id);
    }
  });
  
  // File upload
  fileBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileUpload);
  
  // Block user
  blockUserBtn.addEventListener('click', () => {
    const userId = blockUserSelect.value;
    if (userId && currentUser) {
      socket.emit('block-user', { userId: currentUser._id, blockedUserId: userId });
    }
  });
  
  // Search messages
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length > 2) {
      searchMessages(query);
    } else {
      searchResults.innerHTML = '';
    }
  });
}

// Show user info
function showUserInfo(user) {
  userInfoSection.style.display = 'block';
  createUserForm.style.display = 'none';
  
  userInfoSection.innerHTML = `
    <div class="user-info-display">
      <div class="avatar-placeholder"></div>
      <div class="user-details">
        <h4>${user.nickname}</h4>
        <p>${user.name}, ${user.age}</p>
        <p>${user.city}</p>
      </div>
    </div>
    <button id="update-profile-btn">Edit Profile</button>
  `;
  
  document.getElementById('update-profile-btn').addEventListener('click', () => {
    const newName = prompt('Enter new name:', user.name);
    const newAge = prompt('Enter new age:', user.age);
    const newCity = prompt('Enter new city:', user.city);
    
    if (newName && newAge && newCity) {
      socket.emit('update-user', {
        userId: user._id,
        name: newName,
        age: parseInt(newAge),
        city: newCity
      });
    }
  });
}

// Update online status
function updateOnlineStatus(online) {
  if (!currentUser) return;
  
  if (online) {
    socket.emit('user-online', currentUser._id);
  } else {
    socket.emit('user-offline', currentUser._id);
  }
}

// Update user list
function updateUserList(user, isOnline) {
  const existingUser = document.querySelector(`.user-item[data-id="${user._id}"]`);
  
  if (existingUser) {
    const status = existingUser.querySelector('.user-status');
    status.className = `user-status ${isOnline ? 'online' : 'offline'}`;
    return;
  }
  
  const userItem = document.createElement('div');
  userItem.className = `user-item ${isOnline ? 'online' : 'offline'}`;
  userItem.dataset.id = user._id;
  userItem.innerHTML = `
    <div class="avatar-placeholder"></div>
    <div class="user-details">
      <h4>${user.nickname}</h4>
      <p>${user.name}</p>
    </div>
    <div class="user-status ${isOnline ? 'online' : 'offline'}"></div>
  `;
  
  userItem.addEventListener('click', () => {
    document.querySelectorAll('.user-item').forEach(item => {
      item.classList.remove('active');
    });
    userItem.classList.add('active');
    
    selectedUser = user;
    selectedRoom = null;
    currentChatTitle.textContent = user.nickname;
    loadPrivateMessages(user._id);
    messageInput.disabled = false;
    sendBtn.disabled = false;
  });
  
  onlineUsersList.appendChild(userItem);
  
  // Add to block user dropdown
  if (user._id !== currentUser?._id) {
    const option = document.createElement('option');
    option.value = user._id;
    option.textContent = user.nickname;
    blockUserSelect.appendChild(option);
  }
}

// Add room to list
function addRoomToList(room) {
  const roomItem = document.createElement('div');
  roomItem.className = 'room-item';
  roomItem.dataset.id = room._id;
  roomItem.innerHTML = `
    <div>${room.name}</div>
    <div class="member-count">${room.members.length} members</div>
  `;
  
  roomItem.addEventListener('click', () => {
    document.querySelectorAll('.room-item').forEach(item => {
      item.classList.remove('active');
    });
    roomItem.classList.add('active');
    
    selectedRoom = room;
    selectedUser = null;
    currentChatTitle.textContent = `Room: ${room.name}`;
    socket.emit('join-room', { roomId: room._id, userId: currentUser._id });
    messageInput.disabled = false;
    sendBtn.disabled = false;
  });
  
  roomsList.appendChild(roomItem);
}

// Load private messages
function loadPrivateMessages(userId) {
  messagesContainer.innerHTML = '';
  fetch(`/api/messages?recipient=${userId}&sender=${currentUser._id}`)
    .then(response => response.json())
    .then(messages => {
      messages.forEach(msg => {
        addMessageToUI(msg, msg.sender._id === currentUser._id);
      });
      scrollToBottom();
    });
}

// Load room messages
function loadRoomMessages(roomId) {
  messagesContainer.innerHTML = '';
  fetch(`/api/rooms/${roomId}/messages`)
    .then(response => response.json())
    .then(messages => {
      messages.forEach(msg => {
        addMessageToUI(msg, msg.sender._id === currentUser._id);
      });
      scrollToBottom();
    });
}

// Add message to UI
function addMessageToUI(message, isSent) {
  const messageElement = document.createElement('div');
  messageElement.id = `message-${message._id}`;
  messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
  
  const date = new Date(message.timestamp);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  messageElement.innerHTML = `
    <div class="sender">${message.sender.nickname}</div>
    <div class="content">${message.text || ''}</div>
    <div class="timestamp">${timeString}</div>
    <div class="actions">
      ${isSent ? `
        <button class="edit-btn" data-id="${message._id}">Edit</button>
        <button class="delete-btn" data-id="${message._id}">Delete</button>
      ` : ''}
    </div>
  `;
  
  if (isSent) {
    messageElement.querySelector('.edit-btn').addEventListener('click', () => {
      const newText = prompt('Edit your message:', message.text);
      if (newText && newText.trim() !== '') {
        socket.emit('edit-message', { messageId: message._id, newText });
      }
    });
    
    messageElement.querySelector('.delete-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this message?')) {
        socket.emit('delete-message', message._id);
      }
    });
  }
  
  messagesContainer.appendChild(messageElement);
  scrollToBottom();
}

// Add file message to UI
function addFileMessageToUI(message, isSent) {
  const messageElement = document.createElement('div');
  messageElement.id = `message-${message._id}`;
  messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
  
  const date = new Date(message.timestamp);
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  messageElement.innerHTML = `
    <div class="sender">${message.sender.nickname}</div>
    <div class="file">
      <a href="#" download="${message.file.name}">
        <div class="file-icon">📄</div>
        <div>${message.file.name}</div>
      </a>
    </div>
    <div class="timestamp">${timeString}</div>
  `;
  
  messagesContainer.appendChild(messageElement);
  scrollToBottom();
}

// Send message
function sendMessage() {
  const text = messageInput.value.trim();
  
  if ((text || fileInput.files.length > 0) && currentUser) {
    if (selectedUser) {
      // Private message
      const messageData = {
        sender: currentUser._id,
        recipient: selectedUser._id,
        text: text
      };
      
      socket.emit('send-message', messageData);
    } else if (selectedRoom) {
      // Room message
      const messageData = {
        sender: currentUser._id,
        room: selectedRoom._id,
        text: text
      };
      
      socket.emit('send-message', messageData);
    }
    
    messageInput.value = '';
    fileInput.value = '';
  }
}

// Handle file upload
function handleFileUpload() {
  if (!fileInput.files.length) return;
  
  const file = fileInput.files[0];
  const reader = new FileReader();
  
  reader.onload = function(event) {
    const fileData = {
      name: file.name,
      type: file.type,
      data: event.target.result.split(',')[1] // Remove data URL prefix
    };
    
    if (selectedUser) {
      // Private file
      socket.emit('send-file', {
        sender: currentUser._id,
        recipient: selectedUser._id,
        file: fileData
      });
    } else if (selectedRoom) {
      // Room file
      socket.emit('send-file', {
        sender: currentUser._id,
        room: selectedRoom._id,
        file: fileData
      });
    }
  };
  
  reader.readAsDataURL(file);
}

// Search messages
function searchMessages(query) {
  fetch(`/api/messages/search?query=${query}`)
    .then(response => response.json())
    .then(results => {
      searchResults.innerHTML = '';
      
      results.forEach(msg => {
        const resultElement = document.createElement('div');
        resultElement.className = 'search-result';
        resultElement.dataset.id = msg._id;
        
        const date = new Date(msg.timestamp);
        const dateString = date.toLocaleDateString();
        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        resultElement.innerHTML = `
          <div><strong>${msg.sender.nickname}</strong> <span class="timestamp">${dateString} ${timeString}</span></div>
          <div class="message-preview">${msg.text}</div>
        `;
        
        resultElement.addEventListener('click', () => {
          // Focus on the message in the chat
          if (msg.room) {
            socket.emit('join-room', { roomId: msg.room, userId: currentUser._id });
          } else {
            const userId = msg.sender._id === currentUser._id ? msg.recipient : msg.sender._id;
            const userItem = document.querySelector(`.user-item[data-id="${userId}"]`);
            if (userItem) userItem.click();
          }
          
          // Highlight the message
          setTimeout(() => {
            const messageElement = document.getElementById(`message-${msg._id}`);
            if (messageElement) {
              messageElement.style.backgroundColor = '#fff9c4';
              setTimeout(() => {
                messageElement.style.backgroundColor = '';
              }, 3000);
              messageElement.scrollIntoView({ behavior: 'smooth' });
            }
          }, 500);
        });
        
        searchResults.appendChild(resultElement);
      });
    });
}

// Scroll to bottom of chat
function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Update online status when window is focused/blurred
window.addEventListener('focus', () => updateOnlineStatus(true));
window.addEventListener('blur', () => updateOnlineStatus(false));

// Update online status before window closes
window.addEventListener('beforeunload', () => {
  if (socket && currentUser) {
    socket.emit('user-offline', currentUser._id);
  }
});