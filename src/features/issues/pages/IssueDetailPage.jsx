import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIssueById, updateIssue } from '../../../services/api';
import { uploadFile } from '../../../services/storage';
import { useAuth } from '../../../contexts/AuthContext';
import Sidebar from '../../../components/layout/Sidebar';
import ProfileDropdown from '../../../components/common/ProfileDropdown';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import StatusTimeline from '../components/StatusTimeline';
import { formatDate, formatTimeDifference } from '../../../utils/dateUtils';

// Remove the conflicting local formatDate function and use the imported one

const IssueDetailPage = ({ isAdminView = false }) => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusNote, setStatusNote] = useState('');
  const [statusFiles, setStatusFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const isAdmin = user?.role === 'admin';
  const isOwner = user?.uid === issue?.userId;
  const canEdit = isAdmin || isOwner;

  // Get resolution time calculation
  const getResolutionTime = () => {
    if (!issue) return null;
    
    // Check if issue is resolved or closed
    if (issue.status !== 'resolved' && issue.status !== 'closed') {
      return null;
    }
    
    // Find when the issue was first created - try multiple fields
    const startTimeFields = [issue.createdAt, issue.submittedAt, issue.timestamp];
    let startTime = null;
    
    for (const field of startTimeFields) {
      if (field) {
        const date = new Date(field);
        if (!isNaN(date.getTime())) {
          startTime = date;
          break;
        }
      }
    }
    
    if (!startTime) {
      console.warn("No valid start time found for issue:", issue.id);
      return null;
    }
    
    // Find when the issue was resolved - try multiple fields
    const endTimeFields = [issue.adminResolutionTime, issue.resolvedAt];
    let endTime = null;
    
    for (const field of endTimeFields) {
      if (field) {
        const date = new Date(field);
        if (!isNaN(date.getTime())) {
          endTime = date;
          break;
        }
      }
    }
    
    if (!endTime) {
      // If no specific resolution time is found but issue status is resolved,
      // look for resolution status in statusHistory
      if (issue.statusHistory && issue.statusHistory.length > 0) {
        const resolutionUpdate = issue.statusHistory.find(
          update => ['resolved', 'resolved-by-admin', 'resolved-by-student'].includes(update.status)
        );
        
        if (resolutionUpdate && resolutionUpdate.timestamp) {
          const date = new Date(resolutionUpdate.timestamp);
          if (!isNaN(date.getTime())) {
            endTime = date;
          }
        }
      }
    }
    
    if (!endTime) {
      console.warn("No valid resolution time found for issue:", issue.id);
      return null;
    }
    
    // Calculate the time difference
    const timeDiff = endTime - startTime;
    return timeDiff > 0 ? timeDiff : null;
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        setLoading(true);
        const issueData = await getIssueById(id);
        
        if (!issueData) {
          setError('Issue not found');
          return;
        }
        
        setIssue(issueData);
        setError(null);
      } catch (err) {
        console.error('Error fetching issue:', err);
        setError('Failed to load issue details');
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  // Console log for debugging
  useEffect(() => {
    console.log(`Rendering IssueDetailPage for ID: ${id}, isAdminView: ${isAdminView}`);
  }, [id, isAdminView]);

  // Handle file selection for status updates
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length === 0) return;
    
    // Check file types (only images and videos allowed)
    const validFiles = selectedFiles.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    if (validFiles.length !== selectedFiles.length) {
      setError("Only image and video files are allowed");
      return;
    }
    
    // Check file sizes (limit to 20MB each)
    const validSizedFiles = validFiles.filter(file => file.size <= 20 * 1024 * 1024);
    if (validSizedFiles.length !== validFiles.length) {
      setError("Files must be less than 20MB each");
      return;
    }
    
    // Create preview URLs for the files
    const newPreviewUrls = validSizedFiles.map(file => URL.createObjectURL(file));
    
    setStatusFiles(validSizedFiles);
    setPreviewUrls(newPreviewUrls);
    setError(null);
  };
  
  // Remove a file from the selection
  const removeFile = (index) => {
    setStatusFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };

  const openStatusModal = (status) => {
    setNewStatus(status);
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!canEdit) return;
    
    // Admin needs to provide proof and notes for status updates
    if (isAdmin && statusFiles.length === 0) {
      setError("Please upload at least one image or video as proof");
      return;
    }
    
    // For resolving an issue, notes are required
    if ((newStatus === 'resolved-by-admin' || newStatus === 'resolved-by-student') && !statusNote) {
      setError("Please provide notes about the resolution");
      return;
    }
    
    try {
      setUpdating(true);
      setError(null);
      
      // Upload files if provided
      let fileUrls = [];
      if (statusFiles.length > 0) {
        fileUrls = await Promise.all(
          statusFiles.map(async (file) => {
            const path = `issues/${id}/status_updates/${Date.now()}_${file.name}`;
            const url = await uploadFile(file, path, (progress) => {
              setUploadProgress(progress);
            });
            return {
              url,
              type: file.type.startsWith('image/') ? 'image' : 'video',
              name: file.name
            };
          })
        );
      }
      
      // Create status history entry
      const statusUpdate = {
        status: newStatus,
        timestamp: new Date().toISOString(),
        updatedBy: user.uid,
        updatedByName: user.displayName || (isAdmin ? 'Administrator' : 'Student'),
        notes: statusNote,
        attachments: fileUrls
      };
      
      // Special handling for resolution confirmations
      let updates = {};
      if (newStatus === 'resolved-by-admin') {
        updates = {
          status: 'pending-student-confirmation',
          resolvedByAdmin: true,
          adminResolutionTime: new Date().toISOString()
        };
      } else if (newStatus === 'resolved-by-student' && issue.resolvedByAdmin) {
        // If both admin and student have confirmed resolution
        updates = {
          status: 'resolved',
          resolvedByStudent: true,
          studentConfirmationTime: new Date().toISOString()
        };
      } else {
        updates = { status: newStatus };
      }
      
      // Add the new status to the history
      const statusHistory = [...(issue.statusHistory || []), statusUpdate];
      
      // Update the issue
      await updateIssue(id, { 
        ...updates,
        statusHistory
      });
      
      // Update local state
      setIssue(prev => ({
        ...prev,
        ...updates,
        statusHistory
      }));
      
      // Clean up
      setStatusNote('');
      setStatusFiles([]);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      setShowStatusModal(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
      setUploadProgress(0);
    }
  };

  const getAvailableStatusActions = () => {
    const currentStatus = issue?.status || '';
    
    if (isAdmin) {
      // Admin status transitions
      switch (currentStatus) {
        case 'submitted':
          return ['in-review', 'assigned', 'delayed'];
        case 'in-review':
          return ['assigned', 'delayed', 'closed'];
        case 'assigned':
          return ['in-progress', 'delayed'];
        case 'in-progress':
          return ['waiting-for-parts', 'delayed', 'completed'];
        case 'waiting-for-parts':
          return ['in-progress', 'delayed'];
        case 'delayed':
          return ['in-review', 'assigned', 'in-progress'];
        case 'completed':
          return ['resolved-by-admin'];
        case 'pending-student-confirmation':
          return ['in-progress', 'closed']; // Admin can reopen or force close
        default:
          return ['in-review', 'assigned', 'in-progress', 'closed'];
      }
    } else {
      // Student status transitions
      switch (currentStatus) {
        case 'pending-student-confirmation':
          return ['resolved-by-student']; // Student confirms resolution
        case 'completed':
          return []; // Student can't change this status
        case 'resolved':
          return []; // Final state
        case 'closed':
          return []; // Final state
        default:
          return []; // Students can't change other statuses
      }
    }
  };

  const getStatusButtonLabel = (status) => {
    switch (status) {
      case 'in-review': return 'Mark as In Review';
      case 'assigned': return 'Mark as Assigned';
      case 'in-progress': return 'Mark as In Progress';
      case 'delayed': return 'Mark as Delayed';
      case 'waiting-for-parts': return 'Mark as Waiting for Parts';
      case 'completed': return 'Mark as Completed';
      case 'resolved-by-admin': return 'Mark as Resolved';
      case 'resolved-by-student': return 'Confirm Resolution';
      case 'closed': return 'Close Issue';
      default: return `Mark as ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Issue not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Update handleBack to navigate to correct location
  const handleBack = () => {
    if (isAdminView) {
      navigate('/admin/issues');
    } else {
      navigate('/my-issues');
    }
  };

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
                onClick={() => navigate(-1)}
                className="mr-3 text-gray-500 hover:text-gray-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900 truncate">
                {issue.title}
              </h1>
            </div>
            <ProfileDropdown user={user} />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Issue Details Card */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {issue.title}
                  </h2>
                  <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                    <StatusBadge status={issue.status} />
                    <PriorityBadge priority={issue.priority} />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 mb-6 space-y-1 sm:space-y-0 sm:space-x-2">
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Submitted by {issue.userName || 'Anonymous'}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {/* Add additional fallback logic */}
                    <span>
                      {issue.submittedAt || issue.createdAt || issue.timestamp 
                        ? formatDate(issue.submittedAt || issue.createdAt || issue.timestamp)
                        : 'Date not recorded'}
                    </span>
                  </div>
                  
                  {/* Add Resolution Time to the header info */}
                  {(issue.status === 'resolved' || issue.status === 'closed') && getResolutionTime() && (
                    <div className="flex items-center text-green-600 font-medium">
                      <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Resolved in {formatTimeDifference(getResolutionTime())}</span>
                    </div>
                  )}
                </div>

                <div className="prose max-w-none mb-8">
                  <p className="text-gray-700">{issue.description}</p>
                </div>

                {/* Student Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500">Roll Number</h3>
                    <p className="mt-1 text-sm text-gray-900 font-medium">
                      {issue.rollNumber || 'Not specified'}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500">Room Number</h3>
                    <p className="mt-1 text-sm text-gray-900 font-medium">
                      {issue.roomNumber || 'Not specified'}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500">Contact</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {issue.userEmail || 'No contact information'}
                    </p>
                  </div>
                </div>

                {/* Issue Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {issue.mainCategory || 'Uncategorized'}
                      {issue.subCategory && ` > ${issue.subCategory}`}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {issue.location || 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Original Attachments */}
                {issue.attachments && issue.attachments.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Attached Proof</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {issue.attachments.map((file, index) => (
                        <div key={index} className="relative group">
                          {file.type === 'image' ? (
                            <a 
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block border border-gray-200 rounded-lg overflow-hidden"
                            >
                              <img 
                                src={file.url} 
                                alt={`Attachment ${index + 1}`}
                                className="h-24 w-full object-cover"
                              />
                            </a>
                          ) : (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex flex-col items-center justify-center h-24 bg-gray-100 border border-gray-200 rounded-lg p-2 hover:bg-gray-200"
                            >
                              <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs mt-2 text-center text-gray-800 truncate w-full">
                                {file.name || 'Video'}
                              </span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Update Actions */}
                {canEdit && getAvailableStatusActions().length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Update Status</h3>
                    <div className="flex flex-wrap gap-2">
                      {getAvailableStatusActions().map(status => (
                        <button
                          key={status}
                          onClick={() => openStatusModal(status)}
                          disabled={updating}
                          className={`px-3 py-1 text-sm rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50
                          ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {getStatusButtonLabel(status)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Status Timeline Section */}
            <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Status Timeline</h3>
                <StatusTimeline statusHistory={issue.statusHistory || []} issue={issue} />
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background Overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowStatusModal(false)}></div>
            
            {/* Modal Panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {getStatusButtonLabel(newStatus)}
                  </h3>
                  
                  <div className="mt-4">
                    <label htmlFor="status-note" className="block text-sm font-medium text-gray-700">
                      Add Notes
                      {(newStatus === 'resolved-by-admin' || newStatus === 'resolved-by-student') && ' *'}
                    </label>
                    <textarea
                      id="status-note"
                      rows="3"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Explain what changed with this status update"
                      required={newStatus === 'resolved-by-admin' || newStatus === 'resolved-by-student'}
                    />
                  </div>
                  
                  {/* File Upload Section (for admin only) */}
                  {isAdmin && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Upload Proof (Images/Videos) 
                        {isAdmin && ' *'}
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                              <span>Upload files</span>
                              <input 
                                id="file-upload" 
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*,video/*"
                                multiple 
                                className="sr-only" 
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF, MP4 up to 20MB</p>
                        </div>
                      </div>
                      
                      {/* File Previews */}
                      {previewUrls.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {previewUrls.map((url, index) => (
                            <div key={index} className="relative">
                              {statusFiles[index]?.type.startsWith('image/') ? (
                                <img
                                  src={url}
                                  alt={`Preview ${index + 1}`}
                                  className="h-24 w-full object-cover rounded border border-gray-200"
                                />
                              ) : (
                                <div className="h-24 w-full bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2"
                              >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Upload Progress */}
                  {updating && uploadProgress > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Uploading files...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                      {error}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={updating || (isAdmin && statusFiles.length === 0) || ((newStatus === 'resolved-by-admin' || newStatus === 'resolved-by-student') && !statusNote)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueDetailPage;
