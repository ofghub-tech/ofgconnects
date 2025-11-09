// src/pages/HistoryPage.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import {
    DATABASE_ID,
    COLLECTION_ID_HISTORY,
    COLLECTION_ID_VIDEOS
} from '../appwriteConfig';
import { Query } from 'appwrite';
import VideoCard from '../components/VideoCard';
import HistoryShortsCard from '../components/HistoryShortsCard'; // (No change)
import { Link } from 'react-router-dom';

// --- (HELPER 1: Format date labels - No change) ---
const getRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }
    return date.toLocaleDateString(undefined, options);
};

// --- (HELPER 2: Group videos by date and type - UPDATED) ---
const groupVideosByDate = (videos) => {
    if (!Array.isArray(videos)) {
        console.error("groupVideosByDate expected an array, but got:", videos);
        return {};
    }
    
    // We now use `seenVideoIds` inside each date group
    // to track duplicates *per day*.
    const grouped = videos.reduce((acc, video) => {
        const dateGroup = getRelativeDate(video.$createdAt);
        
        // Ensure acc[dateGroup] exists
        if (!acc[dateGroup]) {
            acc[dateGroup] = { 
                shorts: [], 
                videos: [],
                seenVideoIds: new Set() // <-- (FIX 1) Add Set for duplicate tracking
            };
        }

        // --- (FIX 2) Check if we've already added this video ID *for this day* ---
        if (acc[dateGroup].seenVideoIds.has(video.$id)) {
            // If yes, skip it. Since the list is sorted by date,
            // we are only keeping the *latest* one (the first one we see).
            return acc;
        }
        
        // --- (FIX 3) If it's new for this day, add it ---
        acc[dateGroup].seenVideoIds.add(video.$id);

        if (video.category === 'shorts') {
            acc[dateGroup].shorts.push(video);
        } else {
            acc[dateGroup].videos.push(video);
        }
        return acc;
    }, {});

    // Clean up the `seenVideoIds` sets from the final object
    Object.keys(grouped).forEach(dateGroup => {
        delete grouped[dateGroup].seenVideoIds;
    });
    
    return grouped;
};


const HistoryPage = () => {
    const { user } = useAuth();
    const [groupedVideos, setGroupedVideos] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- (fetchVideoDetails - No changes) ---
    const fetchVideoDetails = async (historyDocs) => {
        if (historyDocs.length === 0) {
            return [];
        }
        try {
            const videoIds = historyDocs.map(doc => doc.videoId); 
            const uniqueVideoIds = [...new Set(videoIds)];

            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                [
                    Query.equal('$id', uniqueVideoIds), 
                    Query.limit(100)
                ]
            );

            const videoMap = new Map();
            response.documents.forEach(videoDoc => {
                videoMap.set(videoDoc.$id, videoDoc);
            });

            const combinedHistory = historyDocs
                .map(historyDoc => {
                    const videoDetail = videoMap.get(historyDoc.videoId);
                    if (!videoDetail) {
                        return null; 
                    }
                    return {
                        ...videoDetail, 
                        $createdAt: historyDoc.$createdAt 
                    };
                })
                .filter(Boolean); 

            return combinedHistory;

        } catch (e) {
            console.error("Failed to fetch video details:", e);
            setError("Could not load video details.");
            return [];
        }
    };

    // --- (fetchHistory - No changes) ---
    const fetchHistory = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);

        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_HISTORY,
                [
                    Query.equal('userId', user.$id),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100), 
                    Query.select(['$createdAt', 'videoId'])
                ]
            );

            const videoDetails = await fetchVideoDetails(response.documents);
            
            const grouped = groupVideosByDate(videoDetails);
            setGroupedVideos(grouped);

        } catch (e) {
            console.error('Failed to fetch history:', e);
            setError('Failed to load your watch history.');
        }
        setLoading(false);
    };


    useEffect(() => {
        fetchHistory();
    }, [user]);

    // --- (Loading/Error checks - No change) ---
    if (loading) {
        return (
            <div className="flex w-full h-full min-h-[70vh] items-center justify-center p-10 bg-white dark:bg-gray-900">
                <p className="text-xl text-neutral-500 dark:text-gray-400">Loading your history...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex w-full h-full min-h-[70vh] items-center justify-center p-10 bg-white dark:bg-gray-900">
                <p className="text-xl text-red-600">{error}</p>
            </div>
        );
    }

    // --- (NEW RENDER LOGIC) ---
    return (
        <div className="w-full bg-white text-neutral-900 p-4 sm:p-6 lg:p-8 dark:bg-gray-900 dark:text-gray-100">
            <div className="max-w-screen-xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    Watch History
                </h1>

                {Object.keys(groupedVideos).length === 0 ? (
                    // Empty state (no change)
                    <div className="text-center py-20">
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                            Your watch history is empty.
                        </p>
                        <Link
                            to="/"
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                        >
                            Start Watching
                        </Link>
                    </div>
                ) : (
                    // Map over the date groups
                    <div className="flex flex-col gap-8">
                        {Object.entries(groupedVideos).map(([date, data]) => (
                            <section key={date}>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                                    {date}
                                </h2>

                                {/* --- (FIX) Shorts Section (9:16) - Horizontal Scroll --- */}
                                {data.shorts.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                                            Shorts
                                        </h3>
                                        {/* This container creates the horizontal scrollbar.
                                          - `flex` and `gap-4`: Lays out children in a row.
                                          - `overflow-x-auto`: Adds horizontal scroll if needed.
                                          - `py-2`: Adds a little padding for the scrollbar.
                                        */}
                                        <div className="flex gap-4 overflow-x-auto py-2">
                                            {data.shorts.map(video => (
                                                /*
                                                  This wrapper controls the size of the card.
                                                  - `flex-shrink-0`: Stops the card from shrinking.
                                                  - `w-36`: Sets a fixed width (approx 9:16)
                                                */
                                                <div 
                                                    key={`${video.$id}-${video.$createdAt}`}
                                                    className="w-36 flex-shrink-0"
                                                >
                                                    <HistoryShortsCard 
                                                        video={video} 
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* --- (END FIX) --- */}

                                {/* --- Videos Section (16:9) - No change --- */}
                                {data.videos.length > 0 && (
                                    <div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                            {data.videos.map(video => (
                                                <VideoCard 
                                                    key={`${video.$id}-${video.$createdAt}`} 
                                                    video={video} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;