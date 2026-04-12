// Quick script to decrypt Shopify access token from Firestore hash
const CryptoJS = require('../node_modules/crypto-js/index.js');
const key = 'avada-apps-access-token';

const hashes = [
  'U2FsdGVkX1+QaB3bnh80I7BbabQ3EPln58EEbYhXRA1AYYj/0VG43bL6TXx9ZxruxA4JPEb1WykFEc9Nankq+g==',
  'U2FsdGVkX1/Zi2L3u3EmXU+Ss9qDviOnGjqUd9qFaV8//+7hEhFEPMzAYkJDzaYSGmCiLzgONeXMg6ehUT7+YQ=='
];

hashes.forEach((h, i) => {
  const token = CryptoJS.AES.decrypt(h, key).toString(CryptoJS.enc.Utf8);
  console.log(`Token ${i + 1}:`, token || '(empty - wrong key?)');
});
