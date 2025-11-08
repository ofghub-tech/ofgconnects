// src/appwriteConfig.js
import { Client, Account, Databases, Storage, } from 'appwrite';

export const client = new Client();

client
    .setEndpoint(process.env.REACT_APP_APPWRITE_ENDPOINT)
    .setProject(process.env.REACT_APP_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Export the IDs from the .env file
export const DATABASE_ID = process.env.REACT_APP_DATABASE_ID;
export const COLLECTION_ID_VIDEOS = process.env.REACT_APP_COLLECTION_ID_VIDEOS;
export const BUCKET_ID_VIDEOS = process.env.REACT_APP_BUCKET_ID_VIDEOS;
export const BUCKET_ID_THUMBNAILS = process.env.REACT_APP_BUCKET_ID_THUMBNAILS;

// This now correctly reads from your .env file
export const COLLECTION_ID_COMMENTS = process.env.REACT_APP_COLLECTION_ID_COMMENTS; 
export const COLLECTION_ID_SUBSCRIPTIONS = process.env.REACT_APP_COLLECTION_ID_SUBSCRIPTIONS; // ADD THIS LINE
export const COLLECTION_ID_LIKES = process.env.REACT_APP_COLLECTION_ID_LIKES; // ADD THIS LINE
export const COLLECTION_ID_VERSES = process.env.REACT_APP_COLLECTION_ID_VERSES;
export const COLLECTION_ID_HISTORY = process.env.REACT_APP_COLLECTION_ID_HISTORY;
export const COLLECTION_ID_NOTIFICATIONS = process.env.REACT_APP_COLLECTION_ID_NOTIFICATIONS;
// // Export the Endpoint and Project ID
export const ENDPOINT = process.env.REACT_APP_APPWRITE_ENDPOINT;
export const PROJECT_ID = process.env.REACT_APP_APPWRITE_PROJECT_ID;
// src/appwriteConfig.js (ADD THIS LINE)
export const COLLECTION_ID_WATCH_LATER = process.env.REACT_APP_COLLECTION_ID_WATCH_LATER; // <-- ADD THIS
