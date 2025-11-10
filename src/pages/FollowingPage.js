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

const FollowingPage = () => {
    // --- (LOGIC UNCHANGED) ---
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
    // --- (END LOGIC) ---

    return (
        // --- (FIX 1) Removed solid bg-gray-50 dark:bg-gray-900 ---
        <div className="w-full min-h-full p-4 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                
                <div className="lg:col-span-2">
                    <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Following</h1>
                    
                    {loading && <p className="text-gray-600 dark:text-gray-400">Loading...</p>}

                    {!loading && followingList.length === 0 && (
                        // --- (FIX 2) Made this a glass panel ---
                        <div className="glass-panel p-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                You aren't following anyone yet.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        {followingList.map(sub => (
                            // --- (FIX 3) Applied .glass-panel class ---
                            <div 
                                key={sub.$id} 
                                className="glass-panel flex items-center p-4"
                            >
                                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white text-xl font-bold">
                                    {(sub.followingUsername || '?').charAt(0).toUpperCase()}
                                </div>
                                <div className="ml-4">
                                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 block">{sub.followingUsername}</span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Description of Channel</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- Column 2: Image Banner --- */}
                <aside className="hidden lg:block lg:col-span-1">
                     {/* --- (FIX 4) Applied .glass-panel class --- */}
                    <div className="glass-panel h-full p-6 flex items-center justify-center">
                        <span className="text-gray-400 dark:text-gray-500">Banner</span>
                    </div>
                </aside>

            </div>
        </div>
    );
};

export default FollowingPage;