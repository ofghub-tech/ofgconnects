// src/components/Feed.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
// import { Query } from 'appwrite'; // <-- This line is removed
import './Feed.css'; // Optional styling

const Feed = () => {
    // ... (rest of the file is the same) ...
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        // Function to fetch videos
        const getVideos = async () => {
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS,
                    // [Query.orderDesc('$createdAt')] // We removed the import for now
                );
                console.log('Videos fetched:', response.documents);
                setVideos(response.documents);
            } catch (error) {
                console.error('Failed to fetch videos:', error);
            }
        };

        getVideos(); // Call the function
    }, []);

    // ... (rest of the file is the same) ...
    return (
        <div className="feed-container">
            {videos.length === 0 && <p>No videos yet. Be the first to upload!</p>}

            {videos.map(video => (
                <div key={video.$id} className="video-card">
                    <div className="video-thumbnail">
                        <p>Thumbnail for "{video.title}"</p>
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