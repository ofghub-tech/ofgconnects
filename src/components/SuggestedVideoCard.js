import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import Avatar from './Avatar'; // <--- Import Avatar

const SuggestedVideoCard = ({ video }) => {
    if (!video) return null;

    const creatorName = video?.creator?.name || 'User';
    // We often don't show avatar in small suggested cards to save space, 
    // but if you want it, here is how (optional):
    const showAvatar = false; 

    return (
        <div className="flex gap-2 group mb-3">
            {/* Thumbnail */}
            <Link to={`/watch/${video.$id}`} className="relative flex-shrink-0 w-40 aspect-video rounded-lg overflow-hidden bg-gray-900">
                <img 
                    src={video.thumbnailUrl} 
                    alt={video.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
            </Link>

            {/* Info */}
            <div className="flex flex-col flex-1 min-w-0">
                <Link to={`/watch/${video.$id}`}>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
                        {video.title}
                    </h3>
                </Link>
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    <Link to={`/channel/${video?.creator?.$id}`} className="hover:text-gray-700 dark:hover:text-gray-300 mb-0.5 block truncate">
                        {creatorName}
                    </Link>
                    <span>
                        {video?.views || 0} views • {video.$createdAt ? formatDistanceToNow(new Date(video.$createdAt), { addSuffix: true }) : ''}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SuggestedVideoCard;