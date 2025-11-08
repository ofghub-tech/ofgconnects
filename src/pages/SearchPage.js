// src/pages/SearchPage.js (FIXED TO USE SEMANTIC SEARCH FROM FEED.JS)
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Feed from '../components/Feed'; // Import the optimized Feed component

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    // Get the query string from the URL (?q=term)
    const queryStr = searchParams.get('q');
    
    // The Feed component handles all the loading, error states, and infinite scrolling.
    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                    Search Results for: <span className="text-blue-600 dark:text-blue-400">"{queryStr}"</span>
                </h1>
                
                {/* --- RENDER THE OPTIMIZED FEED COMPONENT --- */}
                {/* Pass the queryStr as the searchTerm prop. Feed.js will handle the semantic function call. */}
                {/* We pass category=null because search pages don't filter by category. */}
                <Feed searchTerm={queryStr} category={null} />
            </div>
        </div>
    );
};

export default SearchPage;