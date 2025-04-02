import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getIssues } from '../../../services/api';

const StatsSection = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const issues = await getIssues();
        
        // Filter issues for the current user if not admin
        const userIssues = user?.role === 'admin' 
          ? issues 
          : issues.filter(issue => issue.userId === user?.uid);
        
        // Calculate stats
        const total = userIssues.length;
        const open = userIssues.filter(issue => issue.status === 'open').length;
        const inProgress = userIssues.filter(issue => issue.status === 'in-progress').length;
        const resolved = userIssues.filter(issue => issue.status === 'resolved').length;
        
        setStats({ total, open, inProgress, resolved });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const statsItems = [
    { label: 'Total Issues', value: stats.total, color: 'bg-indigo-500' },
    { label: 'Open', value: stats.open, color: 'bg-green-500' },
    { label: 'In Progress', value: stats.inProgress, color: 'bg-yellow-500' },
    { label: 'Resolved', value: stats.resolved, color: 'bg-blue-500' }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white shadow rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-300 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statsItems.map((item) => (
        <div key={item.label} className="bg-white shadow rounded-lg overflow-hidden">
          <div className={`h-1 ${item.color}`}></div>
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-500">{item.label}</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsSection;
