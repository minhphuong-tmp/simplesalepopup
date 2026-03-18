import { initShopify } from '@functions/services/shopifyService';

/**
 * Register scriptTag dynamically via Shopify API
 * This ensures the script tag always points to the current Cloudflare tunnel URL
 * 
 * @param {string} shopDomain 
 * @param {string} accessToken 
 * @param {Object} shopData
 */
export async function registerScriptTag(shopDomain, accessToken, shopData) {
    try {
        console.log(`[ScriptTag Registration] Starting for ${shopDomain}...`);

        let shopify;
        if (shopData) {
            shopify = initShopify(shopData);
        } else {
            const Shopify = require('shopify-api-node');
            shopify = new Shopify({
                shopName: shopDomain,
                accessToken: accessToken,
                autoLimit: true
            });
        }

        const scriptSrc = `${process.env.APP_BASE_URL}/scripttag/avada-storefront.min.js`;
        console.log(`[ScriptTag Registration] Target URL: ${scriptSrc}`);

        // 1. Check existing scriptTags to avoid duplicates and delete old tunnel URLs
        const existingScriptTags = await shopify.scriptTag.list();

        const hasMatchingScriptTag = existingScriptTags.some(st => st.src === scriptSrc);

        if (hasMatchingScriptTag) {
            console.log(`[ScriptTag Registration] avada-storefront.min.js scriptTag already exists for ${scriptSrc}`);
        } else {
            // Delete old scriptTags from previous ngrok/cloudflare sessions
            for (const st of existingScriptTags) {
                if (st.src.includes('avada-storefront.min.js')) {
                    console.log(`[ScriptTag Registration] Deleting old scriptTag pointing to: ${st.src}`);
                    await shopify.scriptTag.delete(st.id);
                }
            }

            // 2. Create the new scriptTag
            const newScriptTag = await shopify.scriptTag.create({
                event: 'onload',
                src: scriptSrc
            });
            console.log(`[ScriptTag Registration] Successfully created new scriptTag. ID: ${newScriptTag.id}`);
        }

    } catch (error) {
        console.error(`[ScriptTag Registration] Failed for ${shopDomain}:`, error.message);
        if (error.response?.body) {
            console.error('[ScriptTag Registration] Shopify Error Detail:', JSON.stringify(error.response.body));
        }
    }
}
