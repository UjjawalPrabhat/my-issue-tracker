import React from 'react';
import ProfileDropdown from '../../../components/common/ProfileDropdown';

const AdminHeader = ({ user, toggleSidebar, title }) => {
  return (
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
            <div className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-xs font-medium mr-2 flex items-center">
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              ADMIN
            </div>
            <span className="text-xl font-semibold text-gray-900">{title || 'Admin'}</span>
          </div>
        </div>
        
        {/* Admin Actions */}
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          
          {/* Profile Dropdown */}
          <ProfileDropdown user={user} />
        </div>
      </div>
      
      {/* Admin Banner */}
      <div className="bg-red-600 text-white text-center text-xs py-1">
        You are currently in Admin Mode - Actions taken here affect all users
      </div>
    </header>
  );
};

export default AdminHeader;
