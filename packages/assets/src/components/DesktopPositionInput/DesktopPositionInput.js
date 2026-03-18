import React from 'react';
import PropTypes from 'prop-types';
import './DesktopPositionInput.scss';
import { BlockStack, InlineStack, Text } from '@shopify/polaris';

const defaultOptions = [
    { label: 'Bottom left', value: 'bottom-left' },
    { label: 'Bottom right', value: 'bottom-right' },
    { label: 'Top left', value: 'top-left' },
    { label: 'Top right', value: 'top-right' }
];

/**
 * Visual desktop position selector widget (Bottom-left, Bottom-right, etc.)
 *
 * @param {string} label - Field label
 * @param {string} value - Currently selected position value
 * @param {Function} onChange - Callback when position is selected
 * @param {string} helpText - Help text displayed below the selector
 * @param {Array} options - List of {label, value} options
 * @return {React.ReactElement}
 */
const DesktopPositionInput = ({ label, value, onChange, helpText, options = defaultOptions }) => {
    return (
        <BlockStack gap="200">
            <Text as="p" variant="bodyMd">{label}</Text>
            <InlineStack gap="200" wrap={false}>
                {options.map((option, key) => (
                    <div
                        key={key}
                        className={`Avada-DesktopPosition ${value === option.value ? 'Avada-DesktopPosition--selected' : ''}`}
                        onClick={() => onChange(option.value)}
                    >
                        <div className={`Avada-DesktopPosition__Input Avada-DesktopPosition__Input--${option.value}`}></div>
                    </div>
                ))}
            </InlineStack>
            <Text tone="subdued" as="p" variant="bodySm">{helpText}</Text>
        </BlockStack>
    );
};

DesktopPositionInput.propTypes = {
    label: PropTypes.string,
    options: PropTypes.array,
    value: PropTypes.string,
    onChange: PropTypes.func,
    helpText: PropTypes.string
};

export default DesktopPositionInput;
