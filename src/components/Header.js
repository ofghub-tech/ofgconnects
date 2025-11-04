// src/components/Header.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // <-- Added Link
import Modal from './Modal';
import UploadForm from './UploadForm';
import { useNotifications } from '../context/NotificationContext'; // (Keep this)

// --- (All Icon Components - No change, except MenuIcon removed) ---
const SearchIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);
const UploadIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="17"></line>
    </svg>
);
const BellIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
);
// --- NEW ICONS FOR DROPDOWN ---
const IconWrapper = (props) => (
    <svg {...props} className={`h-5 w-5 ${props.className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {props.children}
    </svg>
);
const SettingsIcon = (props) => <IconWrapper {...props}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></IconWrapper>;
const LogoutIcon = (props) => <IconWrapper {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></IconWrapper>;
// --- (End Icons) ---


const Header = ({ toggleSidebar }) => { // toggleSidebar prop is here, but unused by Header
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
    const { notifications, unreadCount, markAllAsRead } = useNotifications();
    
    // --- NEW: State for search input ---
    const [searchQuery, setSearchQuery] = useState('');

    // --- (handleLogout, getAvatarInitial, timeSince - No change) ---
    const handleLogout = async () => {
        try {
            await logoutUser();
            navigate('/');
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };
    const getAvatarInitial = () => {
        if (user) {
            if (user.name) return user.name.charAt(0).toUpperCase();
            if (user.email) return user.email.charAt(0).toUpperCase();
        }
        return '?';
    };
    const timeSince = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m";
        return Math.floor(seconds) + "s";
    };
    // --- (End functions) ---

    // --- NEW: Search submit handler ---
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery(''); // Clear the search bar
        }
    };

    return (
        <>
            {/* --- HEADER (Updated) --- */}
            {/* Added dark:bg-gray-900 and dark:border-gray-800 */}
            <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 dark:border-gray-800 dark:bg-gray-900">
                
                {/* --- MODIFIED: Left Section (Menu button removed) --- */}
                <div className="flex items-center gap-4">
                    {/* <button onClick={toggleSidebar} ... /> REMOVED */}
                    <div className="cursor-pointer" onClick={() => navigate('/home')}>
                        {/* Added dark:text-gray-100 */}
                        <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">OFGConnects</span>
                    </div>
                </div>

                {/* --- Middle Section (Search) (Updated) --- */}
                <div className="hidden flex-1 justify-center px-4 sm:flex sm:max-w-2xl">
                    {/* Added dark:border-gray-700 */}
                    <form className="flex w-full overflow-hidden rounded-full border border-gray-300 dark:border-gray-700" onSubmit={handleSearchSubmit}>
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            // Added dark mode classes
                            className="flex-1 border-none bg-gray-100 px-5 py-2.5 text-base text-gray-900 outline-none dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button 
                            type="submit"
                            // Added dark mode classes
                            className="border-l border-gray-300 bg-gray-50 px-5 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            <SearchIcon className="h-5 w-5" />
                        </button>
                    </form>
                </div>


                {/* Right Section (Updated) */}
                <div className="flex items-center gap-2 sm:gap-4">
                    
                    {/* Upload Button (Updated) */}
                    <button 
                        // Added dark mode classes
                        className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800" 
                        title="Upload Video"
                        onClick={() => setIsUploadModalOpen(true)}
                    >
                        <UploadIcon className="h-6 w-6" />
                    </button>

                    {/* Notification Bell & Dropdown (Updated) */}
                    <div className="relative">
                        <button 
                            // Added dark mode classes
                            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            onClick={() => {
                                setIsNotifDropdownOpen(prev => !prev);
                                if (unreadCount > 0) {
                                    markAllAsRead();
                                }
                            }}
                        >
                            <BellIcon className="h-6 w-6" />
                            {unreadCount > 0 && (
                                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {isNotifDropdownOpen && (
                            // Added dark mode classes
                            <div className="absolute right-0 top-12 z-10 w-80 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                {/* ... (notification dropdown content) ... */}
                                <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No new notifications.</div>
                            </div>
                        )}
                    </div>

                    {/* Avatar & Dropdown (Updated) */}
                    <div className="relative">
                        <button 
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white"
                            onClick={() => setIsUserDropdownOpen(prev => !prev)}
                        >
                            {getAvatarInitial()}
                        </button>
                        
                        {isUserDropdownOpen && (
                            // Added dark mode classes
                            <div className="absolute right-0 top-12 z-10 w-64 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                {/* User Info Header (Updated) */}
                                <div className="flex items-center gap-3 p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
                                        {getAvatarInitial()}
                                    </div>
                                    <div className="overflow-hidden">
                                        {/* Added dark mode classes */}
                                        <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name || 'User'}</div>
                                        <div className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.email || ''}</div>
                                    </div>
                                </div>
                                
                                <hr className="border-gray-100 dark:border-gray-700" />

                                {/* Menu Links (Updated) */}
                                <nav className="py-2">
                                    <Link 
                                        to="/settings" 
                                        onClick={() => setIsUserDropdownOpen(false)}
                                        // Added dark mode classes
                                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <SettingsIcon className="text-gray-500 dark:text-gray-400" />
                                        <span>Account Settings</span>
                                    </Link>
                                    <button 
                                        onClick={handleLogout}
                                        // Added dark mode classes
                                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        <LogoutIcon className="text-gray-500 dark:text-gray-400" />
                                        <span>Logout</span>
                                    </button>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Upload Modal (No change) */}
            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)}>
                <UploadForm />
            </Modal>
        </>
    );
};

export default Header;