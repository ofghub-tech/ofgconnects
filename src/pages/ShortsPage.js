// src/pages/ShortsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { 
    DATABASE_ID, 
    COLLECTION_ID_VIDEOS // <-- CHANGED: Use the main videos collection
} from '../appwriteConfig';
import { Query } from 'appwrite';
// REMOVED: Modal is no longer needed
import './ShortsPage.css'; 

const ShortsPage = () => {
    const navigate = useNavigate();
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(true);
    // REMOVED: Modal state is no longer needed
    
    useEffect(() => {
        const getShorts = async () => {
            setLoading(true);
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS, // <-- CHANGED: Use main videos collection
                    [
                        // --- THIS IS THE NEW QUERY ---
                        // This query ensures we ONLY get "shorts" videos
                        Query.equal('category', 'shorts'),
                        // --- END NEW QUERY ---
                        Query.orderDesc('$createdAt')
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

    // REMOVED: Modal handler functions are no longer needed

    // Helper to safely play video on hover, catching errors
    const handleMouseOver = (e) => {
        e.target.play().catch(error => {
            // Ignore "interrupted" errors if user mouses away quickly
        });
    };

    const handleMouseOut = (e) => {
        e.target.pause();
    };

    return (
        <>
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
                            // --- THIS IS THE NAVIGATION FIX ---
                            // Click now navigates to the VideoRouter
                            onClick={() => navigate(`/watch/${short.$id}`)} 
                        >
                            <video 
                                src={short.videoUrl} 
                                className="short-video"
                                loop
                                muted
                                playsInline
                                onMouseOver={handleMouseOver} // Use safe handler
                                onMouseOut={handleMouseOut}
                            />
                            <div className="short-video-info">
                                <span className="short-video-user">{short.username}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* REMOVED: The entire Modal component is gone */}
        </>
    );
};

export default ShortsPage;