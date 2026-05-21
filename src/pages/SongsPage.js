// src/pages/SongsPage.js
import React, { useState } from 'react';
import Feed from '../components/Feed';
import './SongsPage.css';

const SongsPage = () => {
    const [searchTerm] = useState(null);

    return (
        <div className="songs-page">
            <h1 className="songs-title">Songs</h1>

            <Feed searchTerm={searchTerm} category="songs" />
        </div>
    );
};

export default SongsPage;