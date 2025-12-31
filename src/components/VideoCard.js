import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import Avatar from './Avatar'; 

const VideoCard = ({ video }) => {
    if (!video) return null;

    // --- FIX: Map the fields correctly based on UploadForm.js ---
    // 1. Check 'username' (how it's saved) 
    const creatorName = video?.creator?.name || video?.creatorName || video?.username || 'Unknown';
    
    // 2. Check 'creatorAvatar' (how it's saved)
    const creatorAvatar = video?.creator?.prefs?.avatar || video?.creatorAvatar; 
    
    // 3. Check 'view_count' (how it's saved)
    const views = video?.views || video?.view_count || 0;
    
    return (
        <div className="flex flex-col gap-3 group">
            {/* Thumbnail */}
            <Link to={`/watch/${video.$id}`} className="relative aspect-video rounded-xl overflow-hidden bg-gray-900">
                <img 
                    src={video.thumbnailUrl} 
                    alt={video.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                
                {/* Duration Badge (Optional) */}
                {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-2 py-0.5 rounded">
                        {video.duration}
                    </div>
                )}
            </Link>

            {/* Info Section */}
            <div className="flex gap-3 items-start">
                {/* Avatar */}
                <Link to={`/channel/${video?.creator?.$id || video?.userId}`}>
                    <Avatar 
                        url={creatorAvatar} 
                        name={creatorName} 
                        size="sm" // 32px
                        className="mt-0.5 ring-1 ring-transparent group-hover:ring-gray-300 dark:group-hover:ring-gray-600 transition-all"
                    />
                </Link>

                {/* Text Info */}
                <div className="flex flex-col overflow-hidden">
                    <Link to={`/watch/${video.$id}`}>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {video.title}
                        </h3>
                    </Link>
                    
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 flex flex-col">
                        <Link 
                            to={`/channel/${video?.creator?.$id || video?.userId}`}
                            className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                        >
                            {creatorName}
                        </Link>
                        <span>
                            {views} views • {video.$createdAt ? formatDistanceToNow(new Date(video.$createdAt), { addSuffix: true }) : ''}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCard;