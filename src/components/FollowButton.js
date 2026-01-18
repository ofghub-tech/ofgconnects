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
            // Safety Check: If we don't have a creatorId, we can't check anything.
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

        // 1. CRITICAL CHECK: Ensure we actually have an ID to follow
        if (!creatorId) {
            console.error("Error: creatorId (followingId) is missing!");
            alert("Cannot follow: User ID is missing.");
            return;
        }

        const validUsername = creatorName || "Unknown User";

        try {
            // 2. PAYLOAD: Explicitly mapping creatorId to followingId
            const payload = {
                followerId: user.$id,     // My ID
                followingId: creatorId,   // The ID of the person I'm following
                followingUsername: validUsername
            };
            
            console.log("Sending Follow Payload:", payload); // Debugging: Check console to see IDs

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

    const followButtonClasses = `
        flex items-center justify-center
        py-2 px-4 h-9 rounded-full 
        font-medium text-sm
        transition-all duration-200 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-lg backdrop-blur-2xl border
        hover:scale-105
        ${isFollowing 
            ? 'bg-gray-600/30 border-white/10 text-white' 
            : 'bg-white/90 border-white/20 text-black'
        }
    `;

    // Hide button if loading, no user, self-follow, OR if creatorId is missing
    if (isLoading || !user || user.$id === creatorId) {
        return null; 
    }

    return (
        <button 
            className={followButtonClasses}
            onClick={isFollowing ? handleUnfollow : handleFollow}
            // Disable button if creatorId is missing so you can't click it
            disabled={!user || isLoading || !creatorId}
        >
            {isFollowing ? 'Following' : 'Follow'}
        </button>
    );
};

export default FollowButton;