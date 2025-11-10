// src/pages/MySpacePage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import { Link } from 'react-router-dom';
import UploadForm from '../components/UploadForm';
import Modal from '../components/Modal';
import { useInView } from 'react-intersection-observer';

const MySpacePage = () => {
    // --- (LOGIC UNCHANGED) ---
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);

    const [loadingMore, setLoadingMore] = useState(false);
    const [lastId, setLastId] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 24; 

    const { ref, inView } = useInView({ threshold: 0.1 });

    const fetchUserVideos = async (isLoadMore = false) => {
        if (!user) return;

        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            let queries = [
                Query.equal('userId', user.$id),
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
                setVideos(prev => [...prev, ...response.documents]);
            } else {
                setVideos(response.documents);
            }

            setHasMore(response.documents.length === ITEMS_PER_PAGE);
            if (response.documents.length > 0) {
                setLastId(response.documents[response.documents.length - 1].$id);
            }

        } catch (error) {
            console.error('Failed to fetch user videos:', error);
        }
        setLoading(false);
        setLoadingMore(false);
    };

    useEffect(() => {
        fetchUserVideos(false);
    }, [user]);

    useEffect(() => {
        if (inView && hasMore && !loading && !loadingMore) {
            fetchUserVideos(true);
        }
    }, [inView, hasMore, loading, loadingMore]);

    const handleUploadComplete = () => {
        setShowUploadModal(false);
        setLastId(null);
        setHasMore(true);
        fetchUserVideos(false);
    };
    // --- (END LOGIC) ---

    return (
        // --- (FIX 1) Removed solid bg-gray-50 dark:bg-gray-900 ---
        <div className="p-4 sm:p-6 lg:p-8 min-h-full">
            <div className="max-w-4xl mx-auto">
                
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Space</h1>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors"
                    >
                        Upload Video
                    </button>
                </div>

                {/* Modal is already a glass panel from our earlier change */}
                {showUploadModal && (
                    <Modal onClose={() => setShowUploadModal(false)}>
                        <UploadForm onUploadSuccess={handleUploadComplete} />
                    </Modal>
                )}

                <h2 className="text-2xl font-semibold text-gray-800 mb-4 dark:text-gray-200">My Videos</h2>
                
                {loading ? (
                    <div className="flex justify-center p-10">
                         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {videos.length === 0 ? (
                                // --- (FIX 2) Made this a glass panel ---
                                <div className="glass-panel text-gray-500 col-span-full dark:text-gray-400 text-center p-10">
                                    You haven't uploaded any videos yet.
                                </div>
                            ) : (
                                videos.map((video) => (
                                    <Link to={`/watch/${video.$id}`} key={video.$id} className="video-card-link group">
                                        {/* --- (FIX 3) Replaced solid card with .glass-panel --- */}
                                        <div className="glass-panel p-0 overflow-hidden transition-transform duration-300 group-hover:scale-105">
                                            {/* --- (FIX 4) Removed solid bg from wrapper --- */}
                                            <div className="w-full h-32 overflow-hidden">
                                                <img
                                                    src={video.thumbnailUrl}
                                                    alt={video.title}
                                                    // --- (FIX 5) Rounded top corners ---
                                                    className="w-full h-full object-cover rounded-t-xl"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                                                    {video.title}
                                                </h3>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        {hasMore && videos.length > 0 && (
                            <div ref={ref} className="flex justify-center mt-10 py-4">
                                {loadingMore ? (
                                     <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                         <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                         <span>Loading more...</span>
                                     </div>
                                ) : (
                                    <div className="h-10 w-full" />
                                )}
                            </div>
                        )}
                        
                        {!hasMore && videos.length > 0 && (
                             <p className="text-center text-gray-500 dark:text-gray-400 mt-10 pb-10">
                                 End of your videos.
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MySpacePage;