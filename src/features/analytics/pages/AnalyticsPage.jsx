import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Sidebar from '../../../components/layout/Sidebar';
import ProfileDropdown from '../../../components/common/ProfileDropdown';
import ErrorBoundary from '../../../components/common/ErrorBoundary';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [issuesData, setIssuesData] = useState({
    totalIssues: 0,
    openIssues: 0,
    resolvedIssues: 0,
    byCategory: {},
    byStatus: {},
    byPriority: {},
    timeToResolve: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading analytics data
    setIsLoading(true);
    setTimeout(() => {
      const storedIssues = localStorage.getItem('issues');
      if (storedIssues) {
        const issues = JSON.parse(storedIssues);
        
        // Calculate analytics
        const analytics = {
          totalIssues: issues.length,
          openIssues: issues.filter(issue => issue.status === 'open').length,
          resolvedIssues: issues.filter(issue => issue.status === 'resolved').length,
          byCategory: {},
          byStatus: {
            open: 0,
            'in-progress': 0,
            resolved: 0,
            closed: 0
          },
          byPriority: {
            low: 0,
            medium: 0,
            high: 0,
            critical: 0
          },
          timeToResolve: []
        };

        // Count issues by category
        issues.forEach(issue => {
          // Category counts
          if (issue.category) {
            const category = issue.category.split('-')[0]; // Get main category
            analytics.byCategory[category] = (analytics.byCategory[category] || 0) + 1;
          }

          // Status counts
          if (issue.status) {
            analytics.byStatus[issue.status] = (analytics.byStatus[issue.status] || 0) + 1;
          }

          // Priority counts
          if (issue.priority) {
            analytics.byPriority[issue.priority] = (analytics.byPriority[issue.priority] || 0) + 1;
          }
        });

        setIssuesData(analytics);
      }
      setIsLoading(false);
    }, 800);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Helper to calculate percentage
  const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
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
                <span className="text-xl font-semibold text-blue-600">Analytics</span>
                <span className="text-xl font-semibold text-gray-800 ml-1">Dashboard</span>
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
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-3 text-sm text-gray-500">Loading analytics...</p>
                </div>
              ) : (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <h3 className="text-lg font-medium text-gray-900">Total Issues</h3>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{issuesData.totalIssues}</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <h3 className="text-lg font-medium text-gray-900">Open Issues</h3>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{issuesData.openIssues}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {calculatePercentage(issuesData.openIssues, issuesData.totalIssues)}% of total
                      </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <h3 className="text-lg font-medium text-gray-900">Resolved Issues</h3>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{issuesData.resolvedIssues}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {calculatePercentage(issuesData.resolvedIssues, issuesData.totalIssues)}% of total
                      </p>
                    </div>
                  </div>

                  {/* Status Distribution */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Status Distribution</h3>
                    <div className="space-y-4">
                      {Object.entries(issuesData.byStatus).map(([status, count]) => (
                        <div key={status}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 capitalize">{status.replace('-', ' ')}</span>
                            <span className="text-sm font-medium text-gray-700">
                              {calculatePercentage(count, issuesData.totalIssues)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                status === 'open' ? 'bg-yellow-500' :
                                status === 'in-progress' ? 'bg-blue-500' :
                                status === 'resolved' ? 'bg-green-500' :
                                'bg-gray-500'
                              }`} 
                              style={{ width: `${calculatePercentage(count, issuesData.totalIssues)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category Distribution & Priority Distribution */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Category Distribution */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Issues by Category</h3>
                      <div className="space-y-4">
                        {Object.entries(issuesData.byCategory).map(([category, count]) => (
                          <div key={category}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700 capitalize">{category}</span>
                              <span className="text-sm font-medium text-gray-700">
                                {calculatePercentage(count, issuesData.totalIssues)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${calculatePercentage(count, issuesData.totalIssues)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Priority Distribution */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Issues by Priority</h3>
                      <div className="space-y-4">
                        {Object.entries(issuesData.byPriority).map(([priority, count]) => (
                          <div key={priority}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700 capitalize">{priority}</span>
                              <span className="text-sm font-medium text-gray-700">
                                {calculatePercentage(count, issuesData.totalIssues)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  priority === 'low' ? 'bg-green-500' :
                                  priority === 'medium' ? 'bg-yellow-500' :
                                  priority === 'high' ? 'bg-orange-500' :
                                  'bg-red-500'
                                }`} 
                                style={{ width: `${calculatePercentage(count, issuesData.totalIssues)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Note about analytics */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                    <p className="text-sm text-blue-800">
                      In a production environment, this section would include more detailed charts and trend analysis.
                    </p>
                  </div>
                </>
              )}
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default AnalyticsPage;
