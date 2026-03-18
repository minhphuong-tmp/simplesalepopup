import { getShopByShopifyDomain } from '@functions/repositories/shopRepository';
import { upsertNotification } from '@functions/repositories/notificationsRepository';
import { initShopify } from '@functions/services/shopifyService';

const GET_PRODUCT_IMAGE_QUERY = `
  query getProductImage($id: ID!) {
    product(id: $id) {
      handle
      images(first: 1) {
        edges {
          node {
            url
          }
        }
      }
    }
  }
`;

/**
 * Handle app/uninstalled webhook
 * @param ctx
 * @returns {Promise<{success: boolean}>}
 */
export async function appUninstalled(ctx) {
  try {
    const shopifyDomain = ctx.get('X-Shopify-Shop-Domain');
    // TODO: Handle app uninstallation logic here
    // Example: Mark shop as uninstalled, cleanup data, etc.
    console.log(`App uninstalled for shop: ${shopifyDomain}`);

    return (ctx.body = {
      success: true
    });
  } catch (e) {
    console.error(e);
    return (ctx.body = {
      success: false,
      error: e.message
    });
  }
}

/**
 * Handle orders/create webhook - Save new order as a notification
 *
 * @param {Object} ctx - Koa context with X-Shopify-Shop-Domain header and order payload in req.body
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function listenNewOrder(ctx) {
  try {
    const shopifyDomain = ctx.get('X-Shopify-Shop-Domain');
    const orderData = ctx.req.body;

    if (!orderData?.id) {
      return (ctx.body = { success: false, error: 'Invalid payload' });
    }

    // 1. Get shop
    const shop = await getShopByShopifyDomain(shopifyDomain);
    if (!shop) {
      console.error(`Shop not found for domain: ${shopifyDomain}`);
      return (ctx.body = { success: false, message: 'Shop not found' });
    }

    const shopId = shop.id;
    const orderId = orderData.id;

    // 2. Map REST payload to notification format
    const lineItem = orderData.line_items?.[0];
    const address = orderData.billing_address || orderData.shipping_address || {};

    if (!lineItem) {
      return (ctx.body = { success: true });
    }

    // Shopify REST webhook payload doesn't include product images.
    // We must query the GraphQL Admin API using the product_id to get the image url.
    let productImage = '';
    let productHandle = '';
    if (lineItem.product_id) {
      try {
        const shopify = initShopify(shop);
        const response = await shopify.graphql(GET_PRODUCT_IMAGE_QUERY, {
          id: `gid://shopify/Product/${lineItem.product_id}`
        });
        productImage = response?.product?.images?.edges?.[0]?.node?.url || '';
        productHandle = response?.product?.handle || '';
      } catch (imgError) {
        console.error('Failed to fetch product image during webhook:', imgError.message);
      }
    }

    const notification = {
      orderId,
      firstName: orderData.customer?.first_name || address.first_name || 'Someone',
      city: address.city || '',
      country: address.country || '',
      productName: lineItem.title || '',
      productHandle,
      productId: lineItem.product_id || 0,
      productImage,
      timestamp: new Date(orderData.created_at)
    };

    // 3. Save — idempotent, safe to call multiple times for same order
    await upsertNotification(shopId, notification);

    return (ctx.body = { success: true });
  } catch (e) {
    console.error('listenNewOrder error:', e);
    return (ctx.body = { success: false, error: e.message });
  }
}
