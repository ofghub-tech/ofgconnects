// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import './LoginPage.css';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook
import { useNavigate } from 'react-router-dom'; // Import for redirection

const LoginPage = () => {
    // Get googleLogin from our context
    const { user, loginUser, registerUser, googleLogin } = useAuth();
    const navigate = useNavigate();

    const [isRegistering, setIsRegistering] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        // If the user is already logged in, redirect to home
        if (user) {
            navigate('/home');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isRegistering) {
                await registerUser(email, password, name);
            } else {
                await loginUser(email, password);
            }
            // The useEffect will catch the user change and navigate
        } catch (error) {
            alert(`Failed: ${error.message}`);
        }
    };

    const handleGoogleLoginClick = async () => {
        try {
            await googleLogin();
            // No need to navigate, the googleLogin function's
            // success redirect will handle it.
        } catch (error) {
            // Error is already alerted in the context function
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                
                <h2>{isRegistering ? 'Create Account' : 'Login to OfgConnects'}</h2>
                
                {/* --- Name Field (Only for Registering) --- */}
                {isRegistering && (
                    <div className="form-group">
                        <label>Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                        />
                    </div>
                )}
                
                {/* --- Email Field --- */}
                <div className="form-group">
                    <label>Email</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                
                {/* --- Password Field --- */}
                <div className="form-group">
                    <label>Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                
                {/* --- Submit Button --- */}
                <button type="submit" className="submit-btn">
                    {isRegistering ? 'Sign Up' : 'Login'}
                </button>
                
                {/* --- OR Divider --- */}
                <div className="divider">
                    <span>OR</span>
                </div>

                {/* --- Google Login Button --- */}
                <button 
                    type="button" // Important: set type to "button" so it doesn't submit the form
                    className="google-btn" 
                    onClick={handleGoogleLoginClick}
                >
                    Sign in with Google
                </button>

                {/* --- Toggle Link --- */}
                <p className="toggle-form" onClick={() => setIsRegistering(!isRegistering)}>
                    {isRegistering 
                        ? 'Already have an account? Login' 
                        : "Don't have an account? Sign Up"}
                </p>
            </form>
        </div>
    );
};

export default LoginPage;