// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import VideoCard from '../components/VideoCard';
import { useInView } from 'react-intersection-observer';
import './HomePage.css'; // ✅ NEW CSS

const HomePage = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [loadingMore, setLoadingMore] = useState(false);
    const [lastId, setLastId] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 12;

    const { ref, inView } = useInView({ threshold: 0.5 });

    const fetchVideos = async (isLoadMore = false) => {
        isLoadMore ? setLoadingMore(true) : setLoading(true);

        try {
            let queries = [
                Query.equal('adminStatus', 'approved'),
                Query.notEqual('category', 'shorts'),
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
            console.error("Error fetching videos:", error);
        }

        setLoading(false);
        setLoadingMore(false);
    };

    useEffect(() => {
        fetchVideos(false);
    }, []);

    useEffect(() => {
        if (inView && hasMore && !loading && !loadingMore) {
            fetchVideos(true);
        }
    }, [inView, hasMore, loading, loadingMore]);

    return (
        <div className="home-container">
            <div className="home-content">

                <div className="header">
                    <h1 className="title">Discover</h1>
                </div>

                {loading && (
                    <div className="loader-container">
                        <div className="loader large"></div>
                    </div>
                )}

                {!loading && (
                    <>
                        <div className="video-grid">
                            {videos.map(video => (
                                <VideoCard key={video.$id} video={video} />
                            ))}
                        </div>

                        {videos.length === 0 && (
                            <p className="empty-text">
                                No videos found. Be the first to upload!
                            </p>
                        )}

                        {hasMore && videos.length > 0 && (
                            <div ref={ref} className="load-more">
                                {loadingMore ? (
                                    <div className="load-more-inner">
                                        <div className="loader small"></div>
                                        <span>Loading more...</span>
                                    </div>
                                ) : (
                                    <div className="spacer"></div>
                                )}
                            </div>
                        )}

                        {!hasMore && videos.length > 0 && (
                            <p className="end-text">
                                You've reached the end of the feed.
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default HomePage;