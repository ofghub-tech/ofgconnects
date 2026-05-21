// src/pages/SearchPage.js
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Feed from '../components/Feed';
import './SearchPage.css';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const queryStr = searchParams.get('q');
    
    return (
        <div className="search-page">
            <div className="search-container">

                <h1 className="search-title">
                    Search Results for: 
                    <span className="highlight"> "{queryStr}"</span>
                </h1>

                <Feed searchTerm={queryStr} category={null} />
            </div>
        </div>
    );
};

export default SearchPage;