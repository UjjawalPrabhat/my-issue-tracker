import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { createIssue, getCategories } from '../../../services/api';
import { getFirestoreErrorMessage } from '../../../utils/firebaseErrors';
import { uploadFile } from '../../../services/storage';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { createNotification } from '../../../services/notifications';

const IssueForm = ({ onIssueCreated }) => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mainCategory: '',
    subCategory: '',
    location: '',
    priority: 'medium',
  });
  
  const [categories, setCategories] = useState({ main: [], sub: {} });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [userDetails, setUserDetails] = useState({
    displayName: '',
    email: '',
    roomNumber: '',
    rollNumber: '',
  });

  // Fetch user details and categories
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user?.uid) {
        try {
          // Get user profile data
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserDetails({
              displayName: userData.displayName || user.displayName || '',
              email: user.email || '',
              roomNumber: userData.roomNumber || '',
              rollNumber: userData.rollNumber || '',
            });
          }
        } catch (err) {
          console.error('Error fetching user details:', err);
        }
      }
    };

    const fetchCategories = async () => {
      try {
        const categoriesDoc = await getDoc(doc(db, 'settings', 'categories'));
        if (categoriesDoc.exists()) {
          setCategories(categoriesDoc.data());
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchUserDetails();
    fetchCategories();
  }, [user]);

  // Handle file selection
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
    
    setFiles(prevFiles => [...prevFiles, ...validSizedFiles]);
    setPreviewUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
    setError(null);
  };
  
  // Remove a file from the selection
  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Reset subCategory when mainCategory changes
    if (name === 'mainCategory') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        subCategory: '' 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.uid) {
      setError("You must be logged in to submit an issue");
      return;
    }
    
    if (files.length === 0) {
      setError("Please upload at least one image or video as proof");
      return;
    }
    
    // Check if room number and roll number are available in user profile
    if (!userDetails.roomNumber) {
      setError('Your profile is missing room number. Please complete your profile before submitting an issue.');
      return;
    }
    
    if (!userDetails.rollNumber) {
      setError('Your profile is missing roll number. Please complete your profile before submitting an issue.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      // Upload all files first
      const fileUrls = await Promise.all(
        files.map(async (file) => {
          try {
            const path = `issues/${user.uid}/${Date.now()}_${file.name}`;
            const url = await uploadFile(file, path, (progress) => {
              setUploadProgress(progress);
            });
            return {
              url,
              type: file.type.startsWith('image/') ? 'image' : 'video',
              name: file.name
            };
          } catch (fileError) {
            console.error("Error uploading file:", fileError);
            throw new Error(`File upload failed: ${fileError.message || 'Unknown error'}`);
          }
        })
      );
      
      // Create issue with file URLs
      const issueData = {
        ...formData,
        status: 'submitted', // Initial status is now 'submitted' instead of 'open'
        statusHistory: [
          {
            status: 'submitted',
            timestamp: new Date().toISOString(),
            updatedBy: user.uid,
            updatedByName: user.displayName || 'Student',
            notes: 'Issue submitted',
          }
        ],
        attachments: fileUrls,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || userDetails.displayName || 'Anonymous',
        roomNumber: userDetails.roomNumber,   // Add from user profile
        rollNumber: userDetails.rollNumber,   // Add from user profile
        submittedAt: new Date().toISOString(),
        // This will be set to true only when both the admin and student confirm resolution
        resolvedByAdmin: false,
        resolvedByStudent: false
      };
      
      const newIssue = await createIssue(issueData);
      
      // Create notification for admins
      try {
        await createNotification({
          type: 'issue',
          title: 'New Issue Submitted',
          message: `A new issue "${formData.title}" has been submitted by ${user?.displayName || 'a student'}.`,
          audience: ['admin'],
          actionUrl: `/admin/issues/${newIssue.id}`,
          actionText: 'View Issue',
          relatedIssueId: newIssue.id
        });
      } catch (notificationError) {
        // Log the error but don't fail the whole submission
        console.error("Error creating notification:", notificationError);
        // Continue with the form submission flow
      }
      
      // Show success message
      setSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        mainCategory: '',
        subCategory: '',
        location: '',
        priority: 'medium',
      });
      
      // Clear files
      setFiles([]);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Notify parent component
      if (onIssueCreated) {
        onIssueCreated(newIssue);
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      console.error("Error creating issue:", err);
      if (err.code === 'permission-denied') {
        setError("You don't have permission to create issues. Please contact an administrator.");
      } else {
        setError(getFirestoreErrorMessage(err) || "Failed to create issue. Please try again.");
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (categoriesLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-600">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 p-4 rounded-md border border-green-200 text-green-600">
          Issue created successfully!
        </div>
      )}
      
      {/* User information display - show what will be submitted */}
      <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Your Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <span className="font-medium">Name:</span> {userDetails.displayName || 'Not set'}
          </div>
          <div>
            <span className="font-medium">Email:</span> {userDetails.email}
          </div>
          <div>
            <span className="font-medium">Room Number:</span> {userDetails.roomNumber || 'Not set'}
          </div>
          <div>
            <span className="font-medium">Roll Number:</span> {userDetails.rollNumber || 'Not set'}
          </div>
        </div>
        {(!userDetails.roomNumber || !userDetails.rollNumber) && (
          <p className="mt-2 text-xs text-red-600">
            Please update your profile with missing information before submitting an issue.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Issue Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          rows="4"
          required
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        ></textarea>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="mainCategory" className="block text-sm font-medium text-gray-700">
            Main Category *
          </label>
          <select
            id="mainCategory"
            name="mainCategory"
            required
            value={formData.mainCategory}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {categories.main && categories.main.map(category => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700">
            Sub Category
          </label>
          <select
            id="subCategory"
            name="subCategory"
            value={formData.subCategory}
            onChange={handleChange}
            disabled={!formData.mainCategory}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          >
            <option value="">Select a sub-category</option>
            {formData.mainCategory && 
             categories.sub && 
             categories.sub[formData.mainCategory] && 
             categories.sub[formData.mainCategory].map(subCategory => (
              <option key={subCategory.id} value={subCategory.id}>
                {subCategory.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location *
          </label>
          <input
            id="location"
            name="location"
            type="text"
            required
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., Building A, Room 101"
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
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>
      
      {/* File Upload Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Upload Proof (Images/Videos) *
        </label>
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="file-upload"
            className="w-full flex flex-col items-center px-4 py-6 bg-white text-blue-500 rounded-lg border-2 border-dashed border-blue-200 cursor-pointer hover:bg-blue-50"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <span className="mt-2 text-sm text-gray-600">Click to browse files</span>
            <span className="mt-1 text-xs text-gray-500">Images and videos only (max 20MB each)</span>
            <input 
              id="file-upload" 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              multiple 
              className="hidden" 
            />
          </label>
        </div>
        
        {/* File Previews */}
        {previewUrls.length > 0 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative rounded-lg border border-gray-200 overflow-hidden">
                {files[index]?.type.startsWith('image/') ? (
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <video
                    src={url}
                    className="h-32 w-full object-cover"
                    controls
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Upload Progress */}
      {loading && uploadProgress > 0 && (
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block text-blue-600">
                Uploading files...
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                {uploadProgress}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
            <div style={{ width: `${uploadProgress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
          </div>
        </div>
      )}
      
      <div>
        <button
          type="submit"
          disabled={loading || files.length === 0}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${(loading || files.length === 0) ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Submitting...' : 'Submit Issue'}
        </button>
      </div>
    </form>
  );
};

export default IssueForm;
