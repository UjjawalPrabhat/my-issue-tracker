import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc,
  query, 
  where,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { createCommentNotification } from './notifications';
import { getIssueById } from './api';

// Get all comments for a specific issue
export const getComments = async (issueId) => {
  try {
    console.log("Fetching comments for issue:", issueId);
    
    // Basic query without orderBy for now
    const q = query(
      collection(db, 'comments'), 
      where('issueId', '==', issueId)
    );
    
    const snapshot = await getDocs(q);
    console.log(`Retrieved ${snapshot.docs.length} comments`);
    
    // Map and sort the comments client-side
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Simple client-side sort by timestamp
    comments.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aTime - bTime;
    });
    
    return comments;
  } catch (error) {
    console.error('Error getting comments:', error);
    console.error('Error details:', error.message);
    return [];
  }
};

/**
 * Add a comment to an issue
 * @param {string} issueId - ID of the issue
 * @param {Object} commentData - Comment data (content, userId, userName, etc.)
 * @returns {Promise<Object>} - The created comment
 */
export const addComment = async (issueId, commentData) => {
  try {
    console.log(`Adding comment to issue ${issueId}`);
    
    // Get the current issue to include in notification
    const issue = await getIssueById(issueId);
    
    if (!issue) {
      throw new Error(`Issue with ID ${issueId} not found`);
    }
    
    const commentsRef = collection(db, 'issues', issueId, 'comments');
    
    const commentWithTimestamp = {
      ...commentData,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(commentsRef, commentWithTimestamp);
    
    const addedComment = {
      id: docRef.id,
      ...commentWithTimestamp,
      createdAt: new Date() // Use JS Date for immediate display
    };
    
    // Create comment notification
    await createCommentNotification(issue, addedComment);
    
    return addedComment;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (commentId) => {
  try {
    await deleteDoc(doc(db, 'comments', commentId));
    return true;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};
