// A centralized place for all API calls
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp,
  setDoc 
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

// Import default categories directly
import { mainCategories, subCategories } from '../utils/categories';
import { initializeCategories } from '../utils/createInitialData';
import { 
  createStatusChangeNotification, 
  createAssignmentNotification, 
  createResolutionNotification,
  createNotification
} from './notifications';

// Issues
/**
 * Get all issues from Firestore
 * @returns {Promise<Array>} - Array of issue objects
 */
export const getIssues = async () => {
  try {
    console.log("Fetching all issues from Firestore");
    const issuesCollection = collection(db, 'issues');
    const snapshot = await getDocs(issuesCollection);
    
    if (snapshot.empty) {
      console.log("No issues found in database");
      return [];
    }
    
    // Map documents to objects with id
    const issues = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Ensure dates are properly formatted
      const createdAt = data.createdAt ? 
        (typeof data.createdAt === 'string' ? data.createdAt : data.createdAt.toDate?.().toISOString()) : 
        null;
        
      const submittedAt = data.submittedAt ? 
        (typeof data.submittedAt === 'string' ? data.submittedAt : data.submittedAt.toDate?.().toISOString()) : 
        null;
        
      const updatedAt = data.updatedAt ? 
        (typeof data.updatedAt === 'string' ? data.updatedAt : data.updatedAt.toDate?.().toISOString()) : 
        null;
        
      const adminResolutionTime = data.adminResolutionTime ? 
        (typeof data.adminResolutionTime === 'string' ? data.adminResolutionTime : data.adminResolutionTime.toDate?.().toISOString()) : 
        null;
      
      return {
        id: doc.id,
        ...data,
        createdAt: createdAt || submittedAt,
        submittedAt: submittedAt || createdAt,
        updatedAt,
        adminResolutionTime
      };
    });
    
    console.log(`Successfully retrieved ${issues.length} issues`);
    return issues;
  } catch (error) {
    console.error("Error getting issues:", error);
    throw error;
  }
};

/**
 * Get a specific issue by ID
 * @param {string} id - Issue ID
 * @returns {Promise<Object>} - Issue object
 */
export const getIssueById = async (id) => {
  try {
    const issueDoc = await getDoc(doc(db, 'issues', id));
    
    if (!issueDoc.exists()) {
      console.log(`Issue not found with ID: ${id}`);
      return null;
    }
    
    const issueData = issueDoc.data();
    
    // Add debugging for date fields
    console.log("Raw issue date fields:", {
      createdAt: issueData.createdAt,
      submittedAt: issueData.submittedAt,
      timestamp: issueData.timestamp
    });
    
    // Format and normalize Firestore timestamp fields to ensure they're usable
    const processedData = {
      id,
      ...issueData,
      // Ensure these fields are properly converted to JS dates if they exist
      createdAt: issueData.createdAt?.toDate?.() || issueData.createdAt,
      submittedAt: issueData.submittedAt?.toDate?.() || issueData.submittedAt,
      updatedAt: issueData.updatedAt?.toDate?.() || issueData.updatedAt,
      adminResolutionTime: issueData.adminResolutionTime?.toDate?.() || issueData.adminResolutionTime,
    };
    
    return processedData;
  } catch (error) {
    console.error("Error fetching issue:", error);
    throw error;
  }
};

export const createIssue = async (issue) => {
  try {
    console.log("Creating new issue:", issue);
    const newIssue = {
      ...issue,
      createdAt: serverTimestamp(),
      status: issue.status || 'open' // Ensure status is set
    };
    
    const docRef = await addDoc(collection(db, 'issues'), newIssue);
    console.log("Issue created with ID:", docRef.id);
    return {
      id: docRef.id,
      ...newIssue,
      createdAt: new Date().toISOString() // For immediate UI rendering
    };
  } catch (error) {
    console.error("Error creating issue:", error);
    throw error;
  }
};

export const updateIssue = async (id, updates) => {
  try {
    const issueRef = doc(db, 'issues', id);
    await updateDoc(issueRef, updates);
    const updatedDoc = await getDoc(issueRef);
    return { id, ...updatedDoc.data() };
  } catch (error) {
    console.error("Error updating issue:", error);
    throw new Error('Issue not found or could not be updated');
  }
};

export const deleteIssue = async (id) => {
  try {
    await deleteDoc(doc(db, 'issues', id));
    return true;
  } catch (error) {
    console.error("Error deleting issue:", error);
    throw error;
  }
};

/**
 * Update an issue's status
 * @param {string} issueId - ID of the issue to update
 * @param {string} status - New status
 * @param {string} userId - ID of user making the update
 * @returns {Promise<Object>} - Updated issue
 */
