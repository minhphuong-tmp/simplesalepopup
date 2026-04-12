#!/usr/bin/env node
/**
 * resync-webhook.js
 *
 * Re-registers Shopify webhooks with the current Cloudflare tunnel URL.
 * Called automatically by start-dev.ps1 when APP_BASE_URL changes.
 *
 * Usage:
 *   node scripts/resync-webhook.js
 */

const path = require('path');
const https = require('https');
const fs = require('fs');

// Parse .env from functions package
const envPath = path.resolve(__dirname, '../packages/functions/.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  });
}

const APP_BASE_URL = process.env.APP_BASE_URL;
const DEV_SHOP = process.env.DEV_SHOP;
const DEV_ACCESS_TOKEN = process.env.DEV_ACCESS_TOKEN;

if (!APP_BASE_URL) {
  console.error('❌ APP_BASE_URL is not set in packages/functions/.env');
  process.exit(1);
}
if (!DEV_SHOP || !DEV_ACCESS_TOKEN) {
  console.error('❌ DEV_SHOP or DEV_ACCESS_TOKEN is not set in packages/functions/.env');
  process.exit(1);
}

// Webhook definitions — must match webhookService.js WEBHOOK_LIST
const WEBHOOKS = [
  { topic: 'orders/create', path: '/webhook/order/create' }
];

const baseUrl = `https://${APP_BASE_URL}`;
console.log(`\n🔄 Re-syncing Webhooks to base URL: ${baseUrl}\n`);

/**
 * Call Shopify REST API
 */
function shopifyRequest(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: DEV_SHOP,
      path: `/admin/api/2024-01${endpoint}`,
      method,
      headers: {
        'X-Shopify-Access-Token': DEV_ACCESS_TOKEN,
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {})
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function resyncWebhook(topic, webhookPath) {
  const address = `${baseUrl}${webhookPath}`;
  console.log(`📌 Topic: ${topic}`);
  console.log(`   Address: ${address}`);

  // List existing webhooks for this topic
  const listRes = await shopifyRequest('GET', `/webhooks.json?topic=${topic}`);
  if (listRes.status !== 200) {
    console.error(`   ❌ Failed to list webhooks (HTTP ${listRes.status})`);
    return;
  }

  const existing = listRes.body.webhooks || [];
  const alreadyCorrect = existing.some(w => w.address === address);

  if (alreadyCorrect) {
    console.log(`   ✅ Already up-to-date\n`);
    return;
  }

  // Delete outdated webhooks (wrong URL)
  for (const webhook of existing) {
    console.log(`   🗑️  Deleting old: ${webhook.address}`);
    await shopifyRequest('DELETE', `/webhooks/${webhook.id}.json`);
  }

  // Create new webhook
  const createRes = await shopifyRequest('POST', '/webhooks.json', {
    webhook: { topic, address, format: 'json' }
  });

  if (createRes.status === 201) {
    console.log(`   ✅ Registered (ID: ${createRes.body.webhook?.id})\n`);
  } else {
    console.error(`   ❌ Failed (HTTP ${createRes.status}):`, createRes.body);
    console.log('');
  }
}

async function main() {
  try {
    for (const { topic, path: webhookPath } of WEBHOOKS) {
      await resyncWebhook(topic, webhookPath);
    }
    console.log('✅ Webhook re-sync done!\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
