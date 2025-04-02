import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const DownloadReportModal = ({ issues, dateRange, onClose }) => {
  const [reportType, setReportType] = useState('full');
  const [format, setFormat] = useState('excel');
  const [frequency, setFrequency] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScheduleOptions, setShowScheduleOptions] = useState(false);
  const [email, setEmail] = useState('');

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (showScheduleOptions && !email) {
        setError("Please enter an email address for scheduled reports");
        setLoading(false);
        return;
      }
      
      // Process the issues data based on the report type
      let reportData;
      
      if (reportType === 'full') {
        // Full report includes all issue data
        reportData = issues.map(issue => ({
          'ID': issue.id,
          'Title': issue.title,
          'Description': issue.description,
          'Status': issue.status,
          'Priority': issue.priority,
          'Category': issue.mainCategory,
          'Subcategory': issue.subCategory,
          'Location': issue.location,
          'Reported By': issue.userName || issue.userEmail,
          'Submitted On': new Date(issue.createdAt || issue.submittedAt).toLocaleString(),
          'Resolved On': issue.adminResolutionTime ? new Date(issue.adminResolutionTime).toLocaleString() : 'Not Resolved',
          'Resolution Time (Days)': issue.adminResolutionTime ? 
            ((new Date(issue.adminResolutionTime) - new Date(issue.createdAt || issue.submittedAt)) / (1000 * 60 * 60 * 24)).toFixed(1) : 
            'N/A'
        }));
      } else if (reportType === 'summary') {
        // Summary report includes aggregated statistics
        
        // Get unique categories
        const categories = [...new Set(issues.map(issue => issue.mainCategory || 'Uncategorized'))];
        
        // Category breakdown
        const categoryData = categories.map(category => {
          const categoryIssues = issues.filter(issue => (issue.mainCategory || 'Uncategorized') === category);
          const resolved = categoryIssues.filter(issue => issue.status === 'resolved').length;
          
          return {
            'Category': category,
            'Total Issues': categoryIssues.length,
            'Resolved': resolved,
            'Open': categoryIssues.length - resolved,
            'Resolution Rate': categoryIssues.length > 0 ? 
              ((resolved / categoryIssues.length) * 100).toFixed(1) + '%' : 
              '0%'
          };
        });
        
        // Status breakdown
        const statusCounts = {};
        issues.forEach(issue => {
          const status = issue.status || 'unknown';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        const statusData = Object.entries(statusCounts).map(([status, count]) => ({
          'Status': status.charAt(0).toUpperCase() + status.slice(1),
          'Count': count,
          'Percentage': ((count / issues.length) * 100).toFixed(1) + '%'
        }));
        
        // Priority breakdown
        const priorityCounts = {};
        issues.forEach(issue => {
          const priority = issue.priority || 'unknown';
          priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
        });
        
        const priorityData = Object.entries(priorityCounts).map(([priority, count]) => ({
          'Priority': priority.charAt(0).toUpperCase() + priority.slice(1),
          'Count': count,
          'Percentage': ((count / issues.length) * 100).toFixed(1) + '%'
        }));
        
        // Weekly trend
        const weeklyData = [];
        // Implementation omitted for brevity
        
        reportData = {
          'Summary': [
            { 'Total Issues': issues.length },
            { 'Resolved Issues': issues.filter(issue => issue.status === 'resolved').length },
            { 'Open Issues': issues.filter(issue => issue.status !== 'resolved').length }
          ],
          'By Category': categoryData,
          'By Status': statusData,
          'By Priority': priorityData
        };
      }
      
      // Generate the report in the selected format
      if (format === 'excel') {
        await generateExcelReport(reportData, reportType);
      } else if (format === 'csv') {
        await generateCsvReport(reportData, reportType);
      } else if (format === 'pdf') {
        await generatePdfReport(reportData, reportType);
      }
      
      // Handle scheduled reports if selected
      if (showScheduleOptions && email) {
        // In a real application, this would save the schedule to a database
        // and set up a recurring job to generate and email the report
        console.log('Scheduled report:', {
          email,
          frequency,
          reportType,
          format
        });
        
        // Show a success message
        alert(`Report scheduled successfully! It will be sent to ${email} ${frequency}.`);
      }
      
      // Close the modal on success
      onClose();
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const generateExcelReport = async (data, type) => {
    try {
      const workbook = XLSX.utils.book_new();
      
      if (type === 'full') {
        // Single sheet with all data
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Issue Data');
      } else {
        // Multiple sheets for the summary report
        Object.entries(data).forEach(([sheetName, sheetData]) => {
          const worksheet = XLSX.utils.json_to_sheet(sheetData);
          XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        });
      }
      
      // Generate file name
      const now = new Date();
      const fileName = `issue_tracker_report_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.xlsx`;
      
      // Convert to binary string
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
      
      // Convert to Blob and save
      const blob = new Blob(
        [s2ab(wbout)], 
        { type: 'application/octet-stream' }
      );
      
      saveAs(blob, fileName);
    } catch (err) {
      console.error('Error generating Excel report:', err);
      throw err;
    }
  };
  
  const generateCsvReport = async (data, type) => {
    try {
      // For full report (single CSV)
      if (type === 'full') {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
        
        const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8' });
        
        const now = new Date();
        const fileName = `issue_tracker_report_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.csv`;
        
        saveAs(blob, fileName);
      } else {
        // For summary report (multiple CSVs in a zip)
        // Implementation would require a library like JSZip
        // This is a simplified version that just outputs the first sheet
        const firstSheet = Object.values(data)[0];
        const worksheet = XLSX.utils.json_to_sheet(firstSheet);
        const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
        
        const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8' });
        
        const now = new Date();
        const fileName = `issue_tracker_summary_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.csv`;
        
        saveAs(blob, fileName);
      }
    } catch (err) {
      console.error('Error generating CSV report:', err);
      throw err;
    }
  };
  
  const generatePdfReport = async (data, type) => {
    // PDF generation would typically require a library like jsPDF
    // This is a placeholder implementation
    alert('PDF generation is not implemented in this demo');
  };
  
  // Helper function to convert string to ArrayBuffer for Excel export
  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg max-w-lg w-full p-6 shadow-xl">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Download Issue Report
        </h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="report-type"
                  value="full"
                  checked={reportType === 'full'}
                  onChange={() => setReportType('full')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Full Report</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="report-type"
                  value="summary"
                  checked={reportType === 'summary'}
                  onChange={() => setReportType('summary')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Summary Report</span>
              </label>
            </div>
          </div>
          
          {/* File Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="excel">Excel (.xlsx)</option>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          
          {/* Schedule Report Checkbox */}
          <div className="flex items-center mt-2">
            <input
              id="schedule-report"
              type="checkbox"
              checked={showScheduleOptions}
              onChange={() => setShowScheduleOptions(!showScheduleOptions)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="schedule-report" className="ml-2 block text-sm text-gray-700">
              Schedule recurring reports
            </label>
          </div>
          
          {/* Schedule Options (conditional) */}
          {showScheduleOptions && (
            <div className="space-y-4 border-t border-gray-200 pt-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email for scheduled reports"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select frequency</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={generateReport}
            disabled={loading || (showScheduleOptions && !frequency)}
            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              ${(loading || (showScheduleOptions && !frequency)) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Generating...' : showScheduleOptions ? 'Schedule Report' : 'Download Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadReportModal;
