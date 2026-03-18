const CryptoJS = require('C:/Users/ADMIN/Desktop/Avada/final-project/my-shopify-app/node_modules/crypto-js');
const hash = process.argv[2] || 'U2FsdGVkX19Y+hoFyBIUQ4whYyyuAy445HLknlRzzQcAiPy9B6E43rROqpDCurHEwO4/qCbGbUp2KJWJAB1vgw==';
const key = process.argv[3] || 'avada-apps-access-token';
const token = CryptoJS.AES.decrypt(hash, key).toString(CryptoJS.enc.Utf8);
console.log('Token:', token || '(empty - wrong key?)');
process.exit(0);
