// src/pages/WatchLaterPage.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import { DATABASE_ID, COLLECTION_ID_VIDEOS, COLLECTION_ID_WATCH_LATER } from '../appwriteConfig';
import { Query } from 'appwrite';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import './WatchLaterPage.css';

// Icon
const BookmarkIcon = (props) => (
    <svg {...props} className="bookmark-icon" viewBox="0 0 24 24">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
);

const WatchLaterPage = () => {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [loadingMore, setLoadingMore] = useState(false);
    const [lastDocId, setLastDocId] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 50;

    const { ref, inView } = useInView({ threshold: 0.1 });

    const fetchWatchLaterVideos = async (isLoadMore = false) => {
        if (!user) return;

        isLoadMore ? setLoadingMore(true) : setLoading(true);

        try {
            let queries = [
                Query.equal('userId', user.$id),
                Query.orderDesc('$createdAt'),
                Query.limit(ITEMS_PER_PAGE)
            ];

            if (isLoadMore && lastDocId) {
                queries.push(Query.cursorAfter(lastDocId));
            }

            const wlResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_WATCH_LATER,
                queries
            );

            const wlDocs = wlResponse.documents;

            if (wlDocs.length === 0) {
                if (!isLoadMore) setVideos([]);
                setHasMore(false);
                setLoading(false);
                setLoadingMore(false);
                return;
            }

            setLastDocId(wlDocs[wlDocs.length - 1].$id);
            setHasMore(wlDocs.length === ITEMS_PER_PAGE);

            const videoIds = wlDocs.map(doc => doc.videoId);

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
            console.error(error);
        }

        setLoading(false);
        setLoadingMore(false);
    };

    useEffect(() => {
        fetchWatchLaterVideos(false);
    }, [user]);

    useEffect(() => {
        if (inView && hasMore && !loading && !loadingMore) {
            fetchWatchLaterVideos(true);
        }
    }, [inView]);

    if (!user) {
        return (
            <div className="center-box">
                <h1>Please Log In</h1>
                <p>You must be logged in to view your Watch Later list.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="center-box">
                <p>Loading your saved videos...</p>
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="page">
                <div className="empty-panel">
                    <BookmarkIcon />
                    <h1>Watch Later</h1>
                    <p>Save videos to watch later and they'll show up here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">

                <h1 className="title">Watch Later</h1>

                <div className="grid">
                    {videos.map(video => (
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
                        {loadingMore && <p>Loading more...</p>}
                    </div>
                )}

                {!hasMore && videos.length > 0 && (
                    <p className="end-text">End of your list.</p>
                )}
            </div>
        </div>
    );
};

export default WatchLaterPage;