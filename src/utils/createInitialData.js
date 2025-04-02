import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { mainCategories, subCategories } from './categories';

/**
 * Creates initial categories in the Firestore database if they don't exist
 * Only attempts this if user is authenticated
 */
export const initializeCategories = async () => {
  try {
    // Skip if no user is logged in
    if (!auth.currentUser) {
      console.log("No authenticated user, skipping category initialization");
      return false;
    }
    
    console.log("Checking for existing categories...");
    const categoriesRef = doc(db, 'settings', 'categories');
    const categoriesDoc = await getDoc(categoriesRef);
    
    if (!categoriesDoc.exists()) {
      console.log("No categories found, creating defaults...");
      const defaultCategories = {
        main: mainCategories,
        sub: subCategories
      };
      
      try {
        await setDoc(categoriesRef, defaultCategories);
        console.log("Default categories created successfully");
        return true;
      } catch (writeError) {
        console.error("Error writing default categories:", writeError);
        return false;
      }
    } else {
      console.log("Categories already exist in database");
      return true;
    }
  } catch (error) {
    console.error("Error initializing categories:", error);
    return false;
  }
};

/**
 * Ensures collections like 'comments' exist in the database
 */
export const ensureCollectionExists = async (collectionName) => {
  try {
    if (!auth.currentUser) {
      console.log(`No authenticated user, skipping ${collectionName} collection check`);
      return false;
    }
    
    console.log(`Checking if ${collectionName} collection exists...`);
    
    // Instead of querying, we'll directly create a dummy document to ensure the collection exists
    try {
      const dummyRef = doc(db, collectionName, 'dummy');
      await setDoc(dummyRef, { 
        _created: new Date().toISOString(),
        _description: `System document to initialize ${collectionName} collection`,
        _createdBy: 'system',
        _isInitializer: true
      }, { merge: true });
      console.log(`Created or updated dummy document in ${collectionName} collection`);
      return true;
    } catch (innerError) {
      console.error(`Error creating dummy document in ${collectionName}:`, innerError);
      return false;
    }
  } catch (error) {
    console.error(`Error in ensureCollectionExists for ${collectionName}:`, error);
    return false;
  }
};

/**
 * Function to call on app startup to ensure all required data exists
 */
export const initializeAppData = async () => {
  try {
    if (!auth.currentUser) {
      console.log("No authenticated user, skipping app data initialization");
      return;
    }
    
    console.log("Initializing app data...");
    
    // Make sure comments collection exists first
    await ensureCollectionExists('comments');
    
    // Then initialize categories
    await initializeCategories();
    
    console.log("App data initialization complete");
  } catch (error) {
    console.error("Failed to initialize app data:", error);
  }
};
