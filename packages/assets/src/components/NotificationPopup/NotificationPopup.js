import React from 'react';
import PropTypes from 'prop-types';
import {timeAgo} from '../../helpers/utils/formatFullTime';
import {truncateString} from '../../helpers/utils/notificationUtils';
import './NotificationPopup.scss';

/**
 * Preview component for a sale notification popup (used in the Admin Settings page).
 *
 * @param {string} firstName - Buyer's first name
 * @param {string} city - Buyer's city
 * @param {string} country - Buyer's country
 * @param {string} productName - Product title
 * @param {string} timestamp - ISO timestamp of the order
 * @param {string} productImage - Product image URL
 * @param {Object} settings - Display settings
 * @param {boolean} settings.hideTimeAgo - Whether to hide the time-ago text
 * @param {boolean} settings.truncateProductName - Whether to truncate the product name
 * @returns {React.ReactElement}
 */
const NotificationPopup = ({
  firstName = 'John Doe',
  city = 'New York',
  country = 'United States',
  productName = 'Puffer Jacket With Hidden Hood',
  timestamp = `${new Date()}`,
  productImage = 'http://paris.mageplaza.com/images/shop/single/big-1.jpg',
  settings = {hideTimeAgo: false, truncateProductName: false}
}) => {
  const {hideTimeAgo, truncateProductName} = settings;
  const displayProductName = truncateProductName ? truncateString(productName) : productName;

  return (
    <div className="Avava-SP__Wrapper fadeInUp animated">
      <div className="Avava-SP__Inner">
        <div className="Avava-SP__Container">
          <a href="#" className="Avava-SP__LinkWrapper">
            <div
              className="Avava-SP__Image"
              style={{backgroundImage: `url(${productImage})`}}
            />
            <div className="Avada-SP__Content">
              <div className="Avada-SP__Title">
                {firstName} in {city}, {country}
              </div>
              <div className="Avada-SP__Subtitle">
                purchased {displayProductName}
              </div>
              <div className="Avada-SP__Footer">
                {hideTimeAgo ? '' : timeAgo(timestamp)}{' '}
                <span className="uni-blue">
                  <i className="fa fa-check" aria-hidden="true" /> by Avada
                </span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

NotificationPopup.propTypes = {
  firstName: PropTypes.string,
  city: PropTypes.string,
  country: PropTypes.string,
  productName: PropTypes.string,
  timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  productImage: PropTypes.string,
  settings: PropTypes.shape({
    hideTimeAgo: PropTypes.bool,
    truncateProductName: PropTypes.bool
  })
};

export default NotificationPopup;
