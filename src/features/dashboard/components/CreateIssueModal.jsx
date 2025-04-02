import React from 'react';
import IssueForm from '../../student/components/IssueForm';

const CreateIssueModal = ({ isOpen, onClose }) => {
  const handleIssueCreated = () => {
    // Close the modal when issue is created
    onClose();
    // Optionally, you could add a toast notification here
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
          onClick={onClose}
        ></div>
        
        {/* Modal Content */}
        <div className="relative bg-white rounded-lg max-w-lg w-full p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Issue</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Issue Form Component */}
          <IssueForm onIssueCreated={handleIssueCreated} />
        </div>
      </div>
    </div>
  );
};

export default CreateIssueModal;
