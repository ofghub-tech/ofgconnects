// src/components/Comments.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import {
    DATABASE_ID,
    COLLECTION_ID_COMMENTS
} from '../appwriteConfig';
import { ID, Permission, Role, Query } from 'appwrite';
import { useAuth } from '../context/AuthContext';

const Comments = ({ videoId }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [commentBody, setCommentBody] = useState('');
    const [loading, setLoading] = useState(true);

    // --- PAGINATION STATE ---
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastId, setLastId] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 5; // Fetch 5 comments at a time for testing

    // Initial fetch when videoId changes
    useEffect(() => {
        fetchComments(false);
    }, [videoId]);

    const fetchComments = async (isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            // 1. Base Queries: Always filter by THIS video, newest first, and limit items
            let queries = [
                Query.equal('videoId', videoId),
                Query.orderDesc('$createdAt'),
                Query.limit(ITEMS_PER_PAGE)
            ];

            // 2. If loading MORE, start AFTER the last comment we currently have
            if (isLoadMore && lastId) {
                queries.push(Query.cursorAfter(lastId));
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_COMMENTS,
                queries
            );

            if (isLoadMore) {
                // Append new comments to the end of the existing list
                setComments(prev => [...prev, ...response.documents]);
            } else {
                // First load (or refresh): replace the entire list
                setComments(response.documents);
            }

            // Check if we have reached the end
            setHasMore(response.documents.length === ITEMS_PER_PAGE);

            // Save the last ID for the next page
            if (response.documents.length > 0) {
                setLastId(response.documents[response.documents.length - 1].$id);
            }

        } catch (error) {
            console.error("Failed to fetch comments:", error);
        }

        setLoading(false);
        setLoadingMore(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!commentBody.trim() || !user) return;

        try {
            const payload = {
                content: commentBody,
                videoId: videoId,
                username: user.name,
                userId: user.$id
            };

            const response = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_COMMENTS,
                ID.unique(),
                payload,
                [
                    Permission.read(Role.any()),
                    Permission.update(Role.user(user.$id)),
                    Permission.delete(Role.user(user.$id))
                ]
            );

            // Success! Clear input and prepend the new comment instantly
            setCommentBody('');
            setComments(prev => [response, ...prev]);

        } catch (error) {
            console.error("Failed to post comment:", error);
        }
    };

    return (
        <div className="w-full text-neutral-900 dark:text-gray-100">

            <h3 className="mb-4 text-xl font-semibold dark:text-gray-100">
                Comments
            </h3>

            {/* --- Comment Form --- */}
            {user ? (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-start gap-3 mb-8">
                    <div className="w-9 h-9 bg-blue-600 rounded-full flex justify-center items-center text-lg font-bold text-white shrink-0 mt-1.5 hidden sm:flex">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <textarea
                        value={commentBody}
                        onChange={(e) => setCommentBody(e.target.value)}
                        placeholder="Add a public comment..."
                        rows="1"
                        className="flex-1 w-full p-3 h-12 min-h-[48px] max-h-32 bg-white text-neutral-900 placeholder:text-neutral-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-gray-600"
                    />
                    <button
                        type="submit"
                        disabled={!commentBody.trim()}
                        className="h-12 px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shrink-0"
                    >
                        Comment
                    </button>
                </form>
            ) : (
                <p className="mb-8 text-neutral-600 dark:text-gray-400">
                    Please <a href="/" className="text-blue-500 hover:underline dark:text-blue-400">log in</a> to post a comment.
                </p>
            )}

            {/* --- Comment List --- */}
            <div className="flex flex-col gap-6">
                {loading && (
                    <p className="text-neutral-500 dark:text-gray-400">Loading comments...</p>
                )}

                {!loading && comments.length === 0 && (
                    <p className="text-neutral-600 dark:text-gray-400">No comments yet. Be the first!</p>
                )}

                {comments.map(comment => (
                    <div key={comment.$id} className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-blue-600 rounded-full flex justify-center items-center text-lg font-bold text-white shrink-0">
                            {comment.username ? comment.username.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm text-neutral-800 dark:text-gray-300">
                                @{comment.username || 'Anonymous'}
                            </span>
                            <p className="text-base text-neutral-900 mt-1 whitespace-pre-wrap dark:text-gray-100">
                                {comment.content}
                            </p>
                        </div>
                    </div>
                ))}

                {/* --- Load More Button --- */}
                {!loading && hasMore && comments.length > 0 && (
                    <button
                        onClick={() => fetchComments(true)}
                        disabled={loadingMore}
                        className="self-start mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                    >
                        {loadingMore ? 'Loading...' : 'Load more comments'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Comments;