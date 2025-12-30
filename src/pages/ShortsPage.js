// src/pages/ShortsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import { useInView } from 'react-intersection-observer';

const ShortsPage = () => {
    const navigate = useNavigate();
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastId, setLastId] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 18;

    const { ref, inView } = useInView({ threshold: 0.5 });

    const fetchShorts = async (isLoadMore = false) => {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            let queries = [
                Query.equal('category', 'shorts'),
                Query.equal('adminStatus', 'approved'),
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

    useEffect(() => { fetchShorts(false); }, []);

    useEffect(() => {
        if (inView && hasMore && !loading && !loadingMore) fetchShorts(true);
    }, [inView, hasMore, loading, loadingMore]);

    const handleMouseOver = (e) => { 
        const video = e.target;
        if (video.paused) video.play().catch(() => {}); 
    };
    
    const handleMouseOut = (e) => { 
        const video = e.target;
        if (!video.paused) {
            video.pause();
            video.currentTime = 0; 
        }
    };

    return (
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
                            // MAPPING: Use video_url
                            const thumb = short.thumbnailUrl || short.thumbnail_url;
                            const src = short.video_url || short.videoUrl;
                            const hasThumbnail = !!thumb;

                            return (
                                <div
                                    key={short.$id}
                                    className="glass-panel relative aspect-[9/16] overflow-hidden p-0 cursor-pointer group transition-all duration-300 ease-in-out hover:scale-105"
                                    onClick={() => navigate(`/watch/${short.$id}`)}
                                >
                                    {src ? (
                                        <video
                                            src={src}
                                            poster={hasThumbnail ? thumb : undefined}
                                            className="w-full h-full object-cover rounded-xl"
                                            loop 
                                            muted 
                                            playsInline
                                            preload={hasThumbnail ? "none" : "metadata"}
                                            onMouseOver={handleMouseOver}
                                            onMouseOut={handleMouseOut}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                            <span className="text-xs text-white">No URL</span>
                                        </div>
                                    )}
                                    
                                    <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
                                        <span className="text-white text-sm font-medium truncate block">
                                            {short.username}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default ShortsPage;