async function handleRangeRequest(request, clientId) {
 const rangeHeader = request.headers.get('Range');
 const url = new URL(request.url);
 const pathMatch = url.pathname.match(/^.*\/yellow\/media\/([^\/]+)\/([^\/]+)/);
 const accId = pathMatch[1];
 const uploadId = pathMatch[2];
 const client = await self.clients.get(clientId);

 if (!rangeHeader) {
  // Fallback: return the whole file (inefficient)
  const full = await fetch(request);
  return full;
 }

 const fileInfo = await postMessageWithResponse(client, {
  type: 'GET_FILE_INFO',
  payload: {
   accId,
   uploadId,
  },
 })

 const { fileMimeType, fileSize } = fileInfo;

 const parts = rangeHeader.replace(/bytes=/, "").split("-");
 const start = parseInt(parts[0], 10);
 let end = parts[1] ? parseInt(parts[1], 10) : start + (1024 * 1024);
 //let end = start + (1024 * 1024);
 end = Math.min(end, fileSize - 1);
 const chunkSize = (end - start) + 1;

 return new Promise(resolve => {
  postMessageWithResponse(client, {
   type: 'GET_CHUNK',
   payload: {
    accId,
    uploadId,
    start,
    end,
    rangeHeader,
   },
  }).then(data => {
   const { chunk } = data;

   const response = new Response(chunk.data, {
    status: 206,
    headers: {
     "Content-Range": `bytes ${start}-${end}/${fileSize}`,
     "Accept-Ranges": "bytes",
     "Content-Length": chunkSize,
     "Content-Type": fileMimeType,
    },
   })

   resolve(response)
  })

 })
}

function postMessageWithResponse (client, data) {
 return new Promise(resolve => {
  const channel = new MessageChannel();

  channel.port1.onmessage = event => {
   resolve(event.data);
  }

  client.postMessage(data, [channel.port2]);
 })
}

self.addEventListener('install', function(event) {
 // Skip the 'waiting' lifecycle phase, to go directly from 'installed' to 'activated', even if
 // there are still previous incarnations of this service worker registration active.
 console.log('SW: install event');
 event.waitUntil(self.skipWaiting());
 console.log('SW: skipWaiting done');
});

self.addEventListener('activate', function(event) {
 // Claim any clients immediately, so that the page will be under SW control without reloading.
 console.log('SW: activate event');
 event.waitUntil(self.clients.claim());
 console.log('SW: clients claimed');
});

self.addEventListener('fetch', function(event) {
 if (event.request.url.includes('/yellow/media')) {
  event.respondWith(handleRangeRequest(event.request, event.clientId));
 }
});
