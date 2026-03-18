import React from 'react';
import {
  BlockStack,
  Box,
  Card,
  InlineStack,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
  SkeletonThumbnail
} from '@shopify/polaris';

const SKELETON_ITEM_COUNT = 5;

/**
 * Skeleton loading state for the Notifications page
 * Mirrors the ResourceList layout to prevent layout shift
 *
 * @return {React.ReactElement}
 */
export default function NotificationsSkeleton() {
  return (
    <SkeletonPage title="Notifications" primaryAction>
      <BlockStack gap="400">
        {/* ResourceList card */}
        <Card padding="0">
          <BlockStack>
            {Array.from({ length: SKELETON_ITEM_COUNT }, (_, i) => (
              <Box
                key={i}
                padding="400"
                borderBlockEndWidth={i < SKELETON_ITEM_COUNT - 1 ? '025' : undefined}
                borderColor="border"
              >
                <InlineStack align="space-between" blockAlign="center" wrap={false}>
                  <Box width="293px" minWidth="293px" minHeight="75px">
                    <InlineStack gap="300" blockAlign="center" wrap={false}>
                      <SkeletonThumbnail size="medium" />
                      <Box width="100%">
                        <BlockStack gap="200">
                          <SkeletonDisplayText size="small" />
                          <SkeletonBodyText lines={2} />
                        </BlockStack>
                      </Box>
                    </InlineStack>
                  </Box>
                  <Box minWidth="80px">
                    <SkeletonBodyText lines={1} />
                  </Box>
                </InlineStack>
              </Box>
            ))}
          </BlockStack>
        </Card>

        {/* Pagination skeleton */}
        <InlineStack align="center">
          <SkeletonDisplayText size="small" />
        </InlineStack>
      </BlockStack>
    </SkeletonPage>
  );
}
