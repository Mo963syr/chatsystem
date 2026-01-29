// test-socket.js

// import { io } from "socket.io-client";

const { io } = require('socket.io-client');

// 🔴 الصق الكوكي هنا
const COOKIE =
  'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTc2OTJiMjZhNjc4ZmFmMzExNzgxM2EiLCJlbWFpbCI6Im1vYWZhcWFxZWVkMDFAZ21haWwuY29tIiwicm9sZSI6IkFkbWluIiwiaWF0IjoxNzY5NjA3Nzc4LCJleHAiOjE3Njk2MDg2Nzh9.PH6HaGdNzO1vgnWKWhEP9fCVSkZOqlmM7Fcfc5gSlYM';

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
