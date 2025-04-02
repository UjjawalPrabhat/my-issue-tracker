import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Sidebar from '../../../components/layout/Sidebar';
import ProfileDropdown from '../../../components/common/ProfileDropdown';
import AdminNotificationsList from '../components/notifications/AdminNotificationsList';
import NotificationFilter from '../components/notifications/NotificationFilter';
import { getAdminNotifications, markAllAsRead } from '../../../services/admin/notifications';

const AdminNotificationsPage = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, system, issue
  const [timeRange, setTimeRange] = useState('all'); // all, today, week, month

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminNotifications();
        setNotifications(data);
        setFilteredNotifications(data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Apply filters when filter state changes
  useEffect(() => {
    if (!notifications.length) return;

    let filtered = [...notifications];
    
    // Apply type filter
    if (filter === 'unread') {
      filtered = filtered.filter(notification => !notification.read);
    } else if (filter !== 'all') {
      filtered = filtered.filter(notification => notification.type === filter);
    }
    
    // Apply time range filter
    if (timeRange !== 'all') {
      const now = new Date();
      let cutoffDate;
      
      if (timeRange === 'today') {
        cutoffDate = new Date(now.setHours(0, 0, 0, 0));
      } else if (timeRange === 'week') {
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
      } else if (timeRange === 'month') {
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
      }
      
      filtered = filtered.filter(notification => {
        const notificationDate = new Date(notification.timestamp);
        return notificationDate >= cutoffDate;
      });
    }
    
    // Always sort by date (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    setFilteredNotifications(filtered);
  }, [notifications, filter, timeRange]);

  // Handle filter changes
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };
  
  // Handle time range changes
  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
  };
  
  // Handle marking all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      // Update local state to mark all as read
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true
      }));
      setNotifications(updatedNotifications);
    } catch (err) {
      console.error("Error marking notifications as read:", err);
      setError("Failed to mark notifications as read");
    }
  };
  
  // Calculate unread count
  const unreadCount = notifications.filter(notification => !notification.read).length;

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
                <span className="text-xl font-semibold text-blue-600">Notification Center</span>
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
                  <h2 className="text-lg font-medium text-gray-900">Admin Notifications</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    View system alerts, user activities, and important updates
                  </p>
                  {unreadCount > 0 && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4 sm:mt-0">
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={unreadCount === 0}
                    className={`px-4 py-2 text-sm font-medium text-blue-600 bg-white rounded-md border border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      unreadCount === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
            </div>
            
            {/* Filter Section */}
            <div className="bg-white shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <NotificationFilter 
                  filter={filter} 
                  timeRange={timeRange}
                  onFilterChange={handleFilterChange}
                  onTimeRangeChange={handleTimeRangeChange}
                />
              </div>
            </div>
            
            {/* Notifications List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <AdminNotificationsList 
                notifications={filteredNotifications}
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

export default AdminNotificationsPage;
