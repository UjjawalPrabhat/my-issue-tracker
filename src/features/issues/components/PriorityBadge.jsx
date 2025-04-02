import React from 'react';

const PriorityBadge = ({ priority }) => {
  const getPriorityStyles = () => {
    switch (priority?.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'urgent':
        return 'bg-red-100 text-red-800 border border-red-400';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const displayPriority = priority 
    ? priority.charAt(0).toUpperCase() + priority.slice(1) 
    : 'Unknown';

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityStyles()}`}>
      {displayPriority}
    </span>
  );
};

export default PriorityBadge;
