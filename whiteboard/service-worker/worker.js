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
          return response
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
          console.log("success: ", response.url);
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
              console.log("fetch all fail");``
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
      console.log("abort: ", e.name, url);
      reject(e);
  });
  return controller;
}
