/**
 * Request browser notification permission and show a ready alert.
 */
export async function enableNotifications() {
  const perm = await Notification.requestPermission();
  if (perm === "granted") {
    new Notification("NexusControl Ready");
  }
  return perm;
}

/**
 * Trigger a browser push notification.
 * @param {string} title
 * @param {string} [body]
 */
export function pushNotification(title, body = "") {
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}