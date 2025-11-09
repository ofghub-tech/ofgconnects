// src/pages/MySpacePage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import { Link } from 'react-router-dom';
import UploadForm from '../components/UploadForm';
import Modal from '../components/Modal';
// --- 1. IMPORT OBSERVER ---
import { useInView } from 'react-intersection-observer';

const MySpacePage = () => {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // --- 2. PAGINATION STATE ---
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastId, setLastId] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 24; // Good number for grid layouts (divisible by 2, 3, 4)

    // --- 3. OBSERVER HOOK ---
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

            // If loading more, start AFTER the last video we have
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

            // Update pagination state
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

    // Initial fetch when user loads
    useEffect(() => {
        fetchUserVideos(false);
    }, [user]);

    // Infinite scroll trigger
    useEffect(() => {
        if (inView && hasMore && !loading && !loadingMore) {
            fetchUserVideos(true);
        }
    }, [inView, hasMore, loading, loadingMore]);

    // --- HANDLER FOR SUCCESSFUL UPLOAD ---
    const handleUploadComplete = () => {
        setShowUploadModal(false);
        // Reset pagination state to start fresh from the top
        setLastId(null);
        setHasMore(true);
        // Re-fetch the first page immediately to show the new video
        fetchUserVideos(false);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full dark:bg-gray-900">
            <div className="max-w-4xl mx-auto">
                
                {/* --- HEADER & UPLOAD BUTTON --- */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Space</h1>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors"
                    >
                        Upload Video
                    </button>
                </div>

                {/* --- UPLOAD MODAL --- */}
                {showUploadModal && (
                    <Modal onClose={() => setShowUploadModal(false)}>
                        <UploadForm onUploadSuccess={handleUploadComplete} />
                    </Modal>
                )}

                <h2 className="text-2xl font-semibold text-gray-800 mb-4 dark:text-gray-200">My Videos</h2>
                
                {/* --- LOADING STATE (INITIAL) --- */}
                {loading ? (
                    <div className="flex justify-center p-10">
                         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        {/* --- VIDEO GRID --- */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {videos.length === 0 ? (
                                <p className="text-gray-500 col-span-full dark:text-gray-400">
                                    You haven't uploaded any videos yet.
                                </p>
                            ) : (
                                videos.map((video) => (
                                    <Link to={`/watch/${video.$id}`} key={video.$id} className="video-card-link group">
                                        <div className="bg-white rounded-lg shadow overflow-hidden transition-transform duration-300 group-hover:scale-105 dark:bg-gray-800">
                                            <div className="w-full h-32 bg-gray-200 overflow-hidden dark:bg-gray-700">
                                                <img
                                                    src={video.thumbnailUrl}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                                                    {video.title}
                                                </h3>
                                                {/* You could add views/date here if you want */}
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        {/* --- INFINITE SCROLL TRIGGER AREA --- */}
                        {hasMore && videos.length > 0 && (
                            <div ref={ref} className="flex justify-center mt-10 py-4">
                                {loadingMore ? (
                                     <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                        <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                        <span>Loading more...</span>
                                    </div>
                                ) : (
                                    // Invisible trigger element
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