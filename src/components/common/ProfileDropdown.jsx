import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationsContext';

const ProfileDropdown = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  
  const isAdmin = user?.role === 'admin' || user?.email === 'iamujjawal4u@gmail.com';
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      logout();
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  // Get first name only
  const getFirstName = () => {
    if (!user) return '';
    const displayName = user.displayName || '';
    return displayName.split(' ')[0];
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center space-x-4">
        {/* Notifications Link */}
        <Link to="/notifications" className="relative text-gray-500 hover:text-blue-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          
          {/* Notification Counter Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        
        {/* Profile Dropdown */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-sm text-gray-700 hover:text-blue-600 focus:outline-none"
        >
          <span className="hidden md:inline-block">{getFirstName()}</span>
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="h-8 w-8 rounded-full" />
            ) : (
              <svg className="h-5 w-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </button>
      </div>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.displayName}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          
          <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Your Profile
          </Link>
          
          <Link
            to="/notifications"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </Link>
          
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
