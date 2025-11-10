// src/pages/LikedVideosPage.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import { DATABASE_ID, COLLECTION_ID_VIDEOS, COLLECTION_ID_LIKES } from '../appwriteConfig';
import { Query } from 'appwrite';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';

// --- Icon Component ---
const HeartIcon = (props) => (
    <svg {...props} className="h-16 w-16 text-red-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.44-1.32C4.59 14.28 1 10.15 1 5.5 1 2.44 3.44 0 6.5 0c1.86 0 3.63.85 4.75 2.21L12 3.75l.75-1.54C14.37.85 16.14 0 18.5 0 21.56 0 24 2.44 24 5.5c0 4.65-3.59 8.78-9.56 14.53L12 21.35z" />
    </svg>
);

const LikedVideosPage = () => {
    // --- (LOGIC UNCHANGED) ---
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [loadingMore, setLoadingMore] = useState(false);
    const [lastLikeId, setLastLikeId] = useState(null); // Cursor for LIKES collection
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 50; 

    const { ref, inView } = useInView({ threshold: 0.1 });

    const fetchLikedVideos = async (isLoadMore = false) => {
        if (!user) return;

        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            let queries = [
                Query.equal('userId', user.$id),
                Query.orderDesc('$createdAt'),
                Query.limit(ITEMS_PER_PAGE)
            ];

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

            setLastLikeId(likeDocs[likeDocs.length - 1].$id);
            setHasMore(likeDocs.length === ITEMS_PER_PAGE);

            const videoIds = likeDocs.map(doc => doc.videoId);

            const videosResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                [Query.equal('$id', videoIds), Query.limit(ITEMS_PER_PAGE)]
            );

            const fetchedVideos = videosResponse.documents;
            const orderedBatch = videoIds
                .map(id => fetchedVideos.find(v => v.$id === id))
                .filter(Boolean); 

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

    useEffect(() => {
        fetchLikedVideos(false);
    }, [user]);

    useEffect(() => {
        if (inView && hasMore && !loading && !loadingMore) {
            fetchLikedVideos(true);
        }
    }, [inView, hasMore, loading, loadingMore]);
    // --- (END LOGIC) ---


    // --- (FIX) Removed solid backgrounds and applied .glass-panel ---
    if (!user) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="glass-panel flex flex-col items-center justify-center p-8 min-h-[50vh] text-center">
                    <h1 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">Please Log In</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-200">You must be logged in to view your liked videos.</p>
                </div>
            </div>
        );
    }

    // --- (FIX) Removed solid backgrounds and applied .glass-panel ---
    if (loading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="glass-panel flex items-center justify-center p-8 min-h-[50vh]">
                    <p className="text-lg text-gray-600 dark:text-gray-200">Finding your favorite videos...</p>
                </div>
            </div>
        );
    }

    // --- (FIX) Removed solid backgrounds and applied .glass-panel ---
    if (videos.length === 0 && !loading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="glass-panel flex flex-col items-center justify-center p-8 min-h-[50vh] text-center">
                    <HeartIcon />
                    <h1 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">Liked Videos</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-200">
                        Videos you like will show up here. Go find your next favorite!
                    </p>
                </div>
            </div>
        );
    }

    return (
        // --- (FIX) Removed solid backgrounds ---
        <div className="p-4 sm:p-6 lg:p-8 min-h-full">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 dark:text-gray-100">Liked Videos</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {videos.map((video) => (
                        <Link to={`/watch/${video.$id}`} key={video.$id} className="group block">
                            {/* --- (FIX) Applied .glass-panel class --- */}
                            <div className="glass-panel p-0 overflow-hidden transition-all duration-200 group-hover:scale-[1.02]">
                                {/* Thumbnail */}
                                <div className="w-full aspect-video overflow-hidden">
                                    <img
                                        src={video.thumbnailUrl}
                                        alt={video.title}
                                        // --- (FIX) Rounded top corners ---
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-t-xl"
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