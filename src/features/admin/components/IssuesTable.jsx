import React from 'react';
import { useNavigate } from 'react-router-dom';

const IssuesTable = ({ issues, loading, error }) => {
  const navigate = useNavigate();

  const handleRowClick = (issueId) => {
    navigate(`/issues/${issueId}`);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-500">Loading issues...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No issues found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Issue
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submitted By
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {issues.map((issue) => (
            <tr 
              key={issue.id}
              onClick={() => handleRowClick(issue.id)}
              className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-blue-600">{issue.title}</div>
                <div className="text-sm text-gray-500 truncate max-w-xs">
                  {issue.description?.substring(0, 50)}...
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{issue.userName || 'Anonymous'}</div>
                <div className="text-sm text-gray-500">{issue.userEmail}</div>
                <div className="text-xs text-gray-500 mt-1">
                  <span className="font-medium">Roll:</span> {issue.rollNumber || 'N/A'}
                </div>
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Room:</span> {issue.roomNumber || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{issue.location || 'Not specified'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {issue.mainCategory || 'Uncategorized'}
                  {issue.subCategory && <span> / {issue.subCategory}</span>}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${issue.priority === 'high' ? 'bg-red-100 text-red-800' : 
                    issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'}`}>
                  {issue.priority?.charAt(0).toUpperCase() + issue.priority?.slice(1) || 'Low'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${issue.status === 'open' ? 'bg-green-100 text-green-800' : 
                    issue.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 
                    issue.status === 'resolved' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {issue.status?.charAt(0).toUpperCase() + issue.status?.slice(1) || 'Open'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(issue.createdAt || issue.submittedAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IssuesTable;
