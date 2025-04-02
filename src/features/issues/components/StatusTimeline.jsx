import React from 'react';
import { formatDate, formatTimeDifference } from '../../../utils/dateUtils';

const StatusTimeline = ({ statusHistory = [], issue }) => {
  // Sort the status history by timestamp (newest first)
  const sortedHistory = [...statusHistory].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return dateB - dateA;
  });
  
  // Calculate time differences between events
  const historyWithTimeDiffs = sortedHistory.map((status, index, array) => {
    let timeSinceLastUpdate = null;
    
    // Calculate time since previous update (for all except the first/most recent item)
    if (index < array.length - 1) {
      const currentDate = new Date(status.timestamp);
      const prevDate = new Date(array[index + 1].timestamp);
      timeSinceLastUpdate = currentDate - prevDate;
    }
    
    // For the last item (oldest), use time since submission
    if (index === array.length - 1) {
      // We don't have info here about original submission time
      timeSinceLastUpdate = null;
    }
    
    return {
      ...status,
      timeSinceLastUpdate
    };
  });
  
  // Calculate total resolution time (from submission to resolved status)
  const calculateTotalResolutionTime = () => {
    if (!issue) return null;
    
    // Get submission time (first status or createdAt)
    const submissionTime = issue.createdAt || issue.submittedAt;
    if (!submissionTime) return null;
    
    // Find resolution time (if issue is resolved)
    const isResolved = issue.status === 'resolved' || issue.status === 'closed';
    let resolutionTime = issue.adminResolutionTime || issue.resolvedAt;
    
    // If not resolved yet, return null
    if (!isResolved || !resolutionTime) return null;
    
    // Calculate time difference
    const startDate = new Date(submissionTime);
    const endDate = new Date(resolutionTime);
    
    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
    
    return endDate - startDate;
  };
  
  const totalResolutionTime = calculateTotalResolutionTime();
  
  if (historyWithTimeDiffs.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No status updates available
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'in-review': return 'bg-purple-100 text-purple-800';
      case 'assigned': return 'bg-indigo-100 text-indigo-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'waiting-for-parts': return 'bg-orange-100 text-orange-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'resolved-by-admin': return 'bg-teal-100 text-teal-800';
      case 'resolved-by-student': return 'bg-teal-100 text-teal-800';
      case 'resolved': return 'bg-emerald-100 text-emerald-800';
      case 'pending-student-confirmation': return 'bg-amber-100 text-amber-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatStatus = (status) => {
    return status
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="flow-root">
      {/* Total Resolution Time Banner */}
      {totalResolutionTime && (
        <div className="mb-6 bg-green-50 border border-green-100 rounded-lg p-4 flex items-center">
          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium text-green-700">
            Issue resolved in {formatTimeDifference(totalResolutionTime)}
          </span>
        </div>
      )}
      
      <ul className="-mb-8">
        {historyWithTimeDiffs.map((status, idx) => (
          <li key={idx}>
            <div className="relative pb-8">
              {idx !== historyWithTimeDiffs.length - 1 ? (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getStatusColor(status.status)}`}>
                    {status.status === 'resolved' || status.status === 'resolved-by-admin' || status.status === 'resolved-by-student' ? (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Status changed to <span className="font-medium text-gray-900">{formatStatus(status.status)}</span>
                      {status.updatedByName && (
                        <span> by <span className="font-medium text-gray-900">{status.updatedByName}</span></span>
                      )}
                    </p>
                    {status.notes && (
                      <p className="mt-1 text-sm text-gray-500">
                        {status.notes}
                      </p>
                    )}
                    {/* Display time since last status change */}
                    {status.timeSinceLastUpdate && (
                      <p className="mt-1 text-xs text-gray-500 italic">
                        Time since previous update: {formatTimeDifference(status.timeSinceLastUpdate)}
                      </p>
                    )}
                    
                    {/* Display resolution time for final status (resolved or closed) */}
                    {(['resolved', 'closed'].includes(status.status)) && idx === 0 && totalResolutionTime && (
                      <p className="mt-1 text-xs font-medium text-green-600">
                        Total time from submission to resolution: {formatTimeDifference(totalResolutionTime)}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    <time dateTime={status.timestamp}>
                      {formatDate(status.timestamp, 'long')}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatusTimeline;
