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
import EnhancedTooltip from './EnhancedTooltip';

const PriorityDistributionChart = ({ issues, height = 300 }) => {
  const chartData = useMemo(() => {
    if (!issues || issues.length === 0) {
      return [];
    }
    
    // Count issues by priority
    const priorityCounts = {
      'high': 0,
      'medium': 0,
      'low': 0
    };
    
    issues.forEach(issue => {
      const priority = issue.priority?.toLowerCase() || 'low';
      if (priorityCounts[priority] !== undefined) {
        priorityCounts[priority]++;
      } else {
        priorityCounts.low++; // Default to low if unknown
      }
    });
    
    // Format for chart
    return [
      { name: 'High', value: priorityCounts.high, color: '#EF4444' },
      { name: 'Medium', value: priorityCounts.medium, color: '#F59E0B' },
      { name: 'Low', value: priorityCounts.low, color: '#10B981' }
    ];
  }, [issues]);
  
  if (chartData.every(item => item.value === 0)) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No priority data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis 
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          content={<EnhancedTooltip 
            formatter={(payload) => 
              payload.map(entry => ({
                name: entry.name,
                value: `${entry.value} issues (${((entry.value / issues.length) * 100).toFixed(1)}%)`,
                color: entry.payload.color
              }))
            }
            title="Priority Distribution"
          />}
        />
        <Legend wrapperStyle={{ paddingTop: 15 }} />
        <Bar 
          dataKey="value" 
          name="Issue Count" 
          radius={[4, 4, 0, 0]}
          isAnimationActive={true}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PriorityDistributionChart;
