// src/components/ShortsVideoCard.js
import React, { useRef, useState, useEffect } from 'react';
import LikeButton from './LikeButton';
import ShareButton from './ShareButton';
import FollowButton from './FollowButton';
import Avatar from './Avatar';

const ShortsVideoCard = ({ video, isActive, hasUserInteracted }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Get the correct video source
    const videoSrc = video.video_url || video.videoUrl || video.url;
    const thumbnailSrc = video.thumbnailUrl || video.thumbnail_url;

    // 2. Manage Playback when active state changes
    useEffect(() => {
        if (!videoRef.current) return;

        if (isActive) {
            // Reset video to start
            videoRef.current.currentTime = 0;
            setIsLoading(true);
            setError(null);

            // Attempt to Play
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                        setIsLoading(false); 
                    })
                    .catch((err) => {
                        console.warn("Autoplay blocked/failed:", err);
                        setIsPlaying(false);
                        // If blocked, mute and try again (Browser Policy)
                        if (videoRef.current) {
                            videoRef.current.muted = true;
                            videoRef.current.play()
                                .then(() => setIsPlaying(true))
                                .catch(e => console.error("Muted play failed", e));
                        }
                    });
            }
        } else {
            // Pause if not active
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isActive]);

    // 3. Safety Check: If video is already ready (e.g. from cache)
    useEffect(() => {
        if (videoRef.current && videoRef.current.readyState >= 3) {
            setIsLoading(false);
        }
    }, []);

    // 4. Manual Play/Pause Toggle
    const togglePlay = () => {
        if (!videoRef.current) return;
        
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    // 5. Event Handlers
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlaying = () => {
        setIsLoading(false);
        setIsPlaying(true);
    };
    const handleError = (e) => {
        console.error("Video Error:", e);
        setIsLoading(false);
        setError("Video failed to load");
    };

    return (
        <div className="relative h-full w-full bg-black flex justify-center">
            {/* --- VIDEO CONTAINER --- */}
            <div 
                className="relative h-full w-full sm:w-[450px] cursor-pointer bg-black"
                onClick={togglePlay}
            >
                {/* Error Message */}
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80">
                        <p className="text-red-500 font-bold px-4 text-center">{error}</p>
                    </div>
                )}

                {/* Loading Spinner */}
                {isLoading && !error && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                )}

                {/* The Video Player */}
                {videoSrc ? (
                    <video
                        ref={videoRef}
                        src={videoSrc}
                        poster={thumbnailSrc}
                        className="h-full w-full object-contain"
                        loop
                        playsInline
                        preload="auto"
                        muted={!hasUserInteracted} // Start muted to allow autoplay
                        
                        onWaiting={handleWaiting}
                        onCanPlay={handleCanPlay}
                        onLoadedData={handleCanPlay}
                        onPlaying={handlePlaying}
                        onError={handleError}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-500">
                        Video source unavailable
                    </div>
                )}

                {/* Play Icon Overlay */}
                {!isPlaying && !isLoading && !error && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div className="bg-black/40 p-4 rounded-full backdrop-blur-sm">
                            <svg className="w-8 h-8 text-white fill-white" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            {/* --- RIGHT ACTIONS --- */}
            <div className="absolute right-2 bottom-20 flex flex-col gap-6 items-center z-30 sm:right-[calc(50%-220px)]">
                <div className="flex flex-col items-center">
                    <Avatar 
                        url={video.creatorAvatar} 
                        name={video.username} 
                        size="md" 
                        className="border-2 border-white mb-[-10px] z-10" 
                    />
                </div>
                
                <div className="flex flex-col items-center gap-1">
                    <LikeButton videoId={video.$id} initialLikes={video.likes || []} />
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button className="bg-gray-800/60 p-3 rounded-full hover:bg-gray-700 transition backdrop-blur-sm">
                         <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
                    </button>
                    <span className="text-xs font-medium text-white drop-shadow-md">0</span>
                </div>

                <ShareButton />
            </div>

            {/* --- BOTTOM INFO --- */}
            <div className="absolute bottom-4 left-4 right-16 z-30 text-left sm:left-[calc(50%-200px)] sm:w-[350px]">
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-white drop-shadow-md text-sm sm:text-base">@{video.username}</h3>
                    <FollowButton targetUserId={video.userId} />
                </div>
                <p className="text-sm text-white/90 line-clamp-2 drop-shadow-md">
                    {video.title}
                </p>
            </div>
        </div>
    );
};

export default ShortsVideoCard;