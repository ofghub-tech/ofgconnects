// src/components/Sidebar.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Function to check if the current button is the active page
    const getNavItemClass = (path) => {
        // --- NEW LOGIC: Match specific pages ---
        
        // 1. Check for perfect matches (/home, /shorts, /myspace, etc.)
        if (location.pathname === path) {
            return 'nav-item active';
        }
        
        // 2. Special case: If we are on /watch/:videoId, highlight the Home link
        if (location.pathname.startsWith('/watch') && path === '/home') {
            return 'nav-item active';
        }

        // 3. Special case: If we are on /songs or /kids, the simple match is enough
        if (location.pathname.startsWith(path) && (path === '/songs' || path === '/kids')) {
            return 'nav-item active';
        }
        
        // 4. Fallback for all others
        return 'nav-item';
    };

    return (
        <aside className="sidebar"> 
            <div className="logo-section">
                <img src="/ofg-logo.png" alt="OfgConnects Logo" className="app-logo" />
                <h1>OfgConnects</h1>
            </div>
            <nav className="main-nav">
                
                <button 
                    className={getNavItemClass('/home')} 
                    onClick={() => navigate('/home')}
                >
                    <span className="icon active-indicator">></span> Home
                </button>
                
                <button 
                    className={getNavItemClass('/shorts')} 
                    onClick={() => navigate('/shorts')}
                >
                    <span className="icon active-indicator">></span> Shorts
                </button>
                
                <button 
                    className={getNavItemClass('/following')} 
                    onClick={() => navigate('/following')}
                >
                    <span className="icon active-indicator">></span> Following
                </button>
                
                <button 
                    className={getNavItemClass('/myspace')} 
                    onClick={() => navigate('/myspace')}
                >
                    <span className="icon active-indicator">></span> Myspace
                </button>
                
                <button 
                    className={getNavItemClass('/offline')} 
                    onClick={() => navigate('/offline')}
                >
                    <span className="icon active-indicator">></span> Watch Later
                </button>
                
                <button 
                    className={getNavItemClass('/songs')} 
                    onClick={() => navigate('/songs')}
                >
                    <span className="icon active-indicator">></span> Songs
                </button>
                
                <button 
                    className={getNavItemClass('/kids')} 
                    onClick={() => navigate('/kids')}
                >
                    <span className="icon active-indicator">></span> Kids
                </button>
                
            </nav>
        </aside>
    );
};

export default Sidebar;