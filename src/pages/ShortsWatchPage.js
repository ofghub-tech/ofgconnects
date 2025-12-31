// src/pages/ShortsWatchPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases, DATABASE_ID, COLLECTION_ID_VIDEOS, COLLECTION_ID_HISTORY } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import { Query, ID, Permission, Role } from 'appwrite';
import ShortsVideoCard from '../components/ShortsVideoCard';

const ShortsWatchPage = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [videos, setVideos] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef(null);

    // --- 1. View Logging Logic ---
    const logVideoView = async (userId, videoId, currentViewCount) => {
        if (!userId || !videoId) return null;
        try {
            // Check history to prevent duplicate view counts
            const historyCheck = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_HISTORY,
                [Query.equal('userId', userId), Query.equal('videoId', videoId), Query.limit(1)]
            );

            if (historyCheck.total > 0) return null;

            await databases.createDocument(
                DATABASE_ID, COLLECTION_ID_HISTORY, ID.unique(),
                { userId: userId, videoId: videoId },
                [Permission.read(Role.user(userId)), Permission.write(Role.user(userId))]
            );

            const safeCurrentCount = currentViewCount || 0;
            const newViewCount = safeCurrentCount + 1;

            await databases.updateDocument(
                DATABASE_ID, COLLECTION_ID_VIDEOS, videoId,
                { view_count: newViewCount }
            );
            return newViewCount;
        } catch (e) {
            console.error('Shorts view log failed:', e);
            return null;
        }
    };

    // --- 2. Fetch Videos ---
    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            try {
                // Fetch the specific video requested
                const initialVideo = await databases.getDocument(DATABASE_ID, COLLECTION_ID_VIDEOS, videoId);
                
                // Fetch the feed of other shorts
                const response = await databases.listDocuments(
                    DATABASE_ID, COLLECTION_ID_VIDEOS,
                    [
                        Query.equal('category', 'shorts'),
                        Query.equal('adminStatus', 'approved'),
                        Query.notEqual('$id', videoId),
                        Query.orderDesc('$createdAt'),
                        Query.limit(10)
                    ]
                );
                
                setVideos([initialVideo, ...response.documents].filter(v => v));
                setCurrentIndex(0);
            } catch (error) {
                console.error("Failed to fetch shorts:", error);
                navigate('/shorts');
            }
            setLoading(false);
        };
        if (videoId) fetchVideos();
    }, [videoId, navigate]);

    // --- 3. Handle View Count Update ---
    useEffect(() => {
        const handleViewLog = async () => {
            if (videos.length > 0 && user && videos[currentIndex]) {
                const currentVideo = videos[currentIndex];
                const currentCount = currentVideo.view_count || currentVideo.views || 0;
                
                const newCount = await logVideoView(user.$id, currentVideo.$id, currentCount);
                
                if (newCount) {
                    setVideos(prev => {
                        const newVideos = [...prev];
                        newVideos[currentIndex] = { 
                            ...newVideos[currentIndex], 
                            view_count: newCount 
                        };
                        return newVideos;
                    });
                }
            }
        };
        handleViewLog();
    }, [currentIndex, user, videos.length]);

    // --- 4. User Interaction & Scroll Logic ---
    const handleUserInteraction = () => { 
        if (!hasUserInteracted) setHasUserInteracted(true); 
    };

    const handleWheel = (e) => {
        e.stopPropagation();
        handleUserInteraction();
        if (isScrolling) return;
        
        const scrollDelta = e.deltaY;
        if (scrollDelta > 5 && currentIndex < videos.length - 1) {
            setIsScrolling(true);
            setCurrentIndex(prev => prev + 1);
        } else if (scrollDelta < -5 && currentIndex > 0) {
            setIsScrolling(true);
            setCurrentIndex(prev => prev - 1);
        }
        
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 700);
    };

    const getCardStyle = (index) => {
        const relativeIndex = index - currentIndex;
        if (relativeIndex === 0) return { transform: 'translateY(0)', opacity: 1, zIndex: 10 };
        if (relativeIndex < 0) return { transform: 'translateY(-100%)', opacity: 0, zIndex: 0 };
        if (relativeIndex > 0) return { transform: 'translateY(100%)', opacity: 1, zIndex: 1 };
    };

    if (loading) return <div className="flex items-center justify-center h-full w-full bg-black text-white">Loading...</div>;

    return (
        <div 
            className="h-full w-full bg-black text-white relative flex justify-center items-center overflow-hidden" 
            onWheel={handleWheel}
            onClick={handleUserInteraction} // [FIX] Added click handler
        >
            <div className="h-full w-full relative">
                {videos.map((video, index) => (
                    <div key={video.$id} className="absolute h-full w-full bg-black transition-transform duration-700 ease-in-out" style={getCardStyle(index)}>
                        <ShortsVideoCard
                            video={video}
                            isActive={index === currentIndex}
                            hasUserInteracted={hasUserInteracted}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShortsWatchPage;