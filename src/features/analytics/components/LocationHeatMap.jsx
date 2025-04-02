import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';

const LocationHeatMap = ({ issues, height = 300 }) => {
  const chartData = useMemo(() => {
    if (!issues || issues.length === 0) {
      return [];
    }
    
    // Count issues by location
    const locationCounts = {};
    issues.forEach(issue => {
      const location = issue.location || 'Unknown';
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });
    
    // Format for chart and sort by count (descending)
    return Object.entries(locationCounts)
      .map(([location, count]) => ({
        name: location,
        value: count
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Only show top 10 locations
  }, [issues]);
  
  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No location data available</p>
      </div>
    );
  }

  // Generate a color gradient from blue to red based on count
  const getItemColor = (index, max) => {
    // Heat colors from blue (cool/low) to red (hot/high)
    const colors = [
      '#3B82F6', // blue
      '#60A5FA',
      '#93C5FD',
      '#BFDBFE',
      '#DBEAFE',
      '#FEF3C7',
      '#FDE68A',
      '#FCD34D',
      '#FBBF24',
      '#F59E0B', // amber
      '#F97316', // orange
      '#EF4444'  // red
    ];
    
    const colorIndex = Math.min(
      Math.floor((index / Math.max(1, max - 1)) * (colors.length - 1)),
      colors.length - 1
    );
    
    return colors[colorIndex];
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 10, right: 20, left: 60, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fontSize: 12 }}
          tickLine={false}
          width={100}
        />
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'white', 
            borderColor: '#e5e7eb',
            borderRadius: '0.375rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value, name, props) => [`${value} issues`, props.payload.name]}
          labelFormatter={() => 'Location'}
        />
        <Legend />
        <Bar
          dataKey="value"
          name="Issue Count"
          radius={[0, 4, 4, 0]}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getItemColor(index, chartData.length)} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default LocationHeatMap;
