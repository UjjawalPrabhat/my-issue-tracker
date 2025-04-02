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

const IssuesByMonthChart = ({ issues, height = 300 }) => {
  const chartData = useMemo(() => {
    if (!issues || issues.length === 0) {
      return [];
    }
    
    // Get the current year and previous year
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    // Initialize months for both years
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthData = {};
    
    monthNames.forEach(month => {
      monthData[month] = { 
        name: month, 
        current: 0, 
        previous: 0 
      };
    });
    
    // Count issues by month for both years
    issues.forEach(issue => {
      const date = new Date(issue.createdAt || issue.submittedAt);
      const year = date.getFullYear();
      const month = monthNames[date.getMonth()];
      
      if (year === currentYear) {
        monthData[month].current++;
      } else if (year === previousYear) {
        monthData[month].previous++;
      }
    });
    
    // Convert to array
    return Object.values(monthData);
  }, [issues]);
  
  if (chartData.length === 0 || chartData.every(item => item.current === 0 && item.previous === 0)) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No monthly data available</p>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

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
          contentStyle={{ 
            backgroundColor: 'white', 
            borderColor: '#e5e7eb',
            borderRadius: '0.375rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend wrapperStyle={{ paddingTop: 15 }} />
        <Bar 
          dataKey="current" 
          name={`${currentYear}`} 
          fill="#3B82F6" 
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="previous" 
          name={`${previousYear}`} 
          fill="#93C5FD" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default IssuesByMonthChart;
