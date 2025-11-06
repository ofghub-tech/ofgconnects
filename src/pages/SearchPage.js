// src/pages/SearchPage.js (CRASH-PROOF VERSION)
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import VideoCard from '../components/VideoCard';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const queryStr = searchParams.get('q');
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // NEW: Track errors

    useEffect(() => {
        const performSearch = async () => {
            if (!queryStr) {
                setVideos([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null); // Reset error before new search

            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS,
                    [
                        Query.or([
                            Query.search('title', queryStr),
                            Query.search('username', queryStr),
                            Query.search('tags', queryStr)
                        ])
                    ]
                );
                setVideos(response.documents);
            } catch (err) {
                console.error("Search failed:", err);
                // Save the error message to display it on screen
                setError(err.message || "An unexpected error occurred");
            }
            setLoading(false);
        };

        performSearch();
    }, [queryStr]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                    Search Results for: <span className="text-blue-600 dark:text-blue-400">"{queryStr}"</span>
                </h1>

                {/* --- NEW: Error Message Display --- */}
                {error && (
                    <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded-md">
                        <p className="font-bold">Search Error:</p>
                        <p>{error}</p>
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center items-center h-64">
                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {!loading && !error && videos.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {videos.map((video) => (
                            <VideoCard key={video.$id} video={video} />
                        ))}
                    </div>
                )}

                {!loading && !error && videos.length === 0 && queryStr && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        <p className="text-xl">No videos found for "{queryStr}"</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;