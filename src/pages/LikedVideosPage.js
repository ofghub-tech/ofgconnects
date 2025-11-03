// src/pages/LikedVideosPage.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import { DATABASE_ID, COLLECTION_ID_VIDEOS, COLLECTION_ID_LIKES } from '../appwriteConfig';
import { Query } from 'appwrite';
import { Link } from 'react-router-dom';

// --- Icon Component (Heart for Liked Videos) ---
const HeartIcon = (props) => (
    <svg {...props} className="h-16 w-16 text-red-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.44-1.32C4.59 14.28 1 10.15 1 5.5 1 2.44 3.44 0 6.5 0c1.86 0 3.63.85 4.75 2.21L12 3.75l.75-1.54C14.37.85 16.14 0 18.5 0 21.56 0 24 2.44 24 5.5c0 4.65-3.59 8.78-9.56 14.53L12 21.35z"/>
    </svg>
);

const LikedVideosPage = () => {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchLikedVideos();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchLikedVideos = async () => {
        setLoading(true);
        try {
            // 1. Fetch all 'like' documents created by the current user
            const likesResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_LIKES,
                [
                    Query.equal('userId', user.$id),
                    // Optional: Filter for only 'like' type, in case your collection stores 'dislike' too
                    // Query.equal('type', 'like'), 
                    Query.orderDesc('$createdAt')
                ]
            );

            const videoIds = likesResponse.documents.map(doc => doc.videoId);

            if (videoIds.length === 0) {
                setVideos([]);
                setLoading(false);
                return;
            }

            // 2. Fetch the full video documents based on the collected IDs
            const videosResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                [
                    Query.equal('$id', videoIds),
                    // Order by the time the like document was created (by the order of videoIds)
                    // Note: Appwrite only supports sorting by attributes in the videos collection.
                    // For now, we rely on the implicit order or the default.
                ]
            );

            // 3. Optional: Sort videos to match the order they were liked
            const fetchedVideos = videosResponse.documents;
            const sortedVideos = videoIds
                .map(id => fetchedVideos.find(v => v.$id === id))
                .filter(v => v);
            
            setVideos(sortedVideos);

        } catch (error) {
            console.error("Failed to fetch liked videos:", error);
        }
        setLoading(false);
    };

    // --- RENDER FUNCTIONS ---
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full min-h-[50vh] bg-gray-50 text-center">
                <h1 className="mt-4 text-2xl font-semibold text-gray-800">Please Log In</h1>
                <p className="mt-2 text-gray-600">You must be logged in to view your liked videos.</p>
            </div>
        );
    }
    
    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 h-full min-h-[50vh] bg-gray-50">
                <p className="text-lg text-gray-600">Finding your favorite videos...</p>
            </div>
        );
    }

    // Empty State
    if (videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full min-h-[50vh] bg-gray-50 text-center">
                <HeartIcon />
                <h1 className="mt-4 text-2xl font-semibold text-gray-800">
                    Liked Videos
                </h1>
                <p className="mt-2 text-gray-600">
                    Videos you like will show up here. Go find your next favorite!
                </p>
            </div>
        );
    }


    // Content Display State
    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Liked Videos ({videos.length})</h1>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {videos.map((video) => (
                        <Link to={`/watch/${video.$id}`} key={video.$id} className="group block">
                            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 group-hover:shadow-xl">
                                {/* Thumbnail */}
                                <div className="w-full aspect-video bg-gray-200 overflow-hidden">
                                    <img 
                                        src={video.thumbnailUrl} 
                                        alt={video.title} 
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                {/* Details */}
                                <div className="p-3">
                                    <h3 className="text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600">
                                        {video.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">{video.username}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LikedVideosPage;