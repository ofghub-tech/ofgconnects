// src/components/ShareButton.js
import React from 'react';

const ShareIcon = (props) => (
    // --- (ICON UNCHANGED) ---
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.186 2.25 2.25 0 0 0-3.933 2.186Z" />
    </svg>
);

// --- (FIX) Replaced solid styles with glass panel styles ---
// We use the same styles from our .glass-panel class, but keep rounded-full
const baseButtonClasses = `
    flex items-center justify-center gap-2
    py-2 px-4 h-9 rounded-full 
    font-medium text-sm text-neutral-800
    
    bg-white/70 backdrop-blur-2xl dark:bg-gray-600/50 
    border border-white/20 dark:border-white/10 
    shadow-lg 
    dark:text-gray-100 
    
    hover:bg-white/90 dark:hover:bg-gray-600/80
    transition-all duration-200 ease-in-out
`;

const ShareButton = ({ videoId, videoTitle }) => {
    // --- (LOGIC UNCHANGED) ---
    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/watch/${videoId}`;

        const shareData = {
            title: videoTitle,
            text: `Check out this video: ${videoTitle}`,
            url: shareUrl,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
             try {
                await navigator.clipboard.writeText(shareUrl);
                alert('Link copied to clipboard!');
            } catch (copyErr) {
                prompt('Copy this link:', shareUrl);
            }
        }
    };
    // --- (END LOGIC) ---

    return (
        <button className={baseButtonClasses} onClick={handleShare}>
            <ShareIcon className="h-5 w-5" />
            <span>Share</span>
        </button>
    );
};

export default ShareButton;