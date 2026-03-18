import { getShopByShopifyDomain } from '@functions/repositories/shopRepository';
import { getSettingsByShopId } from '@functions/repositories/settingsRepository';
import { getNotificationsList } from '@functions/repositories/notificationsRepository';

/**
 * Health check endpoint for client API
 * @param ctx
 * @returns {Promise<{success: boolean, timestamp: string}>}
 */
export async function health(ctx) {
  return (ctx.body = {
    success: true,
    timestamp: new Date().toISOString()
  });
}

/**
 * Get widget data for the storefront
 */
export async function getWidgetData(ctx) {
  try {
    const shopifyDomain = ctx.query.shop;
    if (!shopifyDomain) {
      return (ctx.body = { success: false, error: 'Missing shop domain' });
    }

    const shop = await getShopByShopifyDomain(shopifyDomain);
    if (!shop) {
      return (ctx.body = { success: false, error: 'Shop not found' });
    }

    const [settings, notificationsResult] = await Promise.all([
      getSettingsByShopId(shop.id),
      getNotificationsList({ shopId: shop.id, query: { limit: 30 } })
    ]);

    return (ctx.body = {
      success: true,
      data: {
        settings,
        notifications: notificationsResult.data || []
      }
    });
  } catch (e) {
    console.error('getWidgetData error:', e);
    return (ctx.body = {
      success: false,
      error: e.message
    });
  }
}
