import React from 'react';
import PropTypes from 'prop-types';
import {truncateString} from '../../helpers/notificationUtils';
import './NotificationPopup.scss';


const POSITION_BASE = {position: 'fixed', zIndex: 99};
const POSITION_STYLES = {
  'bottom-left':  {bottom: '15px', left: '15px'},
  'bottom-right': {bottom: '15px', right: '15px'},
  'top-left':     {top: '15px',    left: '15px'},
  'top-right':    {top: '15px',    right: '15px'}
};

/**
 * Storefront popup component displayed on the customer-facing store.
 *
 * @param {string} firstName - Buyer's first name
 * @param {string} city - Buyer's city
 * @param {string} country - Buyer's country
 * @param {string} productName - Product title
 * @param {string} relativeDate - Human-readable relative time (e.g. "2 minutes ago")
 * @param {string} productImage - Product image URL
 * @param {string} productHandle - Shopify product handle for link
 * @param {Object} settings - Display settings from shop configuration
 * @returns {React.ReactElement}
 */
const NotificationPopup = ({
  firstName = 'John Doe',
  city = 'New York',
  country = 'United States',
  productName = 'Puffer Jacket With Hidden Hood',
  relativeDate = 'a few seconds ago',
  productImage = 'http://paris.mageplaza.com/images/shop/single/big-1.jpg',
  productHandle = '',
  settings = {}
}) => {
  const {
    position = 'bottom-left',
    hideTimeAgo = false,
    truncateProductName = false
  } = settings;

  const positionStyles = {...POSITION_BASE, ...(POSITION_STYLES[position] || POSITION_STYLES['bottom-left'])};
  const displayProductName = truncateProductName ? truncateString(productName) : productName;
  const productLink = productHandle ? `/products/${productHandle}` : '#';

  const handleClick = e => {
    if (productHandle) {
      e.preventDefault();
      window.top.location.href = productLink;
    }
  };

  return (
    <div className="Avava-SP__Wrapper fadeInUp animated" style={positionStyles}>
      <div className="Avava-SP__Inner">
        <div className="Avava-SP__Container">
          <a href={productLink} className="Avava-SP__LinkWrapper" onClick={handleClick}>
            <div
              className="Avava-SP__Image"
              style={{backgroundImage: `url(${productImage || 'https://paris.mageplaza.com/images/shop/single/big-1.jpg'})`}}
            />
            <div className="Avada-SP__Content">
              <div className="Avada-SP__Title">
                {firstName} in {city}, {country}
              </div>
              <div className="Avada-SP__Subtitle">
                purchased {displayProductName}
              </div>
              <div className="Avada-SP__Footer">
                {!hideTimeAgo && `${relativeDate} `}
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
  relativeDate: PropTypes.string,
  productImage: PropTypes.string,
  productHandle: PropTypes.string,
  settings: PropTypes.shape({
    position: PropTypes.string,
    hideTimeAgo: PropTypes.bool,
    truncateProductName: PropTypes.bool
  })
};

export default NotificationPopup;
