// src/components/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
// NO LONGER NEEDED: import './Sidebar.css'; 

// --- Icon Components ---
// We just add a base class for Tailwind to pick up
const IconWrapper = (props) => (
    <svg {...props} className={`h-6 w-6 shrink-0 ${props.className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {props.children}
    </svg>
);

const HomeIcon = (props) => <IconWrapper {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></IconWrapper>;
const UserIcon = (props) => <IconWrapper {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></IconWrapper>;
const UsersIcon = (props) => <IconWrapper {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></IconWrapper>;
const VideoIcon = (props) => <IconWrapper {...props}><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></IconWrapper>;
const DownloadIcon = (props) => <IconWrapper {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></IconWrapper>;
const MusicIcon = (props) => <IconWrapper {...props}><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></IconWrapper>;
const SmileIcon = (props) => <IconWrapper {...props}><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></IconWrapper>;

// --- NEW ICONS ADDED ---
const HistoryIcon = (props) => <IconWrapper {...props}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></IconWrapper>;
const BookmarkIcon = (props) => <IconWrapper {...props}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></IconWrapper>;
const ThumbsUpIcon = (props) => <IconWrapper {...props}><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></IconWrapper>;
// --- END OF NEW ICONS ---


// --- NavLink Wrapper Component ---
const SidebarLink = ({ to, icon, label, isSidebarOpen }) => {
    
    // This function handles the "active" class logic for NavLink
    const getNavLinkClass = ({ isActive }) => {
        let baseClasses = "flex items-center rounded-lg mx-3 px-3 py-3 transition-colors duration-200";
        let openClasses = "gap-6"; // Gap when open
        let closedClasses = "justify-center"; // Centered when closed

        let activeClass = isActive ? "bg-gray-200 font-medium" : "text-gray-700 hover:bg-gray-100";

        return `${baseClasses} ${isActive ? activeClass : ''} ${isSidebarOpen ? openClasses : closedClasses} ${activeClass}`;
    };

    return (
        <NavLink to={to} className={getNavLinkClass}>
            {icon}
            {/* Replaced 'sidebar-link-label' */}
            <span className={`whitespace-nowrap transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                {label}
            </span>
        </NavLink>
    );
};

// --- Section Title Component ---
const SectionTitle = ({ label, isSidebarOpen }) => (
    // Replaced 'sidebar-section-title'
    <h3 className={`px-6 py-2 text-xs font-medium uppercase text-gray-500 transition-all ${!isSidebarOpen ? 'text-center text-[0px] before:content-["..."] before:text-xs' : ''}`}>
        {isSidebarOpen ? label : ''}
    </h3>
);

// --- Sidebar Component ---
const Sidebar = ({ isSidebarOpen }) => {
    
    // Replaced 'sidebar-container' and '.closed' logic
    const sidebarWidth = isSidebarOpen ? 'w-60' : 'w-20';

    return (
        <aside className={`h-full flex-shrink-0 overflow-y-auto overflow-x-hidden border-r border-gray-200 bg-white pt-6 transition-all duration-300 ${sidebarWidth}`}>
            <nav className="flex flex-col gap-2">
                
                {/* Main Navigation */}
                <div className="flex flex-col gap-1">
                    <SidebarLink to="/home" icon={<HomeIcon />} label="Home" isSidebarOpen={isSidebarOpen} />
                    <SidebarLink to="/myspace" icon={<UserIcon />} label="My Space" isSidebarOpen={isSidebarOpen} />
                    <SidebarLink to="/following" icon={<UsersIcon />} label="Following" isSidebarOpen={isSidebarOpen} />
                    
                    {/* --- NEW LINKS ADDED --- */}
                    <SidebarLink to="/history" icon={<HistoryIcon />} label="History" isSidebarOpen={isSidebarOpen} />
                    <SidebarLink to="/watch-later" icon={<BookmarkIcon />} label="Watch Later" isSidebarOpen={isSidebarOpen} />
                    <SidebarLink to="/liked-videos" icon={<ThumbsUpIcon />} label="Liked Videos" isSidebarOpen={isSidebarOpen} />
                    {/* --- END OF NEW LINKS --- */}
                </div>

                {/* Separator: Replaced 'sidebar-separator' */}
                <hr className={`my-2 mx-6 border-gray-200 transition-all ${!isSidebarOpen ? 'mx-3' : ''}`} />

                {/* Secondary Navigation */}
                <div className="flex flex-col gap-1">
                    <SectionTitle label="Explore" isSidebarOpen={isSidebarOpen} />
                    <SidebarLink to="/shorts" icon={<VideoIcon />} label="Shorts" isSidebarOpen={isSidebarOpen} />
                    <SidebarLink to="/songs" icon={<MusicIcon />} label="Songs" isSidebarOpen={isSidebarOpen} />
                    <SidebarLink to="/kids" icon={<SmileIcon />} label="Kids" isSidebarOpen={isSidebarOpen} />
                    <SidebarLink to="/offline" icon={<DownloadIcon />} label="Offline" isSidebarOpen={isSidebarOpen} />
                </div>

                {/* Separator */}
                <hr className={`my-2 mx-6 border-gray-200 transition-all ${!isSidebarOpen ? 'mx-3' : ''}`} />
                
                <div className={`flex flex-col gap-1 ${!isSidebarOpen ? 'items-center' : ''}`}>
                    <SectionTitle label="More" isSidebarOpen={isSidebarOpen} />
                    {/* Replaced 'sidebar-placeholder' */}
                    <span className={`px-6 text-sm text-gray-400 ${!isSidebarOpen ? 'hidden' : ''}`}>
                        More links...
                    </span>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;