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

// --- MODIFIED: Component now accepts 'forceCategory' ---
const SuggestedVideos = ({ currentVideo, forceCategory = null }) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentVideo) return;

        const fetchAllSuggestions = async () => {
            setLoading(true);
            
            // --- Logic is UNCHANGED ---
            // We fetch all related videos regardless of category first,
            // to respect the priority (creator, tags, etc.)

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

            // 4. Priority 4 (Fallback): Most POPULAR
            const popularQuery = [
                Query.notEqual('$id', currentVideo.$id),
                Query.limit(10),
                Query.orderDesc('likeCount')
            ];

            try {
                // Run all queries
                const [
                    creatorVideos, 
                    tagVideos, 
                    categoryVideos, 
                    popularVideos
                ] = await Promise.all([
                    fetchVideosByQuery(creatorQuery),
                    fetchVideosByQuery(tagsQuery),
                    fetchVideosByQuery(categoryQuery),
                    fetchVideosByQuery(popularQuery)
                ]);

                // --- Combine results and remove duplicates (UNCHANGED) ---
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
                addVideos(popularVideos.documents);

                // --- THIS IS THE NEW FIX ---
                let finalSuggestions = Array.from(videoMap.values());

                // If 'forceCategory' is passed (e.g., "songs"),
                // we filter the final list.
                // If it's 'null' (the main watch page), this is skipped.
                if (forceCategory) {
                    finalSuggestions = finalSuggestions.filter(
                        video => video.category === forceCategory
                    );
                }
                // --- END OF FIX ---

                setVideos(finalSuggestions.slice(0, 15));

            } catch (error) {
                console.error("Failed to fetch suggested videos:", error);
            }
            setLoading(false);
        };

        fetchAllSuggestions();
    // --- MODIFIED: Re-fetch if forceCategory changes ---
    }, [currentVideo, forceCategory]); 

    return (
        // --- MODIFIED: Added dark mode classes ---
        <div className="bg-white rounded-lg sticky top-4 dark:bg-gray-900">
            {/* --- MODIFIED: Added dark mode classes --- */}
            <h3 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-gray-100">Next Up</h3>
            
            <div className="flex flex-col gap-3">
                {/* --- MODIFIED: Added dark mode classes --- */}
                {loading && (
                    <p className="text-xs text-neutral-500 dark:text-gray-400">Loading videos...</p>
                )}

                {/* --- MODIFIED: Added dark mode classes --- */}
                {!loading && videos.length === 0 && (
                    <p className="text-xs text-neutral-500 dark:text-gray-400">
                        {forceCategory 
                            ? `No other ${forceCategory} found.` 
                            : "No other videos found."}
                    </p>
                )}

                {!loading && videos.map(video => (
                    <SuggestedVideoCard key={video.$id} video={video} />
                ))}
            </div>
        </div>
    );
};

export default SuggestedVideos;