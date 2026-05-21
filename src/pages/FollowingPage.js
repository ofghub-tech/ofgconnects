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
import './FollowingPage.css'; // ✅ Import CSS

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
            <div className="following-grid">
                
                <div className="main-section">
                    <h1 className="page-title">Following</h1>
                    
                    {loading && <p className="loading-text">Loading...</p>}

                    {!loading && followingList.length === 0 && (
                        <div className="glass-panel empty-state">
                            <p>You aren't following anyone yet.</p>
                        </div>
                    )}

                    <div className="following-list">
                        {followingList.map(sub => (
                            <div key={sub.$id} className="glass-panel user-card">
                                <div className="avatar">
                                    {(sub.followingUsername || '?').charAt(0).toUpperCase()}
                                </div>
                                <div className="user-info">
                                    <span className="username">{sub.followingUsername}</span>
                                    <span className="description">Description of Channel</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="sidebar">
                    <div className="glass-panel banner">
                        <span>Banner</span>
                    </div>
                </aside>

            </div>
        </div>
    );
};

export default FollowingPage;