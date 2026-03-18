import { Firestore } from '@google-cloud/firestore';
import { prepareDoc } from './helper';

const firestore = new Firestore();
const COLLECTION_NAME = 'settings';
/** @type {CollectionReference} */
const collection = firestore.collection(COLLECTION_NAME);

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

/**
 * @param {string} shopId
 * @returns {Promise<Object|null>}
 */
export async function getSettingsByShopId(shopId) {
    const doc = await collection.doc(shopId).get();
    if (!doc.exists) return null;
    return prepareDoc({ doc });
}

/**
 * @param {string} shopId
 * @param {Object} data
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export async function upsertSettings(shopId, data) {
    if (!data) return { success: false, data: null };

    const now = new Date();
    const docData = {
        ...DEFAULT_SETTINGS,
        ...data,
        shopId,
        updatedAt: now
    };

    const docRef = collection.doc(shopId);
    const existing = await docRef.get();

    if (!existing.exists) {
        docData.createdAt = now;
        await docRef.set(docData);
    } else {
        await docRef.update(docData);
    }

    return { success: true, data: { id: shopId, ...docData } };
}
