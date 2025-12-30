// src/components/SuggestedVideos.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import SuggestedVideoCard from './SuggestedVideoCard';

const fetchVideosByQuery = (queries) => {
    return databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID_VIDEOS,
        queries
    );
};

const SuggestedVideos = ({ currentVideo, forceCategory = null }) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentVideo) return;

        const fetchAllSuggestions = async () => {
            setLoading(true);
            
            // Queries (with your adminStatus check)
            const creatorQuery = [
                Query.equal('userId', currentVideo.userId),
                Query.equal('adminStatus', 'approved'),
                Query.notEqual('$id', currentVideo.$id),
                Query.limit(5),
                Query.orderDesc('$createdAt')
            ];
            const tagsQuery = [
                Query.equal('tags', currentVideo.tags || []),
                Query.equal('adminStatus', 'approved'),
                Query.notEqual('$id', currentVideo.$id),
                Query.limit(10)
            ];
            const categoryQuery = [
                Query.equal('category', currentVideo.category),
                Query.equal('adminStatus', 'approved'),
                Query.notEqual('$id', currentVideo.$id),
                Query.limit(10),
                Query.orderDesc('$createdAt')
            ];
            const popularQuery = [
                Query.equal('adminStatus', 'approved'),
                Query.notEqual('$id', currentVideo.$id),
                Query.limit(10),
                Query.orderDesc('likeCount')
            ];
            
            try {
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
                
                let finalSuggestions = Array.from(videoMap.values());
                if (forceCategory) {
                    finalSuggestions = finalSuggestions.filter(
                        video => video.category === forceCategory
                    );
                }
                setVideos(finalSuggestions.slice(0, 15));
            } catch (error) {
                console.error("Failed to fetch suggested videos:", error);
            }
            setLoading(false);
        };
        fetchAllSuggestions();
    }, [currentVideo, forceCategory]); 

    // --- THE FIX: Hide completely if done loading and no videos found ---
    if (!loading && videos.length === 0) {
        return null; 
    }

    return (
        <div className="glass-panel p-4 sticky top-20"> 
            <h3 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-gray-100">Next Up</h3>
            
            <div className="flex flex-col gap-3">
                {/* Skeleton Loading State (Optional visual upgrade) */}
                {loading && (
                    <div className="space-y-4 animate-pulse">
                        {[1,2,3].map(i => (
                            <div key={i} className="flex gap-2">
                                <div className="w-40 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && videos.map(video => (
                    <SuggestedVideoCard key={video.$id} video={video} />
                ))}
            </div>
        </div>
    );
};

export default SuggestedVideos;