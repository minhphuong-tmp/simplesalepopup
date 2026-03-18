import React, { useState } from 'react';
import {BlockStack, Card, EmptyState, InlineStack, Page, Pagination, ResourceList} from '@shopify/polaris';
import NotificationItem from './NotificationItem';
import useFetchApi from '@assets/hooks/api/useFetchApi';
import useCreateApi from '@assets/hooks/api/useCreateApi';
import NotificationsSkeleton from './NotificationsSkeleton';

const sortOptions = [
    { label: 'Newest update', value: 'timestamp_desc' },
    { label: 'Oldest update', value: 'timestamp_asc' }
];

/**
 * Notifications page - list of real sales notifications from Firestore
 *
 * @return {React.ReactElement}
 */
export default function Notifications() {
    const [sortValue, setSortValue] = useState('timestamp_desc');

    const { data: notifications, count, pageInfo, loading, fetchApi } = useFetchApi({
        url: '/notifications',
        defaultData: [],
        initQueries: { order: sortValue, limit: 10 }
    });

    const { handleCreate: syncData, creating: syncing } = useCreateApi({
        url: '/notifications/sync',
        successMsg: 'Sync completed! Notifications updated.',
        errorMsg: 'Sync failed. Please try again.',
        successCallback: () => fetchApi('/notifications', { order: sortValue, limit: 10 })
    });

    const handleSortChange = newSort => {
        setSortValue(newSort);
        fetchApi('/notifications', { order: newSort, limit: 10 });
    };

    const handlePrevPage = () =>
        fetchApi('/notifications', { order: sortValue, limit: 10, before: notifications[0]?.id });

    const handleNextPage = () =>
        fetchApi('/notifications', { order: sortValue, limit: 10, after: notifications[notifications.length - 1]?.id });

    if (loading) return <NotificationsSkeleton />;

    return (
        <Page
            title="Notifications"
            subtitle="List of sales notification from Shopify"
            primaryAction={{
                content: 'Sync Data',
                onAction: syncData,
                loading: syncing
            }}
        >
            <BlockStack gap="400">
                <Card padding="0">
                    <ResourceList
                        resourceName={{singular: 'notification', plural: 'notifications'}}
                        items={notifications}
                        renderItem={NotificationItem}
                        headerContent={`Showing ${count || notifications.length} notifications`}
                        sortOptions={sortOptions}
                        sortValue={sortValue}
                        onSortChange={handleSortChange}
                        emptyState={
                            <EmptyState
                                heading="No notifications yet"
                                action={{content: 'Sync Data', onAction: syncData}}
                            >
                                <p>Sync your Shopify orders to see sale notifications here.</p>
                            </EmptyState>
                        }
                    />
                </Card>

                {/* Pagination */}
                <InlineStack align="center">
                    <Pagination
                        hasPrevious={pageInfo?.hasPre}
                        onPrevious={handlePrevPage}
                        hasNext={pageInfo?.hasNext}
                        onNext={handleNextPage}
                    />
                </InlineStack>
            </BlockStack>
        </Page>
    );
}
