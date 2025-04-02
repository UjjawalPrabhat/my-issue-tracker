import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const ProfileCompletionPrompt = ({ onComplete }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    roomNumber: user?.roomNumber || '',
    phoneNumber: user?.phoneNumber || '',
    year: user?.year || '',
    semester: user?.semester || ''
    // Removed rollNumber field as it will be automatically set
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailInfo, setEmailInfo] = useState(null);

  // Parse student email to extract information when component mounts
  useEffect(() => {
    if (user?.email && user.email.endsWith('@sst.scaler.com')) {
      const info = parseStudentEmail(user.email);
      setEmailInfo(info);
      
      // Update form data with extracted information
      setFormData(prev => ({
        ...prev,
        year: prev.year || info.year || '',
        semester: prev.semester || info.semester || '',
        // Don't auto-fill roomNumber as it's a required field that needs user input
      }));
    }
  }, [user?.email]);

  // Helper function to parse student email
  const parseStudentEmail = (email) => {
    try {
      // Extract local part before @
      const localPart = email.split('@')[0];
      const parts = localPart.split('.');
      
      // Extract roll number (last part before @)
      const rollNumber = parts[parts.length - 1];
      
      // Calculate year of study based on roll number
      let year = '';
      let semester = '';
      
      if (rollNumber && rollNumber.length >= 2) {
        const enrollmentYear = parseInt('20' + rollNumber.substring(0, 2), 10);
        
        if (!isNaN(enrollmentYear)) {
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth() + 1; // 1-12
          
          // Calculate academic years since enrollment
          let academicYears = currentYear - enrollmentYear;
          
          // If before August, they're still in the previous academic year
          if (currentMonth < 8) {
            academicYears--;
          }
          
          // Clamp between 1-4 years
          const yearOfStudy = Math.min(Math.max(academicYears + 1, 1), 4);
          year = yearOfStudy.toString();
          
          // Calculate semester based on month
          if (currentMonth >= 8 || currentMonth <= 1) {
            // Aug-Jan is odd semester
            semester = ((yearOfStudy * 2) - 1).toString();
          } else {
            // Feb-Jul is even semester
            semester = (yearOfStudy * 2).toString();
          }
          
          // Ensure semester is between 1-8
          semester = Math.min(Math.max(parseInt(semester), 1), 8).toString();
        }
      }
      
      return { 
        rollNumber,
        year, 
        semester
      };
    } catch (error) {
      console.error("Error parsing student email:", error);
      return { rollNumber: '', year: '', semester: '' };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.uid) {
      setError("Authentication error. Please refresh the page and try again.");
      return;
    }
    
    // Validate required fields
    if (!formData.roomNumber.trim()) {
      setError("Room number is required");
      return;
    }
    
    if (!formData.year) {
      setError("Year is required");
      return;
    }
    
    if (!formData.semester) {
      setError("Semester is required");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Get roll number from email if available
      const rollNumber = emailInfo?.rollNumber || '';
      
      // Check if rollNumber was properly extracted
      if (!rollNumber) {
        console.warn("Unable to extract roll number from email:", user.email);
      }
      
      console.log("Updating user profile with rollNumber:", rollNumber);
      
      // Update user document with new profile data
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...formData,
        rollNumber, // Add automatically extracted roll number
        isProfileComplete: true,
        updatedAt: new Date().toISOString()
      });
      
      // Inform parent component that profile has been completed
      if (onComplete) {
        onComplete({...formData, rollNumber});
      }
      
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-800 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md mx-auto w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Profile</h2>
        
        <p className="mb-4 text-gray-600">
          Please provide some additional details to complete your profile.
        </p>
        
        {emailInfo && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Note:</span> Some information has been automatically filled based on your email.
              {emailInfo.rollNumber && (
                <> Your roll number ({emailInfo.rollNumber}) has been automatically extracted.</>
              )}
            </p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700">
                Room Number <span className="text-red-500">*</span>
              </label>
              <input
                id="roomNumber"
                name="roomNumber"
                type="text"
                required
                value={formData.roomNumber}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., A-101"
              />
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Your contact number"
              />
            </div>
            
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                Year <span className="text-red-500">*</span>
              </label>
              <select
                id="year"
                name="year"
                required
                value={formData.year}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
              {emailInfo?.year && (
                <p className="mt-1 text-xs text-gray-500">
                  Calculated from your email: {emailInfo.year}{emailInfo.year === '1' ? 'st' : emailInfo.year === '2' ? 'nd' : emailInfo.year === '3' ? 'rd' : 'th'} Year
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                Semester <span className="text-red-500">*</span>
              </label>
              <select
                id="semester"
                name="semester"
                required
                value={formData.semester}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select semester</option>
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
                <option value="3">3rd Semester</option>
                <option value="4">4th Semester</option>
                <option value="5">5th Semester</option>
                <option value="6">6th Semester</option>
                <option value="7">7th Semester</option>
                <option value="8">8th Semester</option>
              </select>
              {emailInfo?.semester && (
                <p className="mt-1 text-xs text-gray-500">
                  Calculated from your email: {emailInfo.semester}{emailInfo.semester === '1' ? 'st' : emailInfo.semester === '2' ? 'nd' : emailInfo.semester === '3' ? 'rd' : 'th'} Semester
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onComplete && onComplete()}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Skip for now
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletionPrompt;
