// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  console.log('Push notification received:', event);
  
  let data = { title: 'SomDiet', body: 'Check out our health tips!' };
  
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.error('Error parsing push data:', e);
  }
  
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'SomDiet', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

self.addEventListener('install', function(event) {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});
