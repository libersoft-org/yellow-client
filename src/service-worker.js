
self.addEventListener('install', function(event) {
 // Skip the 'waiting' lifecycle phase, to go directly from 'installed' to 'activated', even if
 // there are still previous incarnations of this service worker registration active.
 console.log('install event');
 event.waitUntil(self.skipWaiting());
 console.log('skipWaiting done');
});

self.addEventListener('activate', function(event) {
 // Claim any clients immediately, so that the page will be under SW control without reloading.
 console.log('activate event');
 event.waitUntil(self.clients.claim());
 console.log('clients claimed');
});

self.addEventListener('fetch', function(event) {
 console.log('fetch event xxx', event.request.url);
});
