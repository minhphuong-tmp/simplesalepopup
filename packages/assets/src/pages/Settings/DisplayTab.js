import React from 'react';
import PropTypes from 'prop-types';
import { BlockStack, Checkbox, InlineGrid, RangeSlider, Text } from '@shopify/polaris';
import DesktopPositionInput from '@assets/components/DesktopPositionInput/DesktopPositionInput';

const SLIDER_LIMITS = {
    displayDuration: { min: 1, max: 60 },
    firstDelay: { min: 0, max: 60 },
    popsInterval: { min: 1, max: 30 },
    maxPopsDisplay: { min: 1, max: 80 }
};

/**
 * @param {Object} settings - current settings values
 * @param {Function} onChange - handler(field, value)
 * @return {React.ReactElement}
 */
export default function DisplayTab({ settings, onChange }) {
    const {
        position,
        hideTimeAgo,
        truncateProductName,
        displayDuration,
        firstDelay,
        popsInterval,
        maxPopsDisplay
    } = settings;

    return (
        <BlockStack gap="500">
            {/* APPEARANCE */}
            <BlockStack gap="400">
                <Text as="h2" variant="headingSm" tone="subdued">APPEARANCE</Text>
                <DesktopPositionInput
                    label="Desktop Position"
                    value={position}
                    onChange={val => onChange('position', val)}
                    helpText="The display position of the pop on your website."
                />
                <Checkbox
                    label="Hide time ago"
                    checked={hideTimeAgo}
                    onChange={val => onChange('hideTimeAgo', val)}
                />
                <Checkbox
                    label="Truncate content text"
                    checked={truncateProductName}
                    helpText="If your product name is long for one line, it will be truncated to 'Product na...'"
                    onChange={val => onChange('truncateProductName', val)}
                />
            </BlockStack>

            {/* TIMING */}
            <BlockStack gap="400">
                <Text as="h2" variant="headingSm" tone="subdued">TIMING</Text>
                <InlineGrid columns={2} gap="600">
                    <BlockStack gap="200">
                        <RangeSlider
                            label="Display duration"
                            min={SLIDER_LIMITS.displayDuration.min} max={SLIDER_LIMITS.displayDuration.max}
                            value={displayDuration}
                            onChange={val => onChange('displayDuration', val)}
                            suffix={<Text as="span">{displayDuration} second(s)</Text>}
                        />
                        <Text as="p" variant="bodySm" tone="subdued">How long each pop will display on your site.</Text>
                    </BlockStack>
                    <BlockStack gap="200">
                        <RangeSlider
                            label="Time before the first pop"
                            min={SLIDER_LIMITS.firstDelay.min} max={SLIDER_LIMITS.firstDelay.max}
                            value={firstDelay}
                            onChange={val => onChange('firstDelay', val)}
                            suffix={<Text as="span">{firstDelay} second(s)</Text>}
                        />
                        <Text as="p" variant="bodySm" tone="subdued">The delay time before the first notification.</Text>
                    </BlockStack>
                    <BlockStack gap="200">
                        <RangeSlider
                            label="Gap time between two pops"
                            min={SLIDER_LIMITS.popsInterval.min} max={SLIDER_LIMITS.popsInterval.max}
                            value={popsInterval}
                            onChange={val => onChange('popsInterval', val)}
                            suffix={<Text as="span">{popsInterval} second(s)</Text>}
                        />
                        <Text as="p" variant="bodySm" tone="subdued">The time interval between two popup notifications.</Text>
                    </BlockStack>
                    <BlockStack gap="200">
                        <RangeSlider
                            label="Maximum of popups"
                            min={SLIDER_LIMITS.maxPopsDisplay.min} max={SLIDER_LIMITS.maxPopsDisplay.max}
                            value={maxPopsDisplay}
                            onChange={val => onChange('maxPopsDisplay', val)}
                            suffix={<Text as="span">{maxPopsDisplay} pop(s)</Text>}
                        />
                        <Text as="p" variant="bodySm" tone="subdued">The maximum number of popups allowed. Maximum is 80.</Text>
                    </BlockStack>
                </InlineGrid>
            </BlockStack>
        </BlockStack>
    );
}

DisplayTab.propTypes = {
    settings: PropTypes.shape({
        position: PropTypes.string,
        hideTimeAgo: PropTypes.bool,
        truncateProductName: PropTypes.bool,
        displayDuration: PropTypes.number,
        firstDelay: PropTypes.number,
        popsInterval: PropTypes.number,
        maxPopsDisplay: PropTypes.number
    }).isRequired,
    onChange: PropTypes.func.isRequired
};
