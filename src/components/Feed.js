// src/components/Feed.js
import React, { useEffect } from 'react';
import { databases, functions } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import VideoCard from './VideoCard';

const VIDEOS_PER_PAGE = 12;

const fetchVideos = async ({ pageParam = 0, queryKey }) => {
    const [, searchTerm, category] = queryKey;
    let queries = [];
    let videoIds = null;

    if (searchTerm) {
        try {
             // NOTE: Make sure this Function ID is correct for your project!
            const searchPayload = JSON.stringify({ searchQuery: searchTerm });
            const result = await functions.createExecution('690f37f2b6b6f9854983', searchPayload);
            const responseData = JSON.parse(result.response);
            videoIds = responseData.videoIds;

            if (!videoIds || videoIds.length === 0) return [];
            queries.push(Query.equal('$id', videoIds));
        } catch (e) {
            console.error("Search function failed:", e);
            return [];
        }
    } else {
        queries.push(Query.orderDesc('$createdAt'));
        if (category) {
            queries.push(Query.equal('category', category));
        }
    }

    queries.push(Query.limit(VIDEOS_PER_PAGE));
    queries.push(Query.offset(pageParam));

    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_VIDEOS, queries);

    if (searchTerm && videoIds) {
        response.documents.sort((a, b) => videoIds.indexOf(a.$id) - videoIds.indexOf(b.$id));
    }

    return response.documents;
};

const Feed = ({ searchTerm, category }) => {
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
        queryKey: ['videos', searchTerm, category],
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
        return (
             <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (status === 'error') {
        return <p className="p-6 text-center text-red-500">Error: {error.message}</p>;
    }

    const allVideos = data ? data.pages.flat() : [];

    return (
        <>
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {allVideos.length === 0 && !isFetching && (
                    <p className="col-span-full py-8 text-center text-lg text-gray-600 dark:text-gray-400">
                        {searchTerm ? `No results for "${searchTerm}"` : "No videos yet."}
                    </p>
                )}

                {data && data.pages.map((page, i) => (
                    <React.Fragment key={i}>
                        {page.map(video => <VideoCard key={video.$id} video={video} />)}
                    </React.Fragment>
                ))}
            </div>

            {/* Infinite Scroll Trigger & Feedback Area */}
            <div ref={ref} className="col-span-full py-6 text-center flex justify-center">
                {isFetchingNextPage ? (
                     <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        <span>Loading more...</span>
                    </div>
                ) : hasNextPage ? (
                    // Invisible trigger area when not loading but has more
                    <div className="h-10 w-full" />
                ) : allVideos.length > 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">You've reached the end.</p>
                ) : null}
            </div>
        </>
    );
};

export default Feed;