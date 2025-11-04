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
// import './FollowingPage.css'; // <-- REMOVED THIS LINE TO FIX THE ERROR

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
        // --- MODIFIED: Replaced custom class with Tailwind classes ---
        <div className="w-full min-h-full p-4 sm:p-8 bg-gray-50 dark:bg-gray-900">
            {/* --- MODIFIED: Added responsive grid and layout classes --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                
                {/* --- Column 1: Channel List --- */}
                {/* --- MODIFIED: Added responsive column span --- */}
                <div className="lg:col-span-2">
                    {/* --- MODIFIED: Replaced custom class with Tailwind --- */}
                    <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Following</h1>
                    
                    {/* --- MODIFIED: Added dark mode text --- */}
                    {loading && <p className="text-gray-600 dark:text-gray-400">Loading...</p>}

                    {!loading && followingList.length === 0 && (
                        // --- MODIFIED: Replaced custom class with Tailwind ---
                        <p className="text-gray-500 dark:text-gray-400">
                            You aren't following anyone yet.
                        </p>
                    )}

                    {/* --- MODIFIED: Replaced custom class with Tailwind --- */}
                    <div className="grid grid-cols-1 gap-4">
                        {followingList.map(sub => (
                            // --- MODIFIED: Replaced custom class with Tailwind ---
                            <div 
                                key={sub.$id} 
                                className="flex items-center p-4 bg-white rounded-lg shadow-sm dark:bg-gray-800"
                            >
                                {/* --- MODIFIED: Replaced custom class with Tailwind --- */}
                                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white text-xl font-bold">
                                    {/* ★ THE FIX IS HERE ★ */}
                                    {(sub.followingUsername || '?').charAt(0).toUpperCase()}
                                </div>
                                {/* --- MODIFIED: Replaced custom class with Tailwind --- */}
                                <div className="ml-4">
                                    {/* --- MODIFIED: Replaced custom class with Tailwind --- */}
                                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 block">{sub.followingUsername}</span>
                                    {/* --- MODIFIED: Replaced custom class with Tailwind --- */}
                                    <span className="text-sm text-gray-500 dark:text-gray-400 block">Description of Channel</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- Column 2: Image Banner --- */}
                {/* --- MODIFIED: Replaced custom class with Tailwind --- */}
                <aside className="hidden lg:block lg:col-span-1">
                    {/* Added a themed placeholder since the image is commented out */}
                    <div className="h-full bg-white rounded-lg shadow-sm dark:bg-gray-800 p-6 flex items-center justify-center">
                        <span className="text-gray-400 dark:text-gray-500">Banner</span>
                    </div>
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