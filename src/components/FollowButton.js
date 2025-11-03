// src/components/FollowButton.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { databases } from '../appwriteConfig';
import { 
    DATABASE_ID, 
    COLLECTION_ID_SUBSCRIPTIONS 
} from '../appwriteConfig';
import { ID, Permission, Role, Query } from 'appwrite';

const FollowButton = ({ creatorId, creatorName }) => {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [subscriptionId, setSubscriptionId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSubscription = async () => {
            if (!user || !creatorId || user.$id === creatorId) {
                setIsLoading(false);
                return;
            }
            
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_SUBSCRIPTIONS,
                    [
                        Query.equal('followerId', user.$id),
                        Query.equal('followingId', creatorId)
                    ]
                );

                if (response.total > 0) {
                    setIsFollowing(true);
                    setSubscriptionId(response.documents[0].$id);
                } else {
                    setIsFollowing(false);
                    setSubscriptionId(null);
                }
            } catch (error) {
                console.error("Failed to check subscription:", error);
            }
            setIsLoading(false);
        };

        checkSubscription();
    }, [user, creatorId]);

    const handleFollow = async () => {
        if (!user) {
             alert("Please log in to follow creators.");
             return;
        }
        try {
            const payload = {
                followerId: user.$id,
                followingId: creatorId,
                followingUsername: creatorName 
            };
            const response = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_SUBSCRIPTIONS,
                ID.unique(),
                payload,
                [
                    Permission.read(Role.user(user.$id)),
                    Permission.delete(Role.user(user.$id))
                ]
            );
            setIsFollowing(true);
            setSubscriptionId(response.$id);
        } catch (error) {
            console.error("Failed to follow:", error);
            alert(`Error on Follow: ${error.message}`); 
        }
    };

    const handleUnfollow = async () => {
        if (!user) {
             alert("Please log in.");
             return;
        }
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                COLLECTION_ID_SUBSCRIPTIONS,
                subscriptionId
            );
            setIsFollowing(false);
            setSubscriptionId(null);
        } catch (error) {
            console.error("Failed to unfollow:", error);
            alert(`Error on Unfollow: ${error.message}`);
        }
    };

    // --- UPDATED Tailwind Classes (per your screenshot) ---
    const followButtonClasses = `
        flex items-center justify-center
        py-2 px-4 h-9 rounded-full 
        font-medium text-sm
        transition-colors duration-200 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isFollowing 
            ? 'bg-gray-100 text-neutral-800 hover:bg-gray-200'  // Following state (light gray)
            : 'bg-neutral-900 text-white hover:bg-neutral-700' // Default state (solid black)
        }
    `;

    if (isLoading || !user || user.$id === creatorId) {
        return null; 
    }

    return (
        <button 
            className={followButtonClasses}
            onClick={isFollowing ? handleUnfollow : handleFollow}
            disabled={!user || isLoading} // Added isLoading to disabled state
        >
            {isFollowing ? 'Following' : 'Follow'}
        </button>
    );
};

export default FollowButton;