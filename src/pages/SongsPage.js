// src/pages/SongsPage.js
import React, { useState } from 'react';
import Feed from '../components/Feed';

const SongsPage = () => {
    // --- (LOGIC UNCHANGED) ---
    // Pass null for searchTerm so Feed knows to just show latest songs
    const [searchTerm] = useState(null);

    return (
        // --- (FIX) Removed solid bg-gray-50 dark:bg-gray-900 ---
        <div className="p-4 sm:p-6 lg:p-8 min-h-full">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 dark:text-gray-100">Songs</h1>
            {/* Feed component will show VideoCards, which are already glass panels */}
            <Feed searchTerm={searchTerm} category="songs" />
        </div>
    );
};

export default SongsPage;