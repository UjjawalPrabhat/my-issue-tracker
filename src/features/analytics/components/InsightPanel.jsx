import React from 'react';

const InsightPanel = ({ insights }) => {
  if (!insights || insights.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No insights available with the current data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {insights.map((insight, index) => (
        <div 
          key={index} 
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-start">
            <div 
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3 
                ${insight.type === 'category' ? 'bg-purple-100 text-purple-700' : 
                  insight.type === 'resolution' ? 'bg-blue-100 text-blue-700' : 
                  insight.type === 'trend' ? 'bg-green-100 text-green-700' : 
                  'bg-gray-100 text-gray-700'}`}
            >
              {insight.type === 'category' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              ) : insight.type === 'resolution' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : insight.type === 'trend' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900">{insight.title}</h4>
              <p className="mt-1 text-sm text-gray-600">{insight.description}</p>
              
              <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded text-sm">
                <h5 className="font-medium text-gray-800 mb-1">Recommendation</h5>
                <p className="text-gray-700">{insight.recommendation}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InsightPanel;
