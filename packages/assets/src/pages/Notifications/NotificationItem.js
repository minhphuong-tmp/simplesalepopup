import React from 'react';
import {InlineStack, ResourceItem, Text} from '@shopify/polaris';
import NotificationPopup from '@assets/components/NotificationPopup/NotificationPopup';
import {formatDateOnly} from '@assets/helpers/utils/formatFullTime';
import {toMs} from '@assets/helpers/utils/notificationUtils';

/**
 * @param {Object} item - Notification resource item
 * @param {string} item.id
 * @param {string} item.firstName
 * @param {string} item.city
 * @param {string} item.country
 * @param {string} item.productName
 * @param {string} item.productImage
 * @param {Object|number} item.timestamp
 * @param {Object|number} item.createdAt
 * @returns {React.ReactElement}
 */
export default function NotificationItem(item) {
  const {id, firstName, city, country, productName, productImage, timestamp, createdAt} = item;
  const displayDate = createdAt ? formatDateOnly(toMs(createdAt)) : '';

  return (
    <ResourceItem id={id}>
      <InlineStack align="space-between" blockAlign="center" wrap={false}>
        <NotificationPopup
          firstName={firstName}
          city={city}
          country={country}
          productName={productName}
          productImage={productImage}
          timestamp={toMs(timestamp)}
        />
        <Text as="span" variant="bodySm" tone="subdued">
          From {displayDate}
        </Text>
      </InlineStack>
    </ResourceItem>
  );
}
