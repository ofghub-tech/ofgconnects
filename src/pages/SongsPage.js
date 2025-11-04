// src/pages/SongsPage.js
import React, { useState } from 'react';
import Feed from '../components/Feed';
// REMOVED: all unused appwrite imports, keeping the file clean
// NO LONGER NEEDED: import './SongsPage.css';

const SongsPage = () => {
    const [searchTerm] = useState(null); 
    // We assume the user searches in the header, so searchTerm is null here.
    
    return (
        // --- MODIFIED: Added dark mode and layout classes ---
        <div className="p-4 sm:p-6 lg:p-8 min-h-full bg-gray-50 dark:bg-gray-900">
            {/* --- MODIFIED: Added dark mode classes --- */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6 dark:text-gray-100">Songs</h1>
            
            {/* --- FIX: Pass category prop --- */}
            <Feed searchTerm={searchTerm} category="songs" />
        </div>
    );
};

export default SongsPage;