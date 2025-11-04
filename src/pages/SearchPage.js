// src/pages/SearchPage.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import Feed from '../components/Feed';

// Helper function to parse query parameters
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const SearchPage = () => {
    const query = useQuery();
    const searchTerm = query.get('q');

    return (
        <div className="w-full">
            
            {/* --- MODIFIED: Page Header --- */}
            <div className="border-b border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Search results for: 
                    <span className="italic text-blue-600 dark:text-blue-400 ml-2">\"{searchTerm}\"</span>
                </h1>
                {!searchTerm && (
                    <p className="mt-2 text-red-500">No search term provided.</p>
                )}
            </div>
            {/* --- END MODIFICATION --- */}


            {/* * We re-use the Feed component here.
              * It already has logic to fetch videos based on the 'searchTerm' prop.
              * We set category to null to search across all categories.
            */}
            {searchTerm ? (
                <Feed searchTerm={searchTerm} category={null} />
            ) : (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    <p>Please enter a search term in the search bar above.</p>
                </div>
            )}
            
        </div>
    );
};

export default SearchPage;