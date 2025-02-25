import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { signInWithGoogle, error } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard'); // Redirect to dashboard after successful login
    } catch (error) {
      // Error will be handled by the AuthContext
      console.error("Error signing in:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center p-4">
      {/* Hash pattern background */}
      <div 
        className="fixed inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'url(https://ibpublicimages.s3.us-west-2.amazonaws.com/scaler-landing/hash.svg)',
          backgroundRepeat: 'repeat',
          backgroundSize: '400px',
          transform: 'rotate(-10deg)',
          backgroundPosition: 'center',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      
      {/* Create Impact background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(https://ibpublicimages.s3.us-west-2.amazonaws.com/scaler-landing/create-impact.webp)',
          backgroundSize: '80%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom right -300px', // Changed from -200px to -300px
          opacity: 0.15,
          pointerEvents: 'none'
        }}
      />

      {/* Login Container */}
      <div className="relative z-10 bg-[#f5f5f5]/90 backdrop-blur-sm p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all duration-300 w-full max-w-[400px] text-center border border-blue-100/10">
        <div className="inline-block w-[150px] h-[150px] overflow-hidden rounded-[10px] mb-6">
          <img
            src="https://media.licdn.com/dms/image/v2/D560BAQE_KykOv-R26Q/company-logo_200_200/company-logo_200_200/0/1680526828612/scaler_school_of_technology_logo?e=2147483647&v=beta&t=ErZSckCyUo-j4_ZwBwkBvdpuP8N7nT8L2O7wPvwA0GY"
            alt="Company Logo"
            className="w-full h-full object-cover"
          />
        </div>

        <h1 className="text-[1.875rem] font-bold text-gray-900 mb-3">
          Welcome
        </h1>

        <p className="mb-6 text-gray-600">
          Sign in to continue to the application
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors duration-200"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google logo" 
            className="w-5 h-5"
          />
          Sign in with Google
        </button>

        <p className="mt-8 text-sm text-gray-500">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="text-[#2563EB] hover:text-[#1d4ed8] hover:underline">Terms of service</Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-[#2563EB] hover:text-[#1d4ed8] hover:underline">Privacy policy</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
