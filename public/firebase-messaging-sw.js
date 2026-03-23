importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

// User akan menimpa file ini dengan firebaseConfig mereka dari console Firebase
// API Endpoint ini dipanggil oleh service worker di background
const firebaseConfig = {
  apiKey: "AIzaSyBjR6iLEyJWExAlSHGeNEpqUwFHFZ4BRTg",
  authDomain: "trivgoo-b2129.firebaseapp.com",
  projectId: "trivgoo-b2129",
  storageBucket: "trivgoo-b2129.firebasestorage.app",
  messagingSenderId: "412316571358",
  appId: "1:412316571358:web:e83974b223f2a673df144f"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification?.title || 'Trivgoo';
    const notificationOptions = {
      body: payload.notification?.body || 'Pesanan Anda telah diperbarui',
      icon: '/logo-trivgoo.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.log('[firebase-messaging-sw.js] Error initializing service worker:', error);
}
