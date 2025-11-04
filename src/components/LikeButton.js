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

// --- Icon Components ---
const ThumbsUpIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        {/* Using a more standard YouTube-like icon path */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.166 1.679a.75.75 0 01-.05 1.018l-3.226 3.226a2.625 2.625 0 01-1.002 1.002l-3.226 3.226a.75.75 0 01-1.018-.05A2.25 2.25 0 0116.5 19.5v-1.5a.75.75 0 00-.75-.75H3.75a.75.75 0 01-.75-.75V11.25a.75.75 0 01.75-.75h2.883z" />
    </svg>
);

// --- NEW: Solid Icon for 'Liked' state ---
const ThumbsUpIconSolid = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.561-3.4.1.5-4.996a.75.75 0 01-.5-1.05A2.25 2.25 0 0111.25 1.5H12a2.25 2.25 0 012.25 2.25v.193c.254.06.51.138.764.23l3.53-3.53a.75.75 0 011.06 1.06l-3.53 3.53c.093.254.17.51.23.764h.193a2.25 2.25 0 012.25 2.25c0 1.75-.561 3.4-.1.5-4.996.118-1.042.3-1.528.48A7.48 7.48 0 0112 15.375c-1.75 0-3.4-.561-4.996-1.528-.18-.118-.3-.362-.48-.1.042l-2.072 2.072a.75.75 0 01-1.06-.001l-1.5-1.5a.75.75 0 01.001-1.06l2.072-2.072c.118-.18.362-.3.1.042-.48.118-4.996-1.528-1.5-4.996a7.48 7.48 0 01-1.528-4.996.75.75 0 01-.632-.975c.196-.403.68-.632 1.098-.632H7.5c.418 0 .804.22.975.632.18.362.3.1.042.48.118 4.996-1.528 1.5-4.996 4.996a7.48 7.48 0 01-1.528 4.996.75.75 0 01-.975.632H7.493z" />
    </svg>
);
// --- REMOVED: ThumbsDownIcon ---


const LikeButton = ({ videoId, initialLikeCount }) => {
    const { user } = useAuth();
    const [userAction, setUserAction] = useState(null); // 'like' or null
    const [likeDocId, setLikeDocId] = useState(null);
    const [likeCount, setLikeCount] = useState(initialLikeCount);

    useEffect(() => {
        const checkUserLike = async () => {
            if (!user) return;
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_LIKES,
                    [
                        Query.equal('videoId', videoId),
                        Query.equal('userId', user.$id),
                        Query.limit(1)
                    ]
                );
                if (response.total > 0) {
                    // We only care about 'like' type
                    if (response.documents[0].type === 'like') {
                        setUserAction('like'); 
                        setLikeDocId(response.documents[0].$id);
                    }
                } else {
                    setUserAction(null);
                    setLikeDocId(null);
                }
            } catch (error) {
                console.error("Error checking like status:", error);
            }
        };
        checkUserLike();
    }, [user, videoId]);

    const updateVideoCount = async (delta) => {
        try {
            const videoDoc = await databases.getDocument(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                videoId
            );
            const newCount = Math.max(0, (videoDoc.likeCount || 0) + delta);
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

    const handleLike = async () => {
        if (!user) {
            alert("Please log in to like videos!");
            return;
        }

        try {
            if (userAction === 'like' && likeDocId) {
                // --- UNLIKE ---
                await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_LIKES, likeDocId);
                setUserAction(null);
                setLikeDocId(null);
                updateVideoCount(-1);
            } else if (userAction === null) {
                // --- LIKE ---
                const payload = { videoId, userId: user.$id, type: 'like' };
                const response = await databases.createDocument(
                    DATABASE_ID, COLLECTION_ID_LIKES, ID.unique(), 
                    payload,
                    [Permission.read(Role.any()), Permission.delete(Role.user(user.$id))]
                );
                setUserAction('like');
                setLikeDocId(response.$id);
                updateVideoCount(1);
            }
        } catch (error) {
            console.error("Failed to process like action:", error);
            alert(`Error: ${error.message}`);
        }
    };
    
    // --- REMOVED: handleDislike ---

    // --- UPDATED Tailwind Classes (with dark mode) ---
    const likeButtonClasses = `
        flex items-center justify-center gap-2
        py-2 px-4 h-9 rounded-full 
        font-medium text-sm text-neutral-800
        bg-gray-100 hover:bg-gray-200
        dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600
        transition-colors duration-200 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${userAction === 'like' ? 'bg-gray-200 dark:bg-gray-600' : ''} 
    `;
    
    // --- REMOVED: dislikeButtonClasses ---

    return (
        // --- UPDATED: No longer a button group ---
        <button 
            className={likeButtonClasses}
            onClick={handleLike}
            disabled={!user}
        >
            {userAction === 'like' 
                ? <ThumbsUpIconSolid className="h-5 w-5" />
                : <ThumbsUpIcon className="h-5 w-5" />
            }
            <span>{likeCount}</span>
        </button>
        // --- REMOVED: Dislike button ---
    );
};

export default LikeButton;