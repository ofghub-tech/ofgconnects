// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import VideoCard from '../components/VideoCard';

const HomePage = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- PAGINATION STATE ---
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastId, setLastId] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 10; // Change this to 2 or 3 to test it easily if you have few videos!

    const fetchVideos = async (isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            // Base queries: Newest first, limit to ITEMS_PER_PAGE
            let queries = [
                Query.orderDesc('$createdAt'),
                Query.limit(ITEMS_PER_PAGE)
            ];

            // If we are loading more, start AFTER the last video we currently have
            if (isLoadMore && lastId) {
                queries.push(Query.cursorAfter(lastId));
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                queries
            );

            if (isLoadMore) {
                // Append new videos to the existing list
                setVideos(prev => [...prev, ...response.documents]);
            } else {
                // First load: just set the list
                setVideos(response.documents);
            }

            // If we got fewer items than we asked for, we've reached the end
            setHasMore(response.documents.length === ITEMS_PER_PAGE);

            // Save the ID of the last item for the next fetch
            if (response.documents.length > 0) {
                setLastId(response.documents[response.documents.length - 1].$id);
            }

        } catch (error) {
            console.error("Error fetching videos:", error);
        }

        setLoading(false);
        setLoadingMore(false);
    };

    // Initial fetch on component mount
    useEffect(() => {
        fetchVideos(false);
    }, []);

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen dark:bg-gray-900 transition-colors duration-200">
            <div className="max-w-7xl mx-auto">

                {/* --- Feed Header --- */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Discover
                    </h1>
                </div>

                {/* --- Loading State (Initial) --- */}
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* --- Video Grid --- */}
                {!loading && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {videos.map((video) => (
                                <VideoCard key={video.$id} video={video} />
                            ))}
                        </div>

                        {/* --- Empty State --- */}
                        {videos.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
                                No videos found. Be the first to upload!
                            </p>
                        )}

                        {/* --- Load More Button --- */}
                        {hasMore && videos.length > 0 && (
                            <div className="flex justify-center mt-10">
                                <button
                                    onClick={() => fetchVideos(true)}
                                    disabled={loadingMore}
                                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
                                >
                                    {loadingMore ? (
                                        <span className="flex items-center gap-2">
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                            Loading...
                                        </span>
                                    ) : (
                                        "Load More Videos"
                                    )}
                                </button>
                            </div>
                        )}

                         {/* --- End of Results Message --- */}
                        {!hasMore && videos.length > 0 && (
                             <p className="text-center text-gray-500 dark:text-gray-400 mt-10">
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