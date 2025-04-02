import React, { useState, useEffect } from 'react';
import { getIssues } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { getFirestoreErrorMessage } from '../../../utils/firebaseErrors';

const IssuesList = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const issuesData = await getIssues();
        // Filter issues for the current user if needed
        const userIssues = user.role === 'admin' 
          ? issuesData 
          : issuesData.filter(issue => issue.userId === user.uid);
        
        setIssues(userIssues);
        setError(null);
      } catch (err) {
        console.error("Error fetching issues:", err);
        setError(getFirestoreErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>Error loading issues: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>No issues found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {issues.map(issue => (
        <div key={issue.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">{issue.title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Status: <span className={`font-medium ${issue.status === 'open' ? 'text-green-600' : 'text-gray-600'}`}>
              {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
            </span>
          </p>
          <p className="mt-2 text-gray-700">{issue.description}</p>
        </div>
      ))}
    </div>
  );
};

export default IssuesList;
