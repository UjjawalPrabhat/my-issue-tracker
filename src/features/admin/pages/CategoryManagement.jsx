import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Sidebar from '../../../components/layout/Sidebar';
import ProfileDropdown from '../../../components/common/ProfileDropdown';
import { 
  getCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
  initializeCategories
} from '../../../services/categories';

const CategoryManagement = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Category state management
  const [categories, setCategories] = useState({ main: [], sub: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add-main'); // 'add-main', 'edit-main', 'add-sub', 'edit-sub'
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentMainCategory, setCurrentMainCategory] = useState(null);
  
  // Form state
  const [categoryInput, setCategoryInput] = useState('');
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.email === 'iamujjawal4u@gmail.com';
  const [readOnly, setReadOnly] = useState(false);
  
  // Initialize categories on first load
  useEffect(() => {
    const initialize = async () => {
      if (isAdmin) {
        try {
          console.log("Admin detected, trying to initialize categories");
          await initializeCategories();
        } catch (err) {
          console.error("Failed to initialize categories:", err);
        }
      }
    };
    initialize();
  }, [isAdmin]);
  
  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
    setReadOnly(!isAdmin);
  }, [isAdmin]);
  
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategories();
      console.log("Categories loaded:", data);
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories from the database. Using default categories instead.");
      // Use default categories as fallback
      setCategories({
        main: [
          { id: 'facilities', label: 'Facilities' },
          { id: 'technology', label: 'Technology' },
          { id: 'academic', label: 'Academic' },
          { id: 'administrative', label: 'Administrative' },
          { id: 'housing', label: 'Housing' },
          { id: 'other', label: 'Other' }
        ],
        sub: {} // Empty subcategories for now
      });
    } finally {
      setLoading(false);
    }
  };
  
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  // Display admin status for debugging
  const adminStatus = () => {
    if (!user) return "No user logged in";
    return `User: ${user.email} | Role: ${user.role || 'none'} | isAdmin: ${isAdmin ? 'Yes' : 'No'} | readOnly: ${readOnly ? 'Yes' : 'No'}`;
  };

  // Modal handlers
  const openAddMainCategoryModal = () => {
    // Prevent opening modal if in read-only mode
    if (readOnly) {
      setError("You don't have permission to modify categories. Only admins can make changes.");
      return;
    }
    
    setCategoryInput('');
    setModalType('add-main');
    setShowModal(true);
  };
  
  const openEditMainCategoryModal = (category) => {
    // Prevent opening modal if in read-only mode
    if (readOnly) {
      setError("You don't have permission to modify categories. Only admins can make changes.");
      return;
    }
    
    setCategoryInput(category.label);
    setCurrentCategory(category);
    setModalType('edit-main');
    setShowModal(true);
  };
  
  const openAddSubcategoryModal = (mainCategory) => {
    // Prevent opening modal if in read-only mode
    if (readOnly) {
      setError("You don't have permission to modify categories. Only admins can make changes.");
      return;
    }
    
    setCategoryInput('');
    setCurrentMainCategory(mainCategory);
    setModalType('add-sub');
    setShowModal(true);
  };
  
  const openEditSubcategoryModal = (mainCategoryId, subcategory) => {
    // Prevent opening modal if in read-only mode
    if (readOnly) {
      setError("You don't have permission to modify categories. Only admins can make changes.");
      return;
    }
    
    setCategoryInput(subcategory.label);
    setCurrentCategory(subcategory);
    setCurrentMainCategory({ id: mainCategoryId });
    setModalType('edit-sub');
    setShowModal(true);
  };
  
  const handleModalClose = () => {
    setShowModal(false);
    setCategoryInput('');
    setCurrentCategory(null);
    setCurrentMainCategory(null);
  };
  
  // Form handlers
  const handleInputChange = (e) => {
    setCategoryInput(e.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryInput.trim() || readOnly) return;
    
    try {
      setLoading(true);
      setError(null);
      
      switch (modalType) {
        case 'add-main': {
          const newCategory = {
            id: generateId(categoryInput),
            label: categoryInput.trim()
          };
          await addCategory(newCategory);
          break;
        }
        case 'edit-main': {
          const updatedCategory = {
            ...currentCategory,
            label: categoryInput.trim()
          };
          await updateCategory(updatedCategory);
          break;
        }
        case 'add-sub': {
          const newSubcategory = {
            id: generateId(categoryInput),
            label: categoryInput.trim()
          };
          await addSubcategory(currentMainCategory.id, newSubcategory);
          break;
        }
        case 'edit-sub': {
          const updatedSubcategory = {
            ...currentCategory,
            label: categoryInput.trim()
          };
          await updateSubcategory(currentMainCategory.id, updatedSubcategory);
          break;
        }
        default:
          break;
      }
      
      // Refresh categories
      await fetchCategories();
      handleModalClose();
    } catch (err) {
      console.error("Error updating categories:", err);
      setError(err.message || "Failed to update categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Delete handlers
  const handleDeleteMainCategory = async (categoryId) => {
    if (readOnly) {
      setError("You don't have permission to modify categories. Only admins can make changes.");
      return;
    }
    
    if (!confirm("Are you sure you want to delete this category and all its subcategories?")) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteCategory(categoryId);
      await fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      setError(err.message || "Failed to delete category. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteSubcategory = async (mainCategoryId, subcategoryId) => {
    if (readOnly) {
      setError("You don't have permission to modify categories. Only admins can make changes.");
      return;
    }
    
    if (!confirm("Are you sure you want to delete this subcategory?")) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteSubcategory(mainCategoryId, subcategoryId);
      await fetchCategories();
    } catch (err) {
      console.error("Error deleting subcategory:", err);
      setError(err.message || "Failed to delete subcategory. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to generate ID from label
  const generateId = (label) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
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
                <span className="text-xl font-semibold text-blue-600">Category Management</span>
              </div>
            </div>
            <ProfileDropdown user={user} />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Issue Categories</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {readOnly 
                      ? "View categories and subcategories for issue tracking" 
                      : "Manage categories and subcategories for issue tracking"}
                  </p>
                </div>
                {!readOnly && (
                  <div>
                    <button
                      onClick={openAddMainCategoryModal}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add New Category
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Admin status for debugging */}
            <div className="bg-gray-50 border border-gray-200 text-gray-600 p-2 text-xs rounded-md mb-2 font-mono">
              {adminStatus()}
            </div>
            
            {/* Read-only information */}
            {readOnly && (
              <div className="bg-blue-50 border border-blue-200 text-blue-600 p-4 rounded-md mb-6">
                <p>You're viewing categories in read-only mode. Only administrators can modify categories.</p>
              </div>
            )}
            
            {/* Error state */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md mb-6">
                {error}
                {isAdmin && (
                  <div className="mt-2">
                    <button 
                      onClick={async () => {
                        try {
                          setLoading(true);
                          console.log("Admin trying to force initialize categories");
                          await initializeCategories();
                          await fetchCategories();
                          setError(null);
                        } catch (err) {
                          setError(`Failed to initialize: ${err.message}`);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="text-sm text-red-700 underline"
                    >
                      Force Initialize Categories
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Loading state */}
            {loading && !error && (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
              </div>
            )}
            
            {/* Categories list */}
            {!loading && !error && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                {categories.main.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <p>No categories found. {!readOnly && "Click \"Add New Category\" to create one."}</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {categories.main.map((category) => (
                      <li key={category.id} className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">{category.label}</span>
                            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                              {categories.sub[category.id]?.length || 0} subcategories
                            </span>
                          </div>
                          {!readOnly && (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openAddSubcategoryModal(category)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                Add Subcategory
                              </button>
                              <button
                                onClick={() => openEditMainCategoryModal(category)}
                                className="text-sm text-gray-600 hover:text-gray-800"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteMainCategory(category.id)}
                                className="text-sm text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Subcategories */}
                        {categories.sub[category.id] && categories.sub[category.id].length > 0 && (
                          <div className="mt-2 pl-4 border-l-2 border-gray-200">
                            <ul className="space-y-1">
                              {categories.sub[category.id].map((subcategory) => (
                                <li key={subcategory.id} className="flex items-center justify-between py-1">
                                  <span className="text-sm text-gray-700">{subcategory.label}</span>
                                  {!readOnly && (
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => openEditSubcategoryModal(category.id, subcategory)}
                                        className="text-xs text-gray-600 hover:text-gray-800"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteSubcategory(category.id, subcategory.id)}
                                        className="text-xs text-red-600 hover:text-red-800"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Modal for adding/editing categories */}
      {showModal && !readOnly && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div 
              className="fixed inset-0 bg-black opacity-30" 
              onClick={handleModalClose}
            ></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <h3 className="text-lg font-medium text-gray-900">
                {modalType === 'add-main' && 'Add Main Category'}
                {modalType === 'edit-main' && 'Edit Main Category'}
                {modalType === 'add-sub' && `Add Subcategory to ${currentMainCategory?.label}`}
                {modalType === 'edit-sub' && 'Edit Subcategory'}
              </h3>
              
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-4">
                  <label htmlFor="category-input" className="block text-sm font-medium text-gray-700">
                    Category Name
                  </label>
                  <input
                    id="category-input"
                    type="text"
                    value={categoryInput}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!categoryInput.trim()}
                    className={`px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    ${!categoryInput.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {modalType.startsWith('add') ? 'Add' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
