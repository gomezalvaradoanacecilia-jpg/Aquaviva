// Service Worker para recepción de Notificaciones Push en segundo plano (Web Push FCM)
// Proyecto: aquaviva-crm-rpm
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyD_zogGn0nzMMxN3cSKzEKV60xEN7q4kzs",
  authDomain: "aquaviva-crm-rpm.firebaseapp.com",
  projectId: "aquaviva-crm-rpm",
  storageBucket: "aquaviva-crm-rpm.firebasestorage.app",
  messagingSenderId: "192770288748",
  appId: "1:192770288748:web:109963f9921687418d7c49"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Manejo de notificaciones push cuando el navegador / app está en segundo plano o cerrado
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Notificación recibida en segundo plano:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'Gestor Pro · Alerta';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'Nueva actualización registrada en el sistema.',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="36" fill="%235b4bdb"/><text x="96" y="120" font-size="90" font-family="system-ui,sans-serif" font-weight="bold" text-anchor="middle" fill="%23ffffff">GP</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="36" fill="%235b4bdb"/><text x="96" y="120" font-size="90" font-family="system-ui,sans-serif" font-weight="bold" text-anchor="middle" fill="%23ffffff">GP</text></svg>',
    data: payload.data || {},
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Al pulsar sobre la notificación recibida, abrir o enfocar la aplicación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});
