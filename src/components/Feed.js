import React, { useState, useEffect } from 'react';
import { databases, DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import VideoCard from './VideoCard';
import AdBanner from './AdBanner';
import { useInView } from 'react-intersection-observer';

const Feed = ({ searchTerm, category }) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastId, setLastId] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 12;

    const { ref, inView } = useInView({ threshold: 0.5 });

    const fetchVideos = async (isLoadMore = false) => {
        if (isLoadMore) setLoading(false);
        
        try {
            // Dynamic Query Logic
            let queries = [
                Query.orderDesc('$createdAt'),
                Query.limit(ITEMS_PER_PAGE),
                // --- FIX: Only show approved videos ---
                Query.equal('adminStatus', 'approved'), 
            ];

            // A. Category Filter
            if (category) {
                // If on Songs or Kids page, show ONLY that category
                queries.push(Query.equal('category', category)); 
            } else {
                // If on Home page (no category), show everything EXCEPT Shorts
                queries.push(Query.notEqual('category', 'shorts'));
            }

            // B. Search Filter
            if (searchTerm) {
                queries.push(Query.search('title', searchTerm));
            }

            // C. Pagination
            if (isLoadMore && lastId) {
                queries.push(Query.cursorAfter(lastId));
            }

            const response = await databases.listDocuments(
                DATABASE_ID, 
                COLLECTION_ID_VIDEOS, 
                queries
            );

            if (isLoadMore) {
                setVideos(prev => [...prev, ...response.documents]);
            } else {
                setVideos(response.documents);
            }

            if (response.documents.length < ITEMS_PER_PAGE) {
                setHasMore(false);
            }
            
            if (response.documents.length > 0) {
                setLastId(response.documents[response.documents.length - 1].$id);
            }

        } catch (error) {
            console.error("Failed to fetch feed:", error);
        } finally {
            setLoading(false);
        }
    };

    // Re-run when category or searchTerm changes
    useEffect(() => {
        setLoading(true);
        setVideos([]); // Clear old videos immediately
        setLastId(null);
        setHasMore(true);
        fetchVideos(false);
    }, [category, searchTerm]);

    useEffect(() => {
        if (inView && hasMore && !loading) {
            fetchVideos(true);
        }
    }, [inView, hasMore, loading]);

    const renderContentWithAds = () => {
        const items = [];
        videos.forEach((video, index) => {
            items.push(
                <div key={video.$id} className="w-full">
                    <VideoCard video={video} />
                </div>
            );

            if ((index + 1) % 6 === 0) {
                items.push(
                    <div key={`ad-${index}`} className="col-span-full">
                        <AdBanner slotId="8358319749" />
                    </div>
                );
            }
        });
        return items;
    };

    if (loading && videos.length === 0) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <AdBanner className="mb-8" slotId="YOUR_TOP_BANNER_SLOT_ID" />

            {/* Check if empty */}
            {videos.length === 0 && !loading ? (
                <div className="text-center text-gray-500 py-10">
                    No videos found in this category.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {renderContentWithAds()}
                </div>
            )}

            {hasMore && (
                <div ref={ref} className="flex justify-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
            )}
            
            {!hasMore && videos.length > 0 && (
                <div className="text-center py-10 text-gray-500">
                    You've reached the end!
                </div>
            )}
        </div>
    );
};

export default Feed;