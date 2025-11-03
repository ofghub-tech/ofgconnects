// src/components/Feed.js
import React, { useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import VideoCard from './VideoCard'; // Import reusable component

const VIDEOS_PER_PAGE = 12;

const fetchVideos = async ({ pageParam = 0, queryKey }) => {
    const [, searchTerm] = queryKey;
    
    let queries = [
        // --- THIS IS THE NEW LINE ---
        // This query ensures we ONLY get "general" videos for the main feed
        Query.equal('category', 'general'), 
        // --- END NEW LINE ---
        Query.orderDesc('$createdAt'),
        Query.limit(VIDEOS_PER_PAGE),
        Query.offset(pageParam)
    ];

    if (searchTerm) {
        // Add search on top of the other queries
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
        if (inView && hasNextPage && !isFetchingNextPage) { 
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]); 

    
    if (status === 'loading') {
        return <p className="p-6 text-center text-gray-500">Loading videos...</p>
    }

    if (status === 'error') {
        return <p className="p-6 text-center text-red-500">Error fetching videos: {error.message}</p>
    }
    
    const allVideos = data ? data.pages.flat() : [];

    return (
        <>
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                
                {allVideos.length === 0 && !isFetching && (
                    <p className="col-span-full py-8 text-center text-lg text-gray-600">
                        {searchTerm 
                            ? `No results found for "${searchTerm}"` 
                            : "No videos yet. Be the first to upload!"}
                    </p>
                )}

                {data && data.pages.map((page, i) => (
                    <React.Fragment key={i}>
                        {page.map(video => (
                            <VideoCard key={video.$id} video={video} />
                        ))}
                    </React.Fragment>
                ))}

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