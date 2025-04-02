import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mainCategories, subCategories } from '../../utils/categories.jsx';

const CreateIssueModal = ({ onClose, onSubmit }) => {
  const { user } = useAuth();
  
  // Initialize with empty values if user is null
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    mainCategory: '',
    subCategory: '',
    location: user?.roomNumber || '',
    createdBy: {
      name: user?.name || '',
      email: user?.email || '',
      rollNumber: user?.rollNumber || '',
    },
    attachments: [],
    mediaFiles: []
  });
  
  const [availableSubCategories, setAvailableSubCategories] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Handle main category change
    if (name === 'mainCategory') {
      setFormData(prev => ({
        ...prev,
        subCategory: ''
      }));
      
      // Update available subcategories based on main category
      setAvailableSubCategories(value ? subCategories[value] : []);
    }
  };
  
  // For handling file drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  const handleFiles = (files) => {
    const newFiles = Array.from(files).filter(file => {
      // Accept images and videos only
      return file.type.startsWith('image/') || file.type.startsWith('video/');
    });
    
    if (newFiles.length === 0) {
      alert('Please upload only image or video files.');
      return;
    }
    
    // Create preview URLs for the files
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setFormData(prev => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, ...newFiles],
      attachments: [...prev.attachments, ...newFiles.map(file => file.name)]
    }));
  };

  const removeFile = (index) => {
    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index),
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.mainCategory || !formData.subCategory) {
      alert('Please select both a main category and subcategory.');
      return;
    }
    
    // Format all the data needed by both student and admin views
    const issueData = {
      ...formData,
      // Format the category for display
      category: `${formData.mainCategory}-${formData.subCategory}`,
      createdBy: {
        name: user?.displayName || '',
        email: user?.email || '',
        rollNumber: user?.rollNumber || '',
        roomNumber: user?.roomNumber || '',
      },
      // Remove redundant fields now that we've composed the category
      mainCategory: undefined,
      subCategory: undefined
    };
    
    onSubmit(issueData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-blue-600 text-white">
          <h3 className="text-lg font-medium">Create New Issue</h3>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* User Information (Auto-filled) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Your Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500">Name</label>
                  <p className="text-sm font-medium">{user?.name || 'Not available'}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Roll Number</label>
                  <p className="text-sm font-medium">{user?.rollNumber || 'Not available'}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Email</label>
                  <p className="text-sm font-medium">{user?.email || 'Not available'}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500">Room Number</label>
                  <p className="text-sm font-medium">{user?.roomNumber || 'Not available'}</p>
                </div>
              </div>
            </div>

            {/* Issue Details */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Brief title of the issue"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                required
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Detailed description of the issue"
              ></textarea>
            </div>

            {/* Category Selection - Two level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="mainCategory" className="block text-sm font-medium text-gray-700">
                  Main Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="mainCategory"
                  name="mainCategory"
                  value={formData.mainCategory}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select main category</option>
                  {mainCategories.map(category => (
                    <option key={category.id} value={category.id}>{category.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700">
                  Sub Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="subCategory"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.mainCategory}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">Select sub category</option>
                  {availableSubCategories.map(category => (
                    <option key={category.id} value={category.id}>{category.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                id="location"
                required
                value={formData.location}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Where is this issue located? (e.g., Room 302, Building A)"
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Media Uploads - Images & Videos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Photos or Videos
              </label>
              
              <div 
                className={`mt-1 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
              >
                <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-1 text-sm text-gray-600">
                  Drag and drop photos or videos, or click to select
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Supported formats: JPEG, PNG, GIF, MP4, MOV
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
              </div>
              
              {/* Media Previews */}
              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden h-24 bg-gray-100">
                      {formData.mediaFiles[index]?.type.startsWith('image/') ? (
                        <img 
                          src={url} 
                          alt={`Preview ${index}`} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <video 
                          src={url} 
                          className="h-full w-full object-cover"
                          controls
                        />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIssueModal;
