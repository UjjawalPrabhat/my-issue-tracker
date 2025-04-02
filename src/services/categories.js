import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { mainCategories, subCategories } from '../utils/categories';

/**
 * Get all categories from Firestore
 * @returns {Promise<Object>} - Categories object containing main and sub categories
 */
export const getCategories = async () => {
  try {
    console.log("Fetching categories from database");
    
    // Get categories from Firestore
    const categoriesRef = doc(db, 'settings', 'categories');
    const categoriesDoc = await getDoc(categoriesRef);
    
    if (categoriesDoc.exists()) {
      const data = categoriesDoc.data();
      console.log("Categories found in database:", data);
      return data;
    } else {
      console.log("No categories found in database, initializing...");
      try {
        await initializeCategories();
        
        // Try again after initialization
        const freshDoc = await getDoc(categoriesRef);
        if (freshDoc.exists()) {
          return freshDoc.data();
        }
      } catch (initError) {
        console.error("Failed to initialize categories:", initError);
        console.log("Using default categories due to initialization failure");
      }
      
      // Fall back to default if still not found
      return { main: mainCategories, sub: subCategories };
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    console.log("Using default categories due to permission issues");
    // Return default categories as fallback
    return { main: mainCategories, sub: subCategories };
  }
};

/**
 * Initialize categories in Firestore with default values
 * @returns {Promise<boolean>} - Success status
 */
export const initializeCategories = async () => {
  try {
    console.log("Initializing categories in database");
    
    const categoriesRef = doc(db, 'settings', 'categories');
    const defaultCategories = {
      main: mainCategories,
      sub: subCategories
    };
    
    await setDoc(categoriesRef, defaultCategories);
    console.log("Categories initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing categories:", error);
    return false;
  }
};

/**
 * Add a new main category
 * @param {Object} category - Category object with id and label
 * @returns {Promise<boolean>} - Success status
 */
export const addCategory = async (category) => {
  try {
    console.log("Adding new main category:", category);
    
    // Get current categories
    const categoriesRef = doc(db, 'settings', 'categories');
    const categoriesDoc = await getDoc(categoriesRef);
    
    if (!categoriesDoc.exists()) {
      await initializeCategories();
    }
    
    // Get updated categories
    const currentData = (await getDoc(categoriesRef)).data() || { main: [], sub: {} };
    
    // Check for duplicate IDs
    if (currentData.main.some(c => c.id === category.id)) {
      throw new Error(`Category with ID "${category.id}" already exists`);
    }
    
    // Add the new category
    const updatedMainCategories = [...currentData.main, category];
    
    // Update Firestore
    await updateDoc(categoriesRef, {
      main: updatedMainCategories
    });
    
    return true;
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
};

/**
 * Update an existing main category
 * @param {Object} category - Updated category object with id and label
 * @returns {Promise<boolean>} - Success status
 */
export const updateCategory = async (category) => {
  try {
    console.log("Updating main category:", category);
    
    // Get current categories
    const categoriesRef = doc(db, 'settings', 'categories');
    const categoriesDoc = await getDoc(categoriesRef);
    
    if (!categoriesDoc.exists()) {
      throw new Error("Categories not found");
    }
    
    const currentData = categoriesDoc.data();
    
    // Find the category to update
    if (!currentData.main.some(c => c.id === category.id)) {
      throw new Error(`Category with ID "${category.id}" not found`);
    }
    
    // Update the category
    const updatedMainCategories = currentData.main.map(c => 
      c.id === category.id ? category : c
    );
    
    // Update Firestore
    await updateDoc(categoriesRef, {
      main: updatedMainCategories
    });
    
    return true;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

/**
 * Delete a main category and its subcategories
 * @param {string} categoryId - ID of the category to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteCategory = async (categoryId) => {
  try {
    console.log("Deleting main category:", categoryId);
    
    // Get current categories
    const categoriesRef = doc(db, 'settings', 'categories');
    const categoriesDoc = await getDoc(categoriesRef);
    
    if (!categoriesDoc.exists()) {
      throw new Error("Categories not found");
    }
    
    const currentData = categoriesDoc.data();
    
    // Remove the category
    const updatedMainCategories = currentData.main.filter(c => c.id !== categoryId);
    
    // Remove subcategories
    const updatedSub = {...currentData.sub};
    delete updatedSub[categoryId];
    
    // Update Firestore
    await updateDoc(categoriesRef, {
      main: updatedMainCategories,
      sub: updatedSub
    });
    
    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

/**
 * Add a subcategory to a main category
 * @param {string} mainCategoryId - ID of the main category
 * @param {Object} subcategory - Subcategory object with id and label
 * @returns {Promise<boolean>} - Success status
 */
export const addSubcategory = async (mainCategoryId, subcategory) => {
  try {
    console.log(`Adding subcategory to "${mainCategoryId}":`, subcategory);
    
    // Get current categories
    const categoriesRef = doc(db, 'settings', 'categories');
    const categoriesDoc = await getDoc(categoriesRef);
    
    if (!categoriesDoc.exists()) {
      throw new Error("Categories not found");
    }
    
    const currentData = categoriesDoc.data();
    
    // Ensure main category exists
    if (!currentData.main.some(c => c.id === mainCategoryId)) {
      throw new Error(`Main category "${mainCategoryId}" not found`);
    }
    
    // Prepare updated subcategories
    const currentSubcategories = currentData.sub[mainCategoryId] || [];
    
    // Check for duplicate IDs
    if (currentSubcategories.some(s => s.id === subcategory.id)) {
      throw new Error(`Subcategory with ID "${subcategory.id}" already exists`);
    }
    
    // Add subcategory
    const updatedSubcategories = [...currentSubcategories, subcategory];
    
    // Prepare update object
    const updatedSub = {
      ...currentData.sub,
      [mainCategoryId]: updatedSubcategories
    };
    
    // Update Firestore
    await updateDoc(categoriesRef, {
      sub: updatedSub
    });
    
    return true;
  } catch (error) {
    console.error("Error adding subcategory:", error);
    throw error;
  }
};

/**
 * Update an existing subcategory
 * @param {string} mainCategoryId - ID of the main category
 * @param {Object} subcategory - Updated subcategory object with id and label
 * @returns {Promise<boolean>} - Success status
 */
export const updateSubcategory = async (mainCategoryId, subcategory) => {
  try {
    console.log(`Updating subcategory in "${mainCategoryId}":`, subcategory);
    
    // Get current categories
    const categoriesRef = doc(db, 'settings', 'categories');
    const categoriesDoc = await getDoc(categoriesRef);
    
    if (!categoriesDoc.exists()) {
      throw new Error("Categories not found");
    }
    
    const currentData = categoriesDoc.data();
    
    // Ensure main category exists
    if (!currentData.sub[mainCategoryId] || !currentData.sub[mainCategoryId].length) {
      throw new Error(`No subcategories found for main category "${mainCategoryId}"`);
    }
    
    // Find the subcategory to update
    if (!currentData.sub[mainCategoryId].some(s => s.id === subcategory.id)) {
      throw new Error(`Subcategory with ID "${subcategory.id}" not found`);
    }
    
    // Update the subcategory
    const updatedSubcategories = currentData.sub[mainCategoryId].map(s => 
      s.id === subcategory.id ? subcategory : s
    );
    
    // Prepare update object
    const updatedSub = {
      ...currentData.sub,
      [mainCategoryId]: updatedSubcategories
    };
    
    // Update Firestore
    await updateDoc(categoriesRef, {
      sub: updatedSub
    });
    
    return true;
  } catch (error) {
    console.error("Error updating subcategory:", error);
    throw error;
  }
};

/**
 * Delete a subcategory from a main category
 * @param {string} mainCategoryId - ID of the main category
 * @param {string} subcategoryId - ID of the subcategory to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteSubcategory = async (mainCategoryId, subcategoryId) => {
  try {
    console.log(`Deleting subcategory "${subcategoryId}" from "${mainCategoryId}"`);
    
    // Get current categories
    const categoriesRef = doc(db, 'settings', 'categories');
    const categoriesDoc = await getDoc(categoriesRef);
    
    if (!categoriesDoc.exists()) {
      throw new Error("Categories not found");
    }
    
    const currentData = categoriesDoc.data();
    
    // Ensure main category exists
    if (!currentData.sub[mainCategoryId] || !currentData.sub[mainCategoryId].length) {
      throw new Error(`No subcategories found for main category "${mainCategoryId}"`);
    }
    
    // Remove the subcategory
    const updatedSubcategories = currentData.sub[mainCategoryId].filter(s => 
      s.id !== subcategoryId
    );
    
    // Prepare update object
    const updatedSub = {
      ...currentData.sub,
      [mainCategoryId]: updatedSubcategories
    };
    
    // Update Firestore
    await updateDoc(categoriesRef, {
      sub: updatedSub
    });
    
    return true;
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    throw error;
  }
};
