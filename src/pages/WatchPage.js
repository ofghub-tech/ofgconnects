// src/pages/WatchPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import Comments from '../components/Comments';
import FollowButton from '../components/FollowButton';
import LikeButton from '../components/LikeButton';
import ShareButton from '../components/ShareButton';
import SuggestedVideos from '../components/SuggestedVideos'; // <-- 1. IMPORT

// Key must match the one in OfflinePage.js
const WATCH_LATER_KEY = 'ofg_watch_later_list';

// ... (Keep all your Icon components: BookmarkIcon, BookmarkIconSolid)
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


const WatchPage = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);

    // ... (Keep all your functions: checkSavedStatus, toggleSavedStatus, useEffect)
    // --- Utility function to manage Watch Later list ---
    const checkSavedStatus = (id) => {
        const savedList = JSON.parse(localStorage.getItem(WATCH_LATER_KEY) || '[]');
        return savedList.includes(id);
    };

    const toggleSavedStatus = (id) => {
        let savedList = JSON.parse(localStorage.getItem(WATCH_LATER_KEY) || '[]');
        if (savedList.includes(id)) {
            savedList = savedList.filter(vId => vId !== id);
            setIsSaved(false);
        } else {
            savedList.push(id);
            setIsSaved(true);
        }
        localStorage.setItem(WATCH_LATER_KEY, JSON.stringify(savedList));
    };

    useEffect(() => {
        const getVideo = async () => {
            setLoading(true);
            try {
                const response = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS,
                    videoId
                );
                setVideo(response);
                setIsSaved(checkSavedStatus(response.$id));

            } catch (error) {
                console.error('Failed to fetch video:', error);
            }
            setLoading(false);
        };
        getVideo();
    }, [videoId, navigate]);

    // ... (Keep all your button classes: actionButtonClasses, saveButtonClasses)
    const actionButtonClasses = `
        flex items-center justify-center gap-2
        py-2 px-4 h-9 rounded-full 
        font-medium text-sm text-neutral-800
        bg-gray-100 hover:bg-gray-200
        transition-colors duration-200 ease-in-out
        whitespace-nowrap
    `;
    const saveButtonClasses = `
        ${actionButtonClasses}
        ${isSaved ? 'bg-gray-200 font-semibold' : ''}
    `;

    // ... (Keep your Loading and Not Found states)
    if (loading) {
        return (
            <div className="flex w-full h-full min-h-[70vh] items-center justify-center p-10 bg-white">
                <p className="text-xl text-neutral-500">Loading video...</p>
            </div>
        );
    }
    if (!video) {
        return (
            <div className="flex w-full h-full min-h-[70vh] items-center justify-center p-10 bg-white">
                <p className="text-xl text-red-600">Video not found or failed to load.</p>
            </div>
        );
    }


    return (
        <div className="w-full bg-white text-neutral-900 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-3 lg:gap-x-6 gap-y-6">

                {/* --- 1. Main Content (Left Column) --- */}
                <div className="lg:col-span-2">
                    
                    {/* --- Video Player --- */}
                    <div className="w-full aspect-video rounded-lg bg-black mb-4 overflow-hidden">
                        <video
                            controls
                            autoPlay
                            src={video.videoUrl}
                            className="w-full h-full"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>

                    {/* --- Video Title --- */}
                    <h1 className="mb-3 text-xl sm:text-2xl font-bold text-gray-900">
                        {video.title}
                    </h1>

                    {/* --- Creator Info & Actions Layout --- */}
                    {video.username && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3">
                            
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-full flex justify-center items-center text-xl font-bold text-white shrink-0">
                                    {video.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-base font-semibold text-neutral-800">
                                    {video.username}
                                </span>
                                <FollowButton creatorId={video.userId} creatorName={video.username} />
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <LikeButton videoId={video.$id} initialLikeCount={video.likeCount || 0} />
                                <ShareButton videoId={video.$id} videoTitle={video.title} />
                                <button
                                    className={saveButtonClasses}
                                    onClick={() => toggleSavedStatus(video.$id)}
                                    title={isSaved ? 'Remove from Save List' : 'Add to Save List'}
                                >
                                    {isSaved
                                        ? <BookmarkIconSolid className="h-5 w-5" />
                                        : <BookmarkIcon className="h-5 w-WELCOME" />
                                    }
                                    {isSaved ? 'Saved' : 'Save'}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* --- Video Description Box --- */}
                    <div className="mt-4 p-4 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg cursor-pointer">
                        <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                            {video.description || 'No description provided.'}
                        </p>
                    </div>
                    
                    <hr className="border-t border-gray-200 my-6" />

                    {/* --- Comments Section --- */}
                    <Comments videoId={videoId} />

                </div>
                
                {/* --- 2. Suggested Videos (Right Column) --- */}
                <div className="lg:col-span-1">
                    {/* Pass the full video object so we can access its tags, category, and userId */}
                    <SuggestedVideos currentVideo={video} />
                </div>

            </div>
        </div>
    );
};

export default WatchPage;