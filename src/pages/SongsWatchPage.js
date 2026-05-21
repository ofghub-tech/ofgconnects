// src/pages/SongsWatchPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import {
    DATABASE_ID,
    COLLECTION_ID_VIDEOS,
    COLLECTION_ID_HISTORY,
    COLLECTION_ID_WATCH_LATER
} from '../appwriteConfig';
import { ID, Query, Permission, Role } from 'appwrite';
import Comments from '../components/Comments';
import FollowButton from '../components/FollowButton';
import LikeButton from '../components/LikeButton';
import ShareButton from '../components/ShareButton';
import SuggestedVideos from '../components/SuggestedVideos';
import Avatar from '../components/Avatar';
import './SongsWatchPage.css';

// ICONS (UNCHANGED)
const BookmarkIcon = (props) => (<svg {...props} viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>);
const BookmarkIconSolid = (props) => (<svg {...props} viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>);
const EyeIcon = (props) => (<svg {...props} viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /></svg>);

const SongsWatchPage = () => {
    const { videoId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [savedDocId, setSavedDocId] = useState(null);
    const [isTogglingSave, setIsTogglingSave] = useState(false);

    const viewCountedRef = useRef(false);

    useEffect(() => {
        const checkSavedStatus = async () => {
            if (!user || !videoId) return;
            try {
                const res = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_WATCH_LATER,
                    [Query.equal('userId', user.$id), Query.equal('videoId', videoId), Query.limit(1)]
                );
                if (res.total > 0) {
                    setIsSaved(true);
                    setSavedDocId(res.documents[0].$id);
                }
            } catch {}
        };
        checkSavedStatus();
    }, [user, videoId]);

    const handleToggleSave = async () => {
        if (!user) return;
        if (isTogglingSave) return;

        setIsTogglingSave(true);

        try {
            if (isSaved && savedDocId) {
                await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_WATCH_LATER, savedDocId);
                setIsSaved(false);
            } else {
                const res = await databases.createDocument(
                    DATABASE_ID,
                    COLLECTION_ID_WATCH_LATER,
                    ID.unique(),
                    { userId: user.$id, videoId },
                    [Permission.read(Role.user(user.$id)), Permission.write(Role.user(user.$id))]
                );
                setIsSaved(true);
                setSavedDocId(res.$id);
            }
        } catch {}

        setIsTogglingSave(false);
    };

    useEffect(() => {
        viewCountedRef.current = false;

        const getVideo = async () => {
            setLoading(true);
            try {
                const res = await databases.getDocument(DATABASE_ID, COLLECTION_ID_VIDEOS, videoId);
                setVideo(res);
            } catch {}
            setLoading(false);
        };

        getVideo();
    }, [videoId]);

    if (loading) return <div className="center">Loading...</div>;
    if (!video) return <div className="center">Video not found</div>;

    return (
        <div className="page">
            <div className="layout">

                <div className="main">
                    <div className="video-box">
                        <video controls src={video.url_4k || video.videoUrl}></video>
                    </div>

                    <div className="panel">
                        <h1 className="title">{video.title}</h1>

                        <div className="views">
                            <EyeIcon />
                            <span>{video.view_count || 0} views</span>
                        </div>

                        <div className="creator-row">
                            <div className="creator">
                                <Link to={`/channel/${video.userId}`}>
                                    <Avatar url={video.creatorAvatar} name={video.username} />
                                </Link>

                                <div>
                                    <Link to={`/channel/${video.userId}`}>
                                        {video.username}
                                    </Link>
                                </div>

                                <FollowButton targetUserId={video.userId} />
                            </div>

                            <div className="actions">
                                <LikeButton videoId={video.$id} />
                                <ShareButton videoId={video.$id} />

                                <button className="save-btn" onClick={handleToggleSave}>
                                    {isSaved ? <BookmarkIconSolid /> : <BookmarkIcon />}
                                    {isSaved ? 'Saved' : 'Save'}
                                </button>
                            </div>
                        </div>

                        <div className="description">
                            {video.description}
                        </div>
                    </div>

                    <div className="panel">
                        <Comments videoId={videoId} />
                    </div>
                </div>

                <div className="sidebar">
                    <SuggestedVideos currentVideo={video} forceCategory="songs" />
                </div>

            </div>
        </div>
    );
};

export default SongsWatchPage;