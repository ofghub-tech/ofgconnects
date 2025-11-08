// src/context/BibleContext.js
import React, { createContext, useContext, useState } from 'react';

const BibleContext = createContext();

export const BibleProvider = ({ children }) => {
    // 'closed', 'sidebar', or 'fullscreen'
    const [bibleView, setBibleView] = useState('closed');
    
    // --- 1. SET DEFAULT LANGUAGE TO TELUGU ---
    const [language, setLanguage] = useState('te'); 

    const openBibleFullscreen = () => setBibleView('fullscreen');
    const openBibleSidebar = () => setBibleView('sidebar');
    
    const toggleBibleSidebar = () => {
        setBibleView(prev => (prev === 'closed' ? 'sidebar' : 'closed'));
    };

    const value = {
        bibleView,
        openBibleFullscreen,
        openBibleSidebar,
        toggleBibleSidebar,
        language, 
        setLanguage, 
    };

    return (
        <BibleContext.Provider value={value}>
            {children}
        </BibleContext.Provider>
    );
};

export const useBible = () => {
    return useContext(BibleContext);
};