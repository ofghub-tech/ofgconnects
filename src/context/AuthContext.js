// src/context/AuthContext.js
import { createContext, useState, useEffect, useContext } from 'react';
import { account, storage, BUCKET_ID_THUMBNAILS } from '../appwriteConfig';
import { ID, Permission, Role } from 'appwrite';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    
    // Theme State (Kept in context for the app to work, even if removed from Settings UI)
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');

    useEffect(() => {
        const root = window.document.documentElement;
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        root.classList.toggle('dark', isDark);
        localStorage.setItem('theme', theme);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => { if (theme === 'system') root.classList.toggle('dark', mediaQuery.matches); };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    useEffect(() => { checkUserStatus(); }, []);

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
        await account.createEmailPasswordSession(email, password);
        await checkUserStatus();
    };

    const logoutUser = async () => {
        await account.deleteSession('current');
        setUser(null);
    };

    const registerUser = async (email, password, name) => {
        await account.create(ID.unique(), email, password, name);
        await loginUser(email, password);
    };

    const googleLogin = async (redirectTo = '/home') => {
        const successUrl = new URL(redirectTo, window.location.origin).href;
        const failureUrl = new URL('/', window.location.origin).href;
        await account.createOAuth2Session('google', successUrl, failureUrl);
    };
    
    const updateUserName = async (newName) => {
        await account.updateName(newName);
        await checkUserStatus(); 
    };

    const updateUserPassword = async (newPassword, oldPassword) => {
        await account.updatePassword(newPassword, oldPassword);
    };

    const uploadProfileImage = async (file) => {
        const fileId = ID.unique();
        await storage.createFile(BUCKET_ID_THUMBNAILS, fileId, file, [Permission.read(Role.any())]);
        const avatarUrl = storage.getFileView(BUCKET_ID_THUMBNAILS, fileId).href;
        const prefs = user.prefs || {};
        await account.updatePrefs({ ...prefs, avatar: avatarUrl });
        await checkUserStatus();
        return avatarUrl;
    };

    // --- NEW: Delete Account Logic ---
    const deleteAccount = async () => {
        try {
            // Note: Client SDKs usually cannot delete users directly for security.
            // Standard practice is to invalidate the session or trigger a Function.
            // For now, we match Mobile App behavior (Logout).
            await account.deleteSession('current');
            setUser(null);
        } catch (error) {
            console.error("Failed to delete account session:", error);
            throw error;
        }
    };

    const contextData = {
        user, loading,
        loginUser, logoutUser, registerUser, googleLogin, 
        updateUserName, updateUserPassword, uploadProfileImage,
        deleteAccount, // <--- Exported
        theme, setTheme
    };

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? (
                 <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading application...</p>
                 </div>
            ) : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;