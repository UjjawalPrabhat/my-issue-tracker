import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Sidebar from '../../../components/layout/Sidebar';
import ProfileDropdown from '../../../components/common/ProfileDropdown';
import ErrorBoundary from '../../../components/common/ErrorBoundary';
import CreateIssueButton from '../components/CreateIssueButton';
import IssuesList from '../components/IssuesList';
import StatsSection from '../components/StatsSection';
import StatusFilter from '../components/StatusFilter';
import ProfileCompletionPrompt from '../../../components/onboarding/ProfileCompletionPrompt';

const DashboardPage = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);

  useEffect(() => {
    // Check if the user has completed their profile
    if (user && user.role === 'student') {
      // Check for all required fields except roll number
      // Roll number should be automatically extracted from email
      const hasRequiredFields = 
        user.roomNumber && 
        user.year && 
        user.semester;
      
      setShowProfilePrompt(!hasRequiredFields);
    }
  }, [user]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const handleProfileComplete = (profileData) => {
    console.log("Profile completed:", profileData);
    setShowProfilePrompt(false);
    // You could refresh user data here if needed
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar collapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center ml-2 lg:ml-0">
                <span className="text-xl font-semibold text-blue-600">Dashboard</span>
              </div>
            </div>
            
            {/* Profile Dropdown */}
            <ProfileDropdown user={user} />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-8">
          <ErrorBoundary>
            <div className="max-w-7xl mx-auto">
              {/* Stats Section */}
              <StatsSection />
              
              {/* Actions and Filters Row */}
              <div className="mt-8 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <StatusFilter 
                  activeStatus={statusFilter} 
                  onStatusChange={handleStatusFilterChange} 
                />
                <CreateIssueButton />
              </div>
              
              {/* Issues List */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <IssuesList statusFilter={statusFilter} />
              </div>
            </div>
          </ErrorBoundary>
        </main>
        
        {/* Profile Completion Prompt */}
        {showProfilePrompt && (
          <ProfileCompletionPrompt onComplete={handleProfileComplete} />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
