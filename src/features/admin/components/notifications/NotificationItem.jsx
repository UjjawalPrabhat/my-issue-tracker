import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { markAsRead } from '../../../../services/admin/notifications';

const NotificationItem = ({ notification }) => {
  const [isRead, setIsRead] = useState(notification.read);
  const navigate = useNavigate();
  
  // Function to format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = () => {
    const iconClass = "h-6 w-6";
    
    switch (notification.type) {
      case 'system':
        return (
          <div className="bg-blue-100 p-2 rounded-full">
            <svg className={`${iconClass} text-blue-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'issue':
        return (
          <div className="bg-yellow-100 p-2 rounded-full">
            <svg className={`${iconClass} text-yellow-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'user':
        return (
          <div className="bg-green-100 p-2 rounded-full">
            <svg className={`${iconClass} text-green-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="bg-red-100 p-2 rounded-full">
            <svg className={`${iconClass} text-red-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 p-2 rounded-full">
            <svg className={`${iconClass} text-gray-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };
  
  // Handle mark as read and navigation
  const handleClick = async () => {
    // Mark as read if not already read
    if (!isRead) {
      try {
        await markAsRead(notification.id);
        setIsRead(true);
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    }
    
    // Navigate to related issue if actionUrl exists
    if (notification.actionUrl) {
      console.log("Admin navigating to:", notification.actionUrl);
      navigate(notification.actionUrl);
    }
  };
  
  return (
    <div 
      className={`px-4 py-5 sm:px-6 hover:bg-gray-50 transition-colors cursor-pointer ${isRead ? '' : 'bg-blue-50'}`}
      onClick={handleClick}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-4">
          {getNotificationIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <p className={`text-sm font-medium ${isRead ? 'text-gray-800' : 'text-blue-800'}`}>
              {notification.title}
            </p>
            <p className="text-xs text-gray-500">
              {formatTimestamp(notification.timestamp)}
            </p>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {notification.message}
          </p>
          
          {/* Action buttons or links */}
          {notification.actionUrl && (
            <div className="mt-3">
              <Link
                to={notification.actionUrl}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering parent click handler
                  if (!isRead) {
                    markAsRead(notification.id)
                      .then(() => setIsRead(true))
                      .catch(err => console.error("Error marking notification as read:", err));
                  }
                  // Don't use navigate here - let the Link component handle it
                }}
              >
                {notification.actionText || 'View Details'}
              </Link>
            </div>
          )}
        </div>
        
        {/* Unread indicator */}
        {!isRead && (
          <div className="ml-4 flex-shrink-0">
            <div className="h-2 w-2 rounded-full bg-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
