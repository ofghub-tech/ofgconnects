// src/pages/ShortsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { 
    DATABASE_ID, 
    COLLECTION_ID_SHORTS 
} from '../appwriteConfig';
import { Query } from 'appwrite';
import Modal from '../components/Modal'; // 1. Import the Modal
import './ShortsPage.css'; 

const ShortsPage = () => {
    const navigate = useNavigate();
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(true);
    // 2. State to hold the currently selected short for the modal player
    const [selectedShort, setSelectedShort] = useState(null); 

    useEffect(() => {
        const getShorts = async () => {
            setLoading(true);
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_SHORTS,
                    [
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

    // Function to handle opening the player modal
    const openShortsPlayer = (short) => {
        setSelectedShort(short);
    };

    // Function to handle closing the player modal
    const closeShortsPlayer = () => {
        setSelectedShort(null);
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
                            // 3. Click now opens the modal player
                            onClick={() => openShortsPlayer(short)} 
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

            {/* --- 4. The Full-Screen Modal Player --- */}
            <Modal isOpen={selectedShort !== null} onClose={closeShortsPlayer}>
                {selectedShort && (
                    <div className="shorts-player-content">
                        <div className="shorts-player-video">
                            {/* The video element that plays the short */}
                            <video
                                key={selectedShort.$id} // Key forces video reload when changing shorts
                                src={selectedShort.videoUrl}
                                controls
                                autoPlay
                                loop
                                playsInline
                                className="full-screen-short-video"
                            />
                            <div className="shorts-player-overlay">
                                <span className="shorts-overlay-user">@{selectedShort.username}</span>
                                {/* We can add like/comment buttons here later */}
                            </div>
                        </div>
                        
                        {/* You can add a vertical comments section on the right later */}
                    </div>
                )}
            </Modal>
        </>
    );
};

export default ShortsPage;