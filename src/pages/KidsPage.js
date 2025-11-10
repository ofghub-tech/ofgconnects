// src/pages/KidsPage.js
import React, { useState } from 'react';
import Feed from '../components/Feed';

const KidsPage = () => {
    // --- (LOGIC UNCHANGED) ---
    const [searchTerm] = useState(null);

    return (
        // --- (FIX) Removed solid bg-gray-50 dark:bg-gray-900 ---
        <div className="p-4 sm:p-6 lg:p-8 min-h-full">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 dark:text-gray-100">Kids Videos</h1>
            {/* The Feed component will use VideoCard, which is already a glass panel */}
            <Feed searchTerm={searchTerm} category="kids" />
        </div>
    );
};

export default KidsPage;