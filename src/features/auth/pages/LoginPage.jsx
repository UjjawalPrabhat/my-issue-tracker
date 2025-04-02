import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getAuthErrorMessage } from '../../../utils/firebaseErrors';
import ProfileCompletionPrompt from '../../../components/onboarding/ProfileCompletionPrompt';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const { login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const { user, isNewUser } = await signInWithGoogle();
      
      // Show profile completion prompt for new student users
      if (isNewUser && user.role === 'student' && !user.isProfileComplete) {
        setShowProfilePrompt(true);
        return;
      }
      
      // Otherwise just navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error("Error signing in with Google:", err);
      setError(getAuthErrorMessage(err) || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  // Handle profile completion
  const handleProfileComplete = (profileData) => {
    console.log("Profile completed:", profileData);
    setShowProfilePrompt(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex relative">
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
          backgroundPosition: 'bottom right -300px',
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
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors duration-200 mb-4"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google logo" 
            className="w-5 h-5"
          />
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        {/* Email/Password Form */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#f5f5f5] text-gray-500">Or continue with email</span>
            </div>
          </div>
          
          {/* Import your LoginForm component here */}
          <div className="mt-6">
            {/* Include your existing LoginForm component */}
          </div>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="text-[#2563EB] hover:text-[#1d4ed8] hover:underline">Terms of service</Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-[#2563EB] hover:text-[#1d4ed8] hover:underline">Privacy policy</Link>
        </p>
      </div>

      {/* Profile Completion Prompt */}
      {showProfilePrompt && (
        <ProfileCompletionPrompt onComplete={handleProfileComplete} />
      )}
    </div>
  );
};

export default LoginPage;
