// src/components/VideoCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // To get user avatar initial
import { databases, BUCKET_ID_THUMBNAILS, storage } from '../appwriteConfig'; // Assuming you might need this later

// Helper function to get the correct avatar initial
const getChannelInitial = (channelName, userEmail) => {
    if (channelName) return channelName.charAt(0).toUpperCase();
    if (userEmail) return userEmail.charAt(0).toUpperCase();
    return '?';
};

// Function to format time (e.g., 2 days ago)
const timeSince = (date) => {
    if (!date) return "someday";
    
    let seconds;
    if (typeof date === 'string') {
        seconds = Math.floor((new Date() - new Date(date)) / 1000);
    } else if (typeof date === 'number') {
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
    const { user } = useAuth(); 

    if (!video) {
        return null;
    }

    const thumbnailUrl = video.thumbnailUrl || 'https://via.placeholder.com/400x225.png?text=No+Thumbnail';
    
    const channelInitial = getChannelInitial(video.username, user?.email);

    return (
        // --- MODIFIED: Applied .glass-panel ---
        // We add .glass-panel and p-0 (so the panel's internal padding doesn't break our layout)
        <div className="glass-panel flex flex-col overflow-hidden p-0 transition-transform duration-200 ease-in-out hover:-translate-y-1">
            <Link to={`/watch/${video.$id}`}>
                <img 
                    // --- MODIFIED: Rounded top corners to match the panel ---
                    className="aspect-video w-full object-cover rounded-t-xl" 
                    src={thumbnailUrl} 
                    alt={video.title} 
                />
            </Link>
            
            <div className="flex gap-3 p-4">
                {/* Channel Avatar */}
                <div className="mt-1 flex-shrink-0">
                    <Link to={`/channel/${video.uploaderId}`}> 
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
                            {channelInitial}
                        </div>
                    </Link>
                </div>
                
                <div className="flex-1">
                    <Link to={`/watch/${video.$id}`}>
                        <h3 className="text-md font-medium text-gray-900 line-clamp-2 dark:text-gray-100">
                            {video.title || 'Untitled Video'}
                        </h3>
                    </Link>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {video.username || 'Unknown Channel'}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>{formatViews(video.view_count || 0)}</span>
                        <span>•</span>
                        <span>{timeSince(video.$createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCard;