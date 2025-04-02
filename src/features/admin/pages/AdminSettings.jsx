import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Sidebar from '../../../components/layout/Sidebar';
import ProfileDropdown from '../../../components/common/ProfileDropdown';

const AdminSettings = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
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
                <span className="text-xl font-semibold text-blue-600">Admin Settings</span>
              </div>
            </div>
            <ProfileDropdown user={user} />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">System Settings</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Configure application settings and behaviors
                  </p>
                </div>
              </div>
            </div>
            
            {/* Content will be added here */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
              <p className="text-gray-500">Admin settings interface is coming soon.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
