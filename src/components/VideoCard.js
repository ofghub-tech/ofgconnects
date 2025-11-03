// src/components/VideoCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom'; // <-- CORRECTED SYNTAX

const VideoCard = ({ video }) => {
    const navigate = useNavigate();
    
    // Safety check: Don't render if the video object is missing
    if (!video) return null;

    return (
        <div 
            key={video.$id} 
            className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            // Navigate to the VideoRouter route which handles resolution
            onClick={() => navigate(`/watch/${video.$id}`)}
        >
            {/* Video Thumbnail */}
            <div className="relative w-full overflow-hidden bg-gray-200 aspect-video">
                {(typeof video.thumbnailUrl === 'string' && video.thumbnailUrl) ? (
                    <img 
                        src={video.thumbnailUrl} 
                        alt={video.title} 
                        className="absolute h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    // Thumbnail Placeholder
                    <div className="absolute flex h-full w-full items-center justify-center p-4 text-center text-sm text-gray-500">
                        <p>Thumbnail for "{video.title}"</p>
                    </div>
                )}
            </div>
            {/* Video Info */}
            <div className="p-4">
                <h3 className="truncate text-lg font-semibold text-gray-900" title={video.title}>
                    {video.title}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                    By: {video.username || '...'}
                </p>
            </div>
        </div>
    );
};

export default VideoCard;
