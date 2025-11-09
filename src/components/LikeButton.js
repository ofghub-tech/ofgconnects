// src/components/LikeButton.js
import React, { useState, useEffect, useCallback } from 'react';
import { databases } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import {
    DATABASE_ID,
    COLLECTION_ID_VIDEOS,
    COLLECTION_ID_LIKES
} from '../appwriteConfig';
import { ID, Query, Permission, Role } from 'appwrite';

const HeartIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);
const HeartIconSolid = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);

const LikeButton = ({ videoId, initialLikeCount }) => {
    const { user } = useAuth();
    
    const [likeCount, setLikeCount] = useState(initialLikeCount || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [likeDocId, setLikeDocId] = useState(null); 
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);

    useEffect(() => {
        setLikeCount(initialLikeCount || 0);
    }, [initialLikeCount]);

    // --- 1. FETCH TRUE STATE FROM SERVER ---
    const fetchLikeStatus = useCallback(async () => {
        if (!user || !videoId) return;
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_LIKES,
                [
                    Query.equal('userId', user.$id),
                    Query.equal('videoId', videoId),
                    Query.limit(1)
                ]
            );
            if (response.total > 0) {
                // Server says: LIKED
                setIsLiked(true);
                setLikeDocId(response.documents[0].$id);
                console.log("Sync: Video is LIKED on server.");
            } else {
                // Server says: NOT LIKED
                setIsLiked(false);
                setLikeDocId(null);
                console.log("Sync: Video is NOT LIKED on server.");
            }
        } catch (error) {
            console.error("Sync failed:", error);
        }
    }, [user, videoId]);

    useEffect(() => {
        if (!user || !videoId) {
            setIsLiked(false);
            setLikeDocId(null);
            setIsLoadingStatus(false);
            return;
        }
        setIsLoadingStatus(true);
        fetchLikeStatus().finally(() => setIsLoadingStatus(false));
    }, [user, videoId, fetchLikeStatus]);

    // --- 2. GET CURRENT COUNT HELPER ---
    const getVideoLikeCount = async () => {
        try {
            const videoDoc = await databases.getDocument(
                DATABASE_ID, COLLECTION_ID_VIDEOS, videoId
            );
            return videoDoc.likeCount || 0;
        } catch (e) {
            console.error("Could not get video doc for count:", e);
            throw e; 
        }
    };

    // --- 3. MAIN HANDLER ---
    const handleLike = async (e) => {
        e.stopPropagation();
        if (!user) return alert("Please log in to like videos.");
        if (isProcessing || isLoadingStatus) return;

        setIsProcessing(true);
        console.log("Starting like action... Current state:", isLiked ? "LIKED" : "UNLIKED");

        const prevIsLiked = isLiked;
        const prevLikeDocId = likeDocId;

        // Optimistic UI update
        if (prevIsLiked) {
            setIsLiked(false);
            setLikeDocId(null);
            setLikeCount(prev => Math.max(0, prev - 1));
        } else {
            setIsLiked(true);
            setLikeCount(prev => prev + 1);
        }

        try {
            let newVideoLikeCount;

            if (prevIsLiked) {
                // >>> UNLIKE <<<
                console.log("Attempting to UNLIKE on server...");
                if (!prevLikeDocId) throw new Error("Missing ID for unlike.");
                
                await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_LIKES, prevLikeDocId);
                console.log("UNLIKE success on server.");
                
                newVideoLikeCount = Math.max(0, (await getVideoLikeCount()) - 1);
            } else {
                // >>> LIKE <<<
                console.log("Attempting to LIKE on server...");
                const response = await databases.createDocument(
                    DATABASE_ID,
                    COLLECTION_ID_LIKES,
                    ID.unique(),
                    { userId: user.$id, videoId: videoId, type: 'like' },
                    [
                        Permission.read(Role.any()), // Changed to allow public read
                        Permission.write(Role.user(user.$id)) // Only YOU can delete your like
                    ]
                );
                console.log("LIKE success on server. New Doc ID:", response.$id);
                setLikeDocId(response.$id);
                newVideoLikeCount = (await getVideoLikeCount()) + 1;
            }

            // Update video count
            await databases.updateDocument(
                DATABASE_ID, COLLECTION_ID_VIDEOS, videoId,
                { likeCount: newVideoLikeCount }
            );

        } catch (error) {
            console.error("Like action failed:", error);

            // --- 4. ROBUST ERROR HANDLING ---
            if (error.code === 409) {
                console.warn("Conflict detected (already liked). forcing sync...");
            } else {
                // Only alert for genuine, non-conflict errors
                 alert(`Action failed: ${error.message}`);
            }
            
            // IMPORTANT: Force re-sync from server to ensure UI is correct.
            // This fixes the "rollback" issue by getting the absolute truth from the server.
            await fetchLikeStatus();
            // Also re-fetch the count just to be safe
            const trueCount = await getVideoLikeCount();
            setLikeCount(trueCount);
        }

        setIsProcessing(false);
    };

    const buttonClasses = `flex items-center justify-center gap-2 py-2 px-4 h-9 rounded-full font-medium text-sm transition-all duration-200 ease-in-out whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${isLiked ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900/80' : 'bg-gray-100 text-neutral-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'}`;

    return (
        <button
            className={buttonClasses}
            onClick={handleLike}
            disabled={isProcessing || isLoadingStatus}
            title={!user ? 'Log in to like' : (isLiked ? 'Unlike' : 'Like')}
        >
            {isLiked ? <HeartIconSolid className="h-5 w-5" /> : <HeartIcon className="h-5 w-5" />}
            {likeCount > 0 && <span>{likeCount.toLocaleString()}</span>}
        </button>
    );
};

export default LikeButton;