export const updateIssueStatus = async (issueId, status, userId) => {
  try {
    const issueRef = doc(db, 'issues', issueId);
    const issueSnap = await getDoc(issueRef);
    
    if (!issueSnap.exists()) {
      throw new Error(`Issue with ID ${issueId} not found`);
    }
    
    const issueData = issueSnap.data();
    const previousStatus = issueData.status;
    
    // Only create notification if status is actually changing
    if (status !== previousStatus) {
      const updateData = {
        status,
        updatedAt: serverTimestamp()
      };
      
      // Add resolution timestamp if resolving
      if (status === 'resolved' && previousStatus !== 'resolved') {
        updateData.adminResolutionTime = serverTimestamp();
      }
      
      await updateDoc(issueRef, updateData);
      
      // Get the updated issue
      const updatedIssueSnap = await getDoc(issueRef);
      const updatedIssue = {
        id: updatedIssueSnap.id,
        ...updatedIssueSnap.data()
      };
      
      // Create status change notification
      await createStatusChangeNotification(
        updatedIssue,
        previousStatus,
        status,
        userId
      );
      
      // Create resolution notification if issue was resolved
      if (status === 'resolved' && previousStatus !== 'resolved') {
        await createResolutionNotification(updatedIssue);
      }
      
      return updatedIssue;
    } else {
      console.log("Status unchanged, skipping notification");
      return {
        id: issueSnap.id,
        ...issueData
      };
    }
  } catch (error) {
    console.error("Error updating issue status:", error);
    throw error;
  }
};

/**
 * Assign an issue to an admin
 * @param {string} issueId - ID of the issue to assign
 * @param {string} adminId - ID of the admin to assign to
 * @returns {Promise<Object>} - Updated issue
 */
export const assignIssue = async (issueId, adminId) => {
  try {
    const issueRef = doc(db, 'issues', issueId);
    const issueSnap = await getDoc(issueRef);
    
    if (!issueSnap.exists()) {
      throw new Error(`Issue with ID ${issueId} not found`);
    }
    
    const issueData = issueSnap.data();
    
    // Only create notification if assignment is changing
    if (adminId !== issueData.assignedTo) {
      await updateDoc(issueRef, {
        assignedTo: adminId,
        assignedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Get the updated issue
      const updatedIssueSnap = await getDoc(issueRef);
      const updatedIssue = {
        id: updatedIssueSnap.id,
        ...updatedIssueSnap.data()
      };
      
      // Create assignment notification
      await createAssignmentNotification(updatedIssue, adminId);
      
      // Notify the student that their issue was assigned to someone
      await createNotification({
        type: 'issue',
        title: 'Your Issue Has Been Assigned',
        message: `Your issue "${updatedIssue.title}" has been assigned to an administrator.`,
        audience: ['student', updatedIssue.userId],
        actionUrl: `/issues/${updatedIssue.id}`,
        actionText: 'View Issue',
        relatedIssueId: updatedIssue.id
      });
      
      return updatedIssue;
    } else {
      console.log("Assignment unchanged, skipping notification");
      return {
        id: issueSnap.id,
        ...issueData
      };
    }
  } catch (error) {
    console.error("Error assigning issue:", error);
    throw error;
  }
};

// Users
export const getUsers = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
};

export const getUserById = async (id) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', id));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
};

// Categories
export const getCategories = async () => {
  // First define the default categories we'll use as fallback
  const defaultCategories = {
    main: mainCategories,
    sub: subCategories
  };

  try {
    // Skip initialization if no user is logged in
    if (!auth.currentUser) {
      console.log("No authenticated user, using default categories");
      return defaultCategories;
    }
    
    // Try to fetch categories from Firestore
    try {
      const categoriesDoc = await getDoc(doc(db, 'settings', 'categories'));
      
      if (categoriesDoc.exists()) {
        console.log("Successfully retrieved categories from Firestore");
        return categoriesDoc.data();
      }
      
      console.log("No categories document found in Firestore, using defaults");
      
      // Try to initialize categories in the database
      try {
        await initializeCategories();
        console.log("Categories initialized in database");
      } catch (initError) {
        console.error("Failed to initialize categories:", initError);
      }
    } catch (fetchError) {
      console.error("Error accessing Firestore categories:", fetchError);
    }
    
    // Return default categories if we couldn't fetch or initialize
    console.log("Using default categories");
    return defaultCategories;
  } catch (outerError) {
    console.error("Error in getCategories:", outerError);
    // Always fall back to defaults as a last resort
    return defaultCategories;
  }
};

export const updateCategories = async (categories) => {
  try {
    const settingsRef = doc(db, 'settings', 'categories');
    await setDoc(settingsRef, categories, { merge: true });
    return categories;
  } catch (error) {
    console.error("Error updating categories:", error);
    throw error;
  }
};