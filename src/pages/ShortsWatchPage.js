// src/pages/ShortsWatchPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';

const ShortsWatchPage = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getVideo = async () => {
            setLoading(true);
            try {
                const response = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS,
                    videoId
                );
                setVideo(response);
            } catch (error) {
                console.error('Failed to fetch video:', error);
                navigate('/home'); 
            }
            setLoading(false);
        };
        getVideo();
    }, [videoId, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-xl text-neutral-500">Loading Short...</p>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-xl text-red-600">Short not found.</p>
            </div>
        );
    }
    
    return (
        <div className="flex items-center justify-center h-screen w-full bg-neutral-900 text-white">
            <button 
                onClick={() => navigate('/shorts')} 
                className="absolute top-4 left-4 text-white text-xl p-2 rounded-full hover:bg-neutral-800 z-10"
            >
                &larr; Close
            </button>
            
            <div className="flex flex-col items-center gap-3 w-full">
                
                {/* Outer container limits the height */}
                <div className="h-[90vh] max-h-[800px] flex justify-center items-center w-full">
                    {/* Video Element: Uses h-full to fit parent, and aspect-[9/16] to lock the ratio */}
                    <video 
                        controls 
                        autoPlay 
                        loop
                        muted
                        src={video.videoUrl} 
                        // FIXED RATIO: Using aspect-[9/16] and ensuring it scales vertically
                        className="h-full w-auto aspect-[9/16] bg-black rounded-xl"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
                
                {/* Minimal Title and Creator Info */}
                <div className="p-3 text-center">
                    <h2 className="text-xl font-bold">{video.title}</h2>
                    <p className="text-sm text-neutral-400">@{video.username}</p>
                </div>
            </div>
        </div>
    );
};

export default ShortsWatchPage;