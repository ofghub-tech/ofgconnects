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

    const logVideoView = async (userId, videoId, currentViewCount) => {
        if (!userId || !videoId) return null;
        try {
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

            const newViewCount = (currentViewCount || 0) + 1;
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

    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            try {
                // Fetch the specific video user clicked on
                const initialVideo = await databases.getDocument(DATABASE_ID, COLLECTION_ID_VIDEOS, videoId);
                
                // Fetch other shorts for the feed
                const response = await databases.listDocuments(
                    DATABASE_ID, COLLECTION_ID_VIDEOS,
                    [
                        Query.equal('category', 'shorts'),
                        Query.equal('admin_status', 'approved'), // Filter for approved shorts
                        Query.notEqual('$id', videoId),
                        Query.orderDesc('$createdAt')
                    ]
                );
                
                // Combine them
                setVideos([initialVideo, ...response.documents].filter(v => v));
                setCurrentIndex(0);
            } catch (error) {
                console.error("Failed to fetch shorts:", error);
                navigate('/shorts');
            }
            setLoading(false);
        };
        fetchVideos();
    }, [videoId, navigate]);

    useEffect(() => {
        const handleViewLog = async () => {
            if (videos.length > 0 && user && videos[currentIndex]) {
                const currentVideo = videos[currentIndex];
                const newCount = await logVideoView(user.$id, currentVideo.$id, currentVideo.view_count);
                
                if (newCount) {
                    setVideos(prevVideos => {
                        const newVideos = [...prevVideos];
                        newVideos[currentIndex] = { ...newVideos[currentIndex], view_count: newCount };
                        return newVideos;
                    });
                }
            }
        };
        handleViewLog();
    }, [currentIndex, user, videos.length]);

    const handleUserInteraction = () => { if (!hasUserInteracted) setHasUserInteracted(true); };

    const handleWheel = (e) => {
        e.stopPropagation();
        handleUserInteraction();
        if (isScrolling) return;
        const scrollDelta = e.deltaY;
        if (scrollDelta > 5) {
            if (currentIndex < videos.length - 1) {
                setIsScrolling(true);
                setCurrentIndex(prev => prev + 1);
            }
        } else if (scrollDelta < -5) {
            if (currentIndex > 0) {
                setIsScrolling(true);
                setCurrentIndex(prev => prev + 1);
            }
        }
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 700);
    };

    const getCardStyle = (index) => {
        const relativeIndex = index - currentIndex;
        if (relativeIndex < 0) return { transform: 'translateX(-100%) scale(0.8)', opacity: 0, zIndex: 10 - Math.abs(relativeIndex) };
        if (relativeIndex === 0) return { transform: 'translateX(0) scale(1)', opacity: 1, zIndex: 10 };
        if (relativeIndex === 1) return { transform: 'translateX(0) scale(0.9)', opacity: 0.7, zIndex: 9 };
        return { transform: `translateX(0) scale(${0.9 - (relativeIndex * 0.1)})`, opacity: 0.4, zIndex: 8 - relativeIndex };
    };

    if (loading) return <div className="flex items-center justify-center h-full w-full"><p className="text-xl text-neutral-400">Loading Shorts...</p></div>;

    return (
        <div className="h-full w-full text-white relative flex justify-center items-center overflow-hidden" onWheel={handleWheel}>
            <div className="h-full w-full relative">
                {videos.map((video, index) => {
                    if (!video || !video.$id) return null;
                    return (
                        <div key={video.$id} className="absolute h-full w-full transition-all duration-700 ease-in-out" style={getCardStyle(index)}>
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