import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';

const LoginPage = () => {
    const { user, googleLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/home';
    const [error, setError] = useState('');

    const handleGoogleLogin = async () => {
        try {
            await googleLogin(from);
        } catch (error) {
            setError(error.message || 'Failed to login with Google.');
        }
    };

    // If already logged in, redirect immediately
    if (user) {
        return <Navigate to={from} replace />;
    }

    return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <div className="glass-panel p-8 sm:p-12 w-full max-w-md text-center transform transition-all hover:scale-[1.01] duration-500">
                
                {/* Logo Area */}
                <div className="mb-8">
                     {/* You can uncomment this if you want the logo here */}
                     {/* <img src="/logo192.png" alt="Logo" className="w-16 h-16 mx-auto mb-4 rounded-xl shadow-lg" /> */}
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Sign in to continue to your space.
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Google Login Button */}
                <button 
                    type="button" 
                    className="w-full py-3.5 px-4 flex justify-center items-center gap-3 bg-white text-gray-700 rounded-xl font-bold shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200 border border-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 group"
                    onClick={handleGoogleLogin}
                >
                    {/* Official Multi-colored Google "G" Icon */}
                    <svg className="w-6 h-6" aria-hidden="true" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Continue with Google</span>
                </button>

                <p className="mt-8 text-xs text-gray-400 dark:text-gray-500">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;