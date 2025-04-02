import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Sidebar from "../../../components/layout/Sidebar";
import ProfileDropdown from "../../../components/common/ProfileDropdown";
import ErrorBoundary from "../../../components/common/ErrorBoundary";

const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  
  // Form state for profile info
  const [profileForm, setProfileForm] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    rollNumber: user?.rollNumber || '',
    roomNumber: user?.roomNumber || '',
  });

  // State for notification preferences
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: {
      statusUpdates: true,
      comments: true,
      resolution: true,
      announcements: false,
      weeklyDigest: false
    },
    inApp: {
      statusUpdates: true,
      comments: true,
      resolution: true,
      announcements: true,
      feedbackRequests: false
    }
  });

  // State for privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    complaintHistoryVisibility: true,
    dataCollection: true
  });

  // State for display preferences
  const [displayPreferences, setDisplayPreferences] = useState({
    theme: 'system',
    language: 'english',
    reduceMotion: false,
    highContrast: false
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (section, setting, value) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [setting]: value
      }
    }));
  };

  const handlePrivacyChange = (setting, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleDisplayChange = (setting, value) => {
    setDisplayPreferences(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would call an API to update the user profile
    updateProfile(profileForm);
    alert('Profile updated successfully!');
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
                onClick={toggleSidebar}
                className="text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center ml-2 lg:ml-0">
                <span className="text-xl font-semibold text-blue-600">Settings</span>
              </div>
            </div>
            
            {/* Profile Dropdown */}
            <ProfileDropdown user={user} />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-8">
          <ErrorBoundary>
            <div className="max-w-3xl mx-auto">
              {/* Tabs Navigation */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                  <button
                    onClick={() => handleTabChange('account')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'account'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Account Settings
                  </button>
                  <button
                    onClick={() => handleTabChange('notifications')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'notifications'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Notifications
                  </button>
                  <button
                    onClick={() => handleTabChange('privacy')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'privacy'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Privacy & Security
                  </button>
                  <button
                    onClick={() => handleTabChange('preferences')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'preferences'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Preferences
                  </button>
                </nav>
              </div>

              {/* Account Settings */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div className="bg-white shadow overflow-hidden rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
                      <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>Update your account information and profile details.</p>
                      </div>
                      <div className="mt-5">
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Full name
                              </label>
                              <div className="mt-1">
                                <input
                                  type="text"
                                  name="name"
                                  id="name"
                                  value={profileForm.name}
                                  onChange={handleProfileChange}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-3">
                              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                              </label>
                              <div className="mt-1">
                                <input
                                  type="email"
                                  name="email"
                                  id="email"
                                  value={profileForm.email}
                                  readOnly
                                  disabled
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 bg-gray-100 rounded-md"
                                />
                              </div>
                              <p className="mt-1 text-xs text-gray-500">Your email cannot be changed</p>
                            </div>

                            <div className="sm:col-span-3">
                              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Phone number
                              </label>
                              <div className="mt-1">
                                <input
                                  type="tel"
                                  name="phone"
                                  id="phone"
                                  value={profileForm.phone}
                                  onChange={handleProfileChange}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-3">
                              <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700">
                                Roll Number
                              </label>
                              <div className="mt-1">
                                <input
                                  type="text"
                                  name="rollNumber"
                                  id="rollNumber"
                                  value={profileForm.rollNumber}
                                  onChange={handleProfileChange}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            </div>

                            <div className="sm:col-span-3">
                              <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700">
                                Room Number
                              </label>
                              <div className="mt-1">
                                <input
                                  type="text"
                                  name="roomNumber"
                                  id="roomNumber"
                                  value={profileForm.roomNumber}
                                  onChange={handleProfileChange}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="submit"
                              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Save
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow overflow-hidden rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Account Data</h3>
                      <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>Manage your account data and export options.</p>
                      </div>
                      <div className="mt-5 space-y-4">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Export Your Data
                        </button>

                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="bg-white shadow overflow-hidden rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Email Notifications</h3>
                      <div className="mt-5 space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="email-statusUpdates"
                              name="email-statusUpdates"
                              type="checkbox"
                              checked={notificationPreferences.email.statusUpdates}
                              onChange={(e) => handleNotificationChange('email', 'statusUpdates', e.target.checked)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="email-statusUpdates" className="font-medium text-gray-700">
                              Status Updates
                            </label>
                            <p className="text-gray-500">Receive emails when the status of your complaint changes.</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="email-comments"
                              name="email-comments"
                              type="checkbox"
                              checked={notificationPreferences.email.comments}
                              onChange={(e) => handleNotificationChange('email', 'comments', e.target.checked)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="email-comments" className="font-medium text-gray-700">
                              Comments
                            </label>
                            <p className="text-gray-500">Receive emails when someone comments on your complaint.</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="email-resolution"
                              name="email-resolution"
                              type="checkbox"
                              checked={notificationPreferences.email.resolution}
                              onChange={(e) => handleNotificationChange('email', 'resolution', e.target.checked)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="email-resolution" className="font-medium text-gray-700">
                              Resolution
                            </label>
                            <p className="text-gray-500">Receive emails when your complaint is resolved.</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="email-announcements"
                              name="email-announcements"
                              type="checkbox"
                              checked={notificationPreferences.email.announcements}
                              onChange={(e) => handleNotificationChange('email', 'announcements', e.target.checked)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="email-announcements" className="font-medium text-gray-700">
                              Announcements
                            </label>
                            <p className="text-gray-500">Receive emails about system announcements and updates.</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="email-weeklyDigest"
                              name="email-weeklyDigest"
                              type="checkbox"
                              checked={notificationPreferences.email.weeklyDigest}
                              onChange={(e) => handleNotificationChange('email', 'weeklyDigest', e.target.checked)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="email-weeklyDigest" className="font-medium text-gray-700">
                              Weekly Digest
                            </label>
                            <p className="text-gray-500">Receive a weekly summary of all your active complaints and their status.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow overflow-hidden rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">In-App Notifications</h3>
                      <div className="mt-5 space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="inApp-statusUpdates"
                              name="inApp-statusUpdates"
                              type="checkbox"
                              checked={notificationPreferences.inApp.statusUpdates}
                              onChange={(e) => handleNotificationChange('inApp', 'statusUpdates', e.target.checked)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="inApp-statusUpdates" className="font-medium text-gray-700">
                              Status Updates
                            </label>
                            <p className="text-gray-500">Receive in-app notifications when the status of your complaint changes.</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="inApp-comments"
                              name="inApp-comments"
                              type="checkbox"
                              checked={notificationPreferences.inApp.comments}
                              onChange={(e) => handleNotificationChange('inApp', 'comments', e.target.checked)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="inApp-comments" className="font-medium text-gray-700">
                              Comments
                            </label>
                            <p className="text-gray-500">Receive in-app notifications when someone comments on your complaint.</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="inApp-resolution"
                              name="inApp-resolution"
                              type="checkbox"
                              checked={notificationPreferences.inApp.resolution}
                              onChange={(e) => handleNotificationChange('inApp', 'resolution', e.target.checked)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="inApp-resolution" className="font-medium text-gray-700">
                              Resolution
                            </label>
                            <p className="text-gray-500">Receive in-app notifications when your complaint is resolved.</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="inApp-announcements"
                              name="inApp-announcements"
                              type="checkbox"
                              checked={notificationPreferences.inApp.announcements}
                              onChange={(e) => handleNotificationChange('inApp', 'announcements', e.target.checked)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="inApp-announcements" className="font-medium text-gray-700">
                              Announcements
                            </label>
                            <p className="text-gray-500">Receive in-app notifications about system announcements.</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="inApp-feedbackRequests"
                              name="inApp-feedbackRequests"
                              type="checkbox"
                              checked={notificationPreferences.inApp.feedbackRequests}
                              onChange={(e) => handleNotificationChange('inApp', 'feedbackRequests', e.target.checked)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="inApp-feedbackRequests" className="font-medium text-gray-700">
                              Feedback Requests
                            </label>
                            <p className="text-gray-500">Receive in-app notifications asking for feedback on resolved complaints.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* Privacy & Security Settings */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div className="bg-white shadow overflow-hidden rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Privacy Settings</h3>
                      <div className="mt-5 space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="profileVisibility"
                              name="profileVisibility"
                              type="checkbox"
                              checked={privacySettings.profileVisibility}
                              onChange={(e) => handlePrivacyChange('profileVisibility', e.target.checked)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="profileVisibility" className="font-medium text-gray-700">
                              Profile Visibility
                            </label>
                            <p className="text-gray-500">Allow other users to see your profile in comments and issue activities.</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="complaintHistoryVisibility"
                              name="complaintHistoryVisibility"
                              type="checkbox"
                              checked={privacySettings.complaintHistoryVisibility}
                              onChange={(e) => handlePrivacyChange('complaintHistoryVisibility', e.target.checked)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="complaintHistoryVisibility" className="font-medium text-gray-700">
                              Complaint History Visibility
                            </label>
                            <p className="text-gray-500">Allow administrators to view your full complaint history when reviewing new complaints.</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="dataCollection"
                              name="dataCollection"
                              type="checkbox"
                              checked={privacySettings.dataCollection}
                              onChange={(e) => handlePrivacyChange('dataCollection', e.target.checked)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="dataCollection" className="font-medium text-gray-700">
                              Data Collection for Improvement
                            </label>
                            <p className="text-gray-500">Allow us to collect anonymized data about how you use the system to improve our services.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow overflow-hidden rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Security</h3>
                      <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>Manage your account security settings.</p>
                      </div>
                      <div className="mt-5 space-y-4">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Change Password
                        </button>

                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Enable Two-Factor Authentication
                        </button>

                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Sign Out of All Devices
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Display Preferences */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div className="bg-white shadow overflow-hidden rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Display Preferences</h3>
                      <div className="mt-5 space-y-6">
                        <div>
                          <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                            Theme
                          </label>
                          <select
                            id="theme"
                            name="theme"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            value={displayPreferences.theme}
                            onChange={(e) => handleDisplayChange('theme', e.target.value)}
                          >
                            <option value="system">System Default</option>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                            Language
                          </label>
                          <select
                            id="language"
                            name="language"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            value={displayPreferences.language}
                            onChange={(e) => handleDisplayChange('language', e.target.value)}
                          >
                            <option value="english">English</option>
                            <option value="hindi">Hindi</option>
                            <option value="spanish">Spanish</option>
                            <option value="french">French</option>
                          </select>
                        </div>

                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="reduceMotion"
                              name="reduceMotion"
                              type="checkbox"
                              checked={displayPreferences.reduceMotion}
                              onChange={(e) => handleDisplayChange('reduceMotion', e.target.checked)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="reduceMotion" className="font-medium text-gray-700">
                              Reduce Motion
                            </label>
                            <p className="text-gray-500">Minimize animations throughout the interface.</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="highContrast"
                              name="highContrast"
                              type="checkbox"
                              checked={displayPreferences.highContrast}
                              onChange={(e) => handleDisplayChange('highContrast', e.target.checked)}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="highContrast" className="font-medium text-gray-700">
                              High Contrast Mode
                            </label>
                            <p className="text-gray-500">Increase contrast for better readability.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
