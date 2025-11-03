// src/pages/SongsPage.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import { useNavigate } from 'react-router-dom';
//import FeedCard from '../components/FeedCard'; // We'll create a reusable card component next
import './SongsPage.css';

const SongsPage = () => {
    const navigate = useNavigate();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSongs = async () => {
            setLoading(true);
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS,
                    [
                        // Query for videos where category equals "Songs"
                        Query.equal('category', 'Songs'),
                        Query.orderDesc('$createdAt') 
                    ]
                );
                setSongs(response.documents);
            } catch (error) {
                console.error('Failed to fetch songs:', error);
            }
            setLoading(false);
        };

        getSongs();
    }, []);

    const handleVideoClick = (videoId) => {
        navigate(`/watch/${videoId}`);
    };

    return (
        <div className="songs-container">
            <h1 className="songs-title">Christian Music & Songs</h1>
            
            {loading && <p>Loading songs...</p>}

            {!loading && songs.length === 0 && (
                <p className="songs-empty-message">
                    No songs have been uploaded yet.
                </p>
            )}
            
            <div className="songs-feed-grid">
                {songs.map(video => (
                    // Reusing the look of the home page feed card
                    <div 
                        key={video.$id} 
                        className="video-card" 
                        onClick={() => handleVideoClick(video.$id)}
                    >
                        <div className="video-thumbnail">
                            <img src={video.thumbnailUrl} alt={video.title} />
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

export default SongsPage;