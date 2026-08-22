/* ---------------------------------------------------------------------
   Reform of Life; the record.

   Everything here is device-local. There is no account, no server, and
   nothing leaves the phone: the record lives in localStorage under one
   key. That is a deliberate choice rather than a shortcut. A record of
   who confessed and when is about as sensitive as personal data gets,
   and the safest way to hold it is not to hold it.

   The cost of that choice is stated plainly on the page rather than
   hidden: the record does not follow you to a second device, and
   clearing browser data clears it. The export code exists to soften
   exactly that, and it is the only way a record ever moves.
   --------------------------------------------------------------------- */
(function () {
  "use strict";

  var KEY = "rol.record.v1";

  /* -------------------------------------------------------------------
     The model.

     Steps are deliberately small and countable. A single "done" button
     per practice would make finishing the first layer a matter of four
     taps, which would mean nothing; these are the smallest units that
     are still a real thing you did.
     ------------------------------------------------------------------- */
  var LAYER_ONE = [
    {
      id: "rosary", title: "The Rosary", href: "rosary.html",
      /* One of each set, so that finishing means you have actually met
         all twenty mysteries rather than praying the Joyful five times. */
      unit: "set", steps: ["Joyful", "Luminous", "Sorrowful", "Glorious"]
    },
    {
      id: "gospels", title: "The Gospels", href: "gospels.html",
      unit: "week", steps: ["Mark 1–4", "Mark 5–8", "Mark 9–12", "Mark 13–16"]
    },
    {
      id: "confession", title: "Confession", href: "confession.html",
      unit: "visit", steps: ["Went"]
    },
    {
      id: "mass", title: "The Mass", href: "mass.html",
      unit: "Sunday", steps: ["Sunday", "Sunday", "Sunday", "Sunday"]
    }
  ];

  var LAYER_TWO = [
    {
      id: "fasting", title: "Fasting", href: "fasting.html",
      unit: "step", steps: ["One Friday", "One real fast", "One thing given up"]
    },
    {
      id: "prayer", title: "Prayer", href: "prayer.html",
      unit: "step", steps: ["Ten minutes of silence", "A holy hour", "The Examen, seven nights"]
    },
    {
      id: "service", title: "Service", href: "service.html",
      unit: "step", steps: ["One work of mercy", "Gave until it cost", "Served someone difficult"]
    },
    {
      id: "community", title: "Community", href: "community.html",
      unit: "step", steps: ["Stayed and talked", "Went to one thing", "Brought someone"]
    }
  ];

  var ALL = LAYER_ONE.concat(LAYER_TWO);
  function find(id) {
    for (var i = 0; i < ALL.length; i++) if (ALL[i].id === id) return ALL[i];
    return null;
  }

  /* ---------------------- storage ---------------------- */
  /* Every read and write is wrapped: private browsing and a few locked-down
     iPad configurations throw on localStorage rather than returning null,
     and a devotional tracker that white-screens is worse than one that
     quietly forgets. */
  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  function save(rec) {
    try { window.localStorage.setItem(KEY, JSON.stringify(rec)); return true; }
    catch (e) { return false; }
  }

  /* A step stores the DATE it was done, not a boolean. It costs nothing and
     it means the record can say "you last prayed the Glorious mysteries on
     the 12th", which is the difference between a checklist and a record. */
  function doneAt(rec, id, i) {
    return (rec[id] && rec[id][i]) || null;
  }
  function countDone(rec, p) {
    var n = 0;
    for (var i = 0; i < p.steps.length; i++) if (doneAt(rec, p.id, i)) n++;
    return n;
  }
  function isComplete(rec, p) { return countDone(rec, p) >= p.steps.length; }

  function layerOneRemaining(rec) {
    var n = 0;
    for (var i = 0; i < LAYER_ONE.length; i++) {
      n += LAYER_ONE[i].steps.length - countDone(rec, LAYER_ONE[i]);
    }
    return n;
  }
  function unlocked(rec) { return layerOneRemaining(rec) === 0; }

  function toggle(id, i) {
    var rec = load();
    if (!rec[id]) rec[id] = {};
    if (rec[id][i]) delete rec[id][i];
    else rec[id][i] = new Date().toISOString().slice(0, 10);
    save(rec);
    renderAll();
  }

  /* ---------------------- rendering ---------------------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function plural(n, word) { return n + " " + word + (n === 1 ? "" : "s"); }

  function summaryLine(rec, p) {
    var n = countDone(rec, p), t = p.steps.length;
    if (n === 0) return "not yet";
    if (n >= t) return "complete";
    return n + " of " + plural(t, p.unit);
  }

  /* The dots are the whole status display on the landing page: countable at a
     glance, and they do not need to be read. */
  function dots(rec, p) {
    var wrap = el("span", "dots");
    for (var i = 0; i < p.steps.length; i++) {
      wrap.appendChild(el("span", doneAt(rec, p.id, i) ? "dot on" : "dot"));
    }
    return wrap;
  }

  /* ---- the tracker that sits on each practice page ---- */
  function renderTracker(host) {
    var p = find(host.getAttribute("data-tracker"));
    if (!p) return;
    var rec = load();
    host.innerHTML = "";

    var card = el("div", "record-card");
    var head = el("div", "record-head");
    head.appendChild(el("span", "label", isComplete(rec, p) ? "Complete" : "Your record"));
    head.appendChild(el("span", "record-count", summaryLine(rec, p)));
    card.appendChild(head);

    var list = el("div", "record-steps");
    p.steps.forEach(function (label, i) {
      var when = doneAt(rec, p.id, i);
      var b = el("button", "record-step" + (when ? " done" : ""));
      b.type = "button";
      b.setAttribute("aria-pressed", when ? "true" : "false");

      b.appendChild(el("span", "tick", when ? "✓" : ""));
      var txt = el("span", "record-label");
      txt.appendChild(el("span", "record-step-name", label));
      if (when) {
        var d = new Date(when + "T12:00:00");
        txt.appendChild(el("span", "record-when",
          d.toLocaleDateString(undefined, { month: "short", day: "numeric" })));
      }
      b.appendChild(txt);
      b.addEventListener("click", function () { toggle(p.id, i); });
      list.appendChild(b);
    });
    card.appendChild(list);

    var note = el("p", "record-note");
    note.textContent = isComplete(rec, p)
      ? "Tap any line again if you logged it by mistake."
      : "Tap each one after you have done it. Kept on this device only.";
    card.appendChild(note);

    host.appendChild(card);
  }

  /* ---- the landing page summary, including the locked second layer ---- */
  function renderSummary(host) {
    var rec = load();
    var remaining = layerOneRemaining(rec);
    var open = unlocked(rec);
    host.innerHTML = "";

    var started = false;
    for (var i = 0; i < LAYER_ONE.length; i++) if (countDone(rec, LAYER_ONE[i])) started = true;
    if (!started) { host.appendChild(lockedNotice(remaining, false)); return; }

    var card = el("div", "record-card");
    card.appendChild(el("span", "label", open ? "Your record · first layer complete" : "Your record"));

    var list = el("div", "record-summary");
    LAYER_ONE.forEach(function (p) {
      var row = el("a", "record-row");
      row.href = p.href;
      row.appendChild(el("span", "record-row-title", p.title));
      row.appendChild(dots(rec, p));
      row.appendChild(el("span", "record-row-state", summaryLine(rec, p)));
      list.appendChild(row);
    });
    card.appendChild(list);
    host.appendChild(card);
    host.appendChild(lockedNotice(remaining, true));
  }

  /* 🔴 THE SECOND LAYER IS ANNOUNCED FROM THE FIRST VISIT, NOT SPRUNG.
     A locked thing you can see is an invitation; a locked thing nobody
     mentioned is just an absence, and the reader never knows it was there.
     So this states what is behind it and exactly what opens it. */
  function lockedNotice(remaining, afterRecord) {
    var open = remaining === 0;
    var box = el("div", "layer-two" + (open ? " open" : ""));

    box.appendChild(el("span", "label", open ? "Now open" : "Locked"));
    box.appendChild(el("h3", null, "The second layer"));

    var names = LAYER_TWO.map(function (p) { return p.title; }).join(", ");
    box.appendChild(el("p", "layer-two-blurb",
      open
        ? "You have finished all four. " + names + " are open."
        : "Four more practices are waiting behind the first four: " + names + "."));

    if (open) {
      var links = el("div", "layer-two-links");
      LAYER_TWO.forEach(function (p) {
        var a = el("a", "layer-two-link", p.title);
        a.href = p.href;
        links.appendChild(a);
      });
      box.appendChild(links);
    } else {
      var req = el("p", "layer-two-req");
      req.appendChild(el("strong", null, "To open it: "));
      req.appendChild(document.createTextNode(
        "pray each of the four sets of mysteries once, read Mark straight through in four weeks, "
        + "go to confession once, and be at Mass four Sundays."));
      box.appendChild(req);

      box.appendChild(el("p", "layer-two-count",
        afterRecord
          ? plural(remaining, "step") + " to go."
          : "Thirteen steps in all. Start anywhere."));
    }
    return box;
  }

  /* ---- the banner on a second-layer page reached before it is open ---- */
  function renderGate(host) {
    var rec = load();
    if (unlocked(rec)) { host.innerHTML = ""; return; }
    host.innerHTML = "";
    var box = el("div", "gate");
    box.appendChild(el("span", "label", "Not open yet"));
    box.appendChild(el("p", null,
      "This is part of the second layer, which opens once the first four are finished; "
      + plural(layerOneRemaining(rec), "step") + " to go. "
      + "Nothing is hidden from you, so read on if you would rather. It is here when you are."));
    var a = el("a", null, "Back to the four");
    a.href = "index.html";
    box.appendChild(a);
    host.appendChild(box);
  }

  /* ---- export, restore, reset ---- */
  function renderTools(host) {
    host.innerHTML = "";
    var wrap = el("div", "tools");

    var exportBtn = el("button", "tool-btn", "Copy my record");
    exportBtn.type = "button";
    exportBtn.addEventListener("click", function () {
      var code = btoa(unescape(encodeURIComponent(JSON.stringify(load()))));
      var done = function () {
        exportBtn.textContent = "Copied. Paste it somewhere safe.";
        setTimeout(function () { exportBtn.textContent = "Copy my record"; }, 4000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(done, function () { window.prompt("Copy this:", code); });
      } else {
        window.prompt("Copy this:", code);
      }
    });

    var restoreBtn = el("button", "tool-btn", "Restore from a code");
    restoreBtn.type = "button";
    restoreBtn.addEventListener("click", function () {
      var code = window.prompt("Paste the code you copied from your other device:");
      if (!code) return;
      try {
        var parsed = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
        if (typeof parsed !== "object" || parsed === null) throw new Error("bad");
        save(parsed);
        renderAll();
      } catch (e) {
        window.alert("That code was not readable. Copy the whole thing and try again.");
      }
    });

    var resetBtn = el("button", "tool-btn quiet", "Start over");
    resetBtn.type = "button";
    resetBtn.addEventListener("click", function () {
      if (window.confirm("Erase your whole record on this device? This cannot be undone.")) {
        save({});
        renderAll();
      }
    });

    wrap.appendChild(exportBtn);
    wrap.appendChild(restoreBtn);
    wrap.appendChild(resetBtn);
    host.appendChild(wrap);

    host.appendChild(el("p", "record-note",
      "Your record is kept on this device and nowhere else. Nobody, including whoever made this, "
      + "can see it. That also means it does not follow you to another phone unless you copy it across, "
      + "and clearing your browser data clears it."));
  }

  function renderAll() {
    var i, n;
    var trackers = document.querySelectorAll("[data-tracker]");
    for (i = 0; i < trackers.length; i++) renderTracker(trackers[i]);
    n = document.querySelector("[data-summary]"); if (n) renderSummary(n);
    n = document.querySelector("[data-gate]");    if (n) renderGate(n);
    n = document.querySelector("[data-tools]");   if (n) renderTools(n);
  }

  /* ---------------------- install / offline ---------------------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () { /* offline is a bonus, not a requirement */ });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderAll);
  } else {
    renderAll();
  }
})();
