// src/context/NotificationContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // ★ TYPO FIXED HERE ★
import { client, DATABASE_ID, COLLECTION_ID_SUBSCRIPTIONS } from '../appwriteConfig';

const NotificationContext = createContext();

export const useNotifications = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Don't subscribe if the user isn't logged in
        if (!user) return;

        // Appwrite channel to listen to
        // Format: 'databases.[DATABASE_ID].collections.[COLLECTION_ID].documents'
        const channel = `databases.${DATABASE_ID}.collections.${COLLECTION_ID_SUBSCRIPTIONS}.documents`;

        // Subscribe to the channel for new subscriptions
        const unsubscribe = client.subscribe(channel, (response) => {
            // Check if it's a 'create' event
            if (response.events.includes('databases.*.collections.*.documents.*.create')) {
                const newSub = response.payload;

                // Check if the current user is the one being followed
                if (newSub.followingId === user.$id) {
                    // Create a new notification
                    const newNotification = {
                        id: newSub.$id,
                        message: `${newSub.followerUsername || 'Someone'} just subscribed to you!`,
                        timestamp: new Date(),
                        read: false,
                    };

                    setNotifications((prev) => [newNotification, ...prev]);
                    setUnreadCount((prev) => prev + 1);
                }
            }
        });

        // Clean up the subscription on component unmount
        return () => {
            unsubscribe();
        };

    }, [user]);

    // Function to mark all as read
    const markAllAsRead = () => {
        setUnreadCount(0);
        setNotifications((prev) => 
            prev.map(notif => ({ ...notif, read: true }))
        );
    };

    const contextData = {
        notifications,
        unreadCount,
        markAllAsRead,
    };

    return (
        <NotificationContext.Provider value={contextData}>
            {children}
        </NotificationContext.Provider>
    );
};