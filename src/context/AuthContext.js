// src/context/AuthContext.js
import { createContext, useState, useEffect, useContext } from 'react';
import { account } from '../appwriteConfig';
import { ID } from 'appwrite';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    
    // --- NEW THEME STATE ---
    // 1. Get theme from localStorage or default to 'system'
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');

    // --- NEW THEME EFFECT ---
    // 2. Effect to apply theme class to <html> tag
    useEffect(() => {
        const root = window.document.documentElement;
        const isDark =
            theme === 'dark' ||
            (theme === 'system' &&
                window.matchMedia('(prefers-color-scheme: dark)').matches);

        root.classList.toggle('dark', isDark);
        
        // 3. Save choice to localStorage
        localStorage.setItem('theme', theme);

        // Optional: Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                root.classList.toggle('dark', mediaQuery.matches);
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
        
    }, [theme]);
    // --- END NEW THEME LOGIC ---


    useEffect(() => {
        checkUserStatus();
    }, []);

    const checkUserStatus = async () => {
        try {
            const currentUser = await account.get();
            setUser(currentUser);
        } catch (error) {
            setUser(null);
        }
        setLoading(false);
    };

    const loginUser = async (email, password) => {
        try {
            await account.createEmailPasswordSession(email, password);
            const currentUser = await account.get();
            setUser(currentUser);
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const logoutUser = async () => {
        try {
            await account.deleteSession('current');
            setUser(null);
        } catch (error) {
            console.error(error);
        }
    };

    const registerUser = async (email, password, name) => {
        try {
            await account.create(ID.unique(), email, password, name);
            await loginUser(email, password); // Log in after registering
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const googleLogin = async (
        redirectTo = 'http://localhost:3000/home' // <-- Default redirect
    ) => {
        try {
            // --- THIS IS THE FIX (BUG 3) ---
            // Use the passed 'redirectTo' path
            const successUrl = new URL(redirectTo, window.location.origin).href;
            const failureUrl = new URL('/', window.location.origin).href;
            // --- END FIX ---

            // This will trigger the Google login popup
            await account.createOAuth2Session(
                'google',
                successUrl, // <-- Use the dynamic success URL
                failureUrl  // <-- Use the dynamic failure URL
            );
            // After success, Appwrite redirects to the successUrl,
            // our useEffect will run and set the user.
        } catch (error) {
            console.error('Failed to login with Google:', error);
            alert(`Google login failed: ${error.message}`);
        }
    };
    
    // --- NEW FUNCTIONS ---
    
    /**
     * Updates the currently logged-in user's name.
     * @param {string} newName The new name for the user.
     */
    const updateUserName = async (newName) => {
        if (!newName) throw new Error("Name cannot be empty");
        try {
            await account.updateName(newName);
            // Refresh user state to reflect the change
            await checkUserStatus(); 
        } catch (error) {
            console.error("Failed to update name:", error);
            throw error;
        }
    };

    /**
     * Updates the currently logged-in user's password.
     * @param {string} newPassword The new password.
     * @param {string} oldPassword The user's current password.
     */
    const updateUserPassword = async (newPassword, oldPassword) => {
        if (!newPassword || !oldPassword) throw new Error("Passwords cannot be empty");
        try {
            await account.updatePassword(newPassword, oldPassword);
        } catch (error) {
            console.error("Failed to update password:", error);
            throw error;
        }
    };
    // --- END NEW FUNCTIONS ---


    const contextData = {
        user,
        loading,
        loginUser,
        logoutUser,
        registerUser,
        googleLogin, 
        updateUserName,    // <-- Added
        updateUserPassword, // <-- Added
        // --- EXPOSE THEME VALUES ---
        theme,
        setTheme
        // --- END EXPOSE ---
    };

    return (
        <AuthContext.Provider value={contextData}>
            {/* --- UPDATED LOADING --- */}
            {/* Wrapped loading in a full-screen div for better UX */}
            {loading ? (
                 <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading application...</p>
                 </div>
            ) : children}
            {/* --- END UPDATED LOADING --- */}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthContext;