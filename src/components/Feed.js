// src/components/Feed.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import './Feed.css'; // This is where the grid styles will go

const Feed = ({ searchTerm }) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const getVideos = async () => {
            setLoading(true);
            try {
                let queries = [];

                if (searchTerm) {
                    queries.push(Query.search('title', searchTerm));
                }
                
                // Ensure videos are ordered newest first by default
                queries.push(Query.orderDesc('$createdAt')); 

                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS,
                    queries 
                );
                
                setVideos(response.documents);
            } catch (error) {
                console.error('Failed to fetch videos:', error);
            }
            setLoading(false);
        };

        getVideos();
    }, [searchTerm]);

    if (loading) {
        return <p>Loading videos...</p>
    }

    return (
        <div className="feed-container">
            {videos.length === 0 && !loading && (
                <p className="feed-empty-message">
                    {searchTerm 
                        ? `No results found for "${searchTerm}"` 
                        : "No videos yet. Be the first to upload!"}
                </p>
            )}

            {videos.map(video => (
                <div 
                    key={video.$id} 
                    className="video-card" 
                    onClick={() => navigate(`/watch/${video.$id}`)}
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
    );
};

export default Feed;