// src/appwriteConfig.js

import { Client, Account, Databases, Storage } from 'appwrite';

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
// --- ADD THIS NEW EXPORT ---
export const BUCKET_ID_THUMBNAILS = process.env.REACT_APP_BUCKET_ID_THUMBNAILS;