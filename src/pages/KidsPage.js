// src/pages/KidsPage.js
import React, { useState } from 'react';
import Feed from '../components/Feed';
// REMOVED: all unused appwrite imports, keeping the file clean
// NO LONGER NEEDED: import './KidsPage.css';

const KidsPage = () => {
    const [searchTerm] = useState(null); 

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Kids Videos</h1>
            
            {/* --- FIX: Pass category prop --- */}
            <Feed searchTerm={searchTerm} category="kids" />
        </div>
    );
};

export default KidsPage;