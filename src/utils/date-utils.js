/**
 * Centralized Date Utilities for Timezone-Aware Rendering
 * Uses native Intl.DateTimeFormat to avoid heavy library overhead.
 */

/**
 * Formats a date string/object according to a specific timezone.
 * @param {Date|string|number} date - The date to format
 * @param {string} timezone - The target IANA timezone string (e.g., 'America/New_York')
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export const formatInTimezone = (date, timezone = 'UTC', options = {}) => {
  if (!date) return '-';
  
  try {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(d.getTime())) return '-';
    
    return new Intl.DateTimeFormat('en-US', {
      ...options,
      timeZone: timezone,
    }).format(d);
  } catch (error) {
    console.error('Error formatting date in timezone:', error);
    return '-';
  }
};

/**
 * Gets the current parts of a date in a specific timezone
 * Useful for checking if two dates are in the same month/year in that TZ.
 */
export const getZonedParts = (date, timezone = 'UTC') => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(d);

  return parts.reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
};

/**
 * Checks if a date falls within the "current" month in the target timezone.
 */
export const isSameMonthInTimezone = (date, timezone = 'UTC') => {
  const nowParts = getZonedParts(new Date(), timezone);
  const dateParts = getZonedParts(date, timezone);
  
  if (!nowParts || !dateParts) return false;
  
  return nowParts.year === dateParts.year && nowParts.month === dateParts.month;
};

/**
 * Calculates days between now and a future date in the target timezone.
 */
export const getDaysUntilInTimezone = (futureDate) => {
  if (!futureDate) return null;
  
  // We calculate difference in UTC but we need to know what "today" means in the TZ
  const now = new Date();
  const target = new Date(futureDate);
  
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
};
