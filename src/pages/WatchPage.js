// src/pages/WatchPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { 
    DATABASE_ID, 
    COLLECTION_ID_VIDEOS, 
    COLLECTION_ID_HISTORY 
} from '../appwriteConfig';
import { Query, ID, Permission, Role } from 'appwrite'; 
import { useAuth } from '../context/AuthContext'; 

import SuggestedVideos from '../components/SuggestedVideos';
import Comments from '../components/Comments';
import LikeButton from '../components/LikeButton';
import ShareButton from '../components/ShareButton';
import FollowButton from '../components/FollowButton';
import AdBanner from '../components/AdBanner';
import Avatar from '../components/Avatar';
import './WatchPage.css';

const WatchPage = () => {
    const { id } = useParams();
    const { user } = useAuth(); 
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const viewCountedRef = useRef(false);

    useEffect(() => {
        viewCountedRef.current = false;

        const fetchVideo = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS,
                    id
                );
                setVideo(response);

                if (user && !viewCountedRef.current) {
                    viewCountedRef.current = true;

                    try {
                        const historyCheck = await databases.listDocuments(
                            DATABASE_ID,
                            COLLECTION_ID_HISTORY,
                            [
                                Query.equal('userId', user.$id),
                                Query.equal('videoId', id),
                                Query.limit(1)
                            ]
                        );

                        if (historyCheck.total === 0) {
                            await databases.createDocument(
                                DATABASE_ID,
                                COLLECTION_ID_HISTORY,
                                ID.unique(),
                                { userId: user.$id, videoId: id },
                                [
                                    Permission.read(Role.user(user.$id)),
                                    Permission.write(Role.user(user.$id))
                                ]
                            );

                            const currentViews = response.view_count || response.views || 0;

                            await databases.updateDocument(
                                DATABASE_ID,
                                COLLECTION_ID_VIDEOS,
                                id,
                                { view_count: currentViews + 1 }
                            );

                            setVideo(prev => ({ ...prev, view_count: currentViews + 1 }));
                        }
                    } catch (e) {
                        console.log("View count update failed", e);
                    }
                }

            } catch (err) {
                setError(err.message || "Could not load video");
            }
            setLoading(false);
        };

        if (id) fetchVideo();
    }, [id, user]);

    if (loading) return (
        <div className="loader-page">
            <div className="loader"></div>
        </div>
    );

    if (error || !video) return (
        <div className="center-box">
            <h2>Video not found</h2>
            <p>{error}</p>
        </div>
    );

    const videoSource = video.video_url || video.videoUrl;
    const thumbnailSource = video.thumbnailUrl || video.thumbnail_url;

    return (
        <div className="watch-page">
            <div className="watch-layout">
                
                {/* LEFT */}
                <div className="left">

                    <div className="player">
                        {videoSource ? (
                            <video 
                                controls 
                                autoPlay 
                                muted 
                                src={videoSource}
                                poster={thumbnailSource}
                            />
                        ) : (
                            <div className="error-box">
                                No video source
                            </div>
                        )}
                    </div>

                    <div className="content">
                        <h1 className="title">{video.title}</h1>

                        <div className="info-row">
                            <div className="channel">
                                <Link to={`/channel/${video.userId}`}>
                                    <Avatar 
                                        url={video.creatorAvatar} 
                                        name={video.username} 
                                    />
                                </Link>

                                <div>
                                    <Link to={`/channel/${video.userId}`}>
                                        {video.username}
                                    </Link>
                                </div>

                                <FollowButton 
                                    creatorId={video.userId} 
                                    creatorName={video.username} 
                                />
                            </div>

                            <div className="actions">
                                <LikeButton videoId={video.$id} />
                                <ShareButton videoId={video.$id} />
                            </div>
                        </div>

                        <div className="description">
                            <div>
                                {video.view_count || 0} views • {new Date(video.$createdAt).toLocaleDateString()}
                            </div>
                            <p>{video.description}</p>
                        </div>

                        <Comments videoId={video.$id} />
                    </div>
                </div>

                {/* RIGHT */}
                <div className="right">
                    <AdBanner className="ad" />
                    <h3>Up Next</h3>
                    <SuggestedVideos currentVideo={video} />
                </div>

            </div>
        </div>
    );
};

export default WatchPage;