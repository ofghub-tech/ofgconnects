import React from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar'; // <--- Import Avatar

const ShortsVideoCard = ({ video }) => {
    if (!video) return null;

    const creatorName = video?.creator?.name || 'Unknown';
    const creatorAvatar = video?.creator?.prefs?.avatar;

    return (
        <Link to={`/shorts/watch/${video.$id}`} className="block group relative aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            {/* Thumbnail */}
            <img 
                src={video.thumbnailUrl} 
                alt={video.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-white text-sm font-bold line-clamp-2 mb-2 drop-shadow-md">
                    {video.title}
                </h3>
                
                <div className="flex items-center gap-2">
                    <Avatar 
                        url={creatorAvatar} 
                        name={creatorName} 
                        size="xs" // Extra small (needs adding to Avatar.js or use inline class)
                        className="w-6 h-6 text-[10px] ring-1 ring-white/30"
                    />
                    <span className="text-gray-200 text-xs font-medium truncate drop-shadow-sm">
                        {video?.views || 0} views
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default ShortsVideoCard;