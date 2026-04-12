import App from 'koa';
import 'isomorphic-fetch';
import { contentSecurityPolicy, shopifyAuth } from '@avada/core';
import shopifyConfig from '@functions/config/shopify';
import render from 'koa-ejs';
import path from 'path';
import createErrorHandler from '@functions/middleware/errorHandler';
import firebase from 'firebase-admin';
import appConfig from '@functions/config/app';
import shopifyOptionalScopes from '@functions/config/shopifyOptionalScopes';
import { registerWebhooks } from '@functions/services/webhookService';
import { initShopify } from '@functions/services/shopifyService';

if (firebase.apps.length === 0) {
  firebase.initializeApp();
}

// Initialize all demand configuration for an application
const app = new App();
app.proxy = true;

render(app, {
  cache: true,
  debug: false,
  layout: false,
  root: path.resolve(__dirname, '../../views'),
  viewExt: 'html'
});
app.use(createErrorHandler());
app.use(contentSecurityPolicy(true));

// Register all routes for the application
app.use(
  shopifyAuth({
    apiKey: shopifyConfig.apiKey,
    accessTokenKey: shopifyConfig.accessTokenKey,
    firebaseApiKey: shopifyConfig.firebaseApiKey,
    scopes: shopifyConfig.scopes,
    secret: shopifyConfig.secret,
    successRedirect: '/embed',
    initialPlan: {
      id: 'free',
      name: 'Free',
      price: 0,
      trialDays: 0,
      features: {}
    },
    hostName: appConfig.baseUrl,
    isEmbeddedApp: true,
    afterThemePublish: context => {
      return (context.body = {
        success: true
      });
    },
    afterAuth: async context => {
      const { shop, accessToken } = context.state.shopify || {};
      if (shop && accessToken) {
        const shopData = { shopifyDomain: shop, accessToken };

        // delete old script tag
        try {
          const shopify = initShopify(shopData);
          const existing = await shopify.scriptTag.list();
          await Promise.all(existing.map(scriptTag => shopify.scriptTag.delete(scriptTag.id)));
        } catch (e) {
          console.error(e.message);
        }

        await Promise.all([
          registerWebhooks(shopData)
        ]);
      }
    },
    optionalScopes: shopifyOptionalScopes
  }).routes()
);

app.on('error', error => {
  console.error(error);
});

export default app;
