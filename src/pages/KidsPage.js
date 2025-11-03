// src/pages/KidsPage.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import { useNavigate } from 'react-router-dom';
import './KidsPage.css';

const KidsPage = () => {
    const navigate = useNavigate();
    const [kidsVideos, setKidsVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getKidsVideos = async () => {
            setLoading(true);
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS,
                    [
                        // Query for videos where category equals "Kids"
                        Query.equal('category', 'Kids'),
                        Query.orderDesc('$createdAt') 
                    ]
                );
                setKidsVideos(response.documents);
            } catch (error) {
                console.error('Failed to fetch kids videos:', error);
            }
            setLoading(false);
        };

        getKidsVideos();
    }, []);

    const handleVideoClick = (videoId) => {
        navigate(`/watch/${videoId}`);
    };

    return (
        <div className="kids-container">
            <h1 className="kids-title">Kids Safe Content</h1>
            
            {loading && <p>Loading content...</p>}

            {!loading && kidsVideos.length === 0 && (
                <p className="kids-empty-message">
                    No videos tagged for kids yet. Upload one and tag it as 'Kids'!
                </p>
            )}
            
            <div className="kids-feed-grid">
                {kidsVideos.map(video => (
                    // Reusing the same card structure as the main feed and Songs page
                    <div 
                        key={video.$id} 
                        className="video-card" 
                        onClick={() => handleVideoClick(video.$id)}
                    >
                        <div className="video-thumbnail">
                            {(typeof video.thumbnailUrl === 'string' && video.thumbnailUrl) ? (
                                <img 
                                    src={video.thumbnailUrl} 
                                    alt={video.title} 
                                />
                            ) : (
                                <div className="video-thumbnail-placeholder">
                                    <p>Thumbnail for "{video.title}"</p>
                                </div>
                            )}
                        </div>
                        <div className="video-info">
                            <h3>{video.title}</h3>
                            <p className="video-description">By: {video.username}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KidsPage;