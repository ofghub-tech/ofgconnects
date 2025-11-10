// src/pages/HistoryPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { databases } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import {
    DATABASE_ID,
    COLLECTION_ID_HISTORY,
    COLLECTION_ID_VIDEOS
} from '../appwriteConfig';
import { Query } from 'appwrite';
import VideoCard from '../components/VideoCard';
import HistoryShortsCard from '../components/HistoryShortsCard';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';

// --- (LOGIC UNCHANGED) ---
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

const groupVideosByDate = (videos) => {
    if (!Array.isArray(videos)) return {};
    const grouped = videos.reduce((acc, video) => {
        const dateGroup = getRelativeDate(video.$createdAt);
        if (!acc[dateGroup]) {
            acc[dateGroup] = { shorts: [], videos: [], seenVideoIds: new Set() };
        }
        if (acc[dateGroup].seenVideoIds.has(video.$id)) {
            return acc;
        }
        acc[dateGroup].seenVideoIds.add(video.$id);
        if (video.category === 'shorts') {
            acc[dateGroup].shorts.push(video);
        } else {
            acc[dateGroup].videos.push(video);
        }
        return acc;
    }, {});
    Object.keys(grouped).forEach(dateGroup => {
        delete grouped[dateGroup].seenVideoIds;
    });
    return grouped;
};

const HistoryPage = () => {
    const { user } = useAuth();
    const [fullHistoryList, setFullHistoryList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [lastId, setLastId] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 50;
    const { ref, inView } = useInView({ threshold: 0.1 });

    const groupedVideos = useMemo(() => {
        return groupVideosByDate(fullHistoryList);
    }, [fullHistoryList]);

    const fetchVideoDetails = async (historyDocs) => {
        if (historyDocs.length === 0) return [];
        try {
            const videoIds = historyDocs.map(doc => doc.videoId);
            const uniqueVideoIds = [...new Set(videoIds)];
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                [Query.equal('$id', uniqueVideoIds), Query.limit(100)]
            );
            const videoMap = new Map();
            response.documents.forEach(videoDoc => {
                videoMap.set(videoDoc.$id, videoDoc);
            });
            return historyDocs.map(historyDoc => {
                const videoDetail = videoMap.get(historyDoc.videoId);
                if (!videoDetail) return null;
                return {
                    ...videoDetail,
                    $createdAt: historyDoc.$createdAt
                };
            }).filter(Boolean);
        } catch (e) {
            console.error("Failed to fetch video details:", e);
            return [];
        }
    };

    const fetchHistory = async (isLoadMore = false) => {
        if (!user) return;
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }
        setError(null);
        try {
            let queries = [
                Query.equal('userId', user.$id),
                Query.orderDesc('$createdAt'),
                Query.limit(ITEMS_PER_PAGE),
                Query.select(['$createdAt', 'videoId', '$id'])
            ];
            if (isLoadMore && lastId) {
                queries.push(Query.cursorAfter(lastId));
            }
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_HISTORY,
                queries
            );
            const newItems = await fetchVideoDetails(response.documents);
            if (isLoadMore) {
                setFullHistoryList(prev => [...prev, ...newItems]);
            } else {
                setFullHistoryList(newItems);
            }
            setHasMore(response.documents.length === ITEMS_PER_PAGE);
            if (response.documents.length > 0) {
                setLastId(response.documents[response.documents.length - 1].$id);
            }
        } catch (e) {
            console.error('Failed to fetch history:', e);
            setError('Failed to load your watch history.');
        }
        setLoading(false);
        setLoadingMore(false);
    };

    useEffect(() => {
        fetchHistory(false);
    }, [user]);

    useEffect(() => {
        if (inView && hasMore && !loading && !loadingMore) {
            fetchHistory(true);
        }
    }, [inView, hasMore, loading, loadingMore]);
    // --- (END LOGIC) ---

    // --- (FIX) Removed solid backgrounds ---
    if (loading) {
        return (
            <div className="flex w-full h-full min-h-[70vh] items-center justify-center p-10">
                <p className="text-xl text-neutral-500 dark:text-gray-400">Loading your history...</p>
            </div>
        );
    }

    // --- (FIX) Removed solid backgrounds ---
    if (error && fullHistoryList.length === 0) {
        return (
            <div className="flex w-full h-full min-h-[70vh] items-center justify-center p-10">
                <p className="text-xl text-red-600">{error}</p>
            </div>
        );
    }

    return (
        // --- (FIX) Removed solid backgrounds ---
        <div className="w-full text-neutral-900 p-4 sm:p-6 lg:p-8 dark:text-gray-100">
            <div className="max-w-screen-xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    Watch History
                </h1>

                {Object.keys(groupedVideos).length === 0 && !loading ? (
                    // --- (FIX) Made this section a glass panel ---
                    <div className="glass-panel text-center py-20">
                        <p className="text-lg text-gray-600 dark:text-gray-200 mb-4">
                            Your watch history is empty.
                        </p>
                        <Link to="/home" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                            Start Watching
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {Object.entries(groupedVideos).map(([date, data]) => (
                            <section key={date}>
                                {/* --- (FIX) Semi-transparent border --- */}
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-white/20 dark:border-gray-700/50">
                                    {date}
                                </h2>

                                {data.shorts.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Shorts</h3>
                                        <div className="flex gap-4 overflow-x-auto py-2">
                                            {data.shorts.map((video, index) => (
                                                <div key={`${video.$id}-${index}`} className="w-36 flex-shrink-0">
                                                    {/* This component will be converted to a glass panel next */}
                                                    <HistoryShortsCard video={video} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {data.videos.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                        {data.videos.map((video, index) => (
                                            // This component is already a glass panel
                                            <VideoCard key={`${video.$id}-${index}`} video={video} />
                                        ))}
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>
                )}

                {hasMore && (
                    <div ref={ref} className="flex justify-center mt-10 py-4">
                        {loadingMore ? (
                             <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                 <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                 <span>Loading older history...</span>
                             </div>
                        ) : (
                            <div className="h-10 w-full" />
                        )}
                    </div>
                )}

                {!hasMore && fullHistoryList.length > 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 mt-10 pb-10">
                        End of watch history.
                    </p>
                )}
            </div>
        </div>
    );
};

export default HistoryPage;