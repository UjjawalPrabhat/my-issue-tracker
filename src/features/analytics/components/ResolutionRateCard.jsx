import React from 'react';

const ResolutionRateCard = ({ rate }) => {
  // Determine color based on resolution rate
  const getColorClass = () => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${getColorClass()} rounded-md p-3`}>
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                Resolution Rate
              </dt>
              <dd>
                <div className="text-2xl font-semibold text-gray-900">
                  {rate.toFixed(1)}%
                </div>
              </dd>
            </dl>
          </div>
        </div>
        <div className="mt-4">
          <div className="relative h-2 overflow-hidden rounded-full bg-gray-200">
            <div 
              className={`absolute h-full ${getColorClass()}`} 
              style={{ width: `${Math.min(rate, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResolutionRateCard;
