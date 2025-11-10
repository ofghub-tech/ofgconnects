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

// --- (ICONS UNCHANGED) ---
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
// --- (END ICONS) ---

const LikeButton = ({ videoId, initialLikeCount }) => {
    // --- (LOGIC UNCHANGED) ---
    const { user } = useAuth();
    
    const [likeCount, setLikeCount] = useState(initialLikeCount || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [likeDocId, setLikeDocId] = useState(null); 
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);

    useEffect(() => {
        setLikeCount(initialLikeCount || 0);
    }, [initialLikeCount]);

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
                setIsLiked(true);
                setLikeDocId(response.documents[0].$id);
            } else {
                setIsLiked(false);
                setLikeDocId(null);
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

    const handleLike = async (e) => {
        e.stopPropagation();
        if (!user) return alert("Please log in to like videos.");
        if (isProcessing || isLoadingStatus) return;

        setIsProcessing(true);
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
                // UNLIKE
                if (!prevLikeDocId) throw new Error("Missing ID for unlike.");
                
                await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_LIKES, prevLikeDocId);
                newVideoLikeCount = Math.max(0, (await getVideoLikeCount()) - 1);
            } else {
                // LIKE
                const response = await databases.createDocument(
                    DATABASE_ID,
                    COLLECTION_ID_LIKES,
                    ID.unique(),
                    { userId: user.$id, videoId: videoId, type: 'like' },
                    [
                        Permission.read(Role.any()),
                        Permission.write(Role.user(user.$id))
                    ]
                );
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
            if (error.code !== 409) {
                 alert(`Action failed: ${error.message}`);
            }
            
            // Force re-sync from server
            await fetchLikeStatus();
            const trueCount = await getVideoLikeCount();
            setLikeCount(trueCount);
        }
        setIsProcessing(false);
    };
    // --- (END LOGIC) ---

    // --- (FIX) Replaced solid backgrounds with glass panel styles ---
    const buttonClasses = `flex items-center justify-center gap-2 py-2 px-4 h-9 rounded-full font-medium text-sm transition-all duration-200 ease-in-out whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${isLiked 
        ? 'bg-red-100/70 backdrop-blur-2xl dark:bg-red-900/50 border border-red-200/50 dark:border-red-700/50 shadow-lg text-red-600 dark:text-red-400 hover:bg-red-100/90 dark:hover:bg-red-900/80' 
        : 'bg-white/70 backdrop-blur-2xl dark:bg-gray-600/50 border border-white/20 dark:border-white/10 shadow-lg text-neutral-800 dark:text-gray-100 hover:bg-white/90 dark:hover:bg-gray-600/80'
    }`;

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