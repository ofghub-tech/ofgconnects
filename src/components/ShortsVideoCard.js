// src/components/ShortsVideoCard.js
import React, { useState, useEffect, useRef } from 'react';
import { databases } from '../appwriteConfig';
import {
    DATABASE_ID,
    COLLECTION_ID_VIDEOS,
    COLLECTION_ID_HISTORY
} from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import { ID, Query, Permission, Role } from 'appwrite';

import LikeButton from './LikeButton';
import ShareButton from './ShareButton';
import FollowButton from './FollowButton';
import Comments from './Comments';

// --- (logVideoView function - No changes) ---
const logVideoView = async (userId, videoId, currentViewCount) => {
    if (!userId) return null;
    try {
        const existingView = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID_HISTORY,
            [
                Query.equal('userId', userId),
                Query.equal('videoId', videoId),
                Query.orderDesc('$createdAt'),
                Query.limit(1)
            ]
        );
        if (existingView.total > 0) {
            const lastViewTime = new Date(existingView.documents[0].$createdAt);
            const fiveMinutes = 5 * 60 * 1000;
            if (Date.now() - lastViewTime.getTime() < fiveMinutes) {
                return null; 
            }
        }
        await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID_HISTORY,
            ID.unique(),
            { userId: userId, videoId: videoId },
            [
                Permission.read(Role.user(userId)),
                Permission.write(Role.user(userId))
            ]
        );
        const newViewCount = (currentViewCount || 0) + 1;
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTION_ID_VIDEOS,
            videoId,
            { view_count: newViewCount }
        );
        return newViewCount;
    } catch (e) {
        console.error('Failed to log video view:', e);
        return null;
    }
};

// --- (Icons - No changes) ---
const CommentIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-3.86 8.25-8.625 8.25a9.76 9.76 0 01-2.53-.388 1.875 1.875 0 01-1.002-1.002A9.753 9.753 0 013 12c0-4.556 3.86-8.25 8.625-8.25a9.753 9.753 0 012.53.388 1.875 1.875 0 011.002 1.002A9.76 9.76 0 0121 12z" />
    </svg>
);
const CloseIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const PlayIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);
// --- (End Icons) ---


const ShortsVideoCard = ({ video, isActive, onClose }) => {
    const { user } = useAuth();
    const videoRef = useRef(null);
    const [isCommentPanelOpen, setIsCommentPanelOpen] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // --- Playback/Pause Logic ---
    useEffect(() => {
        if (!videoRef.current) return;

        if (isActive) {
            // --- THIS IS THE FIX ---
            // We tell the video to play *only* when it becomes active
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // This handles browsers that block autoplay
                    if (error.name === 'NotAllowedError') {
                        console.warn('Autoplay with sound failed. Trying muted.');
                        videoRef.current.muted = true;
                        videoRef.current.play().catch(err => console.error('Muted autoplay failed.', err));
                    }
                });
            }
            // If the video was manually paused, keep it paused
            if (!isPaused) {
                videoRef.current.play();
            }
        } else {
            // When the card is no longer active, pause and rewind
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setIsCommentPanelOpen(false);
            setIsPaused(false); // Reset pause state for next time
        }
    }, [isActive, video]); // Depends on isActive and video (to load new src)

    // --- View Logging Logic ---
    useEffect(() => {
        if (isActive && user && video) {
            logVideoView(user.$id, video.$id, video.view_count);
        }
    }, [isActive, user, video]);

    // --- Click-to-Pause/Play Handler ---
    const handleVideoClick = () => {
        if (!videoRef.current) return;
        
        // This logic is now simpler and more direct
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPaused(false);
        } else {
            videoRef.current.pause();
            setIsPaused(true);
        }
    };

    if (!video) {
        return <div className="h-full w-full flex-shrink-0 bg-black"></div>;
    }

    return (
        <div 
            className="h-full w-full relative flex justify-center items-center flex-shrink-0 bg-black"
        >
            
            {/* Video Player Wrapper */}
            <div 
                className="relative w-full h-full cursor-pointer"
                onClick={handleVideoClick}
            >
                <video
                    ref={videoRef}
                    loop
                    // `autoPlay` is REMOVED. The useEffect handles playing.
                    playsInline
                    src={video.videoUrl}
                    className="w-full h-full object-contain bg-black"
                >
                    Your browser does not support the video tag.
                </video>
                
                {/* Paused Icon Overlay */}
                {isPaused && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <PlayIcon className="h-16 w-16 text-white/80" />
                    </div>
                )}
            </div>
            
            {/* UI Overlay Wrapper (Fades in/out) */}
            <div 
                className={`
                    absolute inset-0 z-40
                    transition-opacity duration-300 ease-in-out
                    ${isActive ? 'opacity-100' : 'opacity-0'}
                `}
                onClick={(e) => e.stopPropagation()}
                style={{ pointerEvents: isActive ? 'auto' : 'none' }}
            >
                {/* Close Button (Top Left) */}
                <button
                    onClick={onClose} 
                    className="absolute top-4 left-4 z-50 rounded-full bg-black/30 p-2 text-white transition-all hover:bg-black/50"
                    title="Close"
                    style={{ pointerEvents: 'auto' }}
                >
                    <CloseIcon className="h-6 w-6" />
                </button>

                {/* Video Info (Bottom Left) */}
                <div className="absolute bottom-0 left-0 w-full max-w-md p-4 sm:p-6 text-white text-shadow-lg">
                    <h2 className="text-xl font-bold">{video.title}</h2>
                    <p className="mt-1 text-sm text-gray-200 line-clamp-2">
                        {video.description || 'No description.'}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
                            {video.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold">{video.username}</span>
                        <FollowButton creatorId={video.userId} creatorName={video.username} />
                    </div>
                </div>

                {/* Action Buttons (Right Side) */}
                <div 
                    className="absolute right-2 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-4 sm:right-4"
                    style={{ pointerEvents: 'auto' }}
                >
                    <LikeButton videoId={video.$id} initialLikeCount={video.likeCount || 0} />
                    <button 
                        className="flex items-center justify-center gap-2 py-2 px-4 h-9 rounded-full font-medium text-sm text-neutral-800 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                        onClick={() => setIsCommentPanelOpen(true)}
                    >
                        <CommentIcon className="h-5 w-5" />
                        Comment
                    </button>
                    <ShareButton videoId={video.$id} videoTitle={video.title} />
                </div>
            </div>

            {/* Comment Panel (Slide-in) */}
            {isCommentPanelOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsCommentPanelOpen(false)}
                    ></div>
                    <div className="fixed top-0 right-0 z-[51] h-full w-full max-w-md transform-gpu bg-white shadow-lg transition-transform dark:bg-gray-900">
                        <div className="flex h-full flex-col">
                            <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Comments
                                </h3>
                                <button 
                                    onClick={() => setIsCommentPanelOpen(false)} 
                                    className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                                >
                                    <CloseIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <Comments videoId={video.$id} />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ShortsVideoCard;