// src/components/Header.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import UploadForm from './UploadForm';
// 1. Import the new notification hook
import { useNotifications } from '../context/NotificationContext';

// --- Icon Components ---
const MenuIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);
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
// 2. Add the new Bell icon
const BellIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
);

// --- Header Component ---

const Header = ({ toggleSidebar }) => {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    // 3. Add state for notification dropdown
    const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

    // 4. Get notification data from our new context
    const { notifications, unreadCount, markAllAsRead } = useNotifications();

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
    
    // 5. Helper to format time (e.g., "5m ago")
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

    return (
        <>
            <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
                
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    <button onClick={toggleSidebar} className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100">
                        <MenuIcon className="h-6 w-6" />
                    </button>
                    <div className="cursor-pointer" onClick={() => navigate('/home')}>
                        <span className="text-2xl font-bold text-gray-800">OFGConnects</span>
                    </div>
                </div>

                {/* Middle Section */}
                <div className="hidden flex-1 justify-center px-4 sm:flex sm:max-w-2xl">
                    <div className="flex w-full overflow-hidden rounded-full border border-gray-300">
                        <input type="text" placeholder="Search..." className="flex-1 border-none bg-gray-100 px-5 py-2.5 text-base text-gray-900 outline-none" />
                        <button className="border-l border-gray-300 bg-gray-50 px-5 text-gray-600 hover:bg-gray-100">
                            <SearchIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2 sm:gap-4">
                    
                    {/* Upload Button */}
                    <button 
                        className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100" 
                        title="Upload Video"
                        onClick={() => setIsUploadModalOpen(true)}
                    >
                        <UploadIcon className="h-6 w-6" />
                    </button>

                    {/* 6. Notification Bell & Dropdown */}
                    <div className="relative">
                        <button 
                            className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
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

                        {/* Notification Dropdown Panel */}
                        {isNotifDropdownOpen && (
                            <div className="absolute right-0 top-12 z-10 w-80 rounded-md border border-gray-200 bg-white shadow-lg">
                                <div className="border-b border-gray-100 p-4">
                                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                                </div>
                                <ul className="max-h-96 overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map(notif => (
                                            <li key={notif.id} className="border-b border-gray-100 p-4 text-sm text-gray-700 hover:bg-gray-50">
                                                <p>{notif.message}</p>
                                                <span className="text-xs text-blue-500">{timeSince(notif.timestamp)} ago</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="p-4 text-center text-sm text-gray-500">
                                            No new notifications
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Avatar & Dropdown */}
                    <div className="relative">
                        <button 
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white"
                            onClick={() => setIsUserDropdownOpen(prev => !prev)}
                        >
                            {getAvatarInitial()}
                        </button>
                        
                        {isUserDropdownOpen && (
                            <div className="absolute right-0 top-12 z-10 w-64 rounded-md border border-gray-200 bg-white shadow-lg">
                                <div className="flex items-center gap-3 border-b border-gray-100 p-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-xl font-semibold text-white">
                                        {getAvatarInitial()}
                                    </div>
                                    <span className="truncate font-medium text-gray-800">
                                        {user?.name || user?.email}
                                    </span>
                                </div>
                                <ul className="py-2">
                                    <li 
                                        className="cursor-pointer px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                                        onClick={handleLogout}
                                    >
                                        Log Out
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Upload Modal */}
            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)}>
                <UploadForm onCloseModal={() => setIsUploadModalOpen(false)} />
            </Modal>
        </>
    );
};

export default Header;