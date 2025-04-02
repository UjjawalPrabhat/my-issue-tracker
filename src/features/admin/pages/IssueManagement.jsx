import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Sidebar from '../../../components/layout/Sidebar';
import ProfileDropdown from '../../../components/common/ProfileDropdown';
import StatusFilter from '../../../features/dashboard/components/StatusFilter';
import IssuesTable from '../components/IssuesTable';
import { getIssues } from '../../../services/api';

const IssueManagement = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const data = await getIssues();
        
        let filteredIssues = data;
        if (statusFilter !== 'all') {
          filteredIssues = filteredIssues.filter(issue => issue.status === statusFilter);
        }
        
        // Sort by date (newest first)
        filteredIssues.sort((a, b) => {
          const getTimestamp = (issue) => {
            if (issue.createdAt?.seconds) return issue.createdAt.seconds * 1000;
            if (issue.createdAt) return new Date(issue.createdAt).getTime();
            if (issue.submittedAt) return new Date(issue.submittedAt).getTime();
            return 0;
          };
          
          return getTimestamp(b) - getTimestamp(a);
        });
        
        setIssues(filteredIssues);
      } catch (err) {
        console.error("Error fetching issues:", err);
        setError("Failed to load issues");
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [statusFilter]);

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
                <span className="text-xl font-semibold text-blue-600">Issue Management</span>
              </div>
            </div>
            <ProfileDropdown user={user} />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Issues Section Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">All Issues</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage all student-submitted issues and track their status
                  </p>
                </div>
              </div>

              {/* Filters and Actions Row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
                <StatusFilter 
                  activeStatus={statusFilter} 
                  onStatusChange={handleStatusFilterChange} 
                />
                
                <div className="flex space-x-2">
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Export Data
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Filter by Date
                  </button>
                </div>
              </div>
            </div>
            
            {/* Issues Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <IssuesTable 
                issues={issues} 
                loading={loading} 
                error={error} 
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IssueManagement;
