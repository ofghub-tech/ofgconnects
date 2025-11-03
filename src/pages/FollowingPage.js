// src/pages/FollowingPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { 
    DATABASE_ID, 
    COLLECTION_ID_SUBSCRIPTIONS 
} from '../appwriteConfig';
import { Query } from 'appwrite';
import { useAuth } from '../context/AuthContext';
import './FollowingPage.css';

const FollowingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [followingList, setFollowingList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getFollowingList = async () => {
            if (!user) return;
            setLoading(true);

            try {
                const subResponse = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_SUBSCRIPTIONS,
                    [
                        Query.equal('followerId', user.$id)
                    ]
                );
                setFollowingList(subResponse.documents);
            } catch (error) {
                console.error('Failed to fetch following list:', error);
            }
            setLoading(false);
        };

        getFollowingList();
    }, [user]);

    return (
        <div className="following-container">
            <div className="following-grid-main">
                
                {/* --- Column 1: Channel List --- */}
                <div className="following-list-wrapper">
                    <h1 className="following-title">Following</h1>
                    
                    {loading && <p>Loading...</p>}

                    {!loading && followingList.length === 0 && (
                        <p className="following-empty-message">
                            You aren't following anyone yet.
                        </p>
                    )}

                    <div className="channel-list-grid">
                        {followingList.map(sub => (
                            <div 
                                key={sub.$id} 
                                className="channel-card"
                            >
                                <div className="channel-card-avatar">
                                    {/* ★ THE FIX IS HERE ★ */}
                                    {(sub.followingUsername || '?').charAt(0).toUpperCase()}
                                </div>
                                <div className="channel-card-info">
                                    <span className="channel-card-name">{sub.followingUsername}</span>
                                    <span className="channel-card-desc">Description of Channel</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- Column 2: Image Banner --- */}
                <aside className="following-banner">
                    {/*<img 
                        // 1. IMAGE PATH FIXED
                        src="/faith-banner.png" 
                        alt="Walk by Faith not by Sight" 
                    />*/}
                </aside>

            </div>
        </div>
    );
};

export default FollowingPage;