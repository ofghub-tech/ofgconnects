// src/pages/MySpacePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import { useAuth } from '../context/AuthContext';
import './MySpacePage.css'; // We'll create this next

const MySpacePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getMyVideos = async () => {
            if (!user) return; // Wait until user is loaded

            setLoading(true);
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS,
                    [
                        Query.equal('userId', user.$id) // The query!
                    ]
                );
                setVideos(response.documents);
            } catch (error) {
                console.error('Failed to fetch user videos:', error);
            }
            setLoading(false);
        };

        getMyVideos();
    }, [user]); // Re-run when user is available

    if (loading) {
        return <p>Loading your videos...</p>;
    }

    return (
        <div className="myspace-container">
            <button onClick={() => navigate('/home')} className="back-btn-myspace">
                &larr; Back to Home
            </button>
            
            <h1 className="myspace-title">Welcome to your space, {user.name}!</h1>
            <p className="myspace-subtitle">Here are the videos you've uploaded.</p>
            
            <hr className="divider" />

            <div className="myspace-video-grid">
                {videos.length === 0 && <p>You haven't uploaded any videos yet. Click "Upload" on the home page to start!</p>}

                {videos.map(video => (
                    <div 
                        key={video.$id} 
                        className="video-card-myspace"
                        onClick={() => navigate(`/watch/${video.$id}`)}
                    >
                        <div className="video-thumbnail-myspace">
                            <img src={video.thumbnailUrl} alt={video.title} />
                        </div>
                        <div className="video-info-myspace">
                            <h3>{video.title}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MySpacePage;