// src/pages/ShortsWatchPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import ShortsVideoCard from '../components/ShortsVideoCard';

const ShortsWatchPage = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();
    
    const [videos, setVideos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef(null);

    // Fetch ALL shorts (No change)
    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            try {
                const initialVideo = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS,
                    videoId
                );
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS,
                    [
                        Query.equal('category', 'shorts'),
                        Query.notEqual('$id', videoId),
                        Query.orderDesc('$createdAt')
                    ]
                );
                
                const allVideos = [initialVideo, ...response.documents];
                const validVideos = allVideos.filter(video => video); 

                setVideos(validVideos);
                setCurrentIndex(0);

            } catch (error) {
                console.error("Failed to fetch shorts:", error);
                navigate('/shorts');
            }
            setLoading(false);
        };
        fetchVideos();
    }, [videoId, navigate]);

    // handleUserInteraction (No change)
    const handleUserInteraction = () => {
        if (!hasUserInteracted) {
            setHasUserInteracted(true);
        }
    };

    // Handle Wheel (No change)
    const handleWheel = (e) => {
        e.stopPropagation(); 
        handleUserInteraction();
        
        if (isScrolling) return;

        const scrollDelta = e.deltaY;

        if (scrollDelta > 5) {
            // --- SCROLLING DOWN (Next Video) ---
            if (currentIndex < videos.length - 1) {
                setIsScrolling(true);
                setCurrentIndex(prev => prev + 1);
            }
        } else if (scrollDelta < -5) {
            // --- SCROLLING UP (Previous Video) ---
            if (currentIndex > 0) {
                setIsScrolling(true);
                setCurrentIndex(prev => prev - 1); 
            }
        }

        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
        }, 700);
    };

    // (getCardStyle - No changes)
    const getCardStyle = (index) => {
        const relativeIndex = index - currentIndex;
        
        if (relativeIndex < 0) {
            return {
                transform: 'translateX(-100%) scale(0.8)',
                opacity: 0,
                zIndex: 10 - Math.abs(relativeIndex)
            };
        }
        if (relativeIndex === 0) {
            return {
                transform: 'translateX(0) scale(1)',
                opacity: 1,
                zIndex: 10
            };
        }
        if (relativeIndex === 1) {
            return {
                transform: 'translateX(0) scale(0.9)',
                opacity: 0.7,
                zIndex: 9
            };
        }
        return {
            transform: `translateX(0) scale(${0.9 - (relativeIndex * 0.1)})`,
            opacity: 0.4,
            zIndex: 8 - relativeIndex
        };
    };

    if (loading) {
        return (
            // --- (FIX) Updated loading screen for dark/light theme ---
            <div className="flex items-center justify-center h-full w-full bg-white dark:bg-black">
                <p className="text-xl text-neutral-600 dark:text-gray-400">Loading Shorts...</p>
            </div>
            // --- (END FIX) ---
        );
    }
    
    // (Render - No change)
    // This container remains 'bg-black' for the theater experience
    return (
        <div 
            className="h-full w-full bg-black text-white relative flex justify-center items-center overflow-hidden"
            onWheel={handleWheel}
        >
            <div className="h-full w-full relative">
                {videos.map((video, index) => {
                    if (!video || !video.$id) {
                        console.warn(`ShortsWatchPage: Skipping render for invalid video at index ${index}.`);
                        return null; 
                    }
                    
                    return (
                        <div
                            key={video.$id} 
                            className="absolute h-full w-full transition-all duration-700 ease-in-out"
                            style={getCardStyle(index)}
                        >
                            <ShortsVideoCard 
                                video={video}
                                isActive={index === currentIndex}
                                onClose={() => navigate('/shorts')}
                                hasUserInteracted={hasUserInteracted}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ShortsWatchPage;