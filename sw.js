/* 75 Hard — service worker: offline shell + scheduled reminder notifications */

const CACHE = "75hard-v3";
const SCHEDULE_KEY = "/__reminder_schedule__";
let reminderTimers = [];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(["./", "./index.html", "./manifest.json"]);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); }).then(runDueReminders)
  );
});

self.addEventListener("message", function (event) {
  const data = event.data || {};
  if (data.type === "SCHEDULE_REMINDERS") {
    event.waitUntil(persistAndSchedule(data.reminders || []));
  }
  if (data.type === "CANCEL_REMINDERS") {
    event.waitUntil(clearSchedule());
  }
  if (data.type === "CHECK_REMINDERS") {
    event.waitUntil(runDueReminders());
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const action = (event.notification.data && event.notification.data.action) || "dashboard";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
      const client = list.length ? list[0] : null;
      if (client) {
        client.postMessage({ type: "NOTIFICATION_CLICKED", action: action });
        return client.focus();
      }
      return self.clients.openWindow("./?action=" + action);
    })
  );
});

function clearTimers() {
  reminderTimers.forEach(clearTimeout);
  reminderTimers = [];
}

function clearSchedule() {
  clearTimers();
  return caches.open(CACHE).then(function (cache) { return cache.delete(SCHEDULE_KEY); });
}

function persistAndSchedule(reminders) {
  clearTimers();
  return caches.open(CACHE).then(function (cache) {
    return cache.put(SCHEDULE_KEY, new Response(JSON.stringify(reminders)));
  }).then(function () {
    scheduleTimers(reminders);
    return runDueReminders();
  });
}

function scheduleTimers(reminders) {
  const now = Date.now();
  reminders.forEach(function (r) {
    const delay = r.at - now;
    if (delay > 0 && delay < 48 * 60 * 60 * 1000) {
      const timer = setTimeout(function () {
        showReminderNotification(r);
      }, delay);
      reminderTimers.push(timer);
    }
  });
}

async function getStoredReminders() {
  const cache = await caches.open(CACHE);
  const res = await cache.match(SCHEDULE_KEY);
  if (!res) return [];
  try {
    return await res.json();
  } catch (e) {
    return [];
  }
}

async function runDueReminders() {
  const reminders = await getStoredReminders();
  const now = Date.now();
  const due = reminders.filter(function (r) {
    return r.at <= now && r.at > now - 120000;
  });
  await Promise.all(due.map(showReminderNotification));
}

async function showReminderNotification(r) {
  if (!r || !r.title) return;
  // vibrate: always send pattern; Android honours it fully,
  // iOS 16.4+ installed PWA honours it via system setting.
  // silent=true suppresses sound when user toggled sound off.
  const vibratePattern = (r.vibrate && r.vibrate.length) ? r.vibrate : [200, 100, 200];
  await self.registration.showNotification(r.title, {
    body: r.body || "",
    tag: r.tag || "75hard-reminder",
    silent: r.silent === true,
    vibrate: vibratePattern,
    data: { tag: r.tag, id: r.id, action: r.action || "dashboard" },
    requireInteraction: false
  });
}
