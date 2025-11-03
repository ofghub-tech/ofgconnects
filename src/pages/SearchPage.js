// src/pages/SearchPage.js
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Feed from '../components/Feed';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('q');
    const [key, setKey] = useState(searchTerm);

    useEffect(() => {
        setKey(searchTerm);
    }, [searchTerm]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Search results for: <span className="text-blue-600">"{searchTerm}"</span>
            </h1>
            
            {/* * THIS IS NOW 100% CORRECT
              * It passes searchTerm="your-query"
              * It passes category={undefined}
              * The Feed.js `if (category)` check will be false.
              * The `if (searchTerm)` check will be true.
              * This will search ALL categories.
            */}
            <Feed key={key} searchTerm={searchTerm} />
        </div>
    );
};

export default SearchPage;