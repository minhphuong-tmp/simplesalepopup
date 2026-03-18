/**
 * Default settings for the Sale Pop notification popup.
 * Shared between frontend (Settings page) and backend (settingsRepository).
 */
export const DEFAULT_SETTINGS = {
  position: 'bottom-left',
  hideTimeAgo: false,
  truncateProductName: false,
  displayDuration: 5,
  firstDelay: 10,
  popsInterval: 2,
  maxPopsDisplay: 20,
  allowShow: 'all',
  includedUrls: '',
  excludedUrls: ''
};
