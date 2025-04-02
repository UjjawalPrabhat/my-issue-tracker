import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Sidebar from '../../../components/dashboard/Sidebar.jsx';
import ProfileDropdown from '../../../components/common/ProfileDropdown';
import IssuesList from '../../../components/dashboard/IssuesList';
import StatusFilter from '../../../components/forms/StatusFilter';
import ErrorBoundary from '../../../components/common/ErrorBoundary';

const MyIssuesPage = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeStatus, setActiveStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data (in a real app, this would be an API call)
    setIsLoading(true);
    setTimeout(() => {
      const storedIssues = localStorage.getItem('issues');
      if (storedIssues) {
        const parsedIssues = JSON.parse(storedIssues);
        // Filter only the user's issues
        const userIssues = parsedIssues.filter(issue => {
          if (!user) return false;
          
          // Check if the user is the creator (simple check based on email)
          if (typeof issue.createdBy === 'object' && issue.createdBy.email === user.email) {
            return true;
          }
          // For string-based createdBy fields
          if (typeof issue.createdBy === 'string' && issue.createdBy === user.email) {
            return true;
          }
          return false;
        });
        
        setIssues(userIssues);
        setFilteredIssues(userIssues);
      }
      setIsLoading(false);
    }, 800);
  }, [user]);

  useEffect(() => {
    // Filter issues based on status and search query
    let result = [...issues];
    
    if (activeStatus !== 'all') {
      result = result.filter(issue => issue.status === activeStatus);
    }
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        issue => 
          issue.title.toLowerCase().includes(lowerQuery) || 
          issue.description.toLowerCase().includes(lowerQuery)
      );
    }
    
    setFilteredIssues(result);
  }, [issues, activeStatus, searchQuery]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleStatusChange = (status) => {
    setActiveStatus(status);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
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
                <span className="text-xl font-semibold text-blue-600">My</span>
                <span className="text-xl font-semibold text-gray-800 ml-1">Issues</span>
              </div>
            </div>
            
            {/* Profile Dropdown */}
            <ProfileDropdown user={user} />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* User Issues Section */}
            <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-800">My Submitted Issues</h2>
                
                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full sm:w-auto">
                    <input
                      type="search"
                      placeholder="Search my issues..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="w-full sm:w-64 pr-8 pl-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute right-3 top-2.5 text-gray-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <StatusFilter 
                    activeStatus={activeStatus} 
                    onStatusChange={handleStatusChange} 
                  />
                </div>
              </div>
              
              {/* Loading State */}
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-3 text-sm text-gray-500">Loading your issues...</p>
                </div>
              ) : (
                /* Issues List */
                <ErrorBoundary>
                  <IssuesList issues={filteredIssues} />
                </ErrorBoundary>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyIssuesPage;
