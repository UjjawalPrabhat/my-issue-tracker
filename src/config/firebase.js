import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Create empty variables that will be initialized or left as fallbacks
let app;
let auth;
let db;
let storage;

// Initialize Firebase with error handling
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Connect to emulators in development environment
  if (import.meta.env.DEV) {
    console.log("Using Firebase emulators in development");
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, "localhost", 8080);
    connectStorageEmulator(storage, "localhost", 9199);
  } else {
    console.log("Using production Firebase instance");
  }
  
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  
  // Provide fallback objects that won't crash the app but will log errors when used
  auth = {
    onAuthStateChanged: (callback) => {
      console.error("Auth not initialized, but code attempted to use it");
      callback(null);
      return () => {};
    },
    signInWithEmailAndPassword: () => Promise.reject(new Error("Firebase auth not initialized")),
    createUserWithEmailAndPassword: () => Promise.reject(new Error("Firebase auth not initialized")),
    signOut: () => Promise.reject(new Error("Firebase auth not initialized"))
  };
  
  db = {
    collection: () => ({
      doc: () => ({
        get: () => Promise.reject(new Error("Firestore not initialized"))
      })
    })
  };
  
  storage = {
    ref: () => ({
      put: () => Promise.reject(new Error("Storage not initialized")),
      getDownloadURL: () => Promise.reject(new Error("Storage not initialized"))
    })
  };
}

// Export at the top level, outside of try/catch
export { app, auth, db, storage };
