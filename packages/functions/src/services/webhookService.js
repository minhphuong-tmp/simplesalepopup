import Shopify from 'shopify-api-node';
import { initShopify } from '@functions/services/shopifyService';
import appConfig from '@functions/config/app';

/**
 * @type {{ topic: string, path: string }[]}
 */
const WEBHOOK_LIST = [
    { topic: 'orders/create', path: '/webhook/order/create' }
];

/**
 * @param {Object} shopify - Shopify API client
 * @param {string} topic - Webhook topic (e.g. 'orders/create')
 * @param {string} webhookUrl - Full URL of the webhook endpoint
 */
async function registerOneWebhook(shopify, topic, webhookUrl) {
    const existing = await shopify.webhook.list({ topic });

    const outdated = existing.filter(webhook => webhook.address !== webhookUrl);
    await Promise.all(outdated.map(webhook => shopify.webhook.delete(webhook.id)));

    const isRegistered = existing.some(webhook => webhook.address === webhookUrl);
    if (isRegistered) return;

    await shopify.webhook.create({ topic, address: webhookUrl, format: 'json' });
}

/**
 * @param {Object} shopData
 */
export async function registerWebhooks(shopData) {
    try {
        const shopify = initShopify(shopData);

        await Promise.all(
            WEBHOOK_LIST.map(({ topic, path }) =>
                registerOneWebhook(shopify, topic, `${appConfig.baseUrl}${path}`)
            )
        );
    } catch (error) {
        console.error(error);
    }
}
