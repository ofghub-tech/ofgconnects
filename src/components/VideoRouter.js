// src/components/VideoRouter.js
import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';

const VideoRouter = () => {
    const { videoId } = useParams();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkCategory = async () => {
            try {
                const response = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS,
                    videoId,
                    [Query.select(['category'])]
                );
                
                // --- MODIFIED: Check for new categories ---
                if (response.category) {
                    setCategory(response.category.toLowerCase());
                } else {
                    setCategory('general'); // Default
                }

            } catch (error) {
                console.error("Failed to fetch video category for routing:", error);
                setCategory('general'); // Default to general watch page on error
            }
            setLoading(false);
        };
        checkCategory();
    }, [videoId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-white">
                <p className="text-xl text-gray-700">Checking video type...</p>
            </div>
        );
    }
    
    // --- MODIFIED: Add new routing logic ---
    switch (category) {
        case 'shorts':
            return <Navigate to={`/shorts/watch/${videoId}`} replace />;
        case 'songs':
            return <Navigate to={`/songs/watch/${videoId}`} replace />;
        case 'kids':
            return <Navigate to={`/kids/watch/${videoId}`} replace />;
        case 'general':
        default:
            // All other videos (including 'general') go to the main watch page
            return <Navigate to={`/videos/watch/${videoId}`} replace />;
    }
    // --- END MODIFICATION ---
};

export default VideoRouter;