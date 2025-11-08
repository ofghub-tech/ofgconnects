// src/components/BibleFeature/GlobalBibleIcon.js
import React from 'react';
import { useBible } from '../../context/BibleContext'; 

// --- Bible Icon SVG ---
const BibleSvgIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);

// --- Close (X) Icon SVG ---
const CloseSvgIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export default function GlobalBibleIcon() {
    // Get the new state and function
    const { bibleView, toggleBibleSidebar } = useBible();

    // Check if the panel is open in ANY state
    const isBibleOpen = bibleView !== 'closed';

    return (
        <button
            onClick={toggleBibleSidebar} // Use the sidebar toggle function
            
            // --- UPDATED: Set z-index to 50 to float above the panel ---
            className="fixed z-50 flex items-center justify-center w-16 h-16 p-4 text-white bg-blue-600 rounded-full shadow-lg bottom-5 right-5 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            
            aria-label={isBibleOpen ? "Close Bible Panel" : "Open Bible Panel"}
        >
            {isBibleOpen ? (
                <CloseSvgIcon className="w-8 h-8" />
            ) : (
                <BibleSvgIcon className="w-8 h-8" />
            )}
        </button>
    );
}