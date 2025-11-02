// src/pages/WatchPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import Comments from '../components/Comments'; // Import Comments
import FollowButton from '../components/FollowButton'; // Import FollowButton
import './WatchPage.css';

const WatchPage = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getVideo = async () => {
            setLoading(true);
            try {
                const response = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS,
                    videoId
                );
                setVideo(response);
            } catch (error) {
                console.error('Failed to fetch video:', error);
                navigate('/home');
            }
            setLoading(false);
        };

        getVideo();
    }, [videoId, navigate]);

    if (loading) {
        return <p>Loading video...</p>;
    }

    if (!video) {
        return <p>Video not found.</p>;
    }

    return (
        <div className="watch-container">
            <button onClick={() => navigate('/home')} className="back-btn">
                &larr; Back to Home
            </button>
            
            <div className="video-player-wrapper">
                <video 
                    controls 
                    autoPlay 
                    src={video.videoUrl} 
                    width="100%"
                >
                    Your browser does not support the video tag.
                </video>
                <h1 className="video-title">{video.title}</h1>

                {/* --- Creator Info Block with Follow Button --- */}
                {video.username && (
                    <div className="creator-info">
                        <div className="creator-details">
                            <div className="creator-avatar">
                                {video.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="creator-name">{video.username}</span>
                        </div>
                        {/* This is the Follow Button component */}
                        <FollowButton creatorId={video.userId} creatorName={video.username} />
                    </div>
                )}
                {/* --- End of Block --- */}

                <p className="video-description">{video.description || 'No description.'}</p>
            </div>
            
            <hr className="divider" /> 

            {/* This is the Comments component */}
            <Comments videoId={videoId} />
        </div>
    );
};

export default WatchPage;