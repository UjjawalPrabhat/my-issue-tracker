import React, { useRef, useEffect } from 'react';
import { getCategoryIcon } from '../../utils/categories.jsx';

const IssueDetailsModal = ({ issue, onClose }) => {
  const modalRef = useRef(null);

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Extract main and sub category from combined category string
  const getCategoryInfo = (categoryString) => {
    if (!categoryString) return { main: 'general', sub: 'general' };
    
    const parts = categoryString.split('-');
    if (parts.length === 2) {
      return { main: parts[0], sub: parts[1] };
    }
    
    return { main: 'general', sub: 'general' };
  };

  // Get display name from createdBy field
  const getDisplayName = (createdBy) => {
    if (!createdBy) return 'Unknown';
    
    if (typeof createdBy === 'object' && createdBy.name) {
      return createdBy.name;
    } else if (typeof createdBy === 'object' && createdBy.email) {
      return createdBy.email.split('@')[0];
    } else if (typeof createdBy === 'string') {
      return createdBy.includes('@') ? createdBy.split('@')[0] : createdBy;
    }
    
    return 'Unknown';
  };

  // Map status to color class
  const getStatusColor = (status) => {
    const statusColors = {
      open: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  // Map priority to color class
  const getPriorityColor = (priority) => {
    const priorityColors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return priorityColors[priority] || 'bg-gray-100 text-gray-800';
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  // Prevent scrolling on the body when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const { main: mainCategory, sub: subCategory } = getCategoryInfo(issue.category);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-blue-600 text-white">
          <h3 className="text-lg font-medium">Issue Details</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {/* Issue Title and Status */}
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                {getCategoryIcon(subCategory)}
                <span className="ml-2">{issue.title}</span>
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(issue.status)}`}>
                {issue.status || 'open'}
              </span>
            </div>
            
            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Submitted by:</span>
                <p className="font-medium">{getDisplayName(issue.createdBy)}</p>
              </div>
              <div>
                <span className="text-gray-500">Created on:</span>
                <p className="font-medium">{formatDate(issue.createdAt)}</p>
              </div>
              <div>
                <span className="text-gray-500">Priority:</span>
                <p className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getPriorityColor(issue.priority)}`}>
                  {issue.priority || 'medium'}
                </p>
              </div>
            </div>
            
            {/* Category and Location */}
            <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Category:</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {mainCategory}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {subCategory}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-gray-500">Location:</span>
                <p className="font-medium mt-1">{issue.location}</p>
              </div>
            </div>
            
            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap">
                {issue.description}
              </div>
            </div>
            
            {/* Media Attachments */}
            {issue.mediaFiles && issue.mediaFiles.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Attachments</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {issue.mediaFiles.map((file, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden bg-gray-100 aspect-square">
                      {file.type?.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Attachment ${idx}`} 
                          className="h-full w-full object-cover" 
                        />
                      ) : file.type?.startsWith('video/') ? (
                        <video 
                          src={URL.createObjectURL(file)} 
                          className="h-full w-full object-cover" 
                          controls
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailsModal;
