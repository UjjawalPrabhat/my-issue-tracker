import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Hook for Firebase authentication
 * Provides authentication state and methods
 */
export const useFirebaseAuth = () => {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear any errors
  const clearError = () => setError(null);

  // Sign in with email and password
  const signIn = async (email, password) => {
    setError(null);
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Create a new user with email and password
  const signUp = async (email, password) => {
    setError(null);
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Sign out the current user
  const logOut = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setLoading(false);
    });

    // Cleanup function
    return () => unsubscribe();
  }, []);

  return {
    authUser,
    loading,
    error,
    signIn,
    signUp,
    logOut,
    clearError
  };
};
