import React, { useState } from 'react';
import { BlockStack, Button, Card, InlineStack, Layout, Page, Text } from '@shopify/polaris';

/**
 * Home page - App status overview
 *
 * @return {React.ReactElement}
 */
export default function Home() {
  const [enabled, setEnabled] = useState(false);

  return (
    <Page title="Home">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Card>
              <InlineStack align="space-between" blockAlign="center">
                <Text as="span" variant="bodyMd">
                  App status is{' '}
                  <Text as="span" variant="bodyMd" fontWeight="bold">
                    {enabled ? 'enabled' : 'disabled'}
                  </Text>
                </Text>
                <Button
                  variant={enabled ? 'secondary' : 'primary'}
                  tone={enabled ? 'critical' : undefined}
                  onClick={() => setEnabled(prev => !prev)}
                >
                  {enabled ? 'Disable' : 'Enable'}
                </Button>
              </InlineStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
