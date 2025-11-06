// src/context/BibleContext.js
import React, { createContext, useState, useContext } from 'react';

const BibleContext = createContext();

export const useBible = () => useContext(BibleContext);

export const BibleProvider = ({ children }) => {
    // 'closed', 'sidebar', or 'fullscreen'
    const [bibleView, setBibleView] = useState('closed');

    // This is for the main floating button
    const toggleBibleSidebar = () => {
        // If it's closed, open to sidebar.
        // If it's open (in any state), close it.
        setBibleView(prev => (prev === 'closed' ? 'sidebar' : 'closed'));
    };

    // These are for the buttons inside the panel
    const openBibleFullscreen = () => setBibleView('fullscreen');
    const openBibleSidebar = () => setBibleView('sidebar'); // (To minimize from fullscreen)
    const closeBible = () => setBibleView('closed');

    const value = {
        bibleView,
        toggleBibleSidebar, // For the main float icon
        openBibleFullscreen, // For the maximize button
        openBibleSidebar, // For the minimize button
        closeBible, // For the X icon
    };

    return (
        <BibleContext.Provider value={value}>
            {children}
        </BibleContext.Provider>
    );
};