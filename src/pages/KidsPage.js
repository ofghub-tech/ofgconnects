// src/pages/KidsPage.js
import React, { useState } from 'react';
import Feed from '../components/Feed';
import './KidsPage.css'; // ✅ NEW CSS

const KidsPage = () => {
    const [searchTerm] = useState(null);

    return (
        <div className="kids-container">
            <h1 className="kids-title">Kids Videos</h1>

            {/* Feed component remains unchanged */}
            <Feed searchTerm={searchTerm} category="kids" />
        </div>
    );
};

export default KidsPage;