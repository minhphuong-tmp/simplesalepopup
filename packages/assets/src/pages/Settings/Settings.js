import React, { useEffect, useState } from 'react';
import { Box, Card, InlineStack, Layout, Page, Tabs } from '@shopify/polaris';
import SettingsSkeleton from './SettingsSkeleton';
import NotificationPopup from '@assets/components/NotificationPopup/NotificationPopup';
import DisplayTab from './DisplayTab';
import TriggersTab from './TriggersTab';
import sneakerImg from '@assets/images/product-sneaker.png';
import useFetchApi from '@assets/hooks/api/useFetchApi';
import useEditApi from '@assets/hooks/api/useEditApi';
import useInput from '@assets/hooks/form/useInput';
import { DEFAULT_SETTINGS } from '@functions/const/settings';

const tabs = [
  { id: 'display', content: 'Display' },
  { id: 'triggers', content: 'Triggers' }
];

export default function Settings() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [settings, handleChange, setSettings] = useInput(null);

  const { data, loading: fetching } = useFetchApi({
    url: '/settings',
    defaultData: DEFAULT_SETTINGS
  });

  const { handleEdit: saveSettings, editing: saving } = useEditApi({
    url: '/settings',
    successMsg: 'Settings saved successfully!',
    errorMsg: 'Failed to save settings'
  });


  const handleSave = () => saveSettings(settings);

  useEffect(() => {
    if (!fetching && data) {
      setSettings({ ...DEFAULT_SETTINGS, ...data });
    }
  }, [fetching, data]);

  if (fetching || !settings) return <SettingsSkeleton />;

  return (
    <Page
      title="Settings"
      subtitle="Decide how your notifications will display"
      primaryAction={{ content: 'Save', primary: true, onAction: handleSave, loading: saving }}
    >
      <Layout>
        <Layout.Section>
          <InlineStack gap="600" align="start" blockAlign="start" wrap={false}>
            <Box paddingBlockStart="200">
              <NotificationPopup
                productImage={sneakerImg}
                settings={{
                  hideTimeAgo: settings.hideTimeAgo,
                  truncateProductName: settings.truncateProductName
                }}
              />
            </Box>
            <Box width="100%" minHeight="0">
              <Card padding="0">
                <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab}>
                  <Box padding="400">
                    {selectedTab === 0 && <DisplayTab settings={settings} onChange={handleChange} />}
                    {selectedTab === 1 && <TriggersTab settings={settings} onChange={handleChange} />}
                  </Box>
                </Tabs>
              </Card>
            </Box>
          </InlineStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
