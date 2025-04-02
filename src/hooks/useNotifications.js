import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Custom hook to listen for notifications in real-time
 * @param {string} userId - User ID to get notifications for
 * @param {string} role - User role ('admin' or 'student')
 * @returns {Object} - Notifications data and status
 */
const useNotifications = (userId, role) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !role) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a query based on user role
      let notificationsQuery;
      
      if (role === 'admin') {
        // Admin sees all admin-targeted notifications
        notificationsQuery = query(
          collection(db, 'notifications'),
          where('audience', 'array-contains', 'admin'),
          orderBy('timestamp', 'desc')
        );
      } else {
        // Students see notifications specifically for them plus general student notifications
        notificationsQuery = query(
          collection(db, 'notifications'),
          where('audience', 'array-contains-any', ['student', userId]),
          orderBy('timestamp', 'desc')
        );
      }
      
      // Set up real-time listener
      const unsubscribe = onSnapshot(
        notificationsQuery,
        (snapshot) => {
          // Process notifications
          const notificationsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
          }));
          
          setNotifications(notificationsData);
          setUnreadCount(notificationsData.filter(n => !n.read).length);
          setLoading(false);
        },
        (err) => {
          console.error("Error in notifications listener:", err);
          setError("Failed to listen for notifications");
          setLoading(false);
        }
      );
      
      // Clean up listener on unmount
      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up notifications listener:", err);
      setError("Failed to set up notifications listener");
      setLoading(false);
    }
  }, [userId, role]);

  return { notifications, unreadCount, loading, error };
};

export default useNotifications;
