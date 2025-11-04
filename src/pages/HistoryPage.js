// src/pages/HistoryPage.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext'; // <-- NEW IMPORT
import { DATABASE_ID, COLLECTION_ID_VIDEOS, COLLECTION_ID_HISTORY } from '../appwriteConfig';
import { Query } from 'appwrite';
import { Link } from 'react-router-dom';

// --- Icon Component (History) ---
const HistoryIcon = (props) => (
    // --- MODIFIED: Added dark mode class ---
    <svg {...props} className="h-16 w-16 text-gray-400 dark:text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v10l5 5"></path>
        <circle cx="12" cy="12" r="10"></circle>
    </svg>
);

const HistoryPage = () => {
    const { user } = useAuth(); // <-- Get user for query
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchWatchHistory();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchWatchHistory = async () => {
        setLoading(true);
        try {
            // 1. Fetch all history logs for the current user, ordered by most recent view
            const historyResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_HISTORY,
                [
                    Query.equal('userId', user.$id),
                    Query.orderDesc('$createdAt'),
                    Query.limit(50) // Limit to 50 recent views
                ]
            );

            // 2. Extract unique video IDs in the order they were watched (most recent first)
            const uniqueVideoIds = [];
            historyResponse.documents.forEach(doc => {
                if (!uniqueVideoIds.includes(doc.videoId)) {
                    uniqueVideoIds.push(doc.videoId);
                }
            });

            if (uniqueVideoIds.length === 0) {
                setVideos([]);
                setLoading(false);
                return;
            }

            // 3. Fetch the full video documents based on the collected unique IDs
            const videosResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                [
                    Query.equal('$id', uniqueVideoIds)
                ]
            );

            // 4. Sort the fetched videos to match the history order
            const fetchedVideos = videosResponse.documents;
            const sortedVideos = uniqueVideoIds
                .map(id => fetchedVideos.find(v => v.$id === id))
                .filter(v => v);
            
            setVideos(sortedVideos);

        } catch (error) {
            console.error("Failed to fetch watch history:", error);
        }
        setLoading(false);
    };

    // --- RENDER FUNCTIONS ---
    if (!user) {
        return (
            // --- MODIFIED: Added dark mode classes ---
            <div className="flex flex-col items-center justify-center p-8 h-full min-h-[50vh] bg-gray-50 text-center dark:bg-gray-900">
                <h1 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">Please Log In</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">You must be logged in to view your watch history.</p>
            </div>
        );
    }
    
    if (loading) {
        return (
            // --- MODIFIED: Added dark mode classes ---
            <div className="flex items-center justify-center p-8 h-full min-h-[50vh] bg-gray-50 dark:bg-gray-900">
                <p className="text-lg text-gray-600 dark:text-gray-400">Finding your watch history...</p>
            </div>
        );
    }

    // Empty State
    if (videos.length === 0) {
        return (
            // --- MODIFIED: Added dark mode classes ---
            <div className="flex flex-col items-center justify-center p-8 h-full min-h-[50vh] bg-gray-50 text-center dark:bg-gray-900">
                <HistoryIcon />
                <h1 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">
                    Watch History
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Videos you watch will show up here.
                </p>
            </div>
        );
    }

    // Content Display State
    return (
        // --- MODIFIED: Added dark mode classes ---
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full dark:bg-gray-900">
            <div className="max-w-7xl mx-auto">
                {/* --- MODIFIED: Added dark mode classes --- */}
                <h1 className="text-3xl font-bold text-gray-900 mb-6 dark:text-gray-100">Watch History ({videos.length})</h1>
                
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

export default HistoryPage;