// src/pages/SearchPage.js (FIXED TO USE SEMANTIC SEARCH FROM FEED.JS)
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Feed from '../components/Feed'; // Import the optimized Feed component

const SearchPage = () => {
    // --- (LOGIC UNCHANGED) ---
    const [searchParams] = useSearchParams();
    // Get the query string from the URL (?q=term)
    const queryStr = searchParams.get('q');
    
    return (
        // --- (FIX) Removed solid bg-gray-100 dark:bg-gray-900 ---
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen transition-colors duration-200">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                    Search Results for: <span className="text-blue-600 dark:text-blue-400">"{queryStr}"</span>
                </h1>
                
                {/* This Feed component will render VideoCards, 
                  which are already .glass-panel components, 
                  so no other changes are needed.
                */}
                <Feed searchTerm={queryStr} category={null} />
            </div>
        </div>
    );
};

export default SearchPage;