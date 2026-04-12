import React from 'react';
import PropTypes from 'prop-types';
import { BlockStack, Select, Text, TextField } from '@shopify/polaris';

const allowShowOptions = [
    { label: 'All pages', value: 'all' },
    { label: 'Specific pages', value: 'specific' }
];

/**
 * @param {Object} settings - current settings values
 * @param {Function} onChange - handler(field, value)
 * @return {React.ReactElement}
 */
export default function TriggersTab({ settings, onChange }) {
    const { allowShow, excludedUrls } = settings;

    return (
        <BlockStack gap="500">
            <Select
                label="Show popup on"
                options={allowShowOptions}
                value={allowShow}
                onChange={val => onChange('allowShow', val)}
            />
            <TextField
                label="Excluded pages"
                value={excludedUrls}
                onChange={val => onChange('excludedUrls', val)}
                multiline={4}
                helpText="Add URLs of pages where the popup should NOT appear, one URL per line."
            />
        </BlockStack>
    );
}

TriggersTab.propTypes = {
    settings: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
};
