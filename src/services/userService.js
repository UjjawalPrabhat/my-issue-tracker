import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../config/firebase";

const userCollection = collection(db, "users");

export const getUserById = async (userId) => {
  if (!userId) throw new Error("User ID is required");
  
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }
    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const getUsersByRole = async (role) => {
  try {
    const q = query(userCollection, where("role", "==", role));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching users by role:", error);
    throw error;
  }
};

export const updateUserPreferences = async (userId, preferences) => {
  if (!userId) throw new Error("User ID is required");
  
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      preferences: preferences,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating user preferences:", error);
    throw error;
  }
};

export const updateLastActive = async (userId) => {
  if (!userId) throw new Error("User ID is required");
  
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      lastActive: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating last active:", error);
    throw error;
  }
};
