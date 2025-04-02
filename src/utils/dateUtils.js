/**
 * Format a date string or timestamp for display
 * @param {string|Date|Object} dateInput - Date string, Date object, or Firestore timestamp
 * @param {string} format - Format type ('short', 'long', 'relative')
 * @param {string} fallback - Text to show when date is invalid or missing
 * @returns {string} Formatted date string
 */
export const formatDate = (dateInput, format = 'short', fallback = 'Not specified') => {
  if (!dateInput) return fallback;
  
  let date;
  
  try {
    // Handle Firestore timestamp objects (with toDate method)
    if (dateInput && typeof dateInput === 'object' && dateInput.toDate) {
      date = dateInput.toDate();
    } 
    // Handle Firestore timestamp objects (with seconds and nanoseconds)
    else if (dateInput && typeof dateInput === 'object' && dateInput.seconds) {
      date = new Date(dateInput.seconds * 1000);
    }
    // Handle string timestamps that might be ISO format
    else if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    }
    // Handle numeric timestamps (milliseconds since epoch)
    else if (typeof dateInput === 'number') {
      date = new Date(dateInput);
    }
    // Handle regular Date objects
    else {
      date = new Date(dateInput);
    }
    
    // Validate the date
    if (isNaN(date.getTime())) {
      console.warn("Invalid date after conversion:", dateInput, "->", date);
      return fallback;
    }
    
    // Format the date according to the requested format
    switch (format) {
      case 'short':
        return date.toLocaleDateString();
        
      case 'long':
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
      case 'relative':
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMs / 3600000);
        const diffDays = Math.round(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
        
      default:
        return date.toLocaleString();
    }
  } catch (error) {
    console.error("Date formatting error:", error, "for input:", dateInput);
    return fallback;
  }
};

/**
 * Check if a date is valid
 * @param {string|Date|Object} dateInput - Date to validate
 * @returns {boolean} True if date is valid
 */
export const isValidDate = (dateInput) => {
  if (!dateInput) return false;
  
  let date;
  
  // Handle Firestore timestamp objects
  if (dateInput && typeof dateInput === 'object' && dateInput.toDate) {
    date = dateInput.toDate();
  } else {
    date = new Date(dateInput);
  }
  
  return !isNaN(date.getTime());
};

/**
 * Format time difference in milliseconds to a human-readable string
 * @param {number} milliseconds - Time difference in milliseconds
 * @returns {string} Formatted time difference
 */
export const formatTimeDifference = (milliseconds) => {
  if (!milliseconds || isNaN(milliseconds)) return 'unknown time';

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  // Format based on the appropriate time unit
  if (days > 0) {
    return days === 1 ? '1 day' : `${days} days`;
  } else if (hours > 0) {
    const remainingMins = minutes % 60;
    if (remainingMins > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
};
