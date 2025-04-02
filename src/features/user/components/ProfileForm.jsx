import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { getFirestoreErrorMessage } from '../../../utils/firebaseErrors';

const ProfileForm = ({ userData }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    displayName: userData?.displayName || '',
    department: userData?.department || '',
    phoneNumber: userData?.phoneNumber || '',
    roomNumber: userData?.roomNumber || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, formData);
      
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
      </div>
      
      <div>
        <label htmlFor="department" className="block text-sm font-medium text-gray-700">
          Department
        </label>
        <input
          id="department"
          name="department"
          type="text"
          value={formData.department}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
        />
      </div>
      
      <div>
        <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700">
          Room Number (if applicable)
        </label>
        <input
          id="roomNumber"
          name="roomNumber"
          type="text"
          value={formData.roomNumber}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;
