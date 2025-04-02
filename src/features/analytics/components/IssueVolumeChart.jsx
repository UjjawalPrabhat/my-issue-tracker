import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart
} from 'recharts';

const IssueVolumeChart = ({ issues, currentRange = 'month', height = 300 }) => {
  const chartData = useMemo(() => {
    if (!issues || issues.length === 0) {
      console.log("IssueVolumeChart: No issues provided");
      return [];
    }

    console.log(`IssueVolumeChart: Processing ${issues.length} issues for ${currentRange} view`);

    // Determine the time interval for the X-axis based on the current range
    let interval;
    let format;
    let groupBy;
    
    switch (currentRange) {
      case 'week':
        interval = 'day';
        format = 'MMM D';
        groupBy = date => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        break;
      case 'month':
        interval = 'day';
        format = 'MMM D';
        groupBy = date => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        break;
      case 'quarter':
        interval = 'week';
        format = 'MMM D';
        groupBy = date => {
          // Group by week (Sunday is the first day)
          const dayOfWeek = date.getDay();
          const diff = date.getDate() - dayOfWeek;
          return new Date(date.getFullYear(), date.getMonth(), diff).getTime();
        };
        break;
      case 'year':
        interval = 'month';
        format = 'MMM';
        groupBy = date => new Date(date.getFullYear(), date.getMonth(), 1).getTime();
        break;
      default:
        interval = 'day';
        format = 'MMM D';
        groupBy = date => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    }

    // Get date range
    const dates = issues.map(issue => new Date(issue.createdAt || issue.submittedAt));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    // For a week/month, ensure we show the full range with 0 counts for days with no issues
    let startDate, endDate;
    
    if (currentRange === 'week') {
      // Start from Sunday of the current week
      const dayOfWeek = minDate.getDay();
      startDate = new Date(minDate);
      startDate.setDate(minDate.getDate() - dayOfWeek);
      
      // End on Saturday
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else if (currentRange === 'month') {
      // Start from the 1st day of the month
      startDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
      
      // End on the last day of the month
      endDate = new Date(minDate.getFullYear(), minDate.getMonth() + 1, 0);
    } else if (currentRange === 'quarter') {
      // Start from the 1st day of the quarter
      const quarterStartMonth = Math.floor(minDate.getMonth() / 3) * 3;
      startDate = new Date(minDate.getFullYear(), quarterStartMonth, 1);
      
      // End on the last day of the quarter
      endDate = new Date(minDate.getFullYear(), quarterStartMonth + 3, 0);
    } else if (currentRange === 'year') {
      // Start from January 1st
      startDate = new Date(minDate.getFullYear(), 0, 1);
      
      // End on December 31st
      endDate = new Date(minDate.getFullYear(), 11, 31);
    } else {
      // Default to min/max dates from the data
      startDate = minDate;
      endDate = maxDate;
    }
    
    // Group issues by date
    const issueCountsByDate = {};
    const resolvedCountsByDate = {};
    
    // Initialize all dates in the range
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const timestamp = groupBy(currentDate);
      issueCountsByDate[timestamp] = 0;
      resolvedCountsByDate[timestamp] = 0;
      
      // Increment by the appropriate interval
      if (interval === 'day') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (interval === 'week') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (interval === 'month') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    
    // Count issues
    let validDateCount = 0;
    issues.forEach(issue => {
      try {
        // Safely create date object
        const createdStr = issue.createdAt || issue.submittedAt;
        if (!createdStr) {
          console.warn("Issue missing both createdAt and submittedAt:", issue.id);
          return;
        }
        
        const createdDate = new Date(createdStr);
        
        // Validate the date
        if (isNaN(createdDate.getTime())) {
          console.warn("Invalid date format:", createdStr, "for issue:", issue.id);
          return;
        }
        
        validDateCount++;
        const timestamp = groupBy(createdDate);
        
        if (issueCountsByDate[timestamp] !== undefined) {
          issueCountsByDate[timestamp]++;
        }
        
        // Count resolved issues
        if (issue.status === 'resolved' && issue.adminResolutionTime) {
          const resolvedDate = new Date(issue.adminResolutionTime);
          const resolvedTimestamp = groupBy(resolvedDate);
          
          if (resolvedCountsByDate[resolvedTimestamp] !== undefined) {
            resolvedCountsByDate[resolvedTimestamp]++;
          }
        }
      } catch (err) {
        console.error("Error processing issue date:", err, issue);
      }
    });
    
    console.log(`IssueVolumeChart: Found ${validDateCount} issues with valid dates`);
    
    // Convert to chart data format
    const data = Object.keys(issueCountsByDate)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(timestamp => {
        const date = new Date(parseInt(timestamp));
        const month = date.toLocaleString('default', { month: 'short' });
        
        let name;
        if (interval === 'day') {
          name = `${month} ${date.getDate()}`;
        } else if (interval === 'week') {
          const endOfWeek = new Date(date);
          endOfWeek.setDate(date.getDate() + 6);
          name = `${month} ${date.getDate()}-${endOfWeek.getDate()}`;
        } else if (interval === 'month') {
          name = month;
        }
        
        return {
          name,
          reported: issueCountsByDate[timestamp],
          resolved: resolvedCountsByDate[timestamp],
          timestamp: parseInt(timestamp)
        };
      });
    
    return data;
  }, [issues, currentRange]);

  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No data available for the selected period</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis 
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          domain={[0, 'auto']}
        />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            borderColor: '#e5e7eb',
            borderRadius: '0.375rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
          }} 
        />
        <Legend wrapperStyle={{ paddingTop: 15 }} />
        <Area 
          type="monotone" 
          dataKey="reported" 
          stroke="#3B82F6" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorReported)" 
          name="Issues Reported"
        />
        <Area 
          type="monotone" 
          dataKey="resolved" 
          stroke="#10B981" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorResolved)" 
          name="Issues Resolved"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default IssueVolumeChart;
