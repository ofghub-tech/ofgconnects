// src/components/HistoryShortsCard.js
import React from 'react';
import { Link } from 'react-router-dom';

// Helper function to format view count
const formatViews = (views) => {
    if (!views) return '0 views';
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M views';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K views';
    return views + ' views';
};

const HistoryShortsCard = ({ video }) => {
    if (!video) return null;

    return (
        <Link 
            // Send user to the correct watch page based on category
            to={video.category === 'shorts' ? `/shorts/${video.$id}` : `/watch/${video.$id}`}
            className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-transform duration-200 ease-in-out hover:shadow-md hover:-translate-y-1 dark:bg-gray-800"
        >
            {/* 9:16 Aspect Ratio Container */}
            <div className="aspect-[9/16] w-full overflow-hidden">
                <img
                    className="h-full w-full object-cover"
                    src={video.thumbnailUrl}
                    alt={video.title}
                />
            </div>
            {/* Info */}
            <div className="flex-1 p-3">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 dark:text-gray-100">
                    {video.title || 'Untitled Short'}
                </h3>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {formatViews(video.view_count || 0)}
                </p>
            </div>
        </Link>
    );
};

export default HistoryShortsCard;