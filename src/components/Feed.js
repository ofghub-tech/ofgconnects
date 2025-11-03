// src/components/Feed.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
// NO LONGER NEEDED: import './Feed.css';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

const VIDEOS_PER_PAGE = 12;

const fetchVideos = async ({ pageParam = 0, queryKey }) => {
    const [, searchTerm] = queryKey;
    
    let queries = [
        Query.orderDesc('$createdAt'),
        Query.limit(VIDEOS_PER_PAGE),
        Query.offset(pageParam)
    ];

    if (searchTerm) {
        queries.unshift(Query.search('title', searchTerm));
    }

    const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID_VIDEOS,
        queries 
    );
    
    return response.documents;
};

const Feed = ({ searchTerm }) => {
    const navigate = useNavigate();
    const { ref, inView } = useInView();

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['videos', searchTerm],
        queryFn: fetchVideos,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length === VIDEOS_PER_PAGE) {
                return allPages.length * VIDEOS_PER_PAGE;
            }
            return undefined;
        },
    });

    useEffect(() => {
        if (inView && hasNextPage && !isFetching) { 
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage, isFetching]); 

    
    if (status === 'loading') {
        return <p className="p-6 text-center text-gray-500">Loading videos...</p>
    }

    if (status === 'error') {
        return <p className="p-6 text-center text-red-500">Error fetching videos: {error.message}</p>
    }
    
    const allVideos = data ? data.pages.flat() : [];

    return (
        <>
            {/* Replaced 'feed-container' */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                
                {allVideos.length === 0 && !isFetching && (
                    // Replaced 'feed-empty-message'
                    <p className="col-span-full py-8 text-center text-lg text-gray-600">
                        {searchTerm 
                            ? `No results found for "${searchTerm}"` 
                            : "No videos yet. Be the first to upload!"}
                    </p>
                )}

                {data && data.pages.map((page, i) => (
                    <React.Fragment key={i}>
                        {page.map(video => (
                            // Replaced 'video-card'
                            <div 
                                key={video.$id} 
                                className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                                onClick={() => navigate(`/watch/${video.$id}`)}
                            >
                                {/* Replaced 'video-thumbnail' */}
                                <div className="relative w-full overflow-hidden bg-gray-200 aspect-video">
                                    {(typeof video.thumbnailUrl === 'string' && video.thumbnailUrl) ? (
                                        <img 
                                            src={video.thumbnailUrl} 
                                            alt={video.title} 
                                            className="absolute h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        // Replaced 'video-thumbnail-placeholder'
                                        <div className="absolute flex h-full w-full items-center justify-center p-4 text-center text-sm text-gray-500">
                                            <p>Thumbnail for "{video.title}"</p>
                                        </div>
                                    )}
                                </div>
                                {/* Replaced 'video-info' */}
                                <div className="p-4">
                                    <h3 className="truncate text-lg font-semibold text-gray-900" title={video.title}>
                                        {video.title}
                                    </h3>
                                    {/* Replaced 'video-description' */}
                                    <p className="mt-1 text-sm text-gray-600">
                                        By: {video.username || '...'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </React.Fragment>
                ))}

                {/* Replaced 'feed-load-more' */}
                <div className="col-span-full py-6 text-center">
                    <button
                        ref={ref}
                        onClick={() => fetchNextPage()}
                        disabled={!hasNextPage || isFetchingNextPage}
                        className="rounded-md bg-gray-100 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                    >
                        {isFetchingNextPage
                            ? 'Loading more...'
                            : hasNextPage
                            ? 'Load More'
                            : 'Nothing more to load'}
                    </button>
                </div>
            </div>
        </>
    );
};

export default Feed;