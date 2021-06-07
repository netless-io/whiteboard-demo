self.oninstall = function(event) {
  console.log("begin install");
};

self.onactivate = function(event) {
  console.log("onactivate");
};

self.addEventListener("message", function(event) {
  const data = event.data;
  fetchOrigin = data.origin;
});

var fetchOrigin = "";

self.onfetch = function(event) {
  const request = event.request;
  const url = new URL(request.url);
  if (url.origin === "https://convertcdn.netless.link" || url.origin === fetchOrigin) {
    console.log("service worker inject");
    event.respondWith(openCache().then(function(cache) {
      return cache.match(event.request).then(function(response) {
        if (response) {
          console.log("catch success: ", event.request);
        }
        return response || fetch(event.request);
      });
    }));
  }
};

var cachePromise;
function openCache() {
  if (!cachePromise) { cachePromise = caches.open('netless'); }
  return cachePromise;
}
