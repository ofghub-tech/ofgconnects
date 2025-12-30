import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    HomeIcon, FireIcon, MusicalNoteIcon, UserGroupIcon, 
    ClockIcon, HandThumbUpIcon, UserIcon, Cog6ToothIcon, 
    ArrowLeftOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { 
    HomeIcon as HomeIconSolid, FireIcon as FireIconSolid, 
    MusicalNoteIcon as MusicalNoteIconSolid, UserGroupIcon as UserGroupIconSolid,
    ClockIcon as ClockIconSolid, HandThumbUpIcon as HandThumbUpIconSolid, 
    UserIcon as UserIconSolid, Cog6ToothIcon as Cog6ToothIconSolid 
} from '@heroicons/react/24/solid';

const Sidebar = () => {
    const [isHovered, setIsHovered] = useState(false);
    const { logout, user } = useAuth();
    const location = useLocation();

    // Helper to determine active state
    const isActive = (path) => location.pathname === path;

    const NavItem = ({ to, icon: Icon, activeIcon: ActiveIcon, label, onClick }) => {
        const active = isActive(to);
        const IconToRender = active ? ActiveIcon : Icon;

        return (
            <NavLink
                to={to}
                onClick={onClick}
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
                        ${isHovered ? 'w-40 opacity-100 pl-2' : 'w-0 opacity-0 pl-0'}
                    `}
                >
                    {label}
                </span>

                {/* Active Dot Indicator */}
                {active && isHovered && (
                    <div className="absolute right-4 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]" />
                )}
            </NavLink>
        );
    };

    return (
        <aside 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
                fixed left-0 top-0 h-full z-50 pt-20 pb-6 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                flex flex-col justify-between overflow-hidden
                
                /* --- MODIFIED GRADIENT (Left Black -> Right Transparent) --- */
                ${isHovered 
                    /* from-black: Solid black on the left
                       via-black/90: Stays mostly dark through the middle (so text is readable)
                       to-transparent: Fades out completely on the right edge
                    */
                    ? 'w-64 bg-gradient-to-r from-black from-40% via-black/90 to-transparent backdrop-blur-sm' 
                    : 'w-20 bg-transparent'
                } 
            `}
        >
            {/* Navigation Items */}
            <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide space-y-2 mt-4">
                
                <NavItem to="/" icon={HomeIcon} activeIcon={HomeIconSolid} label="Home" />
                <NavItem to="/shorts" icon={FireIcon} activeIcon={FireIconSolid} label="Shorts" />
                <NavItem to="/songs" icon={MusicalNoteIcon} activeIcon={MusicalNoteIconSolid} label="Music" />
                <NavItem to="/kids" icon={UserGroupIcon} activeIcon={UserGroupIconSolid} label="Kids" />
                
                {/* Separator */}
                <div className={`my-4 mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

                <NavItem to="/myspace" icon={UserIcon} activeIcon={UserIconSolid} label="My Channel" />
                <NavItem to="/history" icon={ClockIcon} activeIcon={ClockIconSolid} label="History" />
                <NavItem to="/liked" icon={HandThumbUpIcon} activeIcon={HandThumbUpIconSolid} label="Liked Videos" />
                
                <div className={`my-4 mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

                <NavItem to="/settings" icon={Cog6ToothIcon} activeIcon={Cog6ToothIconSolid} label="Settings" />
            </div>

            {/* Footer / Logout */}
            <div className="relative z-10 px-2 mt-auto">
                {user ? (
                    <button
                        onClick={logout}
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
                                ${isHovered ? 'w-40 opacity-100 pl-2' : 'w-0 opacity-0 pl-0'}
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
                        <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 font-medium ${isHovered ? 'w-40 opacity-100 pl-2' : 'w-0 opacity-0 pl-0'}`}>
                            Sign In
                        </span>
                    </NavLink>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;