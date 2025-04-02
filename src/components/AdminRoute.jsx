import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  
  // Check if user is logged in and is an admin
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // If user is not an admin, redirect to dashboard
  if (!isAdmin()) {
    return <Navigate to="/dashboard" />;
  }
  
  // If user is an admin, render the children
  return children;
};

export default AdminRoute;
