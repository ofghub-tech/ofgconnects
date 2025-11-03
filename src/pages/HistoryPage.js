// src/pages/HistoryPage.js
import React from 'react';

// --- Icon Component ---
const HistoryIcon = (props) => (
    <svg {...props} className="h-16 w-16 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

const HistoryPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50">
            <HistoryIcon />
            <h1 className="mt-4 text-2xl font-semibold text-gray-800">
                Watch History
            </h1>
            <p className="mt-2 text-gray-600">
                Videos you've watched will appear here.
            </p>
        </div>
    );
};

export default HistoryPage;
