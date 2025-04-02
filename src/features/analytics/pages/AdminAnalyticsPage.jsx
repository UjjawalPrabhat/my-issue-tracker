import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Sidebar from '../../../components/layout/Sidebar';
import ProfileDropdown from '../../../components/common/ProfileDropdown';
import IssueStatusChart from '../components/IssueStatusChart';
import IssuesByMonthChart from '../components/IssuesByMonthChart';
import AvgResolutionTimeChart from '../components/AvgResolutionTimeChart';
import CategoryPieChart from '../components/CategoryPieChart';
import PriorityDistributionChart from '../components/PriorityDistributionChart';
import LocationHeatMap from '../components/LocationHeatMap';
import IssueVolumeChart from '../components/IssueVolumeChart';
import InsightPanel from '../components/InsightPanel';
import ResolutionRateCard from '../components/ResolutionRateCard';
import ResponseTimeCard from '../components/ResponseTimeCard';
import DownloadReportModal from '../components/DownloadReportModal';
import { getIssues } from '../../../services/api';

const AdminAnalyticsPage = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('month'); // 'week', 'month', 'quarter', 'year'
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [insights, setInsights] = useState([]);
  const [comparisonPeriod, setComparisonPeriod] = useState('previous'); // 'previous', 'same-last-year'
  
  // New state for advanced filtering
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({ start: null, end: null });
  const [useCustomDateRange, setUseCustomDateRange] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Calculate date ranges for filtering
  const dateRanges = useMemo(() => {
    const now = new Date();
    const ranges = {
      current: {
        week: {
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()),
          end: now
        },
        month: {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: now
        },
        quarter: {
          start: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1),
          end: now
        },
        year: {
          start: new Date(now.getFullYear(), 0, 1),
          end: now
        }
      },
      previous: {
        week: {
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7),
          end: new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 1)
        },
        month: {
          start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          end: new Date(now.getFullYear(), now.getMonth(), 0)
        },
        quarter: {
          start: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - 3, 1),
          end: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 0)
        },
        year: {
          start: new Date(now.getFullYear() - 1, 0, 1),
          end: new Date(now.getFullYear() - 1, 11, 31)
        }
      },
      'same-last-year': {
        week: {
          start: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() - now.getDay()),
          end: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() - now.getDay() + 6)
        },
        month: {
          start: new Date(now.getFullYear() - 1, now.getMonth(), 1),
          end: new Date(now.getFullYear() - 1, now.getMonth() + 1, 0)
        },
        quarter: {
          start: new Date(now.getFullYear() - 1, Math.floor(now.getMonth() / 3) * 3, 1),
          end: new Date(now.getFullYear() - 1, Math.floor(now.getMonth() / 3) * 3 + 2, 31)
        },
        year: {
          start: new Date(now.getFullYear() - 1, 0, 1),
          end: new Date(now.getFullYear() - 1, 11, 31)
        }
      }
    };
    
    return ranges;
  }, []);

  // Fetch issues from Firestore
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getIssues();
        console.log("Analytics page fetched issues:", data.length);
        
        // Debug: Log the raw issue data to check format
        if (data.length > 0) {
          console.log("First issue sample:", {
            id: data[0].id,
            title: data[0].title,
            createdAt: data[0].createdAt,
            submittedAt: data[0].submittedAt,
            status: data[0].status,
            category: data[0].mainCategory
          });
        } else {
          console.log("No issues returned from getIssues()");
        }
        
        setIssues(data);
      } catch (err) {
        console.error("Error fetching issues for analytics:", err);
        setError("Failed to load issue data for analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  // Calculate insights based on the issues data
  useEffect(() => {
    if (issues.length === 0 || loading) return;

    // Generate insights
    const generateInsights = () => {
      const newInsights = [];
      
      // 1. Most common category insight
      const categoryCounts = {};
      issues.forEach(issue => {
        const category = issue.mainCategory || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
      const mostCommonCategory = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])[0];
      
      if (mostCommonCategory) {
        newInsights.push({
          type: 'category',
          title: 'Most Common Issue Category',
          description: `${mostCommonCategory[0]} accounts for ${Math.round((mostCommonCategory[1] / issues.length) * 100)}% of all issues.`,
          recommendation: `Consider reviewing ${mostCommonCategory[0]} facilities and processes to reduce recurring issues.`
        });
      }
      
      // 2. Average resolution time
      const resolvedIssues = issues.filter(issue => 
        issue.status === 'resolved' && issue.createdAt && issue.adminResolutionTime
      );
      
      if (resolvedIssues.length > 0) {
        const resolutionTimes = resolvedIssues.map(issue => {
          const created = new Date(issue.createdAt);
          const resolved = new Date(issue.adminResolutionTime);
          return (resolved - created) / (1000 * 60 * 60 * 24); // Days
        });
        
        const avgResolutionTime = resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length;
        
        newInsights.push({
          type: 'resolution',
          title: 'Average Resolution Time',
          description: `Issues take an average of ${avgResolutionTime.toFixed(1)} days to resolve.`,
          recommendation: avgResolutionTime > 3 
            ? 'Consider streamlining the resolution process to improve response times.'
            : 'Current resolution time is good. Keep up the good work!'
        });
      }
      
      // 3. Trend analysis
      const last30DaysIssues = issues.filter(issue => {
        const created = new Date(issue.createdAt);
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        return created >= thirtyDaysAgo;
      });
      
      const previousThirtyDaysIssues = issues.filter(issue => {
        const created = new Date(issue.createdAt);
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        const sixtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60);
        return created >= sixtyDaysAgo && created < thirtyDaysAgo;
      });
      
      if (last30DaysIssues.length > 0 && previousThirtyDaysIssues.length > 0) {
        const percentChange = ((last30DaysIssues.length - previousThirtyDaysIssues.length) / previousThirtyDaysIssues.length) * 100;
        
        newInsights.push({
          type: 'trend',
          title: 'Issue Volume Trend',
          description: `Issues have ${percentChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(percentChange).toFixed(1)}% in the last 30 days.`,
          recommendation: percentChange > 10 
            ? 'Investigate the cause of this significant increase in issues.'
            : percentChange < -10 
              ? 'Your recent improvements have made a positive impact on reducing issues.'
              : 'Issue volume is relatively stable.'
        });
      }
      
      // Add more sophisticated insights...
      
      setInsights(newInsights);
    };
    
    generateInsights();
  }, [issues, loading]);

  const currentDateRange = dateRanges.current[dateRange];
  const comparisonDateRange = dateRanges[comparisonPeriod][dateRange];

  // Filter issues for current date range
  const currentIssues = useMemo(() => {
    if (!currentDateRange || issues.length === 0) return [];
    
    console.log("Filtering issues for current date range:", {
      start: currentDateRange.start.toISOString(),
      end: currentDateRange.end.toISOString(),
      totalIssues: issues.length
    });
    
    const filtered = issues.filter(issue => {
      // Make sure we handle both createdAt and submittedAt fields
      let created;
      try {
        created = new Date(issue.createdAt || issue.submittedAt);
        
        // Ensure valid date
        if (isNaN(created.getTime())) {
          console.warn("Invalid date found in issue:", issue.id, issue.createdAt, issue.submittedAt);
          return false;
        }
        
        // Include issues created today by extending end date to end of day
        const adjustedEnd = new Date(currentDateRange.end);
        adjustedEnd.setHours(23, 59, 59, 999);
        
        const isInRange = created >= currentDateRange.start && created <= adjustedEnd;
        return isInRange;
      } catch (e) {
        console.error("Error parsing date for issue:", issue.id, e);
        return false;
      }
    });
    
    console.log(`Filtered ${filtered.length} issues out of ${issues.length} for the current date range`);
    return filtered;
  }, [issues, currentDateRange]);

  // Filter issues for comparison date range
  const comparisonIssues = useMemo(() => {
    if (!comparisonDateRange) return [];
    
    return issues.filter(issue => {
      const created = new Date(issue.createdAt || issue.submittedAt);
      return created >= comparisonDateRange.start && created <= comparisonDateRange.end;
    });
  }, [issues, comparisonDateRange]);

  // Calculate summary stats for quick metrics
  const stats = useMemo(() => {
    if (currentIssues.length === 0) {
      return {
        total: 0,
        resolved: 0,
        resolutionRate: 0,
        avgResolutionTime: 0,
        highPriority: 0,
        change: 0
      };
    }
    
    const resolved = currentIssues.filter(issue => issue.status === 'resolved').length;
    const highPriority = currentIssues.filter(issue => issue.priority === 'high').length;
    
    // Calculate average resolution time in days
    const resolvedWithTimes = currentIssues.filter(issue => 
      issue.status === 'resolved' && issue.createdAt && issue.adminResolutionTime
    );
    
    let avgResolutionTime = 0;
    if (resolvedWithTimes.length > 0) {
      avgResolutionTime = resolvedWithTimes.reduce((sum, issue) => {
        const created = new Date(issue.createdAt);
        const resolved = new Date(issue.adminResolutionTime);
        return sum + (resolved - created) / (1000 * 60 * 60 * 24); // Days
      }, 0) / resolvedWithTimes.length;
    }
    
    // Calculate change from previous period
    const prevTotal = comparisonIssues.length;
    const change = prevTotal === 0 ? 100 : ((currentIssues.length - prevTotal) / prevTotal) * 100;
    
    return {
      total: currentIssues.length,
      resolved,
      resolutionRate: currentIssues.length > 0 ? (resolved / currentIssues.length) * 100 : 0,
      avgResolutionTime,
      highPriority,
      change
    };
  }, [currentIssues, comparisonIssues]);

  // Get all available categories from issues
  const availableCategories = useMemo(() => {
    if (!issues || !issues.length) return [];
    
    const categories = ['all', ...new Set(issues.map(issue => 
      issue.mainCategory || 'Uncategorized'
    ))];
    return categories;
  }, [issues]);

  // Apply all filters to issues
  const filteredIssues = useMemo(() => {
    if (!currentIssues || !currentIssues.length) return [];
    
    return currentIssues.filter(issue => {
      // Apply category filter
      if (categoryFilter !== 'all' && (issue.mainCategory || 'Uncategorized') !== categoryFilter) {
        return false;
      }
      
      // Apply priority filter
      if (priorityFilter !== 'all' && issue.priority !== priorityFilter) {
        return false;
      }
      
      // Apply status filter
      if (statusFilter !== 'all' && issue.status !== statusFilter) {
        return false;
      }
      
      return true;
    });
  }, [currentIssues, categoryFilter, priorityFilter, statusFilter]);

  // Compute performance metrics for KPI cards
  const performanceMetrics = useMemo(() => {
    if (!filteredIssues || filteredIssues.length === 0) {
      return {
        avgResolutionTrend: 0,
        responseTimeTrend: 0,
        issueVolumeTrend: 0
      };
    }
    
    // Calculate trends by comparing with previous periods
    const issueVolumeTrend = stats.change;
    
    // Calculate resolution time trend (negative is good)
    const prevResolvedIssues = comparisonIssues.filter(issue => 
      issue.status === 'resolved' && issue.createdAt && issue.adminResolutionTime
    );
    
    let avgResolutionTrend = 0;
    if (prevResolvedIssues.length > 0) {
      const prevAvgResolution = prevResolvedIssues.reduce((sum, issue) => {
        const created = new Date(issue.createdAt);
        const resolved = new Date(issue.adminResolutionTime);
        return sum + (resolved - created) / (1000 * 60 * 60 * 24); // Days
      }, 0) / prevResolvedIssues.length;
      
      avgResolutionTrend = prevAvgResolution > 0 ? 
        ((stats.avgResolutionTime - prevAvgResolution) / prevAvgResolution) * 100 : 0;
    }
    
    // Invert resolution time trend because lower is better
    avgResolutionTrend = -avgResolutionTrend;
    
    return {
      avgResolutionTrend,
      responseTimeTrend: avgResolutionTrend, // Same as resolution time for now
      issueVolumeTrend
    };
  }, [filteredIssues, comparisonIssues, stats]);

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar collapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center ml-2 lg:ml-0">
                <span className="text-xl font-semibold text-blue-600">Advanced Analytics</span>
              </div>
            </div>
            <ProfileDropdown user={user} />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
              {error}
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {/* Controls Row - Enhanced */}
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Analytics Dashboard
                  </h1>
                  <p className="text-gray-500 flex items-center">
                    <span>Showing data for {filteredIssues.length} issues</span>
                    {filteredIssues.length !== currentIssues.length && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Filtered: {filteredIssues.length}/{currentIssues.length}
                      </span>
                    )}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  {/* Date Range Selector - Enhanced */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={dateRange}
                      onChange={(e) => {
                        setDateRange(e.target.value);
                        if (e.target.value === 'custom') {
                          setUseCustomDateRange(true);
                        } else {
                          setUseCustomDateRange(false);
                        }
                      }}
                      className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="quarter">This Quarter</option>
                      <option value="year">This Year</option>
                      <option value="custom">Custom Range</option>
                    </select>
                    
                    {useCustomDateRange && (
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={customDateRange.start || ''}
                          onChange={(e) => setCustomDateRange({...customDateRange, start: e.target.value})}
                          className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="self-center text-gray-500">to</span>
                        <input
                          type="date"
                          value={customDateRange.end || ''}
                          onChange={(e) => setCustomDateRange({...customDateRange, end: e.target.value})}
                          className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Advanced Filters Toggle */}
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="bg-white border border-gray-300 text-gray-700 rounded-md shadow-sm py-2 px-4 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Filters
                    {(categoryFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all') && (
                      <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                        {[
                          categoryFilter !== 'all' ? 1 : 0,
                          priorityFilter !== 'all' ? 1 : 0,
                          statusFilter !== 'all' ? 1 : 0
                        ].reduce((a, b) => a + b, 0)}
                      </span>
                    )}
                  </button>
                  
                  <select
                    value={comparisonPeriod}
                    onChange={(e) => setComparisonPeriod(e.target.value)}
                    className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="previous">vs Previous Period</option>
                    <option value="same-last-year">vs Same Period Last Year</option>
                  </select>
                  
                  <button
                    onClick={() => setShowDownloadModal(true)}
                    className="bg-blue-600 text-white rounded-md shadow-sm py-2 px-4 text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </button>
                </div>
              </div>
              
              {/* Advanced Filters Panel (conditional) */}
              {showAdvancedFilters && (
                <div className="bg-white shadow-md rounded-lg p-4 mb-6 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Category Filter */}
                    <div>
                      <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        id="category-filter"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="all">All Categories</option>
                        {availableCategories.filter(cat => cat !== 'all').map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Priority Filter */}
                    <div>
                      <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        id="priority-filter"
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="all">All Priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    
                    {/* Status Filter */}
                    <div>
                      <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="all">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        setCategoryFilter('all');
                        setPriorityFilter('all');
                        setStatusFilter('all');
                      }}
                      className="text-sm text-gray-700 hover:text-blue-700"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}
              
              {/* Performance Metrics Card (NEW) */}
              <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Performance Metrics
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                  {/* Resolution Time Trend */}
                  <div className="px-6 py-5">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">Resolution Time</p>
                        <div className="flex items-center">
                          <p className="text-2xl font-semibold text-gray-900">
                            {stats.avgResolutionTime.toFixed(1)} days
                          </p>
                          <TrendIndicator 
                            value={performanceMetrics.avgResolutionTrend} 
                            invert={true}
                            className="ml-2"
                          />
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Average time to resolve issues
                    </p>
                  </div>
                  
                  {/* Resolution Rate */}
                  <div className="px-6 py-5">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">Resolution Rate</p>
                        <div className="flex items-center">
                          <p className="text-2xl font-semibold text-gray-900">
                            {stats.resolutionRate.toFixed(1)}%
                          </p>
                          <TrendIndicator 
                            value={stats.resolutionRate > 80 ? 10 : stats.resolutionRate > 60 ? 0 : -10} 
                            className="ml-2"
                          />
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Percentage of issues that have been resolved
                    </p>
                  </div>
                  
                  {/* Issue Volume Trend */}
                  <div className="px-6 py-5">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">Issue Volume</p>
                        <div className="flex items-center">
                          <p className="text-2xl font-semibold text-gray-900">
                            {stats.total}
                          </p>
                          <TrendIndicator 
                            value={performanceMetrics.issueVolumeTrend}
                            invert={true} 
                            className="ml-2"
                          />
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Total number of issues in selected period
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Use filteredIssues instead of currentIssues for all charts */}
              
              {/* Time Series Chart */}
              <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                <div className="p-5 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Issue Volume over Time
                  </h3>
                  <p className="text-sm text-gray-500">
                    Track how issue reporting has changed over time
                  </p>
                </div>
                <div className="p-5">
                  <IssueVolumeChart 
                    issues={filteredIssues} 
                    currentRange={dateRange}
                    height={300} 
                  />
                </div>
              </div>
              
              {/* Second row - Category & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Issues by Category Chart */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Issues by Category
                    </h3>
                  </div>
                  <div className="p-5">
                    <CategoryPieChart 
                      issues={filteredIssues} 
                      height={300} 
                    />
                  </div>
                </div>
                
                {/* Issues by Status Chart */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Issues by Status
                    </h3>
                  </div>
                  <div className="p-5">
                    <IssueStatusChart 
                      issues={filteredIssues} 
                      height={300} 
                    />
                  </div>
                </div>
              </div>
              
              {/* Third row - Location & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Heat Map by Location */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Issue Distribution by Location
                    </h3>
                  </div>
                  <div className="p-5">
                    <LocationHeatMap 
                      issues={filteredIssues} 
                      height={300} 
                    />
                  </div>
                </div>
                
                {/* Issues by Priority Chart */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Issues by Priority
                    </h3>
                  </div>
                  <div className="p-5">
                    <PriorityDistributionChart 
                      issues={filteredIssues}
                      height={300} 
                    />
                  </div>
                </div>
              </div>
              
              {/* Fourth row - Resolution Time & Monthly Trends */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Avg Resolution Time by Category */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Avg. Resolution Time by Category
                    </h3>
                  </div>
                  <div className="p-5">
                    <AvgResolutionTimeChart 
                      issues={issues}
                      height={300} 
                    />
                  </div>
                </div>
                
                {/* Monthly Issue Trends */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Monthly Issue Volume
                    </h3>
                  </div>
                  <div className="p-5">
                    <IssuesByMonthChart 
                      issues={issues}
                      height={300} 
                    />
                  </div>
                </div>
              </div>
              
              {/* Insights & Recommendations Section */}
              <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                <div className="p-5 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Data-Driven Insights
                  </h3>
                  <p className="text-sm text-gray-500">
                    System-generated recommendations to improve issue resolution
                  </p>
                </div>
                <div className="p-5">
                  <InsightPanel insights={insights} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Download Report Modal */}
      {showDownloadModal && (
        <DownloadReportModal 
          issues={filteredIssues} // Pass filtered issues
          dateRange={dateRange}
          onClose={() => setShowDownloadModal(false)}
        />
      )}
    </div>
  );
};

// A new component for trend indicators
const TrendIndicator = ({ value, invert = false, className = '' }) => {
  const displayValue = invert ? -value : value;
  
  if (Math.abs(displayValue) < 0.5) {
    return (
      <div className={`flex items-center text-gray-500 ${className}`}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
        </svg>
        <span className="text-xs font-medium ml-1">Unchanged</span>
      </div>
    );
  }
  
  if (displayValue > 0) {
    return (
      <div className={`flex items-center text-green-600 ${className}`}>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-medium ml-1">{Math.abs(displayValue).toFixed(1)}%</span>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center text-red-600 ${className}`}>
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
      <span className="text-xs font-medium ml-1">{Math.abs(displayValue).toFixed(1)}%</span>
    </div>
  );
};

export default AdminAnalyticsPage;
