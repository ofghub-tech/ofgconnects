// src/pages/ShortsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { 
    DATABASE_ID, 
    COLLECTION_ID_SHORTS 
} from '../appwriteConfig';
import { Query } from 'appwrite';
import './ShortsPage.css'; // We'll create this next

const ShortsPage = () => {
    const navigate = useNavigate();
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getShorts = async () => {
            setLoading(true);
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_SHORTS,
                    [
                        Query.orderDesc('$createdAt') // Show newest first
                    ]
                );
                setShorts(response.documents);
            } catch (error) {
                console.error('Failed to fetch shorts:', error);
            }
            setLoading(false);
        };

        getShorts();
    }, []);

    return (
        <div className="shorts-container">
            <h1 className="shorts-title">Shorts</h1>
            
            {loading && <p>Loading shorts...</p>}

            {!loading && shorts.length === 0 && (
                <p className="shorts-empty-message">
                    No shorts have been uploaded yet.
                </p>
            )}

            <div className="shorts-grid">
                {shorts.map(short => (
                    <div 
                        key={short.$id} 
                        className="short-video-card"
                        // We can make this open a special "Shorts" player later
                        // For now, it won't do anything on click
                    >
                        <video 
                            src={short.videoUrl} 
                            className="short-video"
                            loop
                            muted
                            playsInline
                            onMouseOver={e => e.target.play()}
                            onMouseOut={e => e.target.pause()}
                        />
                        <div className="short-video-info">
                            <span className="short-video-user">{short.username}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShortsPage;