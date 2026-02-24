/**
 * Utility function to unescape HTML entities
 * Uses textarea to robustly decode entities without stripping tags
 */
export const unescapeHtml = (str) => {
  if (!str) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
};
