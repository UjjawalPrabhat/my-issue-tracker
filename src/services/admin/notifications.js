import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  updateDoc,
  writeBatch,
  Timestamp,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '../../config/firebase';

/**
 * Fetch notifications for admin users
 * @returns {Promise<Array>} - Array of notifications
 */
export const getAdminNotifications = async () => {
  try {
    console.log("Fetching admin notifications");
    
    // Query notifications collection for admin notifications
    const q = query(
      collection(db, 'notifications'),
      where('audience', 'array-contains', 'admin'),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    // Transform data for frontend
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp // Handle Firestore timestamps
    }));
    
    console.log(`Retrieved ${notifications.length} admin notifications`);
    return notifications;
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    throw new Error("Failed to load notifications. Please try again later.");
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - ID of the notification to mark as read
 * @returns {Promise<void>}
 */
export const markAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });
    console.log(`Marked notification ${notificationId} as read`);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<void>}
 */
export const markAllAsRead = async () => {
  try {
    // Get all unread admin notifications
    const q = query(
      collection(db, 'notifications'),
      where('audience', 'array-contains', 'admin'),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log("No unread notifications to mark as read");
      return;
    }
    
    // Use batch write for better performance
    const batch = writeBatch(db);
    
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        readAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log(`Marked ${snapshot.docs.length} notifications as read`);
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * Create a new notification
 * This could be called from various parts of the application
 * @param {Object} notification - Notification object
 * @returns {Promise<Object>} - Created notification
 */
export const createNotification = async (notification) => {
  try {
    // Add default fields
    const notificationData = {
      ...notification,
      read: false,
      timestamp: serverTimestamp(),
      audience: notification.audience || ['admin'], // Default to admin
    };
    
    const docRef = await addDoc(collection(db, 'notifications'), notificationData);
    console.log(`Created notification with ID: ${docRef.id}`);
    
    return {
      id: docRef.id,
      ...notificationData,
      timestamp: new Date()
    };
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Mock data for development (if your Firestore isn't set up yet)
export const getMockNotifications = () => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 3600000);
  const oneDayAgo = new Date(now.getTime() - 86400000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 86400000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);
  
  return [
    {
      id: '1',
      type: 'system',
      title: 'System Maintenance Completed',
      message: 'The scheduled system maintenance has been completed successfully.',
      timestamp: oneHourAgo,
      read: false,
      audience: ['admin']
    },
    {
      id: '2',
      type: 'issue',
      title: 'High Priority Issue Reported',
      message: 'A new high priority issue has been reported in the technology category.',
      timestamp: oneDayAgo,
      read: true,
      audience: ['admin'],
      actionUrl: '/admin/issues',
      actionText: 'View Issue'
    },
    {
      id: '3',
      type: 'user',
      title: 'New User Registration',
      message: 'A new admin user has been registered in the system.',
      timestamp: twoDaysAgo,
      read: false,
      audience: ['admin'],
      actionUrl: '/admin/users',
      actionText: 'View User'
    },
    {
      id: '4',
      type: 'error',
      title: 'Database Connection Error',
      message: 'There was a temporary database connection issue that has been resolved.',
      timestamp: oneWeekAgo,
      read: true,
      audience: ['admin']
    }
  ];
};
