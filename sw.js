/* ---------------------------------------------------------------------
   Reform of Life; service worker.

   Its only jobs are to make the site installable and to keep it working
   with no signal, which for a prayer app is a real case: a church
   basement, a plane, a phone with no data left.

   🔴 NETWORK FIRST, CACHE AS FALLBACK, AND THE ORDER IS THE WHOLE POINT.
   The obvious cache-first strategy is faster and wrong here: this site is
   still being edited, and cache-first means a wording change is invisible
   to anyone who has already opened it, sometimes for days, with no way for
   them to know they are reading an old copy. Network-first costs a few
   milliseconds on a connection that already exists and guarantees that
   what you publish is what people read. Offline behaviour is identical.
   --------------------------------------------------------------------- */

var CACHE = "rol-v4";

var SHELL = [
  "index.html",
  "practices.html",
  "rosary.html",
  "gospels.html",
  "confession.html",
  "mass.html",
  "fasting.html",
  "prayer.html",
  "service.html",
  "community.html",
  "contact.html",
  "style.css",
  "app.js",
  "exam.js",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png",
  "manifest.json"
];

self.addEventListener("install", function (e) {
  /* addAll rejects the whole install if any single file 404s, which would
     leave the app with no offline copy at all and no message saying so.
     Added one at a time instead, so a missing file costs that one page. */
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(SHELL.map(function (url) {
        return c.add(url).catch(function () { return null; });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  /* Scripture and Mass times live on other people's servers. Let those go
     straight to the network; caching someone else's site is not this
     worker's business, and a stale copy of a Mass schedule is worse than
     no copy. */
  if (new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.status === 200 && res.type === "basic") {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        return hit || caches.match("practices.html");
      });
    })
  );
});
