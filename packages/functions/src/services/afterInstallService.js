import { initShopify } from '@functions/services/shopifyService';
import { loadGraphQL } from '@functions/helpers/graphql/graphqlHelpers';
import { getShopById } from '@functions/repositories/shopRepository';
import { upsertNotification } from '@functions/repositories/notificationsRepository';
import { getSettingsByShopId, upsertSettings } from '@functions/repositories/settingsRepository';
import { registerWebhooks } from '@functions/helpers/webhookHelpers';
import { registerScriptTag } from '@functions/helpers/scriptTagHelpers';

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
    console.log('[afterInstall] Loading GraphQL query...');
    const query = loadGraphQL('/orders.graphql');
    console.log('[afterInstall] Running Shopify GraphQL...');

    const response = await shopify.graphql(query, {});
    console.log('[afterInstall] GraphQL response keys:', Object.keys(response || {}));

    const orders = response?.orders?.edges?.map(edge => edge.node) || [];
    console.log(`[afterInstall] Found ${orders.length} orders`);

    if (orders.length === 0) {
        console.log('[afterInstall] No orders to sync');
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
    console.log(`[afterInstall] Saved ${created} new notifications (${orders.length - created} skipped) for shop: ${shopId}`);
    return created;
}

async function createDefaultSettings(shopId) {
    const existing = await getSettingsByShopId(shopId);
    if (existing) {
        console.log('[afterInstall] Settings already exist, skipping');
        return;
    }
    await upsertSettings(shopId, DEFAULT_SETTINGS);
    console.log('[afterInstall] Default settings created');
}

/**
 * Handle all after-install logic: sync orders + create default settings
 *
 * @param {string} shopId
 * @returns {Promise<void>}
 */
export async function handleAfterInstall(shopId) {
    console.log('[afterInstall] START for shopId:', shopId);

    const shopData = await getShopById(shopId);
    console.log('[afterInstall] Shop data keys:', Object.keys(shopData || {}));
    console.log('[afterInstall] Has accessToken:', !!shopData?.accessToken);

    const shopParsedData = require('@avada/core').prepareShopData
        ? (() => { try { return require('@avada/core').prepareShopData(shopData.id, shopData, require('@functions/config/shopify').default.accessTokenKey); } catch (e) { return {}; } })()
        : {};
    console.log('[afterInstall] shopParsedData has accessToken:', !!shopParsedData?.accessToken);

    const shopify = initShopify(shopData);

    console.log('[afterInstall] Shopify instance shopName:', shopData.shopifyDomain);

    try {
        const [syncedCount] = await Promise.all([
            syncOrdersToNotifications(shopId, shopify),
            createDefaultSettings(shopId),
            registerWebhooks(shopData.shopifyDomain, shopData.accessToken, shopData),
            registerScriptTag(shopData.shopifyDomain, shopData.accessToken, shopData)
        ]);
        console.log(`[afterInstall] DONE. Synced ${syncedCount} notifications`);
    } catch (e) {
        console.error('[afterInstall] FAILED:', e?.message, e?.response?.status, e?.response?.body);
        throw e;
    }
}
