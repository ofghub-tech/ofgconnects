// src/context/AuthContext.js
import { createContext, useState, useEffect, useContext } from 'react';
import { account } from '../appwriteConfig';
import { ID } from 'appwrite'; // Make sure ID is imported

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

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

    const googleLogin = async () => {
        try {
            // This will trigger the Google login popup
            await account.createOAuth2Session(
                'google',
                'http://localhost:3000/home', // URL to redirect to on success
                'http://localhost:3000/'      // URL to redirect to on failure
            );
            // After success, Appwrite redirects to /home,
            // our useEffect will run and set the user.
        } catch (error) {
            console.error('Failed to login with Google:', error);
            alert(`Google login failed: ${error.message}`);
        }
    };

    const contextData = {
        user,
        loading,
        loginUser,
        logoutUser,
        registerUser,
        googleLogin, // <-- Added Google login function
    };

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? <p>Loading...</p> : children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthContext;