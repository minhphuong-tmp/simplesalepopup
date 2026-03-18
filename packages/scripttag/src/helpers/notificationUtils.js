/**
 * Truncate a string to a maximum length, appending '...' if truncated.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateString = (str, maxLength = 20) =>
  str.length <= maxLength ? str : str.slice(0, maxLength) + '...';
