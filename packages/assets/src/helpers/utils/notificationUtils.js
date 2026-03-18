/**
 * Truncate a string to a maximum length, appending '...' if truncated.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateString = (str, maxLength = 20) =>
  str.length <= maxLength ? str : str.slice(0, maxLength) + '...';

/**
 * Convert a Firestore Timestamp-like object (with _seconds) or a raw value to milliseconds.
 * @param {Object|number|string} ts - Firestore timestamp or raw timestamp
 * @returns {number|string}
 */
export const toMs = ts => (ts?._seconds ? ts._seconds * 1000 : ts);
