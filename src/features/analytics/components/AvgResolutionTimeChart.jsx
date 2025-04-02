import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const AvgResolutionTimeChart = ({ issues, height = 300 }) => {
  const chartData = useMemo(() => {
    if (!issues || issues.length === 0) {
      return [];
    }
    
    // Filter to only resolved issues with timestamps
    const resolvedIssues = issues.filter(issue => 
      issue.status === 'resolved' && 
      issue.createdAt && 
      issue.adminResolutionTime
    );
    
    if (resolvedIssues.length === 0) {
      return [];
    }
    
    // Group issues by category
    const categorySums = {};
    const categoryCounts = {};
    
    resolvedIssues.forEach(issue => {
      const category = issue.mainCategory || 'Uncategorized';
      const created = new Date(issue.createdAt || issue.submittedAt);
      const resolved = new Date(issue.adminResolutionTime);
      const days = (resolved - created) / (1000 * 60 * 60 * 24); // Resolution time in days
      
      categorySums[category] = (categorySums[category] || 0) + days;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    // Calculate averages and prepare chart data
    return Object.entries(categorySums)
      .map(([category, totalDays]) => ({
        name: category,
        value: totalDays / categoryCounts[category],
        count: categoryCounts[category]
      }))
      .sort((a, b) => b.value - a.value); // Sort by average time (descending)
  }, [issues]);
  
  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No resolution time data available</p>
      </div>
    );
  }

  // Format days for tooltip
  const formatDays = (days) => {
    if (days < 1) {
      return `${Math.round(days * 24)} hours`;
    }
    return `${days.toFixed(1)} days`;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 80, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          label={{ 
            value: 'Days', 
            position: 'insideBottom', 
            offset: -5 
          }}
        />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fontSize: 12 }}
          tickLine={false}
          width={120}
        />
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'white', 
            borderColor: '#e5e7eb',
            borderRadius: '0.375rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value, name, props) => [
            formatDays(value), 
            `Avg. Resolution Time (${props.payload.count} issues)`
          ]}
          labelFormatter={(label) => `Category: ${label}`}
        />
        <Legend />
        <Bar
          dataKey="value"
          name="Avg. Resolution Time"
          fill="#3B82F6"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AvgResolutionTimeChart;
