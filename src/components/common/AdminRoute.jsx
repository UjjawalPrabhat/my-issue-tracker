import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Debugging for admin role issues
  console.log("AdminRoute - User:", user);
  console.log("AdminRoute - Email:", user?.email);
  console.log("AdminRoute - Is admin email?", user?.email === 'iamujjawal4u@gmail.com');
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // ONLY allow iamujjawal4u@gmail.com as admin
  if (user.email !== 'iamujjawal4u@gmail.com' && user.role !== 'admin') {
    console.log("Not admin, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log("User is admin, showing admin page");
  return children;
};

export default AdminRoute;
