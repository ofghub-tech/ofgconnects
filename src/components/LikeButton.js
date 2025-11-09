// src/components/LikeButton.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import {
    DATABASE_ID,
    COLLECTION_ID_VIDEOS,
    COLLECTION_ID_LIKES // Make sure this ID is in appwriteConfig.js
} from '../appwriteConfig';
import { ID, Query, Permission, Role } from 'appwrite';

// --- (Icons - No change) ---
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
// --- (End Icons) ---

const LikeButton = ({ videoId, initialLikeCount }) => {
    const { user } = useAuth();
    
    // States for UI
    const [likeCount, setLikeCount] = useState(initialLikeCount || 0);
    const [isLiked, setIsLiked] = useState(false);
    
    // States for logic
    const [likeDocId, setLikeDocId] = useState(null); 
    const [isProcessing, setIsProcessing] = useState(false);
    
    // --- (FIX 1) ---
    // Add loading state to prevent race condition
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);

    // Check if user has already liked this video
    useEffect(() => {
        if (!user || !videoId) {
            setIsLiked(false);
            setLikeDocId(null);
            setIsLoadingStatus(false); // Not logged in, so we're done loading
            return;
        }

        setIsLoadingStatus(true); // Start loading status
        const checkLikeStatus = async () => {
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
                console.error("Failed to check like status:", error);
                // Keep states as default (false, null)
            } finally {
                setIsLoadingStatus(false); // Done loading, allow clicks
            }
        };

        checkLikeStatus();
    }, [user, videoId]);

    // --- (FIX 2) ---
    // Simplified and corrected like/unlike logic
    const handleLike = async (e) => {
        e.stopPropagation(); // Prevents click-to-pause on shorts
        
        if (!user) {
            alert("Please log in to like videos.");
            return;
        }
        
        // Block clicks if we are already processing OR still loading the status
        if (isProcessing || isLoadingStatus) {
            return;
        }

        setIsProcessing(true);

        // Store the *current* state before changing it
        const currentlyLiked = isLiked;
        const currentLikeDocId = likeDocId;

        // --- Optimistic UI Update ---
        // Instantly update the UI, then try the server call.
        if (currentlyLiked) {
            // We are UNLIKING
            setIsLiked(false);
            setLikeDocId(null);
            setLikeCount(prev => prev - 1);
        } else {
            // We are LIKING
            setIsLiked(true);
            // We don't know the doc ID yet, will set it after create
            setLikeCount(prev => prev + 1);
        }

        try {
            let newVideoLikeCount;

            if (currentlyLiked) {
                // --- UNLIKE LOGIC ---
                if (currentLikeDocId) {
                    await databases.deleteDocument(
                        DATABASE_ID,
                        COLLECTION_ID_LIKES,
                        currentLikeDocId
                    );
                    newVideoLikeCount = Math.max(0, (await getVideoLikeCount()) - 1);
                } else {
                    throw new Error("Error: Trying to unlike but no likeDocId is set.");
                }

            } else {
                // --- LIKE LOGIC ---
                const response = await databases.createDocument(
                    DATABASE_ID,
                    COLLECTION_ID_LIKES,
                    ID.unique(),
                    {
                        userId: user.$id,
                        videoId: videoId
                    },
                    [
                        Permission.read(Role.user(user.$id)),
                        Permission.write(Role.user(user.$id))
                    ]
                );
                // Set the new doc ID in case they immediately unlike
                setLikeDocId(response.$id); 
                newVideoLikeCount = (await getVideoLikeCount()) + 1;
            }

            // Update the denormalized count on the video document
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                videoId,
                {
                    likeCount: newVideoLikeCount
                }
            );

        } catch (error) {
            console.error("Failed to update like:", error);
            
            // --- Rollback Optimistic UI Update ---
            // If the server call failed, revert the UI to its original state
            if (currentlyLiked) {
                // Failed to UNLIKE
                setIsLiked(true);
                setLikeDocId(currentLikeDocId);
                setLikeCount(prev => prev + 1);
            } else {
                // Failed to LIKE
                setIsLiked(false);
                setLikeDocId(null);
                setLikeCount(prev => prev - 1);
            }
            alert("Failed to update like. Please try again.");
        }

        setIsProcessing(false);
    };

    // Helper to get the most current count before updating
    const getVideoLikeCount = async () => {
        try {
            const videoDoc = await databases.getDocument(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                videoId
            );
            return videoDoc.likeCount || 0;
        } catch (e) {
            console.error("Could not get video doc for count:", e);
            return 0; // Fallback
        }
    };


    // --- (FIX 3) ---
    // Add `disabled` state based on loading or processing
    const buttonClasses = `
        flex items-center justify-center gap-2
        py-2 px-4 h-9 rounded-full
        font-medium text-sm
        transition-all duration-200 ease-in-out
        whitespace-nowrap
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isLiked
            ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900/80'
            : 'bg-gray-100 text-neutral-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
        }
    `;

    return (
        <button
            className={buttonClasses}
            onClick={handleLike}
            disabled={isProcessing || isLoadingStatus}
            title={!user ? 'Log in to like' : (isLiked ? 'Unlike' : 'Like')}
        >
            {isLiked
                ? <HeartIconSolid className="h-5 w-5" />
                : <HeartIcon className="h-5 w-5" />
            }
            {likeCount > 0 && <span>{likeCount}</span>}
        </button>
    );
};

export default LikeButton;