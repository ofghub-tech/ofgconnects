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
import './MySpacePage.css';

const MySpacePage = () => {
    const { user } = useAuth();
    const location = useLocation(); 
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [activeTab, setActiveTab] = useState('videos'); 

    const [loadingMore, setLoadingMore] = useState(false);
    const [lastId, setLastId] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 24; 

    const { ref, inView } = useInView({ threshold: 0.1 });

    useEffect(() => {
        if (location.state?.openUpload) {
            setShowUploadModal(true);
            window.history.replaceState({}, document.title)
        }
    }, [location]);

    const fetchUserContent = async (isLoadMore = false) => {
        if (!user) return;

        isLoadMore ? setLoadingMore(true) : setLoading(true);

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

            const res = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_VIDEOS, queries);

            isLoadMore
                ? setVideos(prev => [...prev, ...res.documents])
                : setVideos(res.documents);

            setHasMore(res.documents.length === ITEMS_PER_PAGE);

            if (res.documents.length > 0) {
                setLastId(res.documents[res.documents.length - 1].$id);
            }

        } catch (error) {
            console.error(error);
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
    }, [inView]);

    return (
        <div className="page">
            <div className="container">
                
                {/* HEADER */}
                <div className="header">
                    <div className="user-info">
                        <Avatar url={user?.prefs?.avatar} name={user?.name} />
                        <div>
                            <h1 className="username">{user?.name}</h1>
                            <p className="subtitle">My Personal Space</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="upload-btn"
                    >
                        Upload Content
                    </button>
                </div>

                {/* TABS */}
                <div className="tabs">
                    {['videos', 'songs', 'shorts'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`tab ${activeTab === tab ? 'active' : ''}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* CONTENT */}
                {loading && !loadingMore ? (
                    <div className="loader-box">
                        <div className="loader"></div>
                    </div>
                ) : (
                    <>
                        <div className={`grid ${activeTab === 'shorts' ? 'shorts' : 'videos'}`}>
                            {videos.length === 0 ? (
                                <div className="empty">
                                    <p>No {activeTab} found.</p>
                                </div>
                            ) : (
                                videos.map((video) => (
                                    activeTab === 'shorts' ? (
                                        <Link key={video.$id} to={`/shorts/watch/${video.$id}`} className="short-card">
                                            <img src={video.thumbnailUrl} alt={video.title} />
                                            <div className="short-info">
                                                <p>{video.title}</p>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div key={video.$id} className="video-card">
                                            <VideoCard video={video} />
                                        </div>
                                    )
                                ))
                            )}
                        </div>

                        {hasMore && videos.length > 0 && (
                            <div ref={ref} className="load-more">
                                {loadingMore && <div className="loader small"></div>}
                            </div>
                        )}
                    </>
                )}

                {showUploadModal && (
                    <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)}>
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