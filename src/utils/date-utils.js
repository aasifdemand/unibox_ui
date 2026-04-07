import { DateTime } from 'luxon';

/**
 * Centralized Date Utilities for Timezone-Aware Rendering
 * Standardized on Luxon for reliable IANA timezone support.
 */

/**
 * Formats a date string/object according to a specific timezone.
 * @param {Date|string|number} date - The date to format
 * @param {string} timezone - The target IANA timezone string (e.g., 'America/New_York')
 * @param {Object} options - Intl.DateTimeFormat options (now mapped to Luxon format or used as is)
 * @returns {string} - Formatted date string
 */
export const formatInTimezone = (date, timezone = 'UTC', options = {}) => {
  if (!date) return '-';
  
  try {
    const dt = typeof date === 'string' || typeof date === 'number' 
      ? DateTime.fromISO(new Date(date).toISOString()).setZone(timezone) 
      : DateTime.fromJSDate(new Date(date)).setZone(timezone);
    
    if (!dt.isValid) return '-';
    
    // Convert Intl options to Luxon where possible, 
    // or use a smart default if options for specific names are passed
    if (options.weekday || options.month || options.day || options.year) {
      // Simple mapping for common dashboard patterns
      if (options.month === 'short' && options.day === 'numeric' && options.year === 'numeric') {
        return dt.toFormat('LLL d, yyyy');
      }
      if (options.month === 'short' && options.day === 'numeric') {
        return dt.toFormat('LLL d');
      }
      if (options.weekday === 'short') {
        return dt.toFormat('ccc');
      }
    }

    return dt.toLocaleString({ ...DateTime.DATETIME_MED, ...options });
  } catch (error) {
    console.error('Error formatting date in timezone:', error);
    return '-';
  }
};

/**
 * Gets the current parts of a date in a specific timezone
 */
export const getZonedParts = (date, timezone = 'UTC') => {
  const dt = DateTime.fromISO(new Date(date).toISOString()).setZone(timezone);
  if (!dt.isValid) return null;

  return {
    year: dt.year.toString(),
    month: dt.month.toString(),
    day: dt.day.toString(),
    hour: dt.hour.toString(),
    minute: dt.minute.toString(),
    second: dt.second.toString(),
  };
};

/**
 * Checks if a date falls within the "current" month in the target timezone.
 */
export const isSameMonthInTimezone = (date, timezone = 'UTC') => {
  const now = DateTime.now().setZone(timezone);
  const dt = DateTime.fromISO(new Date(date).toISOString()).setZone(timezone);
  
  if (!dt.isValid) return false;
  
  return now.year === dt.year && now.month === dt.month;
};

/**
 * Calculates days between now and a future date in the target timezone.
 */
export const getDaysUntilInTimezone = (futureDate, timezone = 'UTC') => {
  if (!futureDate) return null;
  
  const now = DateTime.now().setZone(timezone).startOf('day');
  const target = DateTime.fromISO(new Date(futureDate).toISOString()).setZone(timezone).startOf('day');
  
  if (!target.isValid) return null;
  
  const diff = target.diff(now, 'days').days;
  return diff > 0 ? Math.ceil(diff) : 0;
};
