// src/pages/WatchLaterPage.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import { Link } from 'react-router-dom';

// We reuse the key from WatchPage.js
const WATCH_LATER_KEY = 'ofg_watch_later_list';

// --- Icon Component (Kept for empty state) ---
const BookmarkIcon = (props) => (
    // --- MODIFIED: Added dark mode class ---
    <svg {...props} className="h-16 w-16 text-gray-400 dark:text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
);

const WatchLaterPage = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savedIds, setSavedIds] = useState([]);

    useEffect(() => {
        // 1. Get the list of IDs from localStorage
        const storedIds = JSON.parse(localStorage.getItem(WATCH_LATER_KEY) || '[]');
        setSavedIds(storedIds);

        if (storedIds.length > 0) {
            fetchSavedVideos(storedIds);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchSavedVideos = async (ids) => {
        setLoading(true);
        try {
            // 2. Fetch all video documents using a single query
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                [
                    // Use Query.equal on the $id attribute to fetch multiple documents
                    Query.equal('$id', ids),
                    // Optionally order them by when they were added (if you track that), 
                    // otherwise, $createdAt is fine.
                    Query.orderDesc('$createdAt') 
                ]
            );

            // 3. Appwrite might return them out of order, so sort by our saved list order
            const fetchedVideos = response.documents;
            const sortedVideos = ids.map(id => fetchedVideos.find(v => v.$id === id)).filter(v => v);
            
            setVideos(sortedVideos);

        } catch (error) {
            console.error("Failed to fetch watch later videos:", error);
            // Even on error, stop loading and show the empty message (or an error message)
        }
        setLoading(false);
    };

    // --- RENDER FUNCTIONS ---

    // 1. Loading State
    if (loading) {
        return (
            // --- MODIFIED: Added dark mode classes ---
            <div className="flex items-center justify-center p-8 h-full min-h-[50vh] bg-gray-50 dark:bg-gray-900">
                <p className="text-lg text-gray-600 dark:text-gray-400">Loading your saved videos...</p>
            </div>
        );
    }

    // 2. Empty State (Uses the original content)
    if (videos.length === 0) {
        return (
            // --- MODIFIED: Added dark mode classes ---
            <div className="flex flex-col items-center justify-center p-8 h-full min-h-[50vh] bg-gray-50 text-center dark:bg-gray-900">
                <BookmarkIcon />
                <h1 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Watch Later
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Save videos to watch later and they'll show up here.
                </p>
                {savedIds.length > 0 && (
                     <p className="mt-4 text-red-500 text-sm">
                        Note: Some saved videos may have been deleted or moved.
                    </p>
                )}
            </div>
        );
    }


    // 3. Content Display State
    return (
        // --- MODIFIED: Added dark mode classes ---
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
                {/* --- MODIFIED: Added dark mode classes --- */}
                <h1 className="text-3xl font-bold text-gray-900 mb-6 dark:text-gray-100">Watch Later</h1>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {videos.map((video) => (
                        <Link to={`/watch/${video.$id}`} key={video.$id} className="group block">
                            {/* --- MODIFIED: Added dark mode classes --- */}
                            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 group-hover:shadow-xl dark:bg-gray-800">
                                {/* Thumbnail */}
                                {/* --- MODIFIED: Added dark mode classes --- */}
                                <div className="w-full aspect-video bg-gray-200 overflow-hidden dark:bg-gray-700">
                                    <img 
                                        src={video.thumbnailUrl} 
                                        alt={video.title} 
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                {/* Details */}
                                <div className="p-3">
                                    {/* --- MODIFIED: Added dark mode classes --- */}
                                    <h3 className="text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                                        {video.title}
                                    </h3>
                                    {/* --- MODIFIED: Added dark mode classes --- */}
                                    <p className="text-sm text-gray-600 mt-1 dark:text-gray-400">{video.username}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WatchLaterPage;