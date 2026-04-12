#!/usr/bin/env node
/**
 * resync-scripttag.js
 *
 * Re-registers the Shopify ScriptTag with the current Cloudflare tunnel URL.
 * Run this after restarting the dev server when the tunnel URL changes.
 *
 * Usage:
 *   node scripts/resync-scripttag.js
 *   node scripts/resync-scripttag.js --shop=yourstore.myshopify.com  (optional override)
 */

const path = require('path');
const https = require('https');
const fs = require('fs');

// Manually parse .env from functions package (avoid dotenv dependency issues)
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
const SHOPIFY_ACCESS_TOKEN_KEY = process.env.SHOPIFY_ACCESS_TOKEN_KEY || 'avada-apps-access-token';
const FIRESTORE_EMULATOR_HOST = 'localhost:8080';
const FIRESTORE_PROJECT_ID = 'simple-sales-pop-5ed4f';

if (!APP_BASE_URL) {
  console.error('❌ APP_BASE_URL is not set in packages/functions/.env');
  process.exit(1);
}

const scriptSrc = `https://${APP_BASE_URL}/scripttag/avada-storefront.min.js`;
console.log(`\n🔄 Re-syncing ScriptTag to: ${scriptSrc}\n`);

// Parse CLI args
const args = process.argv.slice(2);
const shopArg = args.find(a => a.startsWith('--shop='));
const tokenArg = args.find(a => a.startsWith('--token='));
// Fallback to .env DEV_SHOP / DEV_ACCESS_TOKEN if no CLI args
const shopOverride = shopArg ? shopArg.replace('--shop=', '') : process.env.DEV_SHOP || null;
const tokenOverride = tokenArg ? tokenArg.replace('--token=', '') : process.env.DEV_ACCESS_TOKEN || null;

/**
 * Fetch from Firestore emulator REST API
 */
function firestoreGet(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: `/v1/projects/${FIRESTORE_PROJECT_ID}/databases/(default)/documents/${path}`,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };
    const req = require('http').request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error('Invalid JSON from Firestore emulator'));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

/**
 * Extract value from Firestore field format
 */
function extractField(field) {
  if (!field) return null;
  return field.stringValue ?? field.integerValue ?? field.booleanValue ?? null;
}

/**
 * Get all shops from Firestore emulator
 */
async function getShops() {
  const result = await firestoreGet('shops');
  if (!result.documents) return [];
  return result.documents.map(doc => {
    const fields = doc.fields || {};
    return {
      shopifyDomain: extractField(fields.shopifyDomain),
      accessToken: extractField(fields[SHOPIFY_ACCESS_TOKEN_KEY]) || extractField(fields.accessToken),
      id: doc.name.split('/').pop()
    };
  });
}

/**
 * Call Shopify REST API
 */
function shopifyRequest(shopDomain, accessToken, method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: shopDomain,
      path: `/admin/api/2024-01${endpoint}`,
      method,
      headers: {
        'X-Shopify-Access-Token': accessToken,
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

/**
 * Re-register ScriptTag for a single shop
 */
async function resyncShop(shopDomain, accessToken) {
  console.log(`📦 Processing: ${shopDomain}`);

  if (!accessToken) {
    console.warn(`  ⚠️  No access token found, skipping`);
    return;
  }

  // List existing script tags
  const listRes = await shopifyRequest(shopDomain, accessToken, 'GET', '/script_tags.json');
  if (listRes.status !== 200) {
    console.error(`  ❌ Failed to list script_tags (HTTP ${listRes.status})`);
    return;
  }

  const scriptTags = listRes.body.script_tags || [];
  const avadaTags = scriptTags.filter(st => st.src.includes('avada-storefront.min.js'));
  const alreadyCorrect = avadaTags.some(st => st.src === scriptSrc);

  if (alreadyCorrect) {
    console.log(`  ✅ ScriptTag already up-to-date`);
    return;
  }

  // Delete old avada script tags
  for (const st of avadaTags) {
    console.log(`  🗑️  Deleting old ScriptTag: ${st.src}`);
    await shopifyRequest(shopDomain, accessToken, 'DELETE', `/script_tags/${st.id}.json`);
  }

  // Create new script tag
  const createRes = await shopifyRequest(shopDomain, accessToken, 'POST', '/script_tags.json', {
    script_tag: { event: 'onload', src: scriptSrc }
  });

  if (createRes.status === 201) {
    console.log(`  ✅ ScriptTag created (ID: ${createRes.body.script_tag?.id})`);
  } else {
    console.error(`  ❌ Failed to create ScriptTag (HTTP ${createRes.status}):`, createRes.body);
  }
}

async function main() {
  try {
    let shops = [];

    if (shopOverride && tokenOverride) {
      // Direct mode: bypass Firestore entirely
      console.log(`🔍 Direct mode: ${shopOverride}`);
      shops = [{ shopifyDomain: shopOverride, accessToken: tokenOverride }];
    } else if (shopOverride) {
      const allShops = await getShops();
      const found = allShops.find(s => s.shopifyDomain === shopOverride);
      if (!found) {
        console.error(`❌ Shop "${shopOverride}" not found in Firestore emulator`);
        process.exit(1);
      }
      shops = [found];
    } else {
      shops = await getShops();
      if (shops.length === 0) {
        console.error('❌ No shops found in Firestore emulator. Is the emulator running?');
        console.error('   Tip: node scripts/resync-scripttag.js --shop=yourstore.myshopify.com --token=shpat_xxx');
        process.exit(1);
      }
    }

    console.log(`🏪 Found ${shops.length} shop(s)\n`);
    for (const shop of shops) {
      await resyncShop(shop.shopifyDomain, shop.accessToken);
    }
    console.log('\n✅ Done!\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('   Make sure the Firebase emulator is running (port 8080)');
    console.error('   Or run: node scripts/resync-scripttag.js --shop=yourstore.myshopify.com --token=shpat_xxx');
    process.exit(1);
  }
}

main();

