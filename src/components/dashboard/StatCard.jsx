import React from 'react';

const StatCard = ({ title, count, trend, trendValue, icon }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{count}</p>
          {trend && (
            <p className={`flex items-center text-sm mt-2 ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className={`mr-1 ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend === 'up' ? '↑' : '↓'}
              </span>
              {trendValue}%
            </p>
          )}
        </div>
        <div className="bg-blue-50 p-3 rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
