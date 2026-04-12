import { Firestore } from '@google-cloud/firestore';
import { prepareDoc, paginateQuery, getOrderBy } from './helper';

const firestore = new Firestore();
const COLLECTION_NAME = 'notifications';
const collection = firestore.collection(COLLECTION_NAME);

/**
 * @param {Object} params
 * @param {string} params.shopId
 * @param {Object} params.query - {order, after, before, limit}
 * @returns {Promise<{data: Array, count: number, pageInfo: Object}>}
 */
export async function getNotificationsList({ shopId, query = {} }) {
  const { order } = query;
  const { sortField, direction } = getOrderBy(order || 'timestamp_desc');

  const queriedRef = collection
    .where('shopId', '==', shopId)
    .orderBy(sortField, direction);

  return paginateQuery({ queriedRef, collection, query });
}

/**
 * @param {string} shopId
 * @param {Object} data
 * @param {number} data.orderId - Required for deterministic doc ID
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export async function upsertNotification(shopId, data) {
  if (!data?.orderId) return { success: false, data: null };

  const now = new Date();
  const docId = `${shopId}_${data.orderId}`;
  const docRef = collection.doc(docId);
  const docData = {
    ...data,
    shopId,
    updatedAt: now
  };
  // if not exist, create new doc
  const existing = await docRef.get();
  if (!existing.exists) {
    await docRef.set({ ...docData, createdAt: now });
  } else {
    await docRef.update(docData);
  }

  return { success: true, data: { id: docId, ...docData } };
}
