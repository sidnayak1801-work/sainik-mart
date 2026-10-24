/* global firebase */
importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js");

const orderIdFrom = (data) => {
  if (!data || typeof data !== "object") {
    return "";
  }
  if (typeof data.orderId === "string") {
    return data.orderId;
  }
  const nested = data.FCM_MSG && data.FCM_MSG.data;
  if (nested && typeof nested.orderId === "string") {
    return nested.orderId;
  }
  return "";
};

const orderUrl = (orderId) => {
  return orderId ? `/admin/orders/${orderId}` : "/admin/orders";
};

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const orderId = orderIdFrom(event.notification.data);
  const target = orderUrl(orderId);

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) {
          if ("navigate" in client) {
            return client.navigate(target).then((opened) => (opened ? opened.focus() : client.focus()));
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(target);
      }
      return undefined;
    }),
  );
});

const initMessaging = async () => {
  try {
    const response = await fetch("/firebase-web-config.json", { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const config = await response.json();
    if (!config || !config.apiKey || !config.projectId || !config.appId || !config.messagingSenderId) {
      return;
    }
    firebase.initializeApp(config);
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
      if (payload.notification) {
        return;
      }
      const data = payload.data || {};
      const title = "New paid order";
      const body = typeof data.orderId === "string" ? `Order ${data.orderId.replace(/-/g, "").slice(0, 8)}` : "";
      return self.registration.showNotification(title, { body, data });
    });
  } catch (error) {
    console.warn("Admin FCM service worker could not start", error);
  }
};

void initMessaging();
