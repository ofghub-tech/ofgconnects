// src/components/Feed.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite'; // 1. Make sure Query is imported
import './Feed.css';

// 2. Accept the 'searchTerm' prop
const Feed = ({ searchTerm }) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 3. Update useEffect to run when 'searchTerm' changes
    useEffect(() => {
        const getVideos = async () => {
            setLoading(true);
            try {
                let queries = [];

                // 4. If there is a search term, use the search query
                if (searchTerm) {
                    queries.push(Query.search('title', searchTerm));
                }
                
                // You can add other queries here too, like Query.orderDesc('$createdAt')

                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS,
                    queries // 5. Pass the queries array to the API call
                );
                
                setVideos(response.documents);
            } catch (error) {
                console.error('Failed to fetch videos:', error);
            }
            setLoading(false);
        };

        getVideos();
    }, [searchTerm]); // 6. Add 'searchTerm' as a dependency

    if (loading) {
        return <p>Loading videos...</p>
    }

    return (
        <div className="feed-container">
            {videos.length === 0 && !loading && (
                <p>
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
                        <p className="video-description">{video.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Feed;