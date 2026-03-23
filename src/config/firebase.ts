import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Placeholder untuk firebase config. User harus mengisinya nanti dari Firebase Console.
// VAPID KEY juga harus diisi oleh user.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy_PLACEHOLDER",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "trivgoo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "trivgoo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "trivgoo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456:web:abcd1234"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
// Penting: Messaging hanya disupport di HTTPS atau localhost, dan di browser yang mendukukung web push.
let messaging: any = null;

export const initMessaging = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      messaging = getMessaging(app);
    } else {
      console.warn("Firebase Messaging tidak disupport di browser ini.");
    }
    return messaging;
  } catch (error) {
    console.warn("Gagal inisiasi Firebase Messaging:", error);
    return null;
  }
};

export { app, messaging, getToken, onMessage };
