/**
 * Map Firebase authentication error codes to user-friendly messages
 */
export const getAuthErrorMessage = (error) => {
  const errorCode = error?.code || '';
  
  const errorMessages = {
    'auth/email-already-in-use': 'This email address is already in use.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/too-many-requests': 'Too many login attempts. Please try again later.',
    'auth/internal-error': 'An internal error occurred. Please try again.',
    'auth/invalid-credential': 'Invalid login credentials.',
    'auth/account-exists-with-different-credential': 'An account already exists with the same email address but different sign-in credentials.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed before completing the sign in.',
    'auth/popup-blocked': 'Sign-in popup was blocked by your browser.',
    'auth/cancelled-popup-request': 'The sign-in operation was cancelled.',
    'auth/operation-not-allowed': 'Google sign-in is not enabled. Please contact the administrator.'
  };
  
  return errorMessages[errorCode] || 'An error occurred. Please try again.';
};

/**
 * Map Firestore error codes to user-friendly messages
 */
export const getFirestoreErrorMessage = (error) => {
  const errorCode = error?.code || '';
  
  const errorMessages = {
    'permission-denied': 'You don\'t have permission to perform this action.',
    'unavailable': 'The service is currently unavailable. Please try again later.',
    'not-found': 'The requested document was not found.',
    'already-exists': 'A document with the same ID already exists.'
  };
  
  return errorMessages[errorCode] || 'A database error occurred. Please try again.';
};
