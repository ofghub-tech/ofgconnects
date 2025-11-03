// src/pages/LikedVideosPage.js
import React from 'react';

// --- Icon Component ---
const ThumbsUpIcon = (props) => (
    <svg {...props} className="h-16 w-16 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
    </svg>
);

const LikedVideosPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50">
            <ThumbsUpIcon />
            <h1 className="mt-4 text-2xl font-semibold text-gray-800">
                Liked Videos
            </h1>
            <p className="mt-2 text-gray-600">
                Videos you've liked will appear here.
            </p>
        </div>
    );
};

export default LikedVideosPage;
