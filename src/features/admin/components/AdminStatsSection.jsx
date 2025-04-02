import React from 'react';

const AdminStatsSection = ({ issues }) => {
  // Calculate stats from the provided issues
  const totalIssues = issues.length;
  const openIssues = issues.filter(issue => issue.status === 'open').length;
  const inProgressIssues = issues.filter(issue => issue.status === 'in-progress').length;
  const resolvedIssues = issues.filter(issue => issue.status === 'resolved').length;
  
  // Calculate priority distributions
  const highPriority = issues.filter(issue => issue.priority === 'high' || issue.priority === 'urgent').length;
  const mediumPriority = issues.filter(issue => issue.priority === 'medium').length;
  const lowPriority = issues.filter(issue => issue.priority === 'low').length;

  const statsItems = [
    { label: 'Total Issues', value: totalIssues, color: 'bg-indigo-500' },
    { label: 'Open', value: openIssues, color: 'bg-green-500' },
    { label: 'In Progress', value: inProgressIssues, color: 'bg-yellow-500' },
    { label: 'Resolved', value: resolvedIssues, color: 'bg-blue-500' },
    { label: 'High Priority', value: highPriority, color: 'bg-red-500' },
    { label: 'Medium Priority', value: mediumPriority, color: 'bg-yellow-500' },
    { label: 'Low Priority', value: lowPriority, color: 'bg-green-500' },
  ];

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statsItems.slice(0, 4).map((item) => (
          <div key={item.label} className="bg-white shadow rounded-lg overflow-hidden">
            <div className={`h-1 ${item.color}`}></div>
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500">{item.label}</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Issue Priorities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statsItems.slice(4).map((item) => (
            <div key={item.label} className="bg-white shadow rounded-lg overflow-hidden">
              <div className={`h-1 ${item.color}`}></div>
              <div className="p-6">
                <h3 className="text-sm font-medium text-gray-500">{item.label}</h3>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminStatsSection;
