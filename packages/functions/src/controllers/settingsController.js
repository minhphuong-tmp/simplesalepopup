import { getCurrentShop } from '@functions/helpers/auth';
import { getSettingsByShopId, upsertSettings } from '@functions/repositories/settingsRepository';

/**
 * @param {Object} ctx
 * @returns {Promise<{success: boolean, data: Object, error: string|null}>}
 */
export const getSettings = async ctx => {
  try {
    const shopId = getCurrentShop(ctx);
    const data = await getSettingsByShopId(shopId);
    ctx.status = 200;
    ctx.body = { success: true, data: data || {}, error: null };
  } catch (e) {
    console.error(e);
    ctx.body = { success: false, data: null, error: e.message };
  }
};

/**
 * @param {Object} ctx
 * @returns {Promise<{success: boolean, data: null, error: string|null}>}
 */
export const updateSettings = async ctx => {
  try {
    const shopId = getCurrentShop(ctx);
    const data = ctx.req.body;
    const result = await upsertSettings(shopId, data);
    ctx.status = 200;
    ctx.body = { success: result.success, data: null, error: null };
  } catch (e) {
    console.error(e);
    ctx.body = { success: false, data: null, error: e.message };
  }
};
