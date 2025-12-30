import React from 'react';
import { useBible } from '../../context/BibleContext'; 

// --- Icons ---
const BibleSvgIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);

const CloseSvgIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export default function GlobalBibleIcon() {
    const { bibleView, toggleBibleSidebar } = useBible();
    const isBibleOpen = bibleView !== 'closed';

    return (
        <button
            onClick={toggleBibleSidebar}
            // Ensure z-50 is high enough to be above other content
            className="fixed z-50 flex items-center justify-center w-14 h-14 text-white bg-blue-600 rounded-full shadow-lg bottom-6 right-6 hover:bg-blue-700 transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300"
            aria-label={isBibleOpen ? "Close Bible Panel" : "Open Bible Panel"}
        >
            {isBibleOpen ? (
                <CloseSvgIcon className="w-6 h-6" />
            ) : (
                <BibleSvgIcon className="w-7 h-7" />
            )}
        </button>
    );
}