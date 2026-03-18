import {getCurrentShop, getCurrentShopData} from '@functions/helpers/auth';
import {getNotificationsList} from '@functions/repositories/notificationsRepository';
import {syncOrdersToNotifications} from '@functions/services/notificationsService';

/**
 * @param {Object} ctx
 * @returns {Promise<{success: boolean, data: Array, count: number, error: string|null}>}
 */
export const getNotifications = async ctx => {
  try {
    const shopId = getCurrentShop(ctx);
    const result = await getNotificationsList({shopId, query: ctx.query});
    ctx.status = 200;
    ctx.body = {success: true, ...result, error: null};
  } catch (e) {
    console.error(e);
    ctx.status = 500;
    ctx.body = {success: false, data: [], count: 0, error: e.message};
  }
};

/**
 * @param {Object} ctx
 * @returns {Promise<{success: boolean, data: null, error: string|null}>}
 */
export const syncNotifications = async ctx => {
  try {
    const shopId = getCurrentShop(ctx);
    const shopData = getCurrentShopData(ctx);
    const result = await syncOrdersToNotifications(shopId, shopData);
    ctx.status = 201;
    ctx.body = result;
  } catch (e) {
    console.error('syncNotifications error:', e.message);
    ctx.status = 500;
    ctx.body = {success: false, data: null, error: e.message};
  }
};
