// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';

const LoginPage = () => {
    const { user, loginUser, registerUser, googleLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/home';

    const [isLoginView, setIsLoginView] = useState(true);
    const [error, setError] = useState('');

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); 
        try {
            if (isLoginView) {
                await loginUser(email, password);
            } else {
                await registerUser(email, password, name);
            }
            navigate(from, { replace: true });
        } catch (error) {
            console.error('Failed to login/register:', error);
            setError(error.message || 'An error occurred. Please try again.');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await googleLogin(from);
        } catch (error) {
            setError(error.message || 'Failed to login with Google.');
        }
    };

    if (user) {
        return <Navigate to={from} replace />;
    }

    return (
        // --- MODIFIED: Removed bg-gray-100 dark:bg-gray-900 ---
        <div className="flex justify-center items-center min-h-screen p-4">
            {/* --- MODIFIED: Replaced solid bg with .glass-panel class --- */}
            <div className="glass-panel p-8 sm:p-10 w-full max-w-md text-center">
                
                {/* Header */}
                <h2 className="mb-2 text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {isLoginView ? 'Welcome Back!' : 'Create Account'}
                </h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                    {isLoginView ? 'Log in to continue.' : 'Sign up to get started.'}
                </p>

                {/* Error Message */}
                {error && (
                    <p className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-md mb-4 text-sm dark:bg-red-900/80 dark:border-red-700 dark:text-red-200">
                        {error}
                    </p>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {!isLoginView && (
                        <div className="mb-4 text-left">
                            <label htmlFor="name" className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                                Full Name
                            </label>
                            {/* --- MODIFIED: Made inputs semi-transparent --- */}
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100 dark:placeholder-gray-400"
                            />
                        </div>
                    )}
                    <div className="mb-4 text-left">
                        <label htmlFor="email" className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                            Email Address
                        </label>
                        {/* --- MODIFIED: Made inputs semi-transparent --- */}
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100 dark:placeholder-gray-400"
                        />
                    </div>
                    <div className="mb-5 text-left">
                        <label htmlFor="password" className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        {/* --- MODIFIED: Made inputs semi-transparent --- */}
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/50 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100 dark:placeholder-gray-400"
                        />
                    </div>

                    <button type="submit" className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        {isLoginView ? 'Log In' : 'Sign Up'}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-300/50 dark:border-gray-700/50"></span>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        {/* --- MODIFIED: Set bg to transparent --- */}
                        <span className="bg-transparent px-2 text-gray-500 dark:text-gray-400">OR</span>
                    </div>
                </div>

                {/* Google Login (MODIFIED) */}
                <button 
                    type="button" 
                    className="w-full py-3 px-4 flex justify-center items-center gap-2 bg-white/80 border border-gray-300/50 text-gray-700 rounded-lg font-semibold hover:bg-white transition-colors dark:bg-gray-700/80 dark:border-gray-600/50 dark:text-gray-200 dark:hover:bg-gray-700"
                    onClick={handleGoogleLogin}
                >
                    <svg className="w-5 h-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                        <path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 125.2 26.7 169.5 69.1L359.7 138.8C322.9 104.9 288.6 84 248 84c-80.9 0-146.5 65.6-146.5 146.5S167.1 377 248 377c90.1 0 131.6-63.3 136-98.8H248v-66.2h238.5c1.3 13.3 2.5 27.6 2.5 42.8z"></path>
                    </svg>
                    Continue with Google
                </button>

                {/* Toggle View */}
                <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                    {isLoginView ? "Don't have an account?" : 'Already have an account?'}
                    <span 
                        onClick={() => setIsLoginView(!isLoginView)}
                        className="ml-1 font-medium text-blue-600 hover:underline cursor-pointer dark:text-blue-400"
                    >
                        {isLoginView ? ' Sign Up' : ' Log In'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;