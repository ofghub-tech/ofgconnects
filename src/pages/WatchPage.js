// src/pages/WatchPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import Comments from '../components/Comments';
import FollowButton from '../components/FollowButton';
import LikeButton from '../components/LikeButton';
import './WatchPage.css';

// Key must match the one in OfflinePage.js
const WATCH_LATER_KEY = 'ofg_watch_later_list'; 

const WatchPage = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);

    // --- Utility function to manage Watch Later list ---
    const checkSavedStatus = (id) => {
        const savedList = JSON.parse(localStorage.getItem(WATCH_LATER_KEY) || '[]');
        return savedList.includes(id);
    };

    const toggleSavedStatus = (id) => {
        let savedList = JSON.parse(localStorage.getItem(WATCH_LATER_KEY) || '[]');
        
        if (savedList.includes(id)) {
            savedList = savedList.filter(vId => vId !== id);
            setIsSaved(false);
            alert("Video removed from Watch Later list!");
        } else {
            savedList.push(id);
            setIsSaved(true);
            alert("Video added to Watch Later list!");
        }
        localStorage.setItem(WATCH_LATER_KEY, JSON.stringify(savedList));
    };

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
                setIsSaved(checkSavedStatus(response.$id)); 

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

                {/* --- Creator Info Block with Action Buttons --- */}
                {video.username && (
                    <div className="creator-info">
                        {/* NOTE: creator-details is NO LONGER CLICKABLE */}
                        <div className="creator-details">
                            <div className="creator-avatar">
                                {video.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="creator-name">{video.username}</span>
                        </div>

                        <div className="action-buttons-group">
                            <LikeButton videoId={video.$id} initialLikeCount={video.likeCount || 0} /> 
                            
                            <button 
                                className={`download-btn ${isSaved ? 'downloaded' : ''}`}
                                onClick={() => toggleSavedStatus(video.$id)}
                            >
                                {isSaved ? 'Remove from List' : 'Watch Later'}
                            </button>
                            
                            <FollowButton creatorId={video.userId} creatorName={video.username} />
                        </div>
                    </div>
                )}
                {/* --- End of Action Bar --- */}

                <p className="video-description">{video.description || 'No description.'}</p>
            </div>
            
            <hr className="divider" /> 

            <Comments videoId={videoId} />
        </div>
    );
};

export default WatchPage;