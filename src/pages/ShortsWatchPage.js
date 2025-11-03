// src/pages/ShortsWatchPage.js
import React, { useState, useEffect, useRef } from 'react'; // <-- Import useRef
import { useParams, useNavigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';

const ShortsWatchPage = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const videoRef = useRef(null); // <-- Add a ref for the video element

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

    // --- NEW: useEffect for handling video playback ---
    useEffect(() => {
        // This effect runs when the 'video' state is finally set
        if (video && videoRef.current) {
            
            // We programmatically try to play the video.
            const playPromise = videoRef.current.play();

            if (playPromise !== undefined) {
                // .play() returns a promise, which we must handle
                playPromise.catch(error => {
                    // This catch block handles the exact "interrupted" error
                    // by simply ignoring it, as it's a benign error
                    // caused by fast navigation or the component unmounting.
                    if (error.name === 'AbortError') {
                        console.log('Video play was aborted (this is normal).');
                    } else {
                        console.error('Error attempting to play video:', error);
                    }
                });
            }
        }

        // --- Cleanup Function ---
        // This runs when the component unmounts
        return () => {
            if (videoRef.current) {
                videoRef.current.pause(); // <-- Explicitly pause the video
            }
        };
    }, [video]); // <-- This effect depends on the 'video' state
    // --- END of new effect ---


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
                
                <div className="h-[90vh] max-h-[800px] flex justify-center items-center w-full">
                    <video 
                        ref={videoRef} // <-- Attach the ref here
                        controls 
                        // autoPlay // <-- REMOVE the autoPlay attribute
                        loop
                        muted // <-- KEEP muted, it's essential for autoplay policies
                        src={video.videoUrl} 
                        className="h-full w-auto aspect-[9/16] bg-black rounded-xl"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
                
                <div className="p-3 text-center">
                    <h2 className="text-xl font-bold">{video.title}</h2>
                    <p className="text-sm text-neutral-400">@{video.username}</p>
                </div>
            </div>
        </div>
    );
};

export default ShortsWatchPage;