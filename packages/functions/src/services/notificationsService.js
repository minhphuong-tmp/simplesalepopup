import { initShopify } from '@functions/services/shopifyService';
import { upsertNotification } from '@functions/repositories/notificationsRepository';

const ORDER_LIST_QUERY = `{
  orders(first: 30, sortKey: CREATED_AT, reverse: true) {
    edges {
      node {
        id
        legacyResourceId
        createdAt
        customer {
          firstName
          defaultAddress {
            city
            country
          }
        }
        lineItems(first: 1) {
          edges {
            node {
              title
              product {
                legacyResourceId
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
          }
        }
      }
    }
  }
}`;

/**
 * @param {Object} order - Shopify order GraphQL node
 * @returns {{orderId: number, firstName: string, city: string, country: string, productName: string, productHandle: string, productId: number, productImage: string, timestamp: Date}|null}
 */
const mapOrderToNotification = order => {
  const orderId = parseInt(order.legacyResourceId || '0', 10);
  if (!orderId) {
    console.warn(`Skipping order with missing legacyResourceId: ${order.id}`);
    return null;
  }

  const lineItem = order.lineItems?.edges?.[0]?.node;
  const address = order.customer?.defaultAddress;
  return {
    orderId,
    firstName: order.customer?.firstName || 'Someone',
    city: address?.city || '',
    country: address?.country || '',
    productName: lineItem?.title || '',
    productHandle: lineItem?.product?.handle || '',
    productId: parseInt(lineItem?.product?.legacyResourceId || '0', 10),
    productImage: lineItem?.product?.images?.edges?.[0]?.node?.url || '',
    timestamp: new Date(order.createdAt)
  };
};

/**
 * Fetch orders from Shopify and upsert them as notifications in Firestore.
 * @param {string} shopId
 * @param {Object} shopData - Shop credentials for Shopify API
 * @param {string} shopData.domain - The shopify domain
 * @param {string} shopData.accessToken - The access token
 * @returns {Promise<{success: boolean, data: null, error: string|null}>}
 */
export async function syncOrdersToNotifications(shopId, shopData) {
  const shopify = initShopify(shopData);
  const response = await shopify.graphql(ORDER_LIST_QUERY, {});
  const orders = response?.orders?.edges?.map(edge => edge.node) || [];

  if (!orders.length) return { success: true, data: null };

  const notifications = orders.map(mapOrderToNotification).filter(Boolean);
  await Promise.allSettled(notifications.map(notif => upsertNotification(shopId, notif)));
  return {success: true, data: null};
}
