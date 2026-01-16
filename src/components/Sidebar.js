import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    HomeIcon, FireIcon, MusicalNoteIcon, UserGroupIcon, 
    ClockIcon, UserIcon, Cog6ToothIcon, 
    ArrowLeftOnRectangleIcon, XMarkIcon
} from '@heroicons/react/24/outline';
import { 
    HomeIcon as HomeIconSolid, FireIcon as FireIconSolid, 
    MusicalNoteIcon as MusicalNoteIconSolid, UserGroupIcon as UserGroupIconSolid,
    ClockIcon as ClockIconSolid, 
    UserIcon as UserIconSolid, Cog6ToothIcon as Cog6ToothIconSolid 
} from '@heroicons/react/24/solid';

const Sidebar = ({ isOpen, onClose }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { logoutUser, user } = useAuth(); 
    const location = useLocation();

    // Helper to determine active state
    const isActive = (path) => location.pathname === path;

    // Helper to decide if we show expanded text (Desktop Hover OR Mobile Open)
    const showText = isHovered || isOpen;

    const NavItem = ({ to, icon: Icon, activeIcon: ActiveIcon, label, onClick }) => {
        const active = isActive(to);
        const IconToRender = active ? ActiveIcon : Icon;

        // Combined click handler: Run the passed onClick (nav) AND close sidebar if mobile
        const handleClick = (e) => {
            if (onClick) onClick(e);
            if (isOpen) onClose(); 
        };

        return (
            <NavLink
                to={to}
                onClick={handleClick}
                className={`
                    relative flex items-center h-12 my-1 mx-3 rounded-full transition-all duration-300 group
                    ${active ? 'text-white' : 'text-gray-400 hover:text-gray-100'}
                `}
            >
                {/* GLOW EFFECT (Only for active item) */}
                {active && (
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-50 transition-opacity" />
                )}

                {/* Icon Container */}
                <div className={`
                    relative z-10 flex items-center justify-center min-w-[3rem] h-12 w-12 rounded-full transition-all duration-300
                    ${active ? 'text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'group-hover:bg-white/10'}
                `}>
                    <IconToRender className={`w-6 h-6 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
                </div>

                {/* Text Label */}
                <span 
                    className={`
                        z-10 whitespace-nowrap overflow-hidden transition-all duration-300 ease-out font-medium tracking-wide
                        ${showText ? 'w-40 opacity-100 pl-2' : 'w-0 opacity-0 pl-0'}
                    `}
                >
                    {label}
                </span>

                {/* Active Dot Indicator */}
                {active && showText && (
                    <div className="absolute right-4 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]" />
                )}
            </NavLink>
        );
    };

    return (
        <>
            {/* MOBILE OVERLAY: Only visible when isOpen is true on mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                />
            )}

            <aside 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`
                    fixed left-0 top-0 h-full z-50 pt-20 pb-6 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                    flex flex-col justify-between overflow-hidden bg-black md:bg-transparent
                    
                    /* MOBILE LOGIC: Transform based on isOpen */
                    ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
                    
                    /* DESKTOP LOGIC (md:): Reset transform, handle width via hover */
                    md:translate-x-0
                    md:${isHovered 
                        ? 'w-64 bg-gradient-to-r from-black from-40% via-black/90 to-transparent backdrop-blur-sm' 
                        : 'w-20 bg-transparent'
                    } 
                `}
            >
                {/* Mobile Only: Close Button inside Sidebar */}
                <div className="absolute top-4 right-4 md:hidden">
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation Items */}
                <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide space-y-2 mt-4">
                    
                    <NavItem to="/" icon={HomeIcon} activeIcon={HomeIconSolid} label="Home" />
                    <NavItem to="/shorts" icon={FireIcon} activeIcon={FireIconSolid} label="Shorts" />
                    <NavItem to="/songs" icon={MusicalNoteIcon} activeIcon={MusicalNoteIconSolid} label="Music" />
                    <NavItem to="/kids" icon={UserGroupIcon} activeIcon={UserGroupIconSolid} label="Kids" />
                    
                    {/* Separator */}
                    <div className={`my-4 mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent transition-opacity ${showText ? 'opacity-100' : 'opacity-0'}`} />

                    <NavItem to="/myspace" icon={UserIcon} activeIcon={UserIconSolid} label="My Channel" />
                    <NavItem to="/history" icon={ClockIcon} activeIcon={ClockIconSolid} label="History" />
                    
                    <div className={`my-4 mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent transition-opacity ${showText ? 'opacity-100' : 'opacity-0'}`} />

                    <NavItem to="/settings" icon={Cog6ToothIcon} activeIcon={Cog6ToothIconSolid} label="Settings" />
                </div>

                {/* Footer / Logout */}
                <div className="relative z-10 px-2 mt-auto">
                    {user ? (
                        <button
                            onClick={logoutUser} 
                            className={`
                                relative flex items-center h-12 w-full mx-1 rounded-full transition-all duration-300 group
                                text-red-400 hover:text-red-300 hover:bg-red-500/10
                            `}
                        >
                            <div className="flex items-center justify-center min-w-[3rem] h-12 w-12">
                                <ArrowLeftOnRectangleIcon className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
                            </div>
                            <span 
                                className={`
                                    whitespace-nowrap overflow-hidden transition-all duration-300 font-medium
                                    ${showText ? 'w-40 opacity-100 pl-2' : 'w-0 opacity-0 pl-0'}
                                `}
                            >
                                Log Out
                            </span>
                        </button>
                    ) : (
                        <NavLink to="/login" className="relative flex items-center h-12 w-full mx-1 rounded-full text-blue-400 hover:bg-blue-500/10 transition-all">
                            <div className="flex items-center justify-center min-w-[3rem] h-12 w-12">
                                <UserIcon className="w-6 h-6" />
                            </div>
                            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 font-medium ${showText ? 'w-40 opacity-100 pl-2' : 'w-0 opacity-0 pl-0'}`}>
                                Sign In
                            </span>
                        </NavLink>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;