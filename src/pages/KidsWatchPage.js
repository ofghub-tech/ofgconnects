// src/pages/KidsWatchPage.js
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
import './KidsWatchPage.css'; // ✅ CSS added

// ICONS (UNCHANGED)
const BookmarkIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>);
const BookmarkIconSolid = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>);
const EyeIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);

const KidsWatchPage = () => {
    const { videoId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [savedDocId, setSavedDocId] = useState(null);
    const [isTogglingSave, setIsTogglingSave] = useState(false);

    const viewCountedRef = useRef(false);

    // --- (LOGIC UNCHANGED) ---
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
        if (!user) return alert("Login first");
        if (isTogglingSave) return;
        setIsTogglingSave(true);

        try {
            if (isSaved) {
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

    if (loading) return <div className="center-box"><p>Loading...</p></div>;
    if (!video) return <div className="center-box"><p>Video not found.</p></div>;

    return (
        <div className="page">
            <div className="layout">

                <div className="main">
                    <div className="video-box">
                        <video controls src={video.url_4k || video.videoUrl} />
                    </div>

                    <div className="panel">
                        <h1 className="title">{video.title}</h1>

                        <div className="views">
                            <EyeIcon className="icon" />
                            <span>{video.view_count || 0} views</span>
                        </div>

                        <div className="creator-row">
                            <div className="creator">
                                <Link to={`/channel/${video.userId}`}>
                                    <Avatar url={video.creatorAvatar} name={video.username} />
                                </Link>

                                <div>
                                    <Link to={`/channel/${video.userId}`} className="username">
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
                    <SuggestedVideos currentVideo={video} forceCategory="kids" />
                </div>

            </div>
        </div>
    );
};

export default KidsWatchPage;