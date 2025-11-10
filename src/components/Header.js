// src/components/Header.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Modal from './Modal';
import UploadForm from './UploadForm';

// --- (Icons) ---
const MenuIcon = (props) => ( <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <line x1="3" y1="12" x2="21" y2="12"></line> <line x1="3" y1="6" x2="21" y2="6"></line> <line x1="3" y1="18" x2="21" y2="18"></line> </svg> );
const SearchIcon = (props) => ( <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line> </svg> );
const UploadIcon = (props) => ( <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="17"></line> </svg> );
const IconWrapper = (props) => ( <svg {...props} className={`h-5 w-5 ${props.className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> {props.children} </svg> );
const SettingsIcon = (props) => <IconWrapper {...props}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></IconWrapper>;
const LogoutIcon = (props) => <IconWrapper {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></IconWrapper>;
// --- (End Icons) ---


const Header = ({ toggleSidebar }) => {
    // --- (Logic is unchanged) ---
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

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
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery(''); 
            setIsMobileSearchOpen(false);
        }
    };
    const handleUploadComplete = () => {
        setIsUploadModalOpen(false); 
        window.location.reload(); 
    };
    // --- (End Logic) ---

    return (
        <>
            {/* --- MODIFIED: Replaced all styles with .glass-panel --- */}
            <header className="glass-panel sticky top-0 z-50 flex h-16 items-center justify-between px-4 sm:px-6 rounded-none border-b border-l-0 border-r-0 border-t-0">
                
                <div className="flex items-center gap-2">
                    <div className="cursor-pointer" onClick={() => navigate('/home')}>
                        <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">OFGConnects</span>
                    </div>
                </div>

                {/* --- Middle Section (Desktop Search) --- */}
                <div className="hidden flex-1 justify-center px-4 sm:flex sm:max-w-2xl">
                    <form className="flex w-full overflow-hidden rounded-full border border-gray-300/80 dark:border-gray-700/80" onSubmit={handleSearchSubmit}>
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="flex-1 border-none bg-gray-100/80 px-5 py-2.5 text-base text-gray-900 outline-none dark:bg-gray-800/80 dark:text-gray-100 dark:placeholder-gray-400" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button 
                            type="submit"
                            className="border-l border-gray-300/80 bg-gray-50/80 px-5 text-gray-600 hover:bg-gray-100 dark:border-gray-700/80 dark:bg-gray-700/80 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            <SearchIcon className="h-5 w-5" />
                        </button>
                    </form>
                </div>

                {/* --- Right Section --- */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <button 
                        className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100/50 dark:text-gray-300 dark:hover:bg-gray-800/50 sm:hidden" 
                        title="Search"
                        onClick={() => setIsMobileSearchOpen(true)}
                    >
                        <SearchIcon className="h-6 w-6" />
                    </button>
                    <button 
                        className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100/50 dark:text-gray-300 dark:hover:bg-gray-800/50" 
                        title="Upload Video"
                        onClick={() => setIsUploadModalOpen(true)}
                    >
                        <UploadIcon className="h-6 w-6" />
                    </button>

                    {/* Avatar & Dropdown */}
                    <div className="relative">
                        <button 
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white"
                            onClick={() => setIsUserDropdownOpen(prev => !prev)}
                        >
                            {getAvatarInitial()}
                        </button>
                        
                        {isUserDropdownOpen && (
                            // --- MODIFIED: Applied .glass-panel to dropdown ---
                            <div className="glass-panel absolute right-0 top-12 z-10 w-64 overflow-hidden rounded-md p-0 shadow-lg">
                                <div className="flex items-center gap-3 p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
                                        {getAvatarInitial()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name || 'User'}</div>
                                        <div className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.email || ''}</div>
                                    </div>
                                </div>
                                <hr className="border-white/20 dark:border-gray-700/50" />
                                <nav className="py-2">
                                    <Link 
                                        to="/settings" 
                                        onClick={() => setIsUserDropdownOpen(false)}
                                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                                    >
                                        <SettingsIcon className="text-gray-500 dark:text-gray-400" />
                                        <span>Account Settings</span>
                                    </Link>
                                    <button 
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                                    >
                                        <LogoutIcon className="text-gray-500 dark:text-gray-400" />
                                        <span>Logout</span>
                                    </button>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Mobile Search Bar (MODIFIED) --- */}
                {isMobileSearchOpen && (
                    <div className="glass-panel absolute left-0 top-0 z-20 flex h-full w-full items-center px-4 rounded-none border-b border-l-0 border-r-0 border-t-0 sm:hidden">
                        <form className="flex w-full" onSubmit={handleSearchSubmit}>
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                className="flex-1 border-none bg-transparent px-2 py-2.5 text-base text-gray-900 outline-none dark:text-gray-100 dark:placeholder-gray-400" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button 
                                type="button"
                                className="px-4 text-gray-600 dark:text-gray-300"
                                onClick={() => setIsMobileSearchOpen(false)}
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                )}
            </header>

            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)}>
                <UploadForm onUploadSuccess={handleUploadComplete} />
            </Modal>
        </>
    );
};

export default Header;