// src/pages/ShortsWatchPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import ShortsVideoCard from '../components/ShortsVideoCard'; // <-- IMPORT OUR CARD

const ShortsWatchPage = () => {
    const { videoId } = useParams(); // The video ID the user clicked on
    const navigate = useNavigate();
    
    const [videos, setVideos] = useState([]); // Holds the list of all shorts
    const [currentIndex, setCurrentIndex] = useState(0); // Which video is active
    const [loading, setLoading] = useState(true);
    
    // --- THIS IS THE FIX (PART 1) ---
    // We must track if the user has interacted to allow unmuted autoplay
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    // --- END FIX ---
    
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef(null);

    // Fetch ALL shorts, but put the one the user clicked on FIRST.
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
                setVideos([initialVideo, ...response.documents]);
                setCurrentIndex(0);
            } catch (error) {
                console.error("Failed to fetch shorts:", error);
                navigate('/shorts');
            }
            setLoading(false);
        };
        fetchVideos();
    }, [videoId, navigate]);

    // This "unlocks" unmuted autoplay after the first scroll
    const handleUserInteraction = () => {
        if (!hasUserInteracted) {
            setHasUserInteracted(true);
        }
    };

    // Handle the mouse wheel scroll for navigation
    const handleWheel = (e) => {
        // Stop the main layout from scrolling
        e.stopPropagation(); 
        
        // --- THIS IS THE FIX (PART 1) ---
        // Register the scroll as a user interaction
        handleUserInteraction();
        // --- END FIX ---
        
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

        // Debounce: Reset the scrolling lock after 700ms (matches animation)
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
        }, 700); // Animation duration
    };

    // --- (getCardStyle - No changes) ---
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
            <div className="flex items-center justify-center h-full w-full bg-black">
                <p className="text-xl text-neutral-500 dark:text-gray-400">Loading Shorts...</p>
            </div>
        );
    }
    
    return (
        <div 
            className="h-full w-full bg-black text-white relative flex justify-center items-center overflow-hidden"
            onWheel={handleWheel} // The scroll handler is on this container
        >
            {/* Wrapper for all video cards */}
            <div className="h-full w-full relative">
                {videos.map((video, index) => (
                    // Each card is in an animated wrapper
                    <div
                        key={video.$id}
                        className="absolute h-full w-full transition-all duration-700 ease-in-out"
                        style={getCardStyle(index)}
                    >
                        <ShortsVideoCard 
                            video={video}
                            isActive={index === currentIndex}
                            onClose={() => navigate('/shorts')}
                            // --- THIS IS THE FIX (PART 1) ---
                            // Pass the interaction state to the card
                            hasUserInteracted={hasUserInteracted}
                            // --- END FIX ---
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShortsWatchPage;