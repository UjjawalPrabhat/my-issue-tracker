import React from 'react';

const NotificationFilter = ({ filter, timeRange, onFilterChange, onTimeRangeChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Type Filter */}
      <div>
        <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Type
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 text-sm rounded-full ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange('unread')}
            className={`px-3 py-1.5 text-sm rounded-full ${
              filter === 'unread'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => onFilterChange('system')}
            className={`px-3 py-1.5 text-sm rounded-full ${
              filter === 'system'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            System
          </button>
          <button
            onClick={() => onFilterChange('issue')}
            className={`px-3 py-1.5 text-sm rounded-full ${
              filter === 'issue'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            Issues
          </button>
          <button
            onClick={() => onFilterChange('user')}
            className={`px-3 py-1.5 text-sm rounded-full ${
              filter === 'user'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            User Activity
          </button>
        </div>
      </div>
      
      {/* Time Range Filter */}
      <div>
        <label htmlFor="time-filter" className="block text-sm font-medium text-gray-700 mb-1">
          Time Range
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onTimeRangeChange('all')}
            className={`px-3 py-1.5 text-sm rounded-full ${
              timeRange === 'all'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => onTimeRangeChange('today')}
            className={`px-3 py-1.5 text-sm rounded-full ${
              timeRange === 'today'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => onTimeRangeChange('week')}
            className={`px-3 py-1.5 text-sm rounded-full ${
              timeRange === 'week'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => onTimeRangeChange('month')}
            className={`px-3 py-1.5 text-sm rounded-full ${
              timeRange === 'month'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationFilter;
