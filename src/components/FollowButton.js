// src/components/FollowButton.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { databases } from '../appwriteConfig';
import { 
    DATABASE_ID, 
    COLLECTION_ID_SUBSCRIPTIONS 
} from '../appwriteConfig';
import { ID, Permission, Role, Query } from 'appwrite';
import './FollowButton.css';

// 1. Accept the new 'creatorName' prop
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
                alert(`Error checking subscription: ${error.message}`);
            }
            setIsLoading(false);
        };

        checkSubscription();
    }, [user, creatorId]);

    const handleFollow = async () => {
        try {
            // 2. Add the creatorName to the payload
            const payload = {
                followerId: user.$id,
                followingId: creatorId,
                followingUsername: creatorName // <-- THIS IS THE NEW LINE
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

    if (isLoading || !user || user.$id === creatorId) {
        return null; 
    }

    return (
        <button 
            className={`follow-btn ${isFollowing ? 'following' : ''}`}
            onClick={isFollowing ? handleUnfollow : handleFollow}
        >
            {isFollowing ? 'Following' : 'Follow'}
        </button>
    );
};

export default FollowButton;