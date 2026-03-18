import { initShopify } from '@functions/services/shopifyService';
import appConfig from '@functions/config/app';

/**
 * Register webhooks dynamically via Shopify API
 * This ensures webhooks always point to the current Cloudflare tunnel URL
 * 
 * @param {string} shopDomain 
 * @param {string} accessToken 
 * @param {Object} shopData
 */
export async function registerWebhooks(shopDomain, accessToken, shopData) {
    try {
        console.log(`[Webhook Registration] Starting for ${shopDomain}...`);

        // We need a shopify instance just for this shop to call the API
        // If shopData is passed, we can use initShopify directly
        let shopify;
        if (shopData) {
            shopify = initShopify(shopData);
        } else {
            // Fallback if only domain and token are provided
            const Shopify = require('shopify-api-node');
            shopify = new Shopify({
                shopName: shopDomain,
                accessToken: accessToken,
                autoLimit: true
            });
        }

        const webhookUrl = `${appConfig.baseUrl}/webhook/order/create`;
        console.log(`[Webhook Registration] Target URL: ${webhookUrl}`);

        // 1. Check existing webhooks to avoid duplicates
        const existingWebhooks = await shopify.webhook.list({
            topic: 'orders/create'
        });

        const hasMatchingWebhook = existingWebhooks.some(w => w.address === webhookUrl);

        if (hasMatchingWebhook) {
            console.log(`[Webhook Registration] orders/create webhook already exists for ${webhookUrl}`);
        } else {
            // Delete old webhooks for the same topic that point to old URLs
            for (const webhook of existingWebhooks) {
                console.log(`[Webhook Registration] Deleting old webhook pointing to: ${webhook.address}`);
                await shopify.webhook.delete(webhook.id);
            }

            // 2. Create the new webhook
            const newWebhook = await shopify.webhook.create({
                topic: 'orders/create',
                address: webhookUrl,
                format: 'json'
            });
            console.log(`[Webhook Registration] Successfully created new webhook. ID: ${newWebhook.id}`);
        }

    } catch (error) {
        console.error(`[Webhook Registration] Failed for ${shopDomain}:`, error.message);
        if (error.response?.body) {
            console.error('[Webhook Registration] Shopify Error Detail:', JSON.stringify(error.response.body));
        }
    }
}
