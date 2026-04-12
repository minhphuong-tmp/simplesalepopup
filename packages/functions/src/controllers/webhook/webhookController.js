import { enqueueTask } from '@functions/services/cloudTaskService';

/**
 * Handle app/uninstalled webhook
 * @param ctx
 */
export async function appUninstalled(ctx) {
  try {
    const shopifyDomain = ctx.get('X-Shopify-Shop-Domain');
    ctx.body = { success: true };
  } catch (e) {
    console.error(e);
    ctx.body = { success: false, error: e.message };
  }
}

/**
 * Handle orders/create webhook - Nhanh chóng đưa vào Background Task
 * @param {Object} ctx
 */
export async function listenNewOrder(ctx) {
  try {
    const shopifyDomain = ctx.get('X-Shopify-Shop-Domain');
    const orderData = ctx.req.body;

    if (!orderData?.id) {
      ctx.body = { success: false, error: 'Invalid payload' };
      return;
    }
    // use pubsub instead of cloud task
    await enqueueTask({
      data: { type: 'orders/create', shopifyDomain, orderData }
    });

    ctx.body = { success: true };
  } catch (e) {
    console.error(e);
    ctx.body = { success: false, error: e.message };
  }
}
