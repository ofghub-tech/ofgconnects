// src/components/VideoRouter.js
import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';

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
                    // Request only the 'category' attribute for efficiency
                    ['category'] 
                );
                // Check for 'shorts' category
                if (response.category && response.category.toLowerCase() === 'shorts') {
                    setCategory('shorts');
                } else {
                    setCategory('general');
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
    
    // Redirect based on category
    if (category === 'shorts') {
        // Redirect to the new dedicated shorts watch page URL
        return <Navigate to={`/shorts/watch/${videoId}`} replace />;
    } else {
        // Render the standard WatchPage component directly
        return <Navigate to={`/videos/watch/${videoId}`} replace />;
    }
};

export default VideoRouter;