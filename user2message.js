// test-socket.js

//SUCCESS SOKET WITH TOKEN IN BODY
const axios = require('axios');
const { io } = require('socket.io-client');

const BASE_URL = 'http://localhost:3000';
const LOGIN_ENDPOINT = '/auth/login';

const EMAIL = 'moafaqaqeed012@gmail.com';
const PASSWORD = 'A123456789';

let accessToken = null;

// ========= 1️⃣ تسجيل الدخول =========
async function login() {
  try {
    const response = await axios.post(BASE_URL + LOGIN_ENDPOINT, {
      email: EMAIL,
      password: PASSWORD,
    });

    // ✅ أخذ التوكن مباشرة من جسم الاستجابة
    accessToken = response.data.token;

    if (!accessToken) {
      throw new Error('Token not found in response body');
    }

    console.log('✅ Logged in successfully');
    console.log('🔐 Token:', accessToken);

    connectSocket();
  } catch (err) {
    console.error('❌ Login failed:', err.response?.data || err.message);
  }
}
function connectSocket() {
  const socket = io(BASE_URL + '/chat', {
    transports: ['websocket'],
    auth: {
      token: accessToken, // ⭐ هنا التوكن
    },
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);

    socket.emit('join-room', {
      roomId: '697912b5c3d60d123e8c482b_697692b26a678faf3117813a',
    });

    socket.emit('send-message', {
      content: 'رسالة اختبار من المستخدم الثاني الدخول ✅',
      receiverId: '697692b26a678faf3117813a',
    });
  });

  socket.on('receive-message', (data) => {
    console.log('📩 Message received:', data);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Socket error:', err.message);
  });
}
login();

// // success socket with token IN CODE
// const { io } = require('socket.io-client');

// // 🔴 الصق الكوكي هنا
// const COOKIE =
//   'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTc2OTJiMjZhNjc4ZmFmMzExNzgxM2EiLCJlbWFpbCI6Im1vYWZhcWFxZWVkMDFAZ21haWwuY29tIiwicm9sZSI6IkFkbWluIiwiaWF0IjoxNzY5Njg0NjEzLCJleHAiOjE3Njk2ODU1MTN9.-9Q7emGgdM9von58kXEkI9GK9XqpDQAU72z-qrsj3f8';

// const socket = io('http://localhost:3000/chat', {
//   transports: ['websocket'],
//   extraHeaders: {
//     Cookie: COOKIE, // ⭐ الحل هنا
//   },
// });

// socket.on('connect', () => {
//   console.log('✅ Connected:', socket.id);

//   socket.emit('join-room', {
//     roomId: '697692b26a678faf3117813a_697912b5c3d60d123e8c482b',
//   });

//   socket.emit('send-message', {
//     content: 'رسالة اختبارلالبالبابل من التيرمنال',
//     receiverId: '697912b5c3d60d123e8c482b',
//   });
// });

// socket.on('receive-message', (data) => {
//   console.log('📩 Message received:', data);
// });

// socket.on('connect_error', (err) => {
//   console.error('❌ Connection error:', err.message);
// });
