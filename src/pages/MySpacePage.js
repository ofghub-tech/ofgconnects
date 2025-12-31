import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { databases, DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import { Link, useLocation } from 'react-router-dom'; 
import UploadForm from '../components/UploadForm';
import Modal from '../components/Modal';
import { useInView } from 'react-intersection-observer';
import VideoCard from '../components/VideoCard'; 
import Avatar from '../components/Avatar';

const MySpacePage = () => {
    const { user } = useAuth();
    const location = useLocation(); 
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    
    // TABS STATE
    const [activeTab, setActiveTab] = useState('videos'); 

    // PAGINATION
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastId, setLastId] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 24; 

    const { ref, inView } = useInView({ threshold: 0.1 });

    // Handle Direct Upload Link (e.g. from Header)
    useEffect(() => {
        if (location.state?.openUpload) {
            setShowUploadModal(true);
            // Clear state so it doesn't get stuck open on refresh
            window.history.replaceState({}, document.title)
        }
    }, [location]);

    const fetchUserContent = async (isLoadMore = false) => {
        if (!user) return;

        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            let queries = [
                Query.equal('userId', user.$id),
                Query.orderDesc('$createdAt'),
                Query.limit(ITEMS_PER_PAGE)
            ];

            if (activeTab === 'shorts') {
                queries.push(Query.equal('category', 'shorts'));
            } else if (activeTab === 'songs') {
                queries.push(Query.equal('category', ['music', 'song', 'songs']));
            } else {
                queries.push(Query.notEqual('category', 'shorts'));
                queries.push(Query.notEqual('category', 'music'));
                queries.push(Query.notEqual('category', 'song'));
            }

            if (isLoadMore && lastId) {
                queries.push(Query.cursorAfter(lastId));
            }

            const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_VIDEOS, queries);

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
            console.error('Failed to fetch user content:', error);
        }
        setLoading(false);
        setLoadingMore(false);
    };

    useEffect(() => {
        setVideos([]);
        setLastId(null);
        setHasMore(true);
        fetchUserContent(false);
    }, [user, activeTab]);

    useEffect(() => {
        if (inView && hasMore && !loading && !loadingMore) {
            fetchUserContent(true);
        }
    }, [inView, hasMore, loading, loadingMore]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-full">
            <div className="max-w-7xl mx-auto">
                
                {/* --- HEADER WITH AVATAR --- */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar 
                            url={user?.prefs?.avatar} 
                            name={user?.name} 
                            size="lg"
                            className="ring-4 ring-gray-800 dark:ring-gray-700 shadow-xl"
                        />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{user?.name}</h1>
                            <p className="text-gray-500 text-sm font-medium">My Personal Space</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="py-2.5 px-6 bg-blue-600 text-white font-semibold rounded-full shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
                    >
                        Upload Content
                    </button>
                </div>

                {/* --- TABS --- */}
                <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8 overflow-x-auto">
                    {['videos', 'songs', 'shorts'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 px-6 text-sm font-bold uppercase tracking-wide transition-colors relative whitespace-nowrap ${
                                activeTab === tab 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* --- CONTENT GRID --- */}
                {loading && !loadingMore ? (
                    <div className="flex justify-center p-20">
                         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        <div className={`grid gap-6 ${activeTab === 'shorts' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                            {videos.length === 0 ? (
                                <div className="col-span-full py-20 text-center">
                                    <p className="text-gray-500 dark:text-gray-400">No {activeTab} found.</p>
                                </div>
                            ) : (
                                videos.map((video) => (
                                    activeTab === 'shorts' ? (
                                        <Link key={video.$id} to={`/shorts/watch/${video.$id}`} className="block group relative aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800">
                                            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"/>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"/>
                                            <div className="absolute bottom-3 left-3 right-3">
                                                <p className="text-white text-sm font-bold truncate drop-shadow-md">{video.title}</p>
                                                <p className="text-gray-300 text-xs truncate mt-1">{video.views || 0} views</p>
                                            </div>
                                            {video.adminStatus !== 'approved' && (
                                                <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider ${video.adminStatus === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                                                    {video.adminStatus}
                                                </div>
                                            )}
                                        </Link>
                                    ) : (
                                        <div key={video.$id} className="relative group">
                                            <VideoCard video={video} />
                                            {video.adminStatus !== 'approved' && (
                                                <div className={`absolute top-2 left-2 z-10 px-2 py-1 rounded-md text-xs font-bold text-white shadow-sm backdrop-blur-md ${video.adminStatus === 'rejected' ? 'bg-red-500/90' : 'bg-yellow-500/90'}`}>
                                                    {video.adminStatus?.toUpperCase() || 'PENDING'}
                                                </div>
                                            )}
                                        </div>
                                    )
                                ))
                            )}
                        </div>

                        {hasMore && videos.length > 0 && (
                            <div ref={ref} className="flex justify-center mt-12 py-4">
                                {loadingMore && <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>}
                            </div>
                        )}
                    </>
                )}
                
                {/* --- FIX IS HERE: Added isOpen prop --- */}
                {showUploadModal && (
                    <Modal 
                        isOpen={showUploadModal} // <--- THIS WAS MISSING
                        onClose={() => setShowUploadModal(false)}
                    >
                        <UploadForm onUploadSuccess={() => {
                            setShowUploadModal(false);
                            setVideos([]); 
                            setLastId(null);
                            fetchUserContent(false);
                        }} />
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default MySpacePage;