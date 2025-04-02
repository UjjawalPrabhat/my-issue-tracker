import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip
} from 'recharts';

const IssueStatusChart = ({ issues, height = 300 }) => {
  const chartData = useMemo(() => {
    if (!issues || issues.length === 0) {
      console.log("IssueStatusChart: No issues provided");
      return [];
    }
    
    console.log(`IssueStatusChart: Processing ${issues.length} issues`);
    
    // Count issues by status
    const statusCounts = {};
    issues.forEach(issue => {
      const status = issue.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    console.log("Status counts:", statusCounts);
    
    // Format for chart
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' '),
      value: count
    }));
  }, [issues]);
  
  // Status colors
  const COLORS = {
    'Open': '#10B981', // green
    'In progress': '#FBBF24', // yellow
    'Resolved': '#3B82F6', // blue
    'Closed': '#6B7280', // gray
    'Delayed': '#EF4444', // red
    'In review': '#8B5CF6', // purple
    'Assigned': '#EC4899', // pink
    'Waiting for parts': '#9CA3AF', // gray
    'Completed': '#059669', // emerald
    'Pending student confirmation': '#F59E0B' // amber
  };
  
  // Default color for any other status
  const DEFAULT_COLOR = '#9CA3AF';
  
  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[entry.name] || DEFAULT_COLOR} 
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value, name) => [value, name]}
          contentStyle={{ 
            backgroundColor: 'white', 
            borderColor: '#e5e7eb',
            borderRadius: '0.375rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default IssueStatusChart;
