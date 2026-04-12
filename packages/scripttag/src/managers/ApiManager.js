// v2
import makeRequest from '../helpers/api/makeRequest';

export default class ApiManager {
  getNotifications = async () => {
    return this.getApiData();
  };

  getApiData = async () => {
    const shopifyDomain = window.AVADA_SHOP_DOMAIN || (window.Shopify && window.Shopify.shop);
    const response = await makeRequest(
      `${process.env.API_URL}/clientApi/widget?shop=${shopifyDomain}`
    );

    const { notifications, settings } = response.data || {};

    return { notifications, settings };
  };
}




