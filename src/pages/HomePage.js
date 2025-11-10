// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import VideoCard from '../components/VideoCard';
import { useInView } from 'react-intersection-observer';

const HomePage = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- PAGINATION STATE ---
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastId, setLastId] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 12;

    const { ref, inView } = useInView({
        threshold: 0.5,
    });

    const fetchVideos = async (isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            let queries = [
                Query.orderDesc('$createdAt'),
                Query.limit(ITEMS_PER_PAGE)
            ];

            if (isLoadMore && lastId) {
                queries.push(Query.cursorAfter(lastId));
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                queries
            );

            if (isLoadMore) {
                setVideos(prev => [...prev, ...response.documents]);
            } else {
                setVideos(response.documents);
            }

            setHasMore(response.documents.length === ITEMS_PER_PAGE);

            if (response.documents.length > 0) {
                setLastId(response.documents[response.documents.length - 1].$id);
            }

        } catch (error) {
            console.error("Error fetching videos:", error);
        }

        setLoading(false);
        setLoadingMore(false);
    };

    // Initial fetch
    useEffect(() => {
        fetchVideos(false);
    }, []);

    // --- 3. INFINITE SCROLL TRIGGER ---
    useEffect(() => {
        if (inView && hasMore && !loading && !loadingMore) {
            fetchVideos(true);
        }
    }, [inView, hasMore, loading, loadingMore]);

    return (
        // --- MODIFIED: Removed bg-gray-100 dark:bg-gray-900 ---
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen transition-colors duration-200">
            <div className="max-w-7xl mx-auto">

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Discover
                    </h1>
                </div>

                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {!loading && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {videos.map((video) => (
                                <VideoCard key={video.$id} video={video} />
                            ))}
                        </div>

                        {videos.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
                                No videos found. Be the first to upload!
                            </p>
                        )}

                        {/* --- 4. INVISIBLE TRIGGER ELEMENT --- */}
                        {hasMore && videos.length > 0 && (
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
                                You've reached the end of the feed.
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default HomePage;