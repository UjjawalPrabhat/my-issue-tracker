import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
// Rename the imported hook to avoid naming conflict
import useNotificationsData from '../hooks/useNotifications';

// Create context
const NotificationsContext = createContext();

// Custom hook to use the notifications context
export const useNotifications = () => useContext(NotificationsContext);

// Provider component
export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.email === 'iamujjawal4u@gmail.com';
  
  // Use our real-time notifications hook with the renamed import
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error 
  } = useNotificationsData(
    user?.uid, 
    isAdmin ? 'admin' : 'student'
  );
  
  // Provide the notifications data to all children
  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        isAdmin
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
