import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';

const ShortsVideoCard = ({ video, isActive, hasUserInteracted }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!videoRef.current) return;
        if (isActive) {
            videoRef.current.currentTime = 0;
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            }
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive]);

    if (!video) return null;

    // --- FIX: Data Mapping matched to WatchPage.js ---
    // WatchPage uses: video.video_url || video.videoUrl
    const videoSrc = video.video_url || video.videoUrl || video.fileUrl;
    const thumbnailSrc = video.thumbnailUrl || video.thumbnail_url;
    
    // WatchPage uses: video.username and video.creatorAvatar (Direct fields)
    // We add a fallback to nested creator object just in case
    const creatorName = video.username || video?.creator?.name || 'Unknown';
    const creatorAvatar = video.creatorAvatar || video?.creator?.prefs?.avatar;
    const views = video.view_count || video.views || 0;

    // --- RENDER: PLAYER ---
    if (isActive !== undefined) {
        return (
            <div className="relative h-full w-full bg-black flex justify-center items-center">
                <video
                    ref={videoRef}
                    src={videoSrc}
                    className="h-full w-full object-cover"
                    loop
                    playsInline
                    poster={thumbnailSrc}
                    onClick={(e) => {
                        e.target.paused ? e.target.play() : e.target.pause();
                        setIsPlaying(!e.target.paused);
                    }}
                />

                {!isPlaying && isActive && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/40 p-4 rounded-full backdrop-blur-sm">
                            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-24 pointer-events-none">
                    <div className="flex items-end justify-between pointer-events-auto">
                        <div className="flex-1 mr-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Avatar url={creatorAvatar} name={creatorName} className="w-10 h-10 border border-white" />
                                <span className="font-bold text-white text-base">@{creatorName}</span>
                                <button className="bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full hover:bg-gray-200 transition">Subscribe</button>
                            </div>
                            <p className="text-white text-sm line-clamp-2 drop-shadow-md mb-2">{video.title}</p>
                        </div>
                        <div className="flex flex-col gap-6 items-center pb-4">
                            <div className="text-center">
                                <button className="bg-gray-800/60 p-3 rounded-full hover:bg-gray-700 backdrop-blur-sm transition">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"/></svg>
                                </button>
                                <span className="text-xs font-medium text-white block mt-1">Like</span>
                            </div>
                            <div className="text-center">
                                <button className="bg-gray-800/60 p-3 rounded-full hover:bg-gray-700 backdrop-blur-sm transition">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-7 7 7z"/></svg>
                                </button>
                                <span className="text-xs font-medium text-white block mt-1">Share</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: GRID PREVIEW ---
    return (
        <Link to={`/shorts/watch/${video.$id}`} className="block group relative aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden">
            <img src={thumbnailSrc} alt={video.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-white text-sm font-bold line-clamp-2 mb-2 drop-shadow-md">{video.title}</h3>
                <div className="flex items-center gap-2">
                    <Avatar url={creatorAvatar} name={creatorName} size="xs" className="w-6 h-6 text-[10px] ring-1 ring-white/30" />
                    <span className="text-gray-200 text-xs font-medium truncate drop-shadow-sm">{views} views</span>
                </div>
            </div>
        </Link>
    );
};

export default ShortsVideoCard;