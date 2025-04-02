import React from 'react';

const ResponseTimeCard = ({ days }) => {
  // Determine color based on resolution time (lower is better)
  const getColorClass = () => {
    if (days <= 2) return 'bg-green-500';
    if (days <= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Format days with appropriate rounding
  const formatDays = () => {
    if (isNaN(days) || days === 0) return '0';
    if (days < 1) {
      const hours = Math.round(days * 24);
      return `${hours} hr${hours !== 1 ? 's' : ''}`;
    }
    return days.toFixed(1);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${getColorClass()} rounded-md p-3`}>
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                Avg. Resolution Time
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatDays()}
                </div>
                <div className="ml-2 text-sm text-gray-500">
                  {days >= 1 ? 'days' : ''}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseTimeCard;
