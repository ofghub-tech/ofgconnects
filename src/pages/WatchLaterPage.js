// src/pages/WatchLaterPage.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import { DATABASE_ID, COLLECTION_ID_VIDEOS, COLLECTION_ID_WATCH_LATER } from '../appwriteConfig';
import { Query } from 'appwrite';
import { Link } from 'react-router-dom';
// --- 1. IMPORT OBSERVER ---
import { useInView } from 'react-intersection-observer';

// --- Icon Component ---
const BookmarkIcon = (props) => (
    <svg {...props} className="h-16 w-16 text-gray-400 dark:text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
);

const WatchLaterPage = () => {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- 2. PAGINATION STATE ---
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastDocId, setLastDocId] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 50;

    // --- 3. OBSERVER HOOK ---
    const { ref, inView } = useInView({ threshold: 0.1 });

    const fetchWatchLaterVideos = async (isLoadMore = false) => {
        if (!user) return;

        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            // 1. Fetch batch of 'watch later' documents
            let queries = [
                Query.equal('userId', user.$id),
                Query.orderDesc('$createdAt'),
                Query.limit(ITEMS_PER_PAGE)
            ];

            if (isLoadMore && lastDocId) {
                queries.push(Query.cursorAfter(lastDocId));
            }

            const wlResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_WATCH_LATER,
                queries
            );

            const wlDocs = wlResponse.documents;
            if (wlDocs.length === 0) {
                if (!isLoadMore) setVideos([]);
                setHasMore(false);
                setLoading(false);
                setLoadingMore(false);
                return;
            }

            // Update cursor
            setLastDocId(wlDocs[wlDocs.length - 1].$id);
            setHasMore(wlDocs.length === ITEMS_PER_PAGE);

            // 2. Extract video IDs
            const videoIds = wlDocs.map(doc => doc.videoId);

            // 3. Fetch actual video documents
            const videosResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                [Query.equal('$id', videoIds), Query.limit(ITEMS_PER_PAGE)]
            );

            // 4. Re-sort to match saved order
            const fetchedVideos = videosResponse.documents;
            const orderedBatch = videoIds
                .map(id => fetchedVideos.find(v => v.$id === id))
                .filter(Boolean);

            // 5. Update state
            if (isLoadMore) {
                setVideos(prev => [...prev, ...orderedBatch]);
            } else {
                setVideos(orderedBatch);
            }

        } catch (error) {
            console.error("Failed to fetch watch later videos:", error);
        }
        setLoading(false);
        setLoadingMore(false);
    };

    // Initial fetch
    useEffect(() => {
        fetchWatchLaterVideos(false);
    }, [user]);

    // Infinite scroll trigger
    useEffect(() => {
        if (inView && hasMore && !loading && !loadingMore) {
            fetchWatchLaterVideos(true);
        }
    }, [inView, hasMore, loading, loadingMore]);


    // --- RENDER FUNCTIONS ---
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full min-h-[50vh] bg-gray-50 text-center dark:bg-gray-900">
                <h1 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">Please Log In</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">You must be logged in to view your Watch Later list.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 h-full min-h-[50vh] bg-gray-50 dark:bg-gray-900">
                <p className="text-lg text-gray-600 dark:text-gray-400">Loading your saved videos...</p>
            </div>
        );
    }

    if (videos.length === 0 && !loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full min-h-[50vh] bg-gray-50 text-center dark:bg-gray-900">
                <BookmarkIcon />
                <h1 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Watch Later
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Save videos to watch later and they'll show up here.
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 dark:text-gray-100">Watch Later</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {videos.map((video) => (
                        <Link to={`/watch/${video.$id}`} key={video.$id} className="group block">
                            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 group-hover:shadow-xl dark:bg-gray-800">
                                {/* Thumbnail */}
                                <div className="w-full aspect-video bg-gray-200 overflow-hidden dark:bg-gray-700">
                                    <img
                                        src={video.thumbnailUrl}
                                        alt={video.title}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                {/* Details */}
                                <div className="p-3">
                                    <h3 className="text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                                        {video.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1 dark:text-gray-400">{video.username}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* --- INFINITE SCROLL TRIGGER AREA --- */}
                {hasMore && (
                    <div ref={ref} className="flex justify-center mt-10 py-4">
                        {loadingMore ? (
                             <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                <span>Loading more...</span>
                            </div>
                        ) : (
                            <div className="h-10 w-full" />
                        )}
                    </div>
                )}

                {!hasMore && videos.length > 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 mt-10 pb-10">
                        End of your list.
                    </p>
                )}
            </div>
        </div>
    );
};

export default WatchLaterPage;