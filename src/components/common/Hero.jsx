import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative py-16 md:py-24 overflow-hidden">
      {/* Hero content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center md:max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Campus Issue <span className="text-blue-600">Tracker</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10">
            Seamlessly report and track campus maintenance issues, technical problems, 
            and administrative requests all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Get Started
            </Link>
            
            <Link
              to="#features"
              className="px-8 py-3 bg-white text-blue-600 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors duration-200"
            >
              Learn More
            </Link>
          </div>
          
          <div className="mt-16">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-3">
              Trusted by
            </p>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
              <span className="text-gray-400 text-lg font-semibold">University Housing</span>
              <span className="text-gray-400 text-lg font-semibold">IT Department</span>
              <span className="text-gray-400 text-lg font-semibold">Student Services</span>
              <span className="text-gray-400 text-lg font-semibold">Facilities Management</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hero image/illustration (optional) */}
      <div className="mt-16 flex justify-center">
        <div className="w-full max-w-4xl rounded-lg shadow-xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
            alt="Issue tracking dashboard"
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
