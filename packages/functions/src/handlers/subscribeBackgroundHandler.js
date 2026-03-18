import { handleAfterInstall } from '@functions/services/afterInstallService';

/**
 * Background handler for PubSub messages
 * Used in production where Pub/Sub triggers Cloud Functions
 *
 * @param event - CloudEvent with PubSub message
 * @returns {Promise<void>}
 */
export default async function subscribeBackgroundHandling(event) {
  try {
    const data = event.data.message.json;
    const { type, shopId } = data;

    switch (type) {
      case 'afterInstall':
        console.log('Processing afterInstall via Pub/Sub for shop:', shopId);
        await handleAfterInstall(shopId);
        break;
      default:
        console.log('Unknown background task type:', type);
    }
  } catch (e) {
    console.error('Background handling error:', e);
  }
}
