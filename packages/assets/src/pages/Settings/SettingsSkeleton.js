import React from 'react';
import {
  BlockStack,
  Box,
  Card,
  InlineGrid,
  InlineStack,
  Layout,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
  SkeletonTabs,
  SkeletonThumbnail
} from '@shopify/polaris';

const SETTINGS_TABS_COUNT = 2;
const POSITION_OPTIONS_COUNT = 4;

/**
 * Skeleton loading state for the Settings page
 * Mirrors the actual Settings layout (InlineStack + Card + Tabs) to prevent layout shift
 *
 * @return {React.ReactElement}
 */
export default function SettingsSkeleton() {
  return (
    <SkeletonPage title="Settings" primaryAction>
      <Layout>
        <Layout.Section>
          <InlineStack gap="600" align="start" blockAlign="start" wrap={false}>
            {/* Left: NotificationPopup preview skeleton */}
            <Box paddingBlockStart="200" width="293px" minWidth="293px">
              <Card>
                <InlineStack gap="300" blockAlign="center">
                  <SkeletonThumbnail size="medium" />
                  <BlockStack gap="200">
                    <SkeletonDisplayText size="small" />
                    <SkeletonBodyText lines={2} />
                  </BlockStack>
                </InlineStack>
              </Card>
            </Box>

            {/* Right: Card with Tabs (Display tab by default) */}
            <Box width="100%">
              <Card padding="0">
                <SkeletonTabs count={SETTINGS_TABS_COUNT} />
                <Box padding="400">
                  <BlockStack gap="500">
                    {/* APPEARANCE section */}
                    <BlockStack gap="400">
                      <SkeletonDisplayText size="small" />
                      {/* DesktopPositionInput: 4 position boxes inline */}
                      <InlineStack gap="200">
                        {Array.from({length: POSITION_OPTIONS_COUNT}, (_, i) => (
                          <SkeletonThumbnail key={i} size="small" />
                        ))}
                      </InlineStack>
                      {/* 2 Checkboxes */}
                      <SkeletonBodyText lines={1} />
                      <SkeletonBodyText lines={1} />
                    </BlockStack>

                    {/* TIMING section */}
                    <BlockStack gap="400">
                      <SkeletonDisplayText size="small" />
                      {/* 4 RangeSliders in 2-column grid */}
                      <InlineGrid columns={2} gap="600">
                        <SkeletonBodyText lines={2} />
                        <SkeletonBodyText lines={2} />
                        <SkeletonBodyText lines={2} />
                        <SkeletonBodyText lines={2} />
                      </InlineGrid>
                    </BlockStack>
                  </BlockStack>
                </Box>
              </Card>
            </Box>
          </InlineStack>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );
}
