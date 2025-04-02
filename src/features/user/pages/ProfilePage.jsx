import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import Sidebar from '../../../components/layout/Sidebar';
import ProfileDropdown from '../../../components/common/ProfileDropdown';
import { getFirestoreErrorMessage } from '../../../utils/firebaseErrors';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    phoneNumber: user?.phoneNumber || '',
    // Admin users don't need student-specific fields
    ...(user?.role !== 'admin' && {
      rollNumber: user?.rollNumber || '',
      year: user?.year || '',
      roomNumber: user?.roomNumber || '',
      semester: user?.semester || ''
    })
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is an admin
  const isAdmin = user?.role === 'admin' || user?.email === 'iamujjawal4u@gmail.com';

  // Email parsing information - Only for students
  const emailInfo = React.useMemo(() => {
    if (isAdmin || !user?.email || !user.email.endsWith('@sst.scaler.com')) {
      return null;
    }
    
    // Extract email components
    const localPart = user.email.split('@')[0];
    const parts = localPart.split('.');
    
    // Extract name and roll number
    const rollNumber = parts.length > 0 ? parts[parts.length - 1] : '';
    const nameParts = parts.slice(0, parts.length - 1);
    
    // Get current date to calculate year of study
    let yearInfo = null;
    if (rollNumber && rollNumber.length >= 2) {
      try {
        const enrollmentYear = parseInt('20' + rollNumber.substring(0, 2), 10);
        if (!isNaN(enrollmentYear)) {
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const currentMonth = currentDate.getMonth() + 1;
          
          let academicYears = currentYear - enrollmentYear;
          if (currentMonth < 8) {
            academicYears--;
          }
          
          const yearOfStudy = Math.min(Math.max(academicYears + 1, 1), 4);
          
          let currentSemester;
          if (currentMonth >= 8 || currentMonth <= 1) {
            currentSemester = (yearOfStudy * 2) - 1;
          } else {
            currentSemester = yearOfStudy * 2;
          }
          
          yearInfo = {
            year: yearOfStudy,
            semester: Math.min(Math.max(currentSemester, 1), 8)
          };
        }
      } catch (e) {
        console.error("Error calculating academic year:", e);
      }
    }
    
    return { 
      name: nameParts,
      rollNumber,
      yearInfo
    };
  }, [user?.email, isAdmin]);

  // Fetch latest user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;
      
      try {
        setRefreshing(true);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          if (isAdmin) {
            // For admin users, only set basic fields
            setFormData({
              displayName: userData.displayName || user.displayName || '',
              phoneNumber: userData.phoneNumber || '',
              // Include any admin-specific fields here
            });
          } else {
            // For student users, set all fields including student-specific ones
            setFormData({
              displayName: userData.displayName || user.displayName || '',
              rollNumber: userData.rollNumber || '',
              year: userData.year || user.year || '',
              phoneNumber: userData.phoneNumber || '',
              roomNumber: userData.roomNumber || '',
              semester: userData.semester || user.semester || ''
            });
          }
        } else if (emailInfo && !isAdmin) {
          // If no user document but we have email info for students, use that
          setFormData(prev => ({
            ...prev,
            rollNumber: emailInfo.rollNumber || '',
            year: emailInfo.yearInfo?.year?.toString() || '',
            semester: emailInfo.yearInfo?.semester?.toString() || ''
          }));
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setRefreshing(false);
      }
    };
    
    fetchUserData();
  }, [user?.uid, user?.displayName, emailInfo, isAdmin]);

  // Auto-fill any missing information with extracted data - for students only
  useEffect(() => {
    if (emailInfo && !isAdmin) {
      setFormData(prev => {
        const formattedName = emailInfo.name
          .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join(' ');
          
        return {
          ...prev,
          // Only use extracted values if current values are empty
          displayName: prev.displayName || formattedName || '',
          rollNumber: prev.rollNumber || emailInfo.rollNumber || '',
          year: prev.year || (emailInfo.yearInfo?.year?.toString() || ''),
          semester: prev.semester || (emailInfo.yearInfo?.semester?.toString() || '')
        };
      });
      
      // If email has been parsed and roll number is available, immediately update the user document
      if (emailInfo.rollNumber && user?.uid) {
        const userRef = doc(db, 'users', user.uid);
        updateDoc(userRef, {
          rollNumber: emailInfo.rollNumber
        }).catch(err => {
          console.error("Error auto-updating roll number:", err);
        });
      }
    }
  }, [emailInfo, user?.uid, isAdmin]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.uid) {
      setError("You must be logged in to update your profile");
      return;
    }
    
    // Validate required fields
    if (!formData.displayName.trim()) {
      setError("Name is required");
      return;
    }
    
    // Student-specific validation
    if (!isAdmin) {
      if (!formData.roomNumber?.trim()) {
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
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...formData,
        isProfileComplete: true,
        updatedAt: new Date().toISOString()
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(getFirestoreErrorMessage(err));
    } finally {
      setLoading(false);
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
            <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
            <ProfileDropdown user={user} />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">User Information</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and profile information</p>
                
                {emailInfo && !isAdmin && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm">
                    <p className="text-blue-700">
                      <span className="font-medium">Note:</span> Information has been automatically filled from your email ({user.email}). Feel free to update any incorrect details.
                    </p>
                  </div>
                )}

                {isAdmin && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm">
                    <p className="text-blue-700">
                      <span className="font-medium">Admin Profile:</span> As an administrator, you only need to provide basic information.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                {refreshing ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-600">
                        {error}
                      </div>
                    )}
                    
                    {success && (
                      <div className="bg-green-50 p-4 rounded-md border border-green-200 text-green-600">
                        Profile updated successfully!
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        id="displayName"
                        name="displayName"
                        type="text"
                        value={formData.displayName}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      {emailInfo && !isAdmin && emailInfo.name.length > 0 && (
                        <p className="mt-1 text-xs text-gray-500">
                          Extracted from email: {emailInfo.name.map(p => 
                            p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
                          ).join(' ')}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                        />
                        <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
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
                        />
                      </div>
                    </div>
                    
                    {/* Student-specific fields */}
                    {!isAdmin && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700">
                              Roll Number
                            </label>
                            <input
                              id="rollNumber"
                              name="rollNumber"
                              type="text"
                              value={formData.rollNumber}
                              disabled
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                            />
                            {emailInfo && emailInfo.rollNumber && (
                              <p className="mt-1 text-xs text-gray-500">
                                Extracted from email: {emailInfo.rollNumber}
                              </p>
                            )}
                          </div>
                          
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
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            {emailInfo && emailInfo.yearInfo && (
                              <p className="mt-1 text-xs text-gray-500">
                                Calculated automatically: {emailInfo.yearInfo.year}{emailInfo.yearInfo.year === 1 ? 'st' : emailInfo.yearInfo.year === 2 ? 'nd' : emailInfo.yearInfo.year === 3 ? 'rd' : 'th'} Year
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
                            {emailInfo && emailInfo.yearInfo && (
                              <p className="mt-1 text-xs text-gray-500">
                                Calculated automatically: {emailInfo.yearInfo.semester}{emailInfo.yearInfo.semester === 1 ? 'st' : emailInfo.yearInfo.semester === 2 ? 'nd' : emailInfo.yearInfo.semester === 3 ? 'rd' : 'th'} Semester
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                    
                    {/* Admin-specific fields could be added here if needed */}
                    {isAdmin && (
                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                          Role
                        </label>
                        <input
                          id="role"
                          type="text"
                          value="Administrator"
                          disabled
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
