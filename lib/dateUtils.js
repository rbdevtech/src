// src/lib/dateUtils.js

/**
 * Format a date in 24-hour format with Morocco/Casablanca timezone (GMT+1)
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
    // Convert to Date object if string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Options for formatting
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // Use 24-hour format
      timeZone: 'Africa/Casablanca' // Morocco timezone (GMT+1)
    };
    
    // Format the date
    return new Intl.DateTimeFormat('en-GB', options).format(dateObj);
  }
  
  /**
   * Format a date without time
   * @param {Date|string} date - Date object or date string
   * @returns {string} Formatted date string without time
   */
  export function formatDateOnly(date) {
    // Convert to Date object if string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Options for formatting
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Africa/Casablanca' // Morocco timezone (GMT+1)
    };
    
    // Format the date
    return new Intl.DateTimeFormat('en-GB', options).format(dateObj);
  }
  
  /**
   * Format time only in 24-hour format with GMT+1 timezone
   * @param {Date|string} date - Date object or date string
   * @returns {string} Formatted time string
   */
  export function formatTimeOnly(date) {
    // Convert to Date object if string
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Options for formatting
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // Use 24-hour format
      timeZone: 'Africa/Casablanca' // Morocco timezone (GMT+1)
    };
    
    // Format the time
    return new Intl.DateTimeFormat('en-GB', options).format(dateObj);
  }