/**
 * MV3 background entry - a service worker on Chrome/Edge, an event page on
 * Firefox (see the manifest split in configs/vite.config.mts). Keep it
 * dependency-free so the same bundle works in both runtimes; the `chrome.*`
 * namespace is available in all three browsers.
 *
 * Besides being the future home for messaging, alarms and other background
 * work, its service worker is how the e2e fixture discovers the extension id.
 */
chrome.runtime.onInstalled.addListener(() => {
  // Placeholder: seed default settings or run migrations on install/update.
});
