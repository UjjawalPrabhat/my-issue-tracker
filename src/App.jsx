import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';

// Landing
import LandingPage from './features/landing/pages/LandingPage';

// Auth
import LoginPage from './features/auth/pages/LoginPage';

// Student features
import DashboardPage from './features/dashboard/pages/DashboardPage';
import MyIssuesPage from './features/student/pages/MyIssuesPage';

// Admin features
import AdminDashboard from './features/admin/pages/AdminDashboard';
import IssueManagement from './features/admin/pages/IssueManagement';
import UserManagement from './features/admin/pages/UserManagement';
import CategoryManagement from './features/admin/pages/CategoryManagement';
import AdminSettings from './features/admin/pages/AdminSettings';

// Common features
import ProfilePage from './features/user/pages/ProfilePage';
import SettingsPage from './features/settings/pages/SettingsPage';
import AnalyticsPage from './features/analytics/pages/AnalyticsPage';
import NotificationsPage from './features/notifications/pages/NotificationsPage';

// Components
import AdminRoute from './components/common/AdminRoute';

// Import issue detail page
import IssueDetailPage from './features/issues/pages/IssueDetailPage';

// Import initialization functions
import { initializeFirestore } from './utils/setupFirestore';
import { initializeAppData } from './utils/createInitialData';
import { useEffect } from 'react';

// Import admin analytics page
import AdminAnalyticsPage from './features/analytics/pages/AdminAnalyticsPage';

// Import the new AdminNotificationsPage
import AdminNotificationsPage from './features/admin/pages/AdminNotificationsPage';

// Protect routes that require authentication
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// Redirect to admin dashboard if user is admin, otherwise to student dashboard
const DashboardRoute = ({ children }) => {
  const { user } = useAuth();
  
  // Enhanced debugging
  console.log("DashboardRoute - User object:", JSON.stringify(user, null, 2));
  console.log("User role:", user?.role);
  console.log("User email:", user?.email);
  console.log("Is admin?", user?.role === 'admin');
  console.log("Is admin email?", user?.email === 'iamujjawal4u@gmail.com');
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // ONLY iamujjawal4u@gmail.com should be admin
  if (user.email === 'iamujjawal4u@gmail.com' || user.role === 'admin') {
    console.log("Redirecting to admin dashboard (specific email match)");
    return <Navigate to="/admin" replace />;
  }
  
  console.log("Rendering student dashboard (not admin email)");
  return children;
};

function App() {
  // Initialize app data and Firestore collections after authentication
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // First initialize Firestore collections
        await initializeFirestore();
        
        // Then initialize app data (categories, etc.)
        await initializeAppData();
      } catch (error) {
        console.error("Error initializing application:", error);
      }
    };
    
    initializeApp();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <NotificationsProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes with admin redirect */}
            <Route 
              path="/dashboard" 
              element={
                <DashboardRoute>
                  <DashboardPage />
                </DashboardRoute>
              } 
            />
            
            {/* Issue Detail Page */}
            <Route
              path="/issues/:id"
              element={
                <PrivateRoute>
                  <IssueDetailPage />
                </PrivateRoute>
              }
            />
            
            {/* Other protected routes */}
            <Route 
              path="/my-issues" 
              element={
                <PrivateRoute>
                  <MyIssuesPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <PrivateRoute>
                  <AnalyticsPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <PrivateRoute>
                  <NotificationsPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/issues" 
              element={
                <AdminRoute>
                  <IssueManagement />
                </AdminRoute>
              } 
            />
            {/* Add specific route for admin issue details */}
            <Route 
              path="/admin/issues/:id" 
              element={
                <AdminRoute>
                  <IssueDetailPage isAdminView={true} />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/categories" 
              element={
                <AdminRoute>
                  <CategoryManagement />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <AdminRoute>
                  <AdminSettings />
                </AdminRoute>
              } 
            />

            {/* Admin Analytics Route */}
            <Route 
              path="/admin/analytics" 
              element={
                <AdminRoute>
                  <AdminAnalyticsPage />
                </AdminRoute>
              } 
            />

            {/* Fallback - Redirect to dashboard if logged in, otherwise to login page */}
            <Route 
              path="*" 
              element={
                <PrivateRoute>
                  <Navigate to="/dashboard" replace />
                </PrivateRoute>
              } 
            />
          </Routes>
        </NotificationsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
