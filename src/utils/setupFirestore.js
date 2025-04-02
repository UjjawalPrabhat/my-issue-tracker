import { doc, setDoc, collection, getDocs, limit, query } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

/**
 * Ensures a collection exists by writing a placeholder document if needed
 * @param {string} collectionName - The name of the collection to ensure
 * @returns {Promise<boolean>} - Whether initialization was completed
 */
export const ensureCollection = async (collectionName) => {
  try {
    // First, just check if the collection has any documents
    const q = query(collection(db, collectionName), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.size > 0) {
      console.log(`Collection '${collectionName}' already has documents.`);
      return true;
    }
    
    // If no documents exist, create a placeholder
    await setDoc(
      doc(db, collectionName, "__placeholder__"),
      {
        _created: new Date().toISOString(),
        _placeholder: true,
        _info: `This document ensures the ${collectionName} collection exists`
      }
    );
    
    console.log(`Created placeholder for '${collectionName}' collection.`);
    return true;
  } catch (error) {
    console.error(`Error initializing '${collectionName}' collection:`, error);
    return false;
  }
};

/**
 * Initialize all necessary Firestore collections when the app starts
 */
export const initializeFirestore = async () => {
  try {
    if (!auth.currentUser) {
      console.log('User not authenticated, skipping Firestore initialization');
      return false;
    }
    
    console.log('Initializing Firestore collections...');
    
    // Ensure these collections exist
    await Promise.all([
      ensureCollection('comments'),
      ensureCollection('issues'),
      ensureCollection('users')
    ]);
    
    console.log('Firestore initialization complete.');
    return true;
  } catch (error) {
    console.error('Failed to initialize Firestore:', error);
    return false;
  }
};
