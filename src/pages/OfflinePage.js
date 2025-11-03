// src/pages/OfflinePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import './OfflinePage.css'; // We will still use this filename

// We change the key to reflect 'Watch Later' instead of 'offline_list'
const WATCH_LATER_KEY = 'ofg_watch_later_list'; 

const OfflinePage = () => {
    const navigate = useNavigate();
    const [watchLaterVideos, setWatchLaterVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getWatchLaterVideos = async () => {
            setLoading(true);
            // 1. Get the list of IDs from Local Storage
            const savedIds = JSON.parse(localStorage.getItem(WATCH_LATER_KEY) || '[]');

            if (savedIds.length === 0) {
                setWatchLaterVideos([]);
                setLoading(false);
                return;
            }

            try {
                // 2. Fetch the documents from Appwrite using those IDs
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS,
                    [
                        Query.equal('$id', savedIds)
                    ]
                );
                
                setWatchLaterVideos(response.documents);
            } catch (error) {
                console.error('Failed to fetch watch later videos:', error);
            }
            setLoading(false);
        };

        getWatchLaterVideos();
    }, []);

    const handleRemoveFromWatchLater = (videoId) => {
        let savedList = JSON.parse(localStorage.getItem(WATCH_LATER_KEY) || '[]');
        savedList = savedList.filter(vId => vId !== videoId);
        localStorage.setItem(WATCH_LATER_KEY, JSON.stringify(savedList));

        // Update state immediately
        setWatchLaterVideos(prev => prev.filter(video => video.$id !== videoId));
    };

    return (
        <div className="offline-container"> {/* We keep the CSS class name for simplicity */}
            <h1 className="offline-title">Watch Later</h1> {/* <-- Updated Title */}
            
            {loading && <p>Loading your Watch Later list...</p>}

            {!loading && watchLaterVideos.length === 0 && (
                <p className="offline-empty-message">
                    Your Watch Later list is empty. Add videos from the Watch Page.
                </p>
            )}

            <div className="offline-video-list">
                {watchLaterVideos.map(video => (
                    <div key={video.$id} className="offline-card">
                        <div 
                            className="offline-thumbnail"
                            onClick={() => navigate(`/watch/${video.$id}`)} 
                        >
                            <img src={video.thumbnailUrl} alt={video.title} />
                        </div>
                        <div className="offline-info">
                            <h3 className="offline-card-title">{video.title}</h3>
                            <button 
                                className="remove-btn"
                                onClick={() => handleRemoveFromWatchLater(video.$id)}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OfflinePage;