// src/components/SuggestedVideos.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import SuggestedVideoCard from './SuggestedVideoCard';

// Helper function to run a query
const fetchVideosByQuery = (queries) => {
    return databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID_VIDEOS,
        queries
    );
};

const SuggestedVideos = ({ currentVideo }) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentVideo) return;

        const fetchAllSuggestions = async () => {
            setLoading(true);
            
            // --- This is the new "Smart" Logic ---

            // 1. Priority 1: Get videos from the SAME CREATOR
            const creatorQuery = [
                Query.equal('userId', currentVideo.userId),
                Query.notEqual('$id', currentVideo.$id),
                Query.limit(5),
                Query.orderDesc('$createdAt')
            ];

            // 2. Priority 2: Get videos with MATCHING TAGS
            const tagsQuery = [
                Query.equal('tags', currentVideo.tags || []),
                Query.notEqual('$id', currentVideo.$id),
                Query.limit(10)
            ];

            // 3. Priority 3: Get videos in the SAME CATEGORY
            const categoryQuery = [
                Query.equal('category', currentVideo.category),
                Query.notEqual('$id', currentVideo.$id),
                Query.limit(10),
                Query.orderDesc('$createdAt')
            ];

            // --- 4. UPDATED: Priority 4 (Fallback) is now MOST POPULAR ---
            const popularQuery = [
                Query.notEqual('$id', currentVideo.$id),
                Query.limit(10),
                Query.orderDesc('likeCount') // <-- CHANGED from $createdAt
            ];

            try {
                // Run all queries in parallel
                const [
                    creatorVideos, 
                    tagVideos, 
                    categoryVideos, 
                    popularVideos // <-- CHANGED from newestVideos
                ] = await Promise.all([
                    fetchVideosByQuery(creatorQuery),
                    fetchVideosByQuery(tagsQuery),
                    fetchVideosByQuery(categoryQuery),
                    fetchVideosByQuery(popularQuery) // <-- CHANGED from newestQuery
                ]);

                // --- Combine results and remove duplicates ---
                const videoMap = new Map();
                
                const addVideos = (docs) => {
                    for (const vid of docs) {
                        if (!videoMap.has(vid.$id) && vid.$id !== currentVideo.$id) {
                            videoMap.set(vid.$id, vid);
                        }
                    }
                };
                
                addVideos(creatorVideos.documents);
                addVideos(tagVideos.documents);
                addVideos(categoryVideos.documents);
                addVideos(popularVideos.documents); // <-- CHANGED from newestVideos

                const finalSuggestions = Array.from(videoMap.values()).slice(0, 15);
                setVideos(finalSuggestions);

            } catch (error) {
                console.error("Failed to fetch suggested videos:", error);
            }
            setLoading(false);
        };

        fetchAllSuggestions();
    }, [currentVideo]); // Re-fetch if the main video changes

    return (
        <div className="bg-white rounded-lg sticky top-4">
            <h3 className="text-lg font-semibold mb-4 text-neutral-800">Next Up</h3>
            
            <div className="flex flex-col gap-3">
                {loading && (
                    <p className="text-xs text-neutral-500">Loading videos...</p>
                )}

                {!loading && videos.length === 0 && (
                    <p className="text-xs text-neutral-500">No other videos found.</p>
                )}

                {!loading && videos.map(video => (
                    <SuggestedVideoCard key={video.$id} video={video} />
                ))}
            </div>
        </div>
    );
};

export default SuggestedVideos;