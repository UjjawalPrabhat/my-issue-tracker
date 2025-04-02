import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";
import { db } from "../config/firebase";

const issuesCollection = collection(db, "issues");

// Create a new issue
export const createIssue = async (issueData) => {
  try {
    // Add server timestamp for consistent sorting
    const issueWithTimestamp = {
      ...issueData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: issueData.status || 'open'
    };
    
    const docRef = await addDoc(issuesCollection, issueWithTimestamp);
    return { id: docRef.id, ...issueWithTimestamp };
  } catch (error) {
    console.error("Error creating issue:", error);
    throw error;
  }
};

// Get all issues
export const getAllIssues = async () => {
  try {
    const q = query(issuesCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firebase timestamps to ISO strings for consistency
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString() || new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error fetching issues:", error);
    throw error;
  }
};

// Get issues by user email
export const getIssuesByUser = async (userEmail) => {
  try {
    const q = query(
      issuesCollection, 
      where("createdBy.email", "==", userEmail),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firebase timestamps to ISO strings
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString() || new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error fetching user issues:", error);
    throw error;
  }
};

// Update issue status
export const updateIssueStatus = async (issueId, newStatus) => {
  try {
    const issueRef = doc(db, "issues", issueId);
    await updateDoc(issueRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating issue status:", error);
    throw error;
  }
};

// Get an issue by ID
export const getIssueById = async (issueId) => {
  try {
    const issueRef = doc(db, "issues", issueId);
    const issueSnap = await getDoc(issueRef);
    
    if (!issueSnap.exists()) {
      throw new Error("Issue not found");
    }
    
    const issueData = issueSnap.data();
    return {
      id: issueSnap.id,
      ...issueData,
      createdAt: issueData.createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: issueData.updatedAt?.toDate().toISOString() || new Date().toISOString()
    };
  } catch (error) {
    console.error("Error fetching issue:", error);
    throw error;
  }
};

// Subscribe to issues changes (real-time updates)
export const subscribeToIssues = (callback) => {
  const q = query(issuesCollection, orderBy("createdAt", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const issues = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString() || new Date().toISOString()
    }));
    callback(issues);
  }, (error) => {
    console.error("Error in issues subscription:", error);
  });
};

// Subscribe to user's issues changes (real-time updates)
export const subscribeToUserIssues = (userEmail, callback) => {
  const q = query(
    issuesCollection, 
    where("createdBy.email", "==", userEmail),
    orderBy("createdAt", "desc")
  );
  
  return onSnapshot(q, (snapshot) => {
    const issues = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString() || new Date().toISOString()
    }));
    callback(issues);
  }, (error) => {
    console.error("Error in user issues subscription:", error);
  });
};
