// src/components/VideoCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // To get user avatar initial
import { databases, BUCKET_ID_THUMBNAILS, storage } from '../appwriteConfig'; // Assuming you might need this later

// Helper function to get the correct avatar initial
// (This is the full logic from your AuthContext, ensuring it's available here)
const getChannelInitial = (channelName, userEmail) => {
    if (channelName) return channelName.charAt(0).toUpperCase();
    if (userEmail) return userEmail.charAt(0).toUpperCase();
    return '?';
};

// Function to format time (e.g., 2 days ago)
const timeSince = (date) => {
    if (!date) return "someday";
    
    // Ensure 'date' is a valid Date object or timestamp
    let seconds;
    if (typeof date === 'string') {
        seconds = Math.floor((new Date() - new Date(date)) / 1000);
    } else if (typeof date === 'number') {
        // Assuming it's a timestamp
        seconds = Math.floor((new Date() - new Date(date * 1000)) / 1000);
    } else {
        return "invalid date";
    }

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

// Function to format view count
const formatViews = (views) => {
    if (!views) return '0 views';
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M views';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K views';
    return views + ' views';
};


const VideoCard = ({ video }) => {
    // We get the *user* from useAuth, to fall back if channelName is missing
    const { user } = useAuth(); 

    if (!video) {
        return null;
    }

    // Use a placeholder if thumbnail URL is missing
    const thumbnailUrl = video.thumbnailUrl || 'https://via.placeholder.com/400x225.png?text=No+Thumbnail';
    
    // Get initial for the channel, falling back to the logged-in user's email
    const channelInitial = getChannelInitial(video.channelName, user?.email);

    return (
        // --- MODIFIED: Added dark:bg-gray-900 to the card container ---
        <div className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-transform duration-200 ease-in-out hover:shadow-md hover:-translate-y-1 dark:bg-gray-800">
            <Link to={`/watch/${video.$id}`}>
                <img 
                    className="aspect-video w-full object-cover" 
                    src={thumbnailUrl} 
                    alt={video.title} 
                />
            </Link>
            
            <div className="flex gap-3 p-4">
                {/* Channel Avatar */}
                <div className="mt-1 flex-shrink-0">
                    <Link to={`/channel/${video.userId}`}> {/* Assuming you have channel pages */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
                            {channelInitial}
                        </div>
                    </Link>
                </div>
                
                {/* --- MODIFIED: Video Details (Added dark: text classes) --- */}
                <div className="flex-1">
                    <Link to={`/watch/${video.$id}`}>
                        <h3 className="text-md font-medium text-gray-900 line-clamp-2 dark:text-gray-100">
                            {video.title || 'Untitled Video'}
                        </h3>
                    </Link>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {video.channelName || 'Unknown Channel'}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>{formatViews(video.views || 0)}</span>
                        <span>•</span>
                        <span>{timeSince(video.$createdAt)}</span>
                    </div>
                </div>
                {/* --- END MODIFICATION --- */}
            </div>
        </div>
    );
};

export default VideoCard;