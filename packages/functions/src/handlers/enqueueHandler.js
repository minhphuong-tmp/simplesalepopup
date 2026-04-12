import { syncNewOrderToNotification } from '@functions/services/notificationsService';


export default async function enqueueHandler(request) {
  try {
    const { type, shopifyDomain, orderData } = request.data;

    switch (type) {
      case 'orders/create':
        await syncNewOrderToNotification({ shopifyDomain, orderData });
        break;
      default:
        console.log('Unknown enqueue task type:', type);
    }
  } catch (e) {
    console.error(e);
  }
}
