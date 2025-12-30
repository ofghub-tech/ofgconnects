// src/components/VideoCard.js
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VideoCard = ({ video }) => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    // MAPPING: Align with your Flutter 'Video.fromAppwrite' logic
    // Flutter: videoUrl: doc.data['video_url']
    // Flutter: thumbnailUrl: doc.data['thumbnailUrl']
    const sourceUrl = video.video_url || video.videoUrl; 
    const thumbUrl = video.thumbnailUrl || video.thumbnail_url;

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (videoRef.current && sourceUrl) {
            videoRef.current.play().catch(e => { /* Ignore autoplay errors */ });
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <div 
            onClick={() => navigate(`/watch/${video.$id}`)}
            className="glass-panel group cursor-pointer p-0 overflow-hidden flex flex-col"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Thumbnail / Video Preview Area */}
            <div className="relative aspect-video bg-black overflow-hidden rounded-t-xl">
                {/* 1. Thumbnail Image (Visible by default, hidden on hover if video plays) */}
                <img 
                    src={thumbUrl} 
                    alt={video.title}
                    className={`w-full h-full object-cover absolute inset-0 z-10 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
                    onError={(e) => { e.target.style.display = 'none'; }} // Hide if broken
                />
                
                {/* 2. Video Preview (Background) */}
                {sourceUrl && (
                    <video
                        ref={videoRef}
                        src={sourceUrl}
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover absolute inset-0 z-0"
                    />
                )}
                
                {/* Duration Badge (Optional) */}
                {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded z-20">
                        {video.duration}
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div className="p-3 flex gap-3">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <img 
                            src={`https://cloud.appwrite.io/v1/avatars/initials?name=${video.username || 'U'}&width=40&height=40`}
                            alt={video.username}
                        />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {video.title}
                    </h3>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                        <p>{video.username || "Unknown"}</p>
                        <div className="flex items-center mt-0.5">
                            <span>{video.view_count || video.views || 0} views</span>
                            <span className="mx-1">•</span>
                            <span>{new Date(video.$createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCard;