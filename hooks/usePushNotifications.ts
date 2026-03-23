import { useEffect, useState } from 'react';
import { initMessaging, getToken, onMessage } from '../src/config/firebase';
import api from '../services/http';
import { useAuth } from '../AuthContext';

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    // Hanya inisialisasi jika user login
    if (!user) return;

    const setupFCM = async () => {
      try {
        const messaging = await initMessaging();
        if (!messaging) return;

        // Minta ijin notifikasi
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Ambil token dari firebase (User harus isi VAPID KEY dari console)
          const token = await getToken(messaging, {
             vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || 'B_PLACEHOLDER_VAPID_KEY'
          });
          
          if (token) {
            setFcmToken(token);
            // Simpan ke backend
            await api.post('/users/fcm-token', { 
              token, 
              device_type: 'web' 
            });
            console.log('[FCM] Token berhasil disinkronkan dengan backend.');
          }
        } else {
          console.warn('[FCM] Izin push notifikasi ditolak oleh pengguna.');
        }

        // Listener untuk notifikasi saat tab sedang dibuka (Foreground)
        onMessage(messaging, (payload) => {
          console.log('[FCM] Foreground message diterima: ', payload);
          // Paksa munculkan OS Popup Notifikasi meski user sedang membuka tab ini
          if (payload.notification) {
            new Notification(payload.notification.title || 'Trivgoo', {
              body: payload.notification.body,
              icon: '/vite.svg'
            });
          }
        });

      } catch (error) {
        console.error('[FCM] Kesalahan saat setup notifikasi:', error);
      }
    };

    setupFCM();

  }, [user]);

  return { fcmToken };
};
