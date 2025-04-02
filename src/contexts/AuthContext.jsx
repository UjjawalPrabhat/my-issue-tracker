import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Create the auth context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Parse student email to extract name and roll number with better year calculation
const parseStudentEmail = (email) => {
  if (!email || !email.endsWith('@sst.scaler.com')) {
    return { name: '', rollNumber: '' };
  }
  
  try {
    // Assuming format: name.rollNumber@sst.scaler.com
    const localPart = email.split('@')[0];
    const parts = localPart.split('.');
    
    // Extract roll number (last part before @)
    const rollNumber = parts[parts.length - 1];
    
    // Extract name (could be first.middle.last format)
    const nameParts = parts.slice(0, parts.length - 1);
    // Format name with proper capitalization
    const formattedName = nameParts.map(part => 
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    ).join(' ');
    
    // Calculate student's year correctly based on enrollment year in roll number
    let year = '';
    let semester = '';
    
    if (rollNumber && rollNumber.length >= 2) {
      // Assuming first 2 digits of roll number represent enrollment year (like 22 for 2022)
      const enrollmentYear = parseInt('20' + rollNumber.substring(0, 2), 10);
      if (!isNaN(enrollmentYear)) {
        // Get current date to calculate year of study
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
        
        // Students advance a year every August
        // If current month is >= August, they're in the next academic year
        let academicYears = currentYear - enrollmentYear;
        if (currentMonth < 8) {
          // If before August, they're still in the previous academic year
          academicYears--;
        }
        
        // Clamp between 1-4 years
        year = Math.min(Math.max(academicYears + 1, 1), 4).toString();
        
        // Calculate semester based on year and month
        if (currentMonth >= 8 || currentMonth <= 1) {
          // Aug-Jan is odd semester
          semester = (parseInt(year) * 2) - 1;
        } else {
          // Feb-Jul is even semester
          semester = parseInt(year) * 2;
        }
        
        // Ensure semester is between 1-8
        semester = Math.min(Math.max(semester, 1), 8).toString();
        
        return { 
          name: formattedName,
          rollNumber: rollNumber,
          year: year,
          semester: semester
        };
      }
    }
    
    return { 
      name: formattedName,
      rollNumber: rollNumber
    };
  } catch (error) {
    console.error("Error parsing student email:", error);
    return { name: '', rollNumber: '' };
  }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Get additional user data from Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              // Combine Firebase Auth user with additional Firestore data
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
                ...userDoc.data()
              });
            } else {
              // If user exists in Auth but not in Firestore, create a basic record
              const userData = {
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || '',
                role: firebaseUser.email === 'iamujjawal4u@gmail.com' ? 'admin' : 'student', // Check for admin email
                createdAt: new Date().toISOString()
              };
              
              try {
                await setDoc(doc(db, 'users', firebaseUser.uid), userData);
                setUser({
                  uid: firebaseUser.uid,
                  ...userData
                });
              } catch (docSetError) {
                console.error("Error creating user document:", docSetError);
                // Fall back to basic user info
                setUser({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  emailVerified: firebaseUser.emailVerified
                });
              }
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            // Fallback to basic user info if Firestore fetch fails
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified
            });
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Auth state change error:", error);
        setError(error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (authError) {
      console.error("Failed to set up auth state listener:", authError);
      setError(authError);
      setLoading(false);
      return () => {}; // Return empty cleanup function
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Google sign in function
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log("Google sign-in successful for:", user.email);
      
      // Check if this is the admin email directly 
      const isAdmin = user.email === 'iamujjawal4u@gmail.com';
      console.log("Is admin email:", isAdmin);
      
      // Check if user document exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create a new user document if it doesn't exist
        // Extract data from email if it's a student email
        const { name, rollNumber, year, semester } = parseStudentEmail(user.email);
        
        const userData = {
          uid: user.uid,
          displayName: name || user.displayName || '',
          email: user.email,
          photoURL: user.photoURL || '',
          role: isAdmin ? 'admin' : 'student',
          rollNumber: rollNumber || '',
          year: year || '',
          semester: semester || '',
          createdAt: new Date().toISOString(),
          isProfileComplete: false // Track if profile is complete
        };
        
        console.log("Creating new user with role:", userData.role);
        await setDoc(doc(db, 'users', user.uid), userData);
        
        // Important: Update the user state with the new data including role
        setUser({
          uid: user.uid,
          ...userData
        });
        
        // Return additional flag for first-time users
        return { 
          user: {
            uid: user.uid,
            ...userData
          },
          isNewUser: true
        };
      } else {
        // User exists, check if we need to update with email-extracted information
        const userData = userDoc.data();
        
        // If we have a student email but missing details, update them
        if (
          user.email.endsWith('@sst.scaler.com') && 
          (!userData.rollNumber || !userData.displayName || !userData.year)
        ) {
          const { name, rollNumber, year, semester } = parseStudentEmail(user.email);
          
          // Only update fields that are empty
          const updates = {};
          if (!userData.rollNumber && rollNumber) updates.rollNumber = rollNumber;
          if (!userData.displayName && name) updates.displayName = name;
          if (!userData.year && year) updates.year = year;
          if (!userData.semester && semester) updates.semester = semester;
          
          // If we have updates to make
          if (Object.keys(updates).length > 0) {
            console.log("Updating user with email-extracted data:", updates);
            await updateDoc(doc(db, 'users', user.uid), updates);
            
            // Update user state with the new data
            setUser({
              ...userData,
              ...updates,
              uid: user.uid
            });
            
            return {
              user: {
                ...userData,
                ...updates,
                uid: user.uid
              },
              isNewUser: false
            };
          }
        }
        
        // Rest of the existing code for admin checks, etc.
        if (isAdmin && userDoc.data().role !== 'admin') {
          // If the admin email doesn't have admin role, update it
          console.log("Updating admin user role");
          await updateDoc(doc(db, 'users', user.uid), {
            role: 'admin'
          });
          
          // Update the user state with the updated role
          setUser({
            ...userDoc.data(),
            uid: user.uid,
            role: 'admin'
          });
        } else if (!isAdmin && userDoc.data().role === 'admin') {
          // If a non-admin email has admin role, fix it
          console.log("Downgrading non-admin user from admin role");
          await updateDoc(doc(db, 'users', user.uid), {
            role: 'student'
          });
          
          // Update the user state with the corrected role
          setUser({
            ...userDoc.data(),
            uid: user.uid,
            role: 'student'
          });
        } else {
          // User exists and role is already correct
          console.log("User exists, using existing role:", userDoc.data().role);
          setUser({
            uid: user.uid,
            ...userDoc.data()
          });
        }
      }
      
      return { 
        user,
        isNewUser: false
      };
    } catch (error) {
      console.error("Google sign in error:", error);
      throw error;
    }
  };

  // Signup function
  const signup = async (email, password, userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        email,
        role: userData.role || 'student',
        createdAt: new Date().toISOString()
      });
      
      return user;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // Auth context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    signup,
    signInWithGoogle,
    isAuthenticated: !!user,
  };

  // Show a better loading state instead of returning null
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Loading application...</p>
      </div>
    );
  }

  // Show error state if auth initialization failed
  if (error && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-700 mb-4">There was a problem connecting to the authentication service.</p>
          <p className="text-sm text-gray-500 mb-6">{error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
