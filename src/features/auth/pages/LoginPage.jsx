import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { getAuthErrorMessage } from "../../../utils/firebaseErrors";
import ProfileCompletionPrompt from "../../../components/onboarding/ProfileCompletionPrompt";

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
      if (isNewUser && user.role === "student" && !user.isProfileComplete) {
        setShowProfilePrompt(true);
        return;
      }

      // Otherwise just navigate to dashboard
      navigate("/dashboard");
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
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hash pattern background - decreased opacity to make it lighter */}
      <div
        className="fixed inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "url(https://ibpublicimages.s3.us-west-2.amazonaws.com/scaler-landing/hash.svg)",
          backgroundRepeat: "repeat",
          backgroundSize: "300px",
          transform: "rotate(-5deg)",
          backgroundPosition: "center",
          pointerEvents: "none",
          zIndex: 1,
          filter: "contrast(1.1)",
        }}
      />

      {/* Subtle pattern overlay */}
      <div className="fixed inset-0 opacity-10 z-0 bg-[radial-gradient(#6B7280_1px,transparent_1px)] bg-[length:20px_20px]"></div>

      {/* Animated gradient blob - changed to grey */}
      <div className="fixed -bottom-32 -left-40 w-80 h-80 bg-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="fixed top-0 -right-20 w-80 h-80 bg-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="fixed -bottom-40 right-20 w-80 h-80 bg-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Stairs background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage:
            "url(https://ibpublicimages.s3.us-west-2.amazonaws.com/scaler-landing/create-impact.webp)",
          backgroundSize: "clamp(70%, 80%, 90%)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom right -300px",
          opacity: 0.12,
          pointerEvents: "none",
          filter: "contrast(1.1) grayscale(1)",
        }}
      />

      {/* Login Container */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md p-6 sm:p-10 rounded-2xl shadow-[0_15px_70px_rgba(107,114,128,0.35)] w-full max-w-[440px] mx-auto text-center border border-gray-100/20 transition-all duration-300 hover:shadow-[0_20px_80px_rgba(79,94,120,0.4)]">
        <div className="inline-block w-[120px] h-[120px] overflow-hidden rounded-2xl mb-6 shadow-md">
          <img
            src="https://media.licdn.com/dms/image/v2/D560BAQE_KykOv-R26Q/company-logo_200_200/company-logo_200_200/0/1680526828612/scaler_school_of_technology_logo?e=2147483647&v=beta&t=ErZSckCyUo-j4_ZwBwkBvdpuP8N7nT8L2O7wPvwA0GY"
            alt="Company Logo"
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
          />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {`Welcome Back </>`}
        </h1>

        <p className="mb-8 text-gray-600 text-sm">
          Sign in to continue
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm">
            {error}
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 rounded-xl px-5 py-3 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-300 shadow-sm mb-6 group"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            className="w-5 h-5"
          />
          <span className="font-medium">
            {loading ? "Signing in..." : "Sign in with Google"}
          </span>
          <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">
            →
          </span>
        </button>

        <p className="mt-8 text-xs text-gray-500">
          By continuing, you agree to our{" "}
          <Link
            to="/terms"
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            Terms of service
          </Link>{" "}
          and{" "}
          <Link
            to="/privacy"
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            Privacy policy
          </Link>
        </p>

        {/* Version tag */}
        <div className="absolute bottom-3 right-3 text-[10px] text-gray-400">
          v1.0.0
        </div>
      </div>

      {/* Profile Completion Prompt */}
      {showProfilePrompt && (
        <ProfileCompletionPrompt onComplete={handleProfileComplete} />
      )}
    </div>
  );
};

export default LoginPage;
