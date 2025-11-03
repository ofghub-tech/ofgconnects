// src/pages/WatchLaterPage.js
import React from 'react';

// --- Icon Component ---
const BookmarkIcon = (props) => (
    <svg {...props} className="h-16 w-16 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
);

const WatchLaterPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50">
            <BookmarkIcon />
            <h1 className="mt-4 text-2xl font-semibold text-gray-800">
                Watch Later
            </h1>
            <p className="mt-2 text-gray-600">
                Save videos to watch later and they'll show up here.
            </p>
        </div>
    );
};

export default WatchLaterPage;
