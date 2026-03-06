import webpush from 'web-push';

if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.warn('VAPID keys are not set. Push notifications will not work.');
} else {
  webpush.setVapidDetails(
    'mailto:support@mindgame.app',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function sendNotification(subscription: PushSubscriptionPayload, title: string, body: string, url?: string) {
  try {
    const payload = JSON.stringify({
      title,
      body,
      url: url || '/',
    });

    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth
        }
      },
      payload
    );
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error };
  }
}

export default webpush;
