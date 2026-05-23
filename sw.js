/* 75 Hard — service worker: offline shell + scheduled reminder notifications */

const CACHE = "75hard-v1";
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
  event.waitUntil(self.clients.claim().then(runDueReminders));
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
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
      if (list.length) return list[0].focus();
      return self.clients.openWindow("./");
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
  await self.registration.showNotification(r.title, {
    body: r.body || "",
    tag: r.tag || "75hard-reminder",
    data: { tag: r.tag, id: r.id },
    requireInteraction: false
  });
}
