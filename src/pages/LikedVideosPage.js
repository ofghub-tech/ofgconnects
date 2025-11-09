// src/pages/LikedVideosPage.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import { DATABASE_ID, COLLECTION_ID_VIDEOS, COLLECTION_ID_LIKES } from '../appwriteConfig';
import { Query } from 'appwrite';
import { Link } from 'react-router-dom';
// --- 1. IMPORT OBSERVER ---
import { useInView } from 'react-intersection-observer';

// --- Icon Component ---
const HeartIcon = (props) => (
    <svg {...props} className="h-16 w-16 text-red-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.44-1.32C4.59 14.28 1 10.15 1 5.5 1 2.44 3.44 0 6.5 0c1.86 0 3.63.85 4.75 2.21L12 3.75l.75-1.54C14.37.85 16.14 0 18.5 0 21.56 0 24 2.44 24 5.5c0 4.65-3.59 8.78-9.56 14.53L12 21.35z" />
    </svg>
);

const LikedVideosPage = () => {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- 2. NEW PAGINATION STATE ---
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastLikeId, setLastLikeId] = useState(null); // Cursor for LIKES collection
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 50; // Fetch 50 likes at a time

    // --- 3. OBSERVER HOOK ---
    const { ref, inView } = useInView({ threshold: 0.1 });

    const fetchLikedVideos = async (isLoadMore = false) => {
        if (!user) return;

        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            // 1. Fetch batch of 'like' documents
            let queries = [
                Query.equal('userId', user.$id),
                Query.orderDesc('$createdAt'),
                Query.limit(ITEMS_PER_PAGE)
            ];

            // If loading more, use the cursor from the last LIKE document
            if (isLoadMore && lastLikeId) {
                queries.push(Query.cursorAfter(lastLikeId));
            }

            const likesResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_LIKES,
                queries
            );

            const likeDocs = likesResponse.documents;
            if (likeDocs.length === 0) {
                if (!isLoadMore) setVideos([]);
                setHasMore(false);
                setLoading(false);
                setLoadingMore(false);
                return;
            }

            // Update cursor for next time
            setLastLikeId(likeDocs[likeDocs.length - 1].$id);
            setHasMore(likeDocs.length === ITEMS_PER_PAGE);

            // 2. Extract video IDs from this batch
            const videoIds = likeDocs.map(doc => doc.videoId);

            // 3. Fetch the actual video documents for this batch
            // (Appwrite's 'equal' query can handle array of IDs up to 100)
            const videosResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                [Query.equal('$id', videoIds), Query.limit(ITEMS_PER_PAGE)]
            );

            // 4. Re-sort to match the 'likes' order (newest like first)
            // because fetching by IDs might return them in a random order.
            const fetchedVideos = videosResponse.documents;
            const orderedBatch = videoIds
                .map(id => fetchedVideos.find(v => v.$id === id))
                .filter(Boolean); // Remove any nulls if a video was deleted

            // 5. Update state
            if (isLoadMore) {
                setVideos(prev => [...prev, ...orderedBatch]);
            } else {
                setVideos(orderedBatch);
            }

        } catch (error) {
            console.error("Failed to fetch liked videos:", error);
        }
        setLoading(false);
        setLoadingMore(false);
    };

    // Initial fetch
    useEffect(() => {
        fetchLikedVideos(false);
    }, [user]);

    // Infinite scroll trigger
    useEffect(() => {
        if (inView && hasMore && !loading && !loadingMore) {
            fetchLikedVideos(true);
        }
    }, [inView, hasMore, loading, loadingMore]);


    // --- RENDER FUNCTIONS ---
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full min-h-[50vh] bg-gray-50 text-center dark:bg-gray-900">
                <h1 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">Please Log In</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">You must be logged in to view your liked videos.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 h-full min-h-[50vh] bg-gray-50 dark:bg-gray-900">
                <p className="text-lg text-gray-600 dark:text-gray-400">Finding your favorite videos...</p>
            </div>
        );
    }

    if (videos.length === 0 && !loading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full min-h-[50vh] bg-gray-50 text-center dark:bg-gray-900">
                <HeartIcon />
                <h1 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">Liked Videos</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Videos you like will show up here. Go find your next favorite!
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 dark:text-gray-100">Liked Videos</h1>

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
                                <span>Loading more likes...</span>
                            </div>
                        ) : (
                            <div className="h-10 w-full" />
                        )}
                    </div>
                )}

                {!hasMore && videos.length > 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 mt-10 pb-10">
                        That's all the videos you've liked!
                    </p>
                )}
            </div>
        </div>
    );
};

export default LikedVideosPage;