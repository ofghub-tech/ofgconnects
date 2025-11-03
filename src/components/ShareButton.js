// src/components/ShareButton.js
import React from 'react';

// --- Icon Component ---
const ShareIcon = (props) => (
    <svg 
        {...props} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={2} 
        stroke="currentColor" 
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.186 2.25 2.25 0 0 0-3.933 2.186Z" />
    </svg>
);

// --- UPDATED: Light Theme Button Style ---
const baseButtonClasses = `
    flex items-center justify-center gap-2
    py-2 px-4 h-9 rounded-full 
    font-medium text-sm text-neutral-800
    bg-gray-100 hover:bg-gray-200
    transition-colors duration-200 ease-in-out
`;

const ShareButton = ({ videoId, videoTitle }) => {
    
    const handleShare = async () => {
        // --- IMPROVED: Build a clean URL ---
        const shareUrl = `${window.location.origin}/watch/${videoId}`;

        const shareData = {
            title: videoTitle,
            text: `Check out this video: ${videoTitle}`,
            url: shareUrl, // Use the clean, specific URL
        };

        try {
            if (navigator.share) {
                // Use Web Share API
                await navigator.share(shareData);
            } else {
                // Fallback: Copy clean URL to clipboard
                await navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
            // Fallback for safety
            try {
                await navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');
            } catch (copyErr) {
                console.error('Error copying to clipboard:', copyErr);
                alert('Could not copy link. Please copy from the address bar.');
            }
        }
    };

    return (
        <button 
            className={baseButtonClasses}
            onClick={handleShare}
        >
            <ShareIcon className="h-5 w-5" />
            <span>Share</span>
        </button>
    );
};

export default ShareButton;