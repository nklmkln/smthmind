var GHPATH = "/sentiments";

var APP_PREFIX = "senti_";

var VERSION = "version_001";

var URLS = [
  `${GHPATH}/`,
  `${GHPATH}/index.html`,
  `${GHPATH}/css/main.css`,
  `${GHPATH}/css/list.css`,
  `${GHPATH}/css/newItem.css`,
  `${GHPATH}/js/db.js`,
  `${GHPATH}/assets/angry_bg.png`,
  `${GHPATH}/assets/angry_fg.png`,
  `${GHPATH}/assets/angry.png`,
  `${GHPATH}/assets/sad_bg.png`,
  `${GHPATH}/assets/sad_fg.png`,
  `${GHPATH}/assets/sad.png`,
  `${GHPATH}/assets/neutral_bg.png`,
  `${GHPATH}/assets/neutral.png`,
  `${GHPATH}/assets/neutral.png`,
  `${GHPATH}/assets/good_bg.png`,
  `${GHPATH}/assets/good_fg.png`,
  `${GHPATH}/assets/good.png`,
  `${GHPATH}/assets/happy_bg.png`,
  `${GHPATH}/assets/happy_fg.png`,
  `${GHPATH}/assets/happy.png`,
];

var CACHE_NAME = APP_PREFIX + VERSION;
self.addEventListener("fetch", function (e) {
  console.log("Fetch request : " + e.request.url);
  e.respondWith(
    caches.match(e.request).then(function (request) {
      if (request) {
        console.log("Responding with cache : " + e.request.url);
        return request;
      } else {
        console.log("File is not cached, fetching : " + e.request.url);
        return fetch(e.request);
      }
    })
  );
});

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("Installing cache : " + CACHE_NAME);
      return cache.addAll(URLS);
    })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      var cacheWhitelist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });
      cacheWhitelist.push(CACHE_NAME);
      return Promise.all(
        keyList.map(function (key, i) {
          if (cacheWhitelist.indexOf(key) === -1) {
            console.log("Deleting cache : " + keyList[i]);
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
});
