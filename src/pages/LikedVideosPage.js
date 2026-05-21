// src/pages/LikedVideosPage.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import { DATABASE_ID, COLLECTION_ID_VIDEOS, COLLECTION_ID_LIKES } from '../appwriteConfig';
import { Query } from 'appwrite';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import './LikedVideosPage.css';

// Icon
const HeartIcon = (props) => (
    <svg {...props} className="heart-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.44-1.32C4.59 14.28 1 10.15 1 5.5 1 2.44 3.44 0 6.5 0c1.86 0 3.63.85 4.75 2.21L12 3.75l.75-1.54C14.37.85 16.14 0 18.5 0 21.56 0 24 2.44 24 5.5c0 4.65-3.59 8.78-9.56 14.53L12 21.35z" />
    </svg>
);

const LikedVideosPage = () => {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [loadingMore, setLoadingMore] = useState(false);
    const [lastLikeId, setLastLikeId] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 50;

    const { ref, inView } = useInView({ threshold: 0.1 });

    const fetchLikedVideos = async (isLoadMore = false) => {
        if (!user) return;

        isLoadMore ? setLoadingMore(true) : setLoading(true);

        try {
            let queries = [
                Query.equal('userId', user.$id),
                Query.orderDesc('$createdAt'),
                Query.limit(ITEMS_PER_PAGE)
            ];

            if (isLoadMore && lastLikeId) {
                queries.push(Query.cursorAfter(lastLikeId));
            }

            const likesResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_LIKES,
                queries
            );

            const likeDocs = likesResponse.documents;

            if (likeDocs.length === 0) {
                if (!isLoadMore) setVideos([]);
                setHasMore(false);
                setLoading(false);
                setLoadingMore(false);
                return;
            }

            setLastLikeId(likeDocs[likeDocs.length - 1].$id);
            setHasMore(likeDocs.length === ITEMS_PER_PAGE);

            const videoIds = likeDocs.map(doc => doc.videoId);

            const videosResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                [Query.equal('$id', videoIds), Query.limit(ITEMS_PER_PAGE)]
            );

            const fetchedVideos = videosResponse.documents;

            const orderedBatch = videoIds
                .map(id => fetchedVideos.find(v => v.$id === id))
                .filter(Boolean);

            isLoadMore
                ? setVideos(prev => [...prev, ...orderedBatch])
                : setVideos(orderedBatch);

        } catch (error) {
            console.error("Failed to fetch liked videos:", error);
        }

        setLoading(false);
        setLoadingMore(false);
    };

    useEffect(() => {
        fetchLikedVideos(false);
    }, [user]);

    useEffect(() => {
        if (inView && hasMore && !loading && !loadingMore) {
            fetchLikedVideos(true);
        }
    }, [inView, hasMore, loading, loadingMore]);

    if (!user) {
        return (
            <div className="page">
                <div className="panel center">
                    <h1>Please Log In</h1>
                    <p>You must be logged in to view your liked videos.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="page">
                <div className="panel center">
                    <p>Finding your favorite videos...</p>
                </div>
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="page">
                <div className="panel center">
                    <HeartIcon />
                    <h1>Liked Videos</h1>
                    <p>Videos you like will show up here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">

                <h1 className="title">Liked Videos</h1>

                <div className="grid">
                    {videos.map((video) => (
                        <Link to={`/watch/${video.$id}`} key={video.$id} className="card-link">
                            <div className="card">
                                <div className="thumb">
                                    <img src={video.thumbnailUrl} alt={video.title} />
                                </div>

                                <div className="card-body">
                                    <h3 className="video-title">{video.title}</h3>
                                    <p className="username">{video.username}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {hasMore && (
                    <div ref={ref} className="load-more">
                        {loadingMore && <p>Loading more likes...</p>}
                    </div>
                )}

                {!hasMore && videos.length > 0 && (
                    <p className="end-text">That's all the videos you've liked!</p>
                )}
            </div>
        </div>
    );
};

export default LikedVideosPage;