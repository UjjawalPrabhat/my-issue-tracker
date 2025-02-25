import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative z-10 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Video Section */}
          <div className="relative aspect-video bg-white/80 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-shadow duration-300 flex items-center justify-center overflow-hidden transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gray-900/5"></div>
            <div className="text-center">
              <svg 
                className="w-16 h-16 mb-4 mx-auto text-gray-400"
                fill="none" 
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <p className="text-xl font-medium text-gray-600">Video Coming Soon</p>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-6 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-all duration-300 transform hover:-translate-y-1">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
              Campus Issue Tracker
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              A comprehensive platform designed to streamline the process of reporting and resolving campus-related issues. 
              With real-time tracking, automated notifications, and an intuitive interface, we make campus maintenance 
              efficient and transparent.
            </p>
            <div className="space-x-4">
              <button 
                onClick={() => navigate('/login')}
                className="bg-[#2563EB] text-white px-6 py-3 rounded-lg hover:bg-[#1d4ed8] transition-colors duration-300"
              >
                Get Started
              </button>
              <button className="text-[#111827] border-2 border-[#111827] px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
