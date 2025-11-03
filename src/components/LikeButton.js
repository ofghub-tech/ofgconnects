// src/components/LikeButton.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import { 
    DATABASE_ID, 
    COLLECTION_ID_LIKES, 
    COLLECTION_ID_VIDEOS 
} from '../appwriteConfig';
import { ID, Permission, Role, Query } from 'appwrite';
import './LikeButton.css';

const LikeButton = ({ videoId, initialLikeCount }) => {
    const { user } = useAuth();
    // userHasLiked is now a simple boolean
    const [userHasLiked, setUserHasLiked] = useState(false); 
    const [likeCount, setLikeCount] = useState(initialLikeCount);

    // 1. Check User's existing like status
    useEffect(() => {
        const checkUserLike = async () => {
            if (!user) return;

            try {
                // Check for ANY document where userId and videoId match
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_LIKES,
                    [
                        Query.equal('videoId', videoId),
                        Query.equal('userId', user.$id),
                        Query.limit(1)
                    ]
                );
                
                // If a document exists, the user has liked it (type no longer matters)
                setUserHasLiked(response.total > 0);
            } catch (error) {
                console.error("Error checking like status:", error);
            }
        };
        checkUserLike();
    }, [user, videoId]);

    // 2. Logic to update the count on the main video document
    const updateVideoCount = async (delta) => {
        try {
            const videoDoc = await databases.getDocument(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                videoId
            );
            
            // Calculate new count
            const newCount = Math.max(0, videoDoc.likeCount + delta);

            await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                videoId,
                { likeCount: newCount }
            );
            setLikeCount(newCount);
        } catch (error) {
            console.error("Error updating video count:", error);
        }
    };

    // 3. Main Handler: Toggle Like/Unlike
    const handleAction = async () => {
        if (!user) {
            alert("Please log in to like videos!");
            return;
        }

        try {
            const existingLikeDoc = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_LIKES,
                [
                    Query.equal('videoId', videoId),
                    Query.equal('userId', user.$id),
                    Query.limit(1)
                ]
            );
            const docId = existingLikeDoc.total > 0 ? existingLikeDoc.documents[0].$id : null;

            if (userHasLiked && docId) {
                // Scenario 1: User UNLIKES (Delete the record)
                await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_LIKES, docId);
                setUserHasLiked(false);
                updateVideoCount(-1); // Decrement count
                
            } else {
                // Scenario 2: User LIKES (Create the record)
                // Note: We include 'type: like' just to satisfy the database attribute, even though it's not used.
                await databases.createDocument(
                    DATABASE_ID, COLLECTION_ID_LIKES, ID.unique(), 
                    { videoId, userId: user.$id, type: 'like' },
                    [Permission.read(Role.any()), Permission.delete(Role.user(user.$id))]
                );
                
                setUserHasLiked(true);
                updateVideoCount(1); // Increment count
            }

        } catch (error) {
            console.error("Failed to process like action:", error);
            // This alert is crucial for debugging Appwrite errors
            alert(`Error: ${error.message}`); 
        }
    };

    return (
        <div className="like-group">
            <button 
                className={`like-btn ${userHasLiked ? 'active' : ''}`}
                onClick={handleAction}
                disabled={!user}
            >
                👍 {likeCount}
            </button>
        </div>
    );
};

export default LikeButton;