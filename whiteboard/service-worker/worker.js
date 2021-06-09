self.oninstall = function(event) {
  console.log("begin install");
  // 同一个网页，必须可以很好的在新旧两个 service 跑，否则不建议直接调用 skipWaiting
  self.skipWaiting();
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
    event.respondWith(openCache().then(function(cache) {
      return cache.match(event.request).then(function(response) {
        if (response) {
          return response;
        } else {
          return fetchMultiple([request.url, request.url.replace("https://convertcdn.netless.link", "https://ap-convertcdn.netless.link")])
        }
      });
    }));
  }
};

var cachePromise;
function openCache() {
  if (!cachePromise) { cachePromise = caches.open('netless'); }
  return cachePromise;
}

function fetchMultiple(urls, init) {
  return new Promise((resolve, reject) => {
      let list = [];
      const fetchResolve = (response, index) => {
          resolve(response);
          list.forEach((v, i) => {
            if (i !== index) {
              v.abort();
            }
          });
      };
      const rejectList = [];
      list = urls.map((v, index) => fetchWithAbort(v, init, index, fetchResolve, e => {
          rejectList.push(e);
          if (rejectList.length === list.length) {
              reject();
          }
      }));
  });
}

function fetchWithAbort(url, init, index, resolve, reject) {
  var controller = new AbortController();
  var signal = controller.signal;
  fetch(url, {signal, ...init}).then(function(response) {
      if (response.status >= 200 && response.status < 400) {
          return response;
      } else {
          reject(new Error("not correct code"));
      }
  }).then(res => {
      resolve(res, index);
  }).catch(function(e) {
      reject(e);
  });
  return controller;
}
