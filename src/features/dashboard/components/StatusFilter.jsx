import React from 'react';

const StatusFilter = ({ activeStatus = 'all', onStatusChange }) => {
  const statuses = [
    { id: 'all', label: 'All Issues' },
    { id: 'open', label: 'Open' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'resolved', label: 'Resolved' },
    { id: 'closed', label: 'Closed' }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <button
          key={status.id}
          onClick={() => onStatusChange(status.id)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
            activeStatus === status.id
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {status.label}
        </button>
      ))}
    </div>
  );
};

export default StatusFilter;
