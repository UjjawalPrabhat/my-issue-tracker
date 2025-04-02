import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Get notifications for a user
 * @param {string} userId - User ID
 * @param {string} role - User role (admin or student)
 * @returns {Promise<Array>} - Array of notifications
 */
export const getUserNotifications = async (userId, role) => {
  try {
    console.log(`Getting notifications for ${role} user ${userId}`);
    
    let q;
    if (role === 'admin') {
      // Admins see all admin notifications
      q = query(
        collection(db, 'notifications'),
        where('audience', 'array-contains', 'admin'),
        orderBy('timestamp', 'desc')
      );
    } else {
      // Students see their personal notifications + general student notifications
      q = query(
        collection(db, 'notifications'),
        where('audience', 'array-contains-any', ['student', userId]),
        orderBy('timestamp', 'desc')
      );
    }
    
    const snapshot = await getDocs(q);
    
    // Process notifications
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || new Date()
    }));
    
    console.log(`Found ${notifications.length} notifications for ${role} ${userId}`);
    return notifications;
  } catch (error) {
    console.error("Error getting user notifications:", error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - ID of notification to mark as read
 * @returns {Promise<void>}
 */
export const markAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @param {string} role - User role (admin or student)
 * @returns {Promise<void>}
 */
export const markAllAsRead = async (userId, role) => {
  try {
    let q;
    if (role === 'admin') {
      q = query(
        collection(db, 'notifications'),
        where('audience', 'array-contains', 'admin'),
        where('read', '==', false)
      );
    } else {
      q = query(
        collection(db, 'notifications'),
        where('audience', 'array-contains-any', ['student', userId]),
        where('read', '==', false)
      );
    }
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return;
    }
    
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        readAt: serverTimestamp()
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * Create a notification in Firestore
 * @param {Object} notification - Notification object
 * @returns {Promise<Object>} - Created notification
 */
export const createNotification = async (notification) => {
  try {
    // Validate required fields
    if (!notification.title || !notification.message || !notification.audience) {
      throw new Error("Missing required notification fields");
    }
    
    // Ensure actionUrl is properly formed if relatedIssueId exists
    if (notification.relatedIssueId && !notification.actionUrl) {
      // Create default actionUrl based on audience
      if (notification.audience.includes('admin')) {
        notification.actionUrl = `/admin/issues/${notification.relatedIssueId}`;
      } else {
        notification.actionUrl = `/issues/${notification.relatedIssueId}`;
      }
    }
    
    // Make sure we use server timestamp for consistent date handling
    const notificationData = {
      ...notification,
      read: false,
      timestamp: serverTimestamp()
    };
    
    // Make sure audience is an array
    if (!Array.isArray(notificationData.audience)) {
      notificationData.audience = [notificationData.audience];
    }
    
    const docRef = await addDoc(collection(db, 'notifications'), notificationData);
    console.log(`Created notification with ID: ${docRef.id}`);
    
    return {
      id: docRef.id,
      ...notificationData,
      timestamp: new Date() // Use JS Date for immediate display
    };
  } catch (error) {
    console.error("Error creating notification:", error);
    // Don't throw the error, just return null to prevent blocking the main flow
    return null;
  }
};

/**
 * Create a notification for issue status changes
 * @param {Object} issue - The issue that was updated
 * @param {string} previousStatus - The previous status
 * @param {string} newStatus - The new status
 * @param {string} updatedBy - ID of the user who updated the issue
 * @returns {Promise<Object>} - Created notification
 */
export const createStatusChangeNotification = async (issue, previousStatus, newStatus, updatedBy) => {
  try {
    // Determine audience based on issue
    // If admin made the change, notify the student who created the issue
    // If student made the change, notify admins
    const isAdminUpdate = updatedBy !== issue.userId;
    
    const audience = isAdminUpdate 
      ? ['student', issue.userId] // Notify the student who created the issue
      : ['admin']; // Notify admins
    
    // Ensure we have the correct path based on audience
    const actionUrl = isAdminUpdate 
      ? `/issues/${issue.id}` // Student views regular issue page
      : `/admin/issues/${issue.id}`; // Admin views admin issue page
    
    const notification = {
      type: 'issue',
      title: `Issue Status Updated: ${issue.title}`,
      message: `The status of issue "${issue.title}" has been updated from ${previousStatus} to ${newStatus}.`,
      audience,
      actionUrl,
      actionText: 'View Issue',
      relatedIssueId: issue.id,
      updatedBy
    };
    
    return await createNotification(notification);
  } catch (error) {
    console.error("Error creating status change notification:", error);
    throw error;
  }
};

/**
 * Create a notification for new comments
 * @param {Object} issue - The issue that received a comment
 * @param {Object} comment - The comment that was added
 * @returns {Promise<Object>} - Created notification
 */
export const createCommentNotification = async (issue, comment) => {
  try {
    // If admin commented, notify the student
    // If student commented, notify admins
    const isAdminComment = comment.userRole === 'admin';
    
    const audience = isAdminComment 
      ? ['student', issue.userId] // Notify the student who created the issue
      : ['admin']; // Notify admins
    
    const notification = {
      type: 'issue',
      title: `New Comment on Issue: ${issue.title}`,
      message: `${comment.userName || 'Someone'} commented: "${comment.content.substring(0, 50)}${comment.content.length > 50 ? '...' : ''}"`,
      audience,
      actionUrl: isAdminComment ? `/issues/${issue.id}` : `/admin/issues/${issue.id}`,
      actionText: 'View Comment',
      relatedIssueId: issue.id,
      relatedCommentId: comment.id
    };
    
    return await createNotification(notification);
  } catch (error) {
    console.error("Error creating comment notification:", error);
    throw error;
  }
};

/**
 * Create a notification for issue assignment
 * @param {Object} issue - The issue that was assigned
 * @param {string} adminId - ID of the admin it was assigned to
 * @returns {Promise<Object>} - Created notification
 */
export const createAssignmentNotification = async (issue, adminId) => {
  try {
    const notification = {
      type: 'issue',
      title: `Issue Assigned: ${issue.title}`,
      message: `You have been assigned to handle issue "${issue.title}".`,
      audience: ['admin', adminId], // Target specific admin
      actionUrl: `/admin/issues/${issue.id}`,
      actionText: 'View Issue',
      relatedIssueId: issue.id
    };
    
    return await createNotification(notification);
  } catch (error) {
    console.error("Error creating assignment notification:", error);
    throw error;
  }
};

/**
 * Create a notification for issue resolution
 * @param {Object} issue - The issue that was resolved
 * @returns {Promise<Object>} - Created notification
 */
export const createResolutionNotification = async (issue) => {
  try {
    const notification = {
      type: 'issue',
      title: `Issue Resolved: ${issue.title}`,
      message: `Your issue "${issue.title}" has been marked as resolved.`,
      audience: ['student', issue.userId], // Notify the student who created the issue
      actionUrl: `/issues/${issue.id}`,
      actionText: 'View Details',
      relatedIssueId: issue.id
    };
    
    return await createNotification(notification);
  } catch (error) {
    console.error("Error creating resolution notification:", error);
    throw error;
  }
};
