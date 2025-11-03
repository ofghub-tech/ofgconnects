// src/components/SuggestedVideoCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const SuggestedVideoCard = ({ video }) => {
    // This component assumes your 'video' object has:
    // - $id: The video ID
    // - thumbnailUrl: The URL for the video's thumbnail
    // - title: The video title
    // - username: The creator's name

    if (!video) return null;

    return (
        <Link 
            to={`/watch/${video.$id}`} 
            className="flex gap-3 cursor-pointer group w-full"
        >
            {/* Thumbnail */}
            <div className="w-40 h-24 bg-gray-200 rounded-lg shrink-0 overflow-hidden relative">
                <img 
                    src={video.thumbnailUrl} // <-- Make sure you have this field in Appwrite
                    alt={video.title} 
                    className="w-full h-full object-cover" 
                />
                {/* You could add a 'type' badge here later (e.g., "Short") */}
            </div>

            {/* Video Details */}
            <div className="flex flex-col flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-neutral-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {video.title}
                </h4>
                <p className="text-xs text-neutral-500 mt-1 truncate">
                    {video.username}
                </p>
                {/* You can add view count here later if you track it:
                  <p className="text-xs text-neutral-500">1.2M views</p> 
                */}
            </div>
        </Link>
    );
};

export default SuggestedVideoCard;