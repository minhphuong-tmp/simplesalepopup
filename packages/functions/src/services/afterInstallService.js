import { initShopify } from '@functions/services/shopifyService';
import { loadGraphQL } from '@functions/helpers/graphql/graphqlHelpers';
import { getShopById } from '@functions/repositories/shopRepository';
import { upsertNotification } from '@functions/repositories/notificationsRepository';
import { getSettingsByShopId, upsertSettings } from '@functions/repositories/settingsRepository';
import { registerWebhooks } from '@functions/services/webhookService';

const DEFAULT_SETTINGS = {
    position: 'bottom-left',
    hideTimeAgo: false,
    truncateProductName: false,
    displayDuration: 5,
    firstDelay: 10,
    popsInterval: 2,
    maxPopsDisplay: 20,
    allowShow: 'all',
    includedUrls: '',
    excludedUrls: ''
};

function mapOrderToNotification(order) {
    const lineItem = order.lineItems?.edges?.[0]?.node;
    const address = order.customer?.defaultAddress;
    return {
        orderId: parseInt(order.legacyResourceId || '0', 10),
        firstName: order.customer?.firstName || 'Someone',
        city: address?.city || '',
        country: address?.country || '',
        productName: lineItem?.title || '',
        productHandle: lineItem?.product?.handle || '',
        productId: parseInt(lineItem?.product?.legacyResourceId || '0', 10),
        productImage: lineItem?.product?.images?.edges?.[0]?.node?.url || '',
        timestamp: new Date(order.createdAt)
    };
}

async function syncOrdersToNotifications(shopId, shopify) {
    const query = loadGraphQL('/orders.graphql');

    const response = await shopify.graphql(query, {});
    const orders = response?.orders?.edges?.map(edge => edge.node) || [];

    if (orders.length === 0) {
        return 0;
    }

    const results = await Promise.all(
        orders.map(async order => {
            const notification = mapOrderToNotification(order);
            const result = await upsertNotification(shopId, notification);
            return result.success;
        })
    );
    const created = results.filter(Boolean).length;
    return created;
}

async function createDefaultSettings(shopId) {
    const existing = await getSettingsByShopId(shopId);
    if (existing) {
        return;
    }
    await upsertSettings(shopId, DEFAULT_SETTINGS);
}

/**
 * Handle all after-install logic: sync orders + create default settings
 *
 * @param {string} shopId
 * @returns {Promise<void>}
 */
export async function handleAfterInstall(shopId) {

    const shopData = await getShopById(shopId);

    const shopParsedData = require('@avada/core').prepareShopData
        ? (() => { try { return require('@avada/core').prepareShopData(shopData.id, shopData, require('@functions/config/shopify').default.accessTokenKey); } catch (error) { return {}; } })()
        : {};

    const shopify = initShopify(shopData);

    try {
        const [syncedCount] = await Promise.all([
            syncOrdersToNotifications(shopId, shopify),
            createDefaultSettings(shopId),
            registerWebhooks(shopData)
        ]);
    } catch (error) {
        throw error;
    }
}
