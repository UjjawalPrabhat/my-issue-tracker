import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getIssues } from '../../../services/api';

const IssuesList = ({ statusFilter = 'all' }) => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    
    return date.toLocaleDateString();
  };

  // Add a helper function to format resolution time
  const formatResolutionTime = (issue) => {
    if (issue.status !== 'resolved' && issue.status !== 'closed') {
      return null;
    }
    
    const startTime = new Date(issue.createdAt || issue.submittedAt);
    const endTime = new Date(issue.adminResolutionTime || issue.resolvedAt);
    
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return null;
    }
    
    const timeDiff = endTime - startTime;
    
    // Format time difference in days, hours, minutes
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else {
      return `${hours}h`;
    }
  };

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const data = await getIssues();
        
        // Filter issues based on user role and status
        let filteredIssues = data;
        
        // If not admin, show only user's issues
        if (user?.role !== 'admin') {
          filteredIssues = filteredIssues.filter(issue => issue.userId === user.uid);
        }
        
        // Apply status filter if not 'all'
        if (statusFilter !== 'all') {
          filteredIssues = filteredIssues.filter(issue => issue.status === statusFilter);
        }
        
        // Sort by date (newest first) - handle both serverTimestamp and string timestamps
        filteredIssues.sort((a, b) => {
          // Handle different timestamp formats
          const getTimestamp = (issue) => {
            if (issue.createdAt?.seconds) return issue.createdAt.seconds * 1000; // Firestore timestamp
            if (issue.createdAt) return new Date(issue.createdAt).getTime(); // ISO string
            if (issue.submittedAt) return new Date(issue.submittedAt).getTime(); // Fallback to submittedAt
            return 0; // Default if no timestamp found
          };
          
          return getTimestamp(b) - getTimestamp(a);
        });
        
        console.log("Filtered issues:", filteredIssues);
        setIssues(filteredIssues);
        setError(null);
      } catch (err) {
        console.error("Error fetching issues:", err);
        setError("Failed to load issues. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [statusFilter, user]);

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
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-blue-500 underline"
        >
          Refresh
        </button>
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
    <ul className="divide-y divide-gray-200">
      {issues.map((issue) => (
        <li key={issue.id}>
          <Link to={`/issues/${issue.id}`} className="block hover:bg-gray-50">
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-blue-600 truncate">{issue.title}</p>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${issue.status === 'open' ? 'bg-green-100 text-green-800' : 
                     issue.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 
                     issue.status === 'resolved' ? 'bg-blue-100 text-blue-800' : 
                     'bg-gray-100 text-gray-800'}`}>
                    {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                  </p>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    <span className="truncate">{issue.description.substring(0, 100)}...</span>
                  </p>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  {issue.status === 'resolved' || issue.status === 'closed' ? (
                    <div className="flex items-center text-sm text-green-600">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>
                        Resolved in {formatResolutionTime(issue) || 'N/A'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">
                      {formatDate(issue.submittedAt || issue.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default IssuesList;
