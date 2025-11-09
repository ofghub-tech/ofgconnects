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
const VolumeUpIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.125 7.5l-4.25-4.25a1.5 1.5 0 00-2.121 0L8.75 7.5H4.5A1.5 1.5 0 003 9v6a1.5 1.5 0 001.5 1.5h4.25l4.25 4.25a1.5 1.5 0 002.121 0l4.25-4.25V7.5zM15 15l3-3m-3 0l-3-3m6 0l-3 3"/>
    </svg>
);
const VolumeOffIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.125 7.5l-4.25-4.25a1.5 1.5 0 00-2.121 0L8.75 7.5H4.5A1.5 1.5 0 003 9v6a1.5 1.5 0 001.5 1.5h4.25l4.25 4.25a1.5 1.5 0 002.121 0l4.25-4.25V7.5zM15 15l3-3m-3 0l-3-3m6 0l-3 3M19.5 7.5l-6 6m6 0l-6-6"/>
    </svg>
);
// --- (End Icons) ---


const ShortsVideoCard = ({ video, isActive, onClose }) => {
    const { user } = useAuth();
    const videoRef = useRef(null);
    const [isCommentPanelOpen, setIsCommentPanelOpen] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentVideo, setCurrentVideo] = useState(video);
    
    const [isMuted, setIsMuted] = useState(() => {
        const storedMuteState = localStorage.getItem('shorts_isMuted');
        return storedMuteState === 'true' ? true : false;
    });

    const [wasForceMuted, setWasForceMuted] = useState(false); 

    useEffect(() => {
        setCurrentVideo(video);
    }, [video]);

    const handleVideoClick = () => {
        if (!videoRef.current) return;
        
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPaused(false);
        } else {
            videoRef.current.pause();
            setIsPaused(true);
        }
    };

    const handleMuteToggle = (e) => {
        e.stopPropagation();
        if (!videoRef.current) return;

        const newMutedState = !isMuted;
        videoRef.current.muted = newMutedState;
        setIsMuted(newMutedState); 
        
        localStorage.setItem('shorts_isMuted', newMutedState);
        
        if (newMutedState === false) {
            setWasForceMuted(false); 
        }
    };

    // --- (Playback/Pause Logic - UPDATED) ---
    useEffect(() => {
        if (!videoRef.current) {
            return;
        }
        const videoElement = videoRef.current;
        
        if (isActive) {
            setWasForceMuted(false); 

            const playPromise = videoElement.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    if (error.name === 'NotAllowedError') {
                        // This handles browser autoplay policy
                        console.warn('Autoplay with sound failed. Trying muted.');
                        videoElement.muted = true; 
                        setIsMuted(true); 
                        setWasForceMuted(true); 
                        localStorage.setItem('shorts_isMuted', 'true'); 
                        videoElement.play().catch(err => console.error('Muted autoplay failed.', err));
                    
                    } else if (error.name !== 'AbortError') { 
                        // --- THIS IS THE FIX ---
                        // We intentionally ignore 'AbortError'.
                        // This error happens when the user scrolls away
                        // before the video play() promise can finish.
                        // It's not a bug, so we don't log it.
                        console.error('Video play failed (unrelated to AbortError):', error);
                    }
                });
            }
        }
        return () => {
            videoElement.pause();
            videoElement.currentTime = 0; 
            setIsCommentPanelOpen(false);
            setIsPaused(false); 
        };
    }, [isActive, currentVideo]); 

    // --- (View Logging Logic - No change) ---
    useEffect(() => {
        if (isActive && user && currentVideo) {
            const logView = async () => {
                const newCount = await logVideoView(
                    user.$id, 
                    currentVideo.$id, 
                    currentVideo.view_count
                );
                
                if (newCount) {
                    setCurrentVideo(prevVideo => ({ 
                        ...prevVideo, 
                        view_count: newCount 
                    }));
                }
            }
            logView();
        }
    }, [isActive, user, currentVideo?.$id]); 
    
    if (!currentVideo) {
        return <div className="h-full w-full flex-shrink-0 bg-white dark:bg-black"></div>; 
    }

    return (
        <div 
            className="h-full w-full relative flex justify-center items-center flex-shrink-0 bg-white dark:bg-black"
            onClick={handleVideoClick} 
        >
            
            <div className="relative w-full h-full cursor-pointer">
                <video
                    ref={videoRef}
                    loop
                    playsInline
                    muted={isMuted}
                    src={currentVideo.videoUrl} 
                    className="w-full h-full object-contain bg-white dark:bg-black"
                >
                    Your browser does not support the video tag.
                </video>
                
                {isPaused && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <PlayIcon className="h-16 w-16 text-white/80" />
                    </div>
                )}

                {/* "Tap to Unmute" Overlay (No change) */}
                {wasForceMuted && (
                    <div 
                        className="absolute inset-0 z-50 flex cursor-pointer items-center justify-center bg-black/40"
                        onClick={(e) => {
                            e.stopPropagation(); 
                            handleMuteToggle(e); 
                        }}
                    >
                        <div className="flex flex-col items-center gap-2 rounded-full bg-black/50 p-4 text-white">
                            <VolumeOffIcon className="h-10 w-10" />
                            <span className="font-semibold">Tap to unmute</span>
                        </div>
                    </div>
                )}
                
            </div>
            
            <div 
                className={`
                    absolute inset-0 z-40
                    transition-opacity duration-300 ease-in-out
                    ${isActive ? 'opacity-100' : 'opacity-0'}
                `}
                style={{ pointerEvents: isActive ? 'auto' : 'none' }}
            >
                {/* Close Button (No change) */}
                <button
                    onClick={(e) => { 
                        e.stopPropagation();
                        onClose();
                    }} 
                    className="absolute top-4 left-4 z-50 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-all hover:bg-black/70 shadow-lg"
                    title="Close"
                    style={{ pointerEvents: 'auto' }}
                >
                    <CloseIcon className="h-6 w-6" />
                </button>

                {/* --- MUTE BUTTON (DESIGN ENHANCED) --- */}
                <button
                    onClick={handleMuteToggle}
                    className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-3 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-black/70"
                    title={isMuted ? 'Unmute' : 'Mute'}
                    style={{ pointerEvents: 'auto' }}
                >
                    {isMuted 
                        ? <VolumeOffIcon className="h-6 w-6" /> 
                        : <VolumeUpIcon className="h-6 w-6" />
                    }
                </button>

                {/* Video Info (No change) */}
                <div 
                    className="absolute bottom-0 left-0 w-full max-w-md p-4 sm:p-6 text-gray-900 dark:text-white text-shadow-lg"
                    onClick={(e) => e.stopPropagation()} 
                >
                    <h2 className="text-xl font-bold">{currentVideo.title}</h2>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-200 line-clamp-2">
                        {currentVideo.description || 'No description.'}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
                            {currentVideo.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-white">{currentVideo.username}</span>
                        <FollowButton creatorId={currentVideo.userId} creatorName={currentVideo.username} />
                    </div>
                </div>

                {/* Action Buttons (No change) */}
                <div 
                    className="absolute right-2 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-4 sm:right-4"
                    style={{ pointerEvents: 'auto' }}
                    onClick={(e) => e.stopPropagation()} 
                >
                    <LikeButton videoId={currentVideo.$id} initialLikeCount={currentVideo.likeCount || 0} />
                    <button 
                        className="flex items-center justify-center gap-2 py-2 px-4 h-9 rounded-full font-medium text-sm text-neutral-800 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                        onClick={() => setIsCommentPanelOpen(true)}
                    >
                        <CommentIcon className="h-5 w-5" />
                        Comment
                    </button>
                    <ShareButton videoId={currentVideo.$id} videoTitle={currentVideo.title} />
                </div>
            </div>

            {/* Comment Panel (No change) */}
            {isCommentPanelOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                        onClick={(e) => { 
                            e.stopPropagation();
                            setIsCommentPanelOpen(false);
                        }}
                    ></div>
                    <div 
                        className="fixed top-0 right-0 z-[51] h-full w-full max-w-md transform-gpu bg-white shadow-lg transition-transform dark:bg-gray-900"
                        onClick={(e) => e.stopPropagation()} 
                    >
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
                                <Comments videoId={currentVideo.$id} />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ShortsVideoCard;