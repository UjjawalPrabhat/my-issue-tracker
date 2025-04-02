import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NavLink from '../navigation/NavLink';
import Logo from '../common/Logo';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-100 py-4 px-6 md:px-10 shadow-lg shadow-blue-100/50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Logo/>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/">Home</NavLink>
          <NavLink to="#features">Features</NavLink>
          <NavLink to="#about">About</NavLink>
          <NavLink to="#contact">Contact</NavLink>
          
          {user ? (
            <Link 
              to="/dashboard" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Dashboard
            </Link>
          ) : (
            <button 
              onClick={handleLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={toggleMenu}
            className="text-gray-500 hover:text-gray-800 focus:outline-none"
          >
            {isMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 border-t border-gray-100 pt-4 px-2">
          <div className="flex flex-col space-y-4">
            <NavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</NavLink>
            <NavLink to="#features" onClick={() => setIsMenuOpen(false)}>Features</NavLink>
            <NavLink to="#about" onClick={() => setIsMenuOpen(false)}>About</NavLink>
            <NavLink to="#contact" onClick={() => setIsMenuOpen(false)}>Contact</NavLink>
            
            {user ? (
              <Link 
                to="/dashboard" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 inline-block text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogin();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 w-full text-left"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
