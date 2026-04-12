import { initShopify } from '@functions/services/shopifyService';
import { upsertNotification } from '@functions/repositories/notificationsRepository';
import { loadGraphQL } from '@functions/helpers/graphql/graphqlHelpers';
import { getShopByShopifyDomain } from '@functions/repositories/shopRepository';

const ORDER_LIST_QUERY = loadGraphQL('/orders.graphql');
const GET_PRODUCT_IMAGE_QUERY = loadGraphQL('/product.graphql');

/**
 * @param {Object} order - Shopify order GraphQL node
 * @returns {{orderId: number, firstName: string, city: string, country: string, productName: string, productHandle: string, productId: number, productImage: string, timestamp: Date}|null}
 */
const mapOrderToNotification = order => {
  const orderId = parseInt(order.legacyResourceId || '0', 10);
  if (!orderId) return null;

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
 * @returns {Promise<void>}
 */
export async function syncOrdersToNotifications(shopId, shopData) {
  const shopify = initShopify(shopData);
  const response = await shopify.graphql(ORDER_LIST_QUERY, {});
  const orders = response?.orders?.edges?.map(edge => edge.node) || [];

  if (!orders.length) return;

  const notifications = orders.map(mapOrderToNotification).filter(Boolean);
  await Promise.allSettled(notifications.map(notif => upsertNotification(shopId, notif)));
}

async function getProductInfo(shopify, productId) {
  try {
    const response = await shopify.graphql(GET_PRODUCT_IMAGE_QUERY, {
      id: `gid://shopify/Product/${productId}`
    });
    return {
      productImage: response?.product?.images?.edges?.[0]?.node?.url || '',
      productHandle: response?.product?.handle || ''
    };
  } catch (error) {
    console.error(error.message);
    return { productImage: '', productHandle: '' };
  }
}

function buildNotification(orderData, lineItem, address, productInfo) {
  return {
    orderId: orderData.id,
    firstName: orderData.customer?.first_name || address.first_name || 'Someone',
    city: address.city || '',
    country: address.country || '',
    productName: lineItem.title || '',
    productHandle: productInfo.productHandle,
    productId: lineItem.product_id || 0,
    productImage: productInfo.productImage,
    timestamp: new Date(orderData.created_at)
  };
}

/**
 * Handle background task to process new order
 */
export async function syncNewOrderToNotification({ shopifyDomain, orderData }) {
  const shop = await getShopByShopifyDomain(shopifyDomain);
  if (!shop || !orderData?.id) return;

  const lineItem = orderData.line_items?.[0];
  const address = orderData.billing_address || orderData.shipping_address || {};

  if (!lineItem) return;

  let productInfo = { productImage: '', productHandle: '' };
  if (lineItem.product_id) {
    productInfo = await getProductInfo(initShopify(shop), lineItem.product_id);
  }

  const notification = buildNotification(orderData, lineItem, address, productInfo);
  await upsertNotification(shop.id, notification);
}
