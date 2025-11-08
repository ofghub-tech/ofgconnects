// src/pages/KidsWatchPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import {
    DATABASE_ID,
    COLLECTION_ID_VIDEOS,
    COLLECTION_ID_HISTORY,
    COLLECTION_ID_WATCH_LATER // <-- 1. IMPORT
} from '../appwriteConfig';
import { ID, Query, Permission, Role } from 'appwrite';
import Comments from '../components/Comments';
import FollowButton from '../components/FollowButton';
import LikeButton from '../components/LikeButton';
import ShareButton from '../components/ShareButton';
import SuggestedVideos from '../components/SuggestedVideos';

// --- (Bookmark Icons: No change) ---
const BookmarkIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
);
const BookmarkIconSolid = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
);
// --- 2. ADD EYE ICON ---
const EyeIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
// --- (End Icons) ---


const KidsWatchPage = () => {
    const { videoId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- 3. UPDATED WATCH LATER STATE ---
    const [isSaved, setIsSaved] = useState(false);
    const [savedDocId, setSavedDocId] = useState(null);
    const [isTogglingSave, setIsTogglingSave] = useState(false);

    // --- 4. CHECK SAVED STATUS (useEffect) ---
    useEffect(() => {
        const checkSavedStatus = async () => {
            if (!user || !videoId) {
                setIsSaved(false);
                setSavedDocId(null);
                return;
            }
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_WATCH_LATER,
                    [
                        Query.equal('userId', user.$id),
                        Query.equal('videoId', videoId),
                        Query.limit(1)
                    ]
                );
                if (response.total > 0) {
                    setIsSaved(true);
                    setSavedDocId(response.documents[0].$id);
                } else {
                    setIsSaved(false);
                    setSavedDocId(null);
                }
            } catch (error) {
                console.error("Failed to check watch later status:", error);
            }
        };
        checkSavedStatus();
    }, [user, videoId]);

    // --- 5. TOGGLE SAVE FUNCTION (DATABASE) ---
    const handleToggleSave = async () => {
        if (!user) {
            alert("Please log in to save videos to Watch Later.");
            return;
        }
        if (isTogglingSave) return;
        setIsTogglingSave(true);
        try {
            if (isSaved && savedDocId) {
                await databases.deleteDocument(
                    DATABASE_ID,
                    COLLECTION_ID_WATCH_LATER,
                    savedDocId
                );
                setIsSaved(false);
                setSavedDocId(null);
            } else {
                const response = await databases.createDocument(
                    DATABASE_ID,
                    COLLECTION_ID_WATCH_LATER,
                    ID.unique(),
                    {
                        userId: user.$id,
                        videoId: videoId
                    },
                    [
                        Permission.read(Role.user(user.$id)),
                        Permission.write(Role.user(user.$id))
                    ]
                );
                setIsSaved(true);
                setSavedDocId(response.$id);
            }
        } catch (error) {
            console.error("Failed to toggle watch later:", error);
            alert("Failed to update Watch Later list. Please try again.");
        }
        setIsTogglingSave(false);
    };

    // --- 6. UPDATED History logging ---
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
                    return null; // Don't log view
                }
            }

            // 1. Log to history
            await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_HISTORY,
                ID.unique(),
                {
                    userId: userId,
                    videoId: videoId
                },
                [
                    Permission.read(Role.user(userId)),
                    Permission.write(Role.user(userId))
                ]
            );

            // 2. Increment and update the view_count
            const newViewCount = (currentViewCount || 0) + 1;
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                videoId,
                {
                    view_count: newViewCount
                }
            );

            // 3. Return the new count
            return newViewCount;

        } catch (e) {
            console.error('Failed to log video view:', e);
            return null;
        }
    };
    // --- (End History) ---


    // --- 7. UPDATED useEffect hook to fetch video ---
    useEffect(() => {
        const getVideo = async () => {
            setLoading(true);
            try {
                const response = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS,
                    videoId
                );
                setVideo(response); // This response now includes `view_count`

                // MODIFIED LOG VIEW HERE
                if (user) {
                    // Pass the current view count
                    const newCount = await logVideoView(user.$id, videoId, response.view_count);
                    
                    // If the count was updated, update local state
                    if (newCount) {
                        setVideo(prevVideo => ({ ...prevVideo, view_count: newCount }));
                    }
                }

            } catch (error) {
                console.error('Failed to fetch video:', error);
            }
            setLoading(false);
        };
        getVideo();
    }, [videoId, navigate, user]); // Dependencies are correct
    // --- (End useEffect) ---

    // --- (CSS classes and Loading/Not Found states - No change) ---
    const actionButtonClasses = `
        flex items-center justify-center gap-2
        py-2 px-4 h-9 rounded-full 
        font-medium text-sm text-neutral-800
        bg-gray-100 hover:bg-gray-200
        dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600
        transition-colors duration-200 ease-in-out
        whitespace-nowrap
        disabled:opacity-50 disabled:cursor-not-allowed
    `;
    const saveButtonClasses = `
        ${actionButtonClasses}
        ${isSaved ? 'bg-gray-200 font-semibold dark:bg-gray-600' : ''}
    `;

    if (loading) {
        return (
            <div className="flex w-full h-full min-h-[70vh] items-center justify-center p-10 bg-white dark:bg-gray-900">
                <p className="text-xl text-neutral-500 dark:text-gray-400">Loading video...</p>
            </div>
        );
    }
    if (!video) {
        return (
            <div className="flex w-full h-full min-h-[70vh] items-center justify-center p-10 bg-white dark:bg-gray-900">
                <p className="text-xl text-red-600">Video not found or failed to load.</p>
            </div>
        );
    }
    // --- (End States) ---


    // --- Render Watch Page ---
    return (
        <div className="w-full bg-white text-neutral-900 font-sans p-4 sm:p-6 lg:p-8 dark:bg-gray-900 dark:text-gray-100">
            <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-3 lg:gap-x-6 gap-y-6">

                {/* --- 1. Main Content (Left Column) --- */}
                <div className="lg:col-span-2">
                    
                    <div className="w-full aspect-video rounded-lg bg-black mb-4 overflow-hidden">
                        <video
                            controls
                            src={video.videoUrl}
                            className="w-full h-full"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>

                    <h1 className="mb-3 text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {video.title}
                    </h1>
                    
                    {/* --- 8. ADDED VIEW COUNT DISPLAY --- */}
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-gray-400 mb-3">
                        <EyeIcon className="w-5 h-5" />
                        <span>
                            {(video.view_count || 0).toLocaleString()} {video.view_count === 1 ? 'view' : 'views'}
                        </span>
                    </div>

                    {video.username && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3">
                            
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex justify-center items-center text-xl font-bold text-white shrink-0">
                                    {video.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-base font-semibold text-neutral-800 dark:text-gray-200">
                                    {video.username}
                                </span>
                                <FollowButton creatorId={video.userId} creatorName={video.username} />
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <LikeButton videoId={video.$id} initialLikeCount={video.likeCount || 0} />
                                <ShareButton videoId={video.$id} videoTitle={video.title} />
                                <button
                                    className={saveButtonClasses}
                                    onClick={handleToggleSave} // <-- 9. Use new function
                                    disabled={isTogglingSave} // <-- 9. Use new state
                                    title={!user ? 'Log in to save' : (isSaved ? 'Remove from Watch Later' : 'Save to Watch Later')}
                                >
                                    {isSaved
                                        ? <BookmarkIconSolid className="h-5 w-5" />
                                        : <BookmarkIcon className="h-5 w-5" />
                                    }
                                    {isSaved ? 'Saved' : 'Save'}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div className="mt-4 p-4 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-700">
                        <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap dark:text-gray-300">
                            {video.description || 'No description provided.'}
                        </p>
                    </div>
                    
                    <hr className="border-t border-gray-200 my-6 dark:border-gray-700" />

                    <Comments videoId={videoId} />

                </div>
                
                {/* --- 2. Suggested Videos (Right Column) --- */}
                <div className="lg:col-span-1">
                    <SuggestedVideos currentVideo={video} forceCategory="kids" />
                </div>

            </div>
        </div>
    );
};

export default KidsWatchPage;