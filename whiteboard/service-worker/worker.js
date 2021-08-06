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
          // https://web.dev/sw-range-requests
          const range = request.headers.get("range");
          if (range && response) {
            if (response.status === 206) return response;
            try {
              const blob = await response.blob();
              const [x, y] = range.replace("bytes=", "").split("-");
              const end = parseInt(y, 10) || blob.size - 1;
              const start = parseInt(x, 10) || 0;
              const sliced = blob.slice(start, end);
              const slicedSize = sliced.size;
              const slicedRes = new Response(sliced, {
                status: 206,
                statusText: "Partial Content",
                headers: response.headers,
              });
              slicedRes.headers.set("Content-Length", String(slicedSize));
              slicedRes.headers.set("Content-Range", `bytes ${start}-${end}/${blob.size}`);
              return slicedRes;
            } catch (error) {
              return new Response("", {
                status: 416,
                statusText: "Range Not Satisfiable",
              });
            }
          }
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
