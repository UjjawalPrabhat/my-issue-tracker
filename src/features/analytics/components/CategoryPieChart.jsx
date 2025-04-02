import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip
} from 'recharts';

const CategoryPieChart = ({ issues, height = 300 }) => {
  const chartData = useMemo(() => {
    if (!issues || issues.length === 0) {
      return [];
    }
    
    // Count issues by category
    const categoryCounts = {};
    issues.forEach(issue => {
      const category = issue.mainCategory || 'Uncategorized';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    // Convert to chart format and sort by count (descending)
    return Object.entries(categoryCounts)
      .map(([category, count]) => ({
        name: category,
        value: count
      }))
      .sort((a, b) => b.value - a.value);
  }, [issues]);
  
  // Generate unique colors for each category
  const getColors = (count) => {
    const baseColors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
      '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
      '#6366F1', '#8D56EB', '#06B6D4', '#84CC16'
    ];
    
    // If we have more categories than colors, we'll repeat with different opacity
    return Array(count).fill().map((_, i) => {
      const colorIndex = i % baseColors.length;
      const opacity = Math.floor(i / baseColors.length) * 0.25;
      return baseColors[colorIndex];
    });
  };
  
  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No category data available</p>
      </div>
    );
  }

  const COLORS = getColors(chartData.length);

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
          label={({ name, percent }) => percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

export default CategoryPieChart;
