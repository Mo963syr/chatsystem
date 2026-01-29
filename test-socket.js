// test-socket.js

// //
// const axios = require('axios');
// const { io } = require('socket.io-client');

// // ========= إعدادات =========
// const BASE_URL = 'http://localhost:3000';
// const LOGIN_ENDPOINT = '/auth/login'; // عدل إذا المسار مختلف

// const EMAIL = 'moafaqaqeed01@gmail.com';
// const PASSWORD = 'A12345678'; // كلمة المرور الصحيحة

// let accessToken = null;

// // ========= 1️⃣ تسجيل الدخول =========
// async function login() {
//   try {
//     const response = await axios.post(
//       BASE_URL + LOGIN_ENDPOINT,
//       {
//         email: EMAIL,
//         password: PASSWORD,
//       },
//       {
//         withCredentials: true, // مهم للكوكي
//       },
//     );

//     // 🔹 حالة: التوكن ضمن الـ body
//     if (response.data?.access_token) {
//       accessToken = response.data.access_token;
//     }

//     // 🔹 حالة: التوكن ضمن Set-Cookie
//     const setCookie = response.headers['set-cookie'];
//     if (setCookie) {
//       const tokenCookie = setCookie.find((c) => c.startsWith('access_token='));
//       if (tokenCookie) {
//         accessToken = tokenCookie.split(';')[0].split('=')[1];
//       }
//     }

//     if (!accessToken) {
//       throw new Error('لم يتم العثور على access_token');
//     }

//     console.log('✅ Logged in successfully');
//     console.log('🔐 Token:', accessToken);

//     connectSocket();
//   } catch (err) {
//     console.error('❌ Login failed:', err.response?.data || err.message);
//   }
// }

// // ========= 2️⃣ فتح السوكيت =========
// function connectSocket() {
//   const socket = io(BASE_URL + '/chat', {
//     transports: ['websocket'],
//     auth: {
//       token: accessToken, // ⭐ الأفضل
//     },
//     // بديل لو كنت تعتمد على Cookie
//     // extraHeaders: {
//     //   Cookie: `access_token=${accessToken}`,
//     // },
//   });

//   socket.on('connect', () => {
//     console.log('✅ Socket connected:', socket.id);

//     socket.emit('join-room', {
//       roomId: '697692b26a678faf3117813a_697912b5c3d60d123e8c482b',
//     });

//     socket.emit('send-message', {
//       content: 'رسالة اختبار بعد تسجيل الدخول ✅',
//       receiverId: '697912b5c3d60d123e8c482b',
//     });
//   });

//   socket.on('receive-message', (data) => {
//     console.log('📩 Message received:', data);
//   });

//   socket.on('connect_error', (err) => {
//     console.error('❌ Socket error:', err.message);
//   });
// }

// // ========= تشغيل =========
// login();

// success socket with token
const { io } = require('socket.io-client');

// 🔴 الصق الكوكي هنا
const COOKIE =
  'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTc2OTJiMjZhNjc4ZmFmMzExNzgxM2EiLCJlbWFpbCI6Im1vYWZhcWFxZWVkMDFAZ21haWwuY29tIiwicm9sZSI6IkFkbWluIiwiaWF0IjoxNzY5Njg0NjEzLCJleHAiOjE3Njk2ODU1MTN9.-9Q7emGgdM9von58kXEkI9GK9XqpDQAU72z-qrsj3f8';

const socket = io('http://localhost:3000/chat', {
  transports: ['websocket'],
  extraHeaders: {
    Cookie: COOKIE, // ⭐ الحل هنا
  },
});

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);

  socket.emit('join-room', {
    roomId: '697692b26a678faf3117813a_697912b5c3d60d123e8c482b',
  });

  socket.emit('send-message', {
    content: 'رسالة اختبارلالبالبابل من التيرمنال',
    receiverId: '697912b5c3d60d123e8c482b',
  });
});

socket.on('receive-message', (data) => {
  console.log('📩 Message received:', data);
});

socket.on('connect_error', (err) => {
  console.error('❌ Connection error:', err.message);
});
