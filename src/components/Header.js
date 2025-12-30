// src/components/Header.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar'; // <--- Import the Avatar component
import { 
    MagnifyingGlassIcon, 
    BellIcon, 
    VideoCameraIcon 
} from '@heroicons/react/24/outline';

const Header = ({ toggleSidebar }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-40 px-4 py-3 transition-all duration-300">
            
            {/* Background Gradient - No hard box, just readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between max-w-7xl mx-auto">
                
                {/* LEFT: Logo Area */}
                <div className="flex items-center gap-4">
                    {/* <h1 className="text-xl font-bold tracking-tighter text-white hidden sm:block">
                        OFG<span className="text-blue-500">Connects</span>
                    </h1> */}
                </div>

                {/* CENTER: Glass Search Bar */}
                <div className="flex-1 max-w-2xl mx-4">
                    <form onSubmit={handleSearch} className="relative group">
                        <div className={`
                            flex items-center overflow-hidden rounded-full transition-all duration-300
                            ${isSearchFocused 
                                ? 'bg-black/60 ring-2 ring-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                                : 'bg-white/10 hover:bg-white/15'
                            }
                            backdrop-blur-md border border-white/10
                        `}>
                            <div className="pl-4 text-gray-400">
                                <MagnifyingGlassIcon className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search videos, songs, or scripture..."
                                className="w-full bg-transparent border-none focus:ring-0 text-gray-100 placeholder-gray-400 py-2.5 px-3"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                            />
                            {/* Search Button (Visible only on focus or hover) */}
                            <button 
                                type="submit"
                                className={`
                                    px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors border-l border-white/5
                                    ${searchTerm ? 'opacity-100' : 'opacity-0 sm:opacity-100'}
                                `}
                            >
                                Search
                            </button>
                        </div>
                    </form>
                </div>

                {/* RIGHT: Action Icons & Profile */}
                <div className="flex items-center gap-2 sm:gap-4">
                    
                    {/* Upload Icon */}
                    <button 
                        onClick={() => navigate('/myspace')}
                        className="p-2 text-gray-300 rounded-full hover:bg-white/10 hover:text-white transition-all duration-200 group relative"
                    >
                        <VideoCameraIcon className="w-6 h-6" />
                        <span className="absolute top-full right-0 mt-2 text-xs bg-black/80 px-2 py-1 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Create
                        </span>
                    </button>

                    {/* Notifications */}
                    <button className="p-2 text-gray-300 rounded-full hover:bg-white/10 hover:text-white transition-all duration-200 relative">
                        <BellIcon className="w-6 h-6" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]" />
                    </button>

                    {/* Profile Avatar (UPDATED) */}
                    <button 
                        onClick={() => navigate('/myspace')}
                        className="ml-2 relative group focus:outline-none"
                    >
                        <Avatar 
                            url={user?.prefs?.avatar} 
                            name={user?.name} 
                            size="sm" 
                            className="w-9 h-9 ring-2 ring-transparent group-hover:ring-blue-500/50 transition-all duration-300 shadow-lg cursor-pointer"
                        />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;