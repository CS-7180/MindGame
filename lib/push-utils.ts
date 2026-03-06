export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service worker not supported');
  }

  const registration = await navigator.serviceWorker.register('/sw.js');
  return registration;
}

export async function getSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return null;
  const subscription = await registration.pushManager.getSubscription();
  return subscription;
}

export async function subscribeToNotifications() {
  const registration = await registerServiceWorker();
  
  // Wait for the service worker to be ready
  await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!)
  });

  // Send subscription to server
  const response = await fetch('/api/notifications/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  });

  if (!response.ok) {
    throw new Error('Failed to save subscription on server');
  }

  return subscription;
}

export async function unsubscribeFromNotifications() {
  const subscription = await getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    
    // Notify server
    await fetch('/api/notifications/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint })
    });
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
