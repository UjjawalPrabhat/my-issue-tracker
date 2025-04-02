import React from 'react';
import { Link } from 'react-router-dom';

const AdminSidebar = ({ collapsed, toggleSidebar }) => {
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Issues', path: '/admin/issues', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Users', path: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Categories', path: '/admin/categories', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
    { name: 'Settings', path: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { name: 'Go to App', path: '/dashboard', icon: 'M10 19l-7-7m0 0l7-7m-7 7h18' },
  ];

  return (
    <div 
      className={`bg-gray-800 text-white z-20 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      } fixed inset-y-0 left-0 lg:relative lg:translate-x-0 transform ${
        collapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
          {!collapsed ? (
            <div className="flex items-center">
              <span className="text-lg font-bold text-white">Admin Panel</span>
              <span className="bg-red-500 text-white text-xs font-bold rounded px-1.5 py-0.5 ml-2">
                ADMIN
              </span>
            </div>
          ) : (
            <span className="bg-red-500 text-white text-xs font-bold rounded px-1.5 py-0.5 mx-auto">
              A
            </span>
          )}
          <button
            onClick={toggleSidebar}
            className={`p-1 rounded-md text-gray-400 hover:text-white focus:outline-none ${collapsed ? 'hidden lg:block' : ''}`}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {collapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-3 py-3 text-sm font-medium rounded-md hover:bg-gray-700 transition-colors ${
                window.location.pathname === item.path ? 'bg-gray-700 text-white' : 'text-gray-300'
              }`}
            >
              <svg 
                className={`h-6 w-6 ${!collapsed ? 'mr-3' : 'mx-auto'}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} />
              </svg>
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Admin Info */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium">
                A
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-gray-400 truncate">admin@example.com</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;
