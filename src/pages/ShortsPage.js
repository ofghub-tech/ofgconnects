// src/pages/ShortsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import { useInView } from 'react-intersection-observer';

const ShortsPage = () => {
    // --- (LOGIC UNCHANGED) ---
    const navigate = useNavigate();
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [loadingMore, setLoadingMore] = useState(false);
    const [lastId, setLastId] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 18;

    const { ref, inView } = useInView({
        threshold: 0.5,
    });

    const fetchShorts = async (isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            let queries = [
                Query.equal('category', 'shorts'),
                Query.orderDesc('$createdAt'),
                Query.limit(ITEMS_PER_PAGE)
            ];

            if (isLoadMore && lastId) {
                queries.push(Query.cursorAfter(lastId));
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                queries
            );

            if (isLoadMore) {
                setShorts(prev => [...prev, ...response.documents]);
            } else {
                setShorts(response.documents);
            }

            setHasMore(response.documents.length === ITEMS_PER_PAGE);
            if (response.documents.length > 0) {
                setLastId(response.documents[response.documents.length - 1].$id);
            }

        } catch (error) {
            console.error('Failed to fetch shorts:', error);
        }
        setLoading(false);
        setLoadingMore(false);
    };

    useEffect(() => {
        fetchShorts(false);
    }, []);

    useEffect(() => {
        if (inView && hasMore && !loading && !loadingMore) {
            fetchShorts(true);
        }
    }, [inView, hasMore, loading, loadingMore]);

    const handleMouseOver = (e) => { 
        const video = e.target;
        if (video.paused) {
             video.play().catch(() => {}); 
        }
    };
    
    const handleMouseOut = (e) => { 
        const video = e.target;
        if (!video.paused) {
            video.pause();
            video.currentTime = 0; 
        }
    };
    // --- (END LOGIC) ---

    return (
        // --- (FIX 1) Removed solid bg-gray-50 dark:bg-gray-900 ---
        <div className="p-4 sm:p-6 lg:p-8 min-h-full">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 dark:text-gray-100">Shorts</h1>

            {loading && (
                 <div className="flex justify-center items-center h-64">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                 </div>
            )}

            {!loading && (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {shorts.map(short => {
                            const hasThumbnail = !!short.thumbnailUrl;

                            return (
                                // --- (FIX 2) Applied .glass-panel, removed solids/shadows ---
                                <div
                                    key={short.$id}
                                    className="glass-panel relative aspect-[9/16] overflow-hidden p-0 cursor-pointer group transition-all duration-300 ease-in-out hover:scale-105"
                                    onClick={() => navigate(`/watch/${short.$id}`)}
                                >
                                    <video
                                        src={short.videoUrl}
                                        poster={hasThumbnail ? short.thumbnailUrl : undefined}
                                        // --- (FIX 3) Rounded video to match panel ---
                                        className="w-full h-full object-cover rounded-xl"
                                        loop 
                                        muted 
                                        playsInline
                                        preload={hasThumbnail ? "none" : "metadata"}
                                        onMouseOver={handleMouseOver}
                                        onMouseOut={handleMouseOut}
                                    />
                                    
                                    <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
                                        <span className="text-white text-sm font-medium truncate block">
                                            {short.username}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {shorts.length === 0 && (
                        <p className="text-gray-600 dark:text-gray-400 text-center mt-10">
                            No shorts have been uploaded yet.
                        </p>
                    )}

                    {hasMore && shorts.length > 0 && (
                        <div ref={ref} className="flex justify-center mt-10 py-4">
                            {loadingMore ? (
                                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                    <span>Loading more shorts...</span>
                                </div>
                            ) : <div className="h-10 w-full" />}
                        </div>
                    )}

                    {!hasMore && shorts.length > 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 mt-10 pb-10">
                            You've reached the end of the shorts.
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

export default ShortsPage;