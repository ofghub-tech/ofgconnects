// src/components/Comments.js
import React, { useState, useEffect, useMemo } from 'react';
import { databases } from '../appwriteConfig';
import {
    DATABASE_ID,
    COLLECTION_ID_COMMENTS
} from '../appwriteConfig';
import { ID, Permission, Role, Query } from 'appwrite';
import { useAuth } from '../context/AuthContext';

// --- CommentForm Component (MODIFIED) ---
const CommentForm = ({ videoId, parent_id = null, onCommentPosted }) => {
    const { user } = useAuth();
    const [commentBody, setCommentBody] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!commentBody.trim() || !user || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const payload = {
                content: commentBody,
                videoId: videoId,
                username: user.name,
                userId: user.$id,
                parent_id: parent_id,
            };
            const response = await databases.createDocument(
                DATABASE_ID, COLLECTION_ID_COMMENTS, ID.unique(), payload,
                [Permission.read(Role.any()), Permission.update(Role.user(user.$id)), Permission.delete(Role.user(user.$id))]
            );
            setCommentBody('');
            onCommentPosted(response);
        } catch (error) {
            console.error("Failed to post comment:", error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return <p className="mb-4 text-neutral-600 dark:text-gray-400">Please <a href="/" className="text-blue-500 hover:underline dark:text-blue-400">log in</a> to comment.</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-start gap-3 mb-4">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex justify-center items-center text-lg font-bold text-white shrink-0 mt-1.5 hidden sm:flex">
                {user.name.charAt(0).toUpperCase()}
            </div>
            {/* --- MODIFIED: Textarea is now semi-transparent --- */}
            <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder={parent_id ? "Add a reply..." : "Add a public comment..."}
                rows="1"
                disabled={isSubmitting}
                className="flex-1 w-full p-3 h-12 min-h-[48px] max-h-32 bg-white/50 text-neutral-900 placeholder:text-neutral-500 border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y dark:bg-gray-800/50 dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-gray-600/50 disabled:opacity-50"
            />
            <button
                type="submit"
                disabled={!commentBody.trim() || isSubmitting}
                className="h-12 px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shrink-0"
            >
                {isSubmitting ? 'Posting...' : (parent_id ? 'Reply' : 'Comment')}
            </button>
        </form>
    );
};

// --- CommentItem Component (MODIFIED) ---
const CommentItem = ({ comment, replies, videoId, onCommentPosted }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);

    const handleReplyPosted = (newReply) => {
        onCommentPosted(newReply);
        setShowReplyForm(false);
    };

    return (
        <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex justify-center items-center text-lg font-bold text-white shrink-0">
                {comment.username ? comment.username.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex flex-col flex-1">
                <span className="font-semibold text-sm text-neutral-800 dark:text-gray-300">
                    @{comment.username || 'Anonymous'}
                </span>
                <p className="text-base text-neutral-900 mt-1 whitespace-pre-wrap dark:text-gray-100">
                    {comment.content}
                </p>
                <button
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 self-start mt-2 hover:underline"
                >
                    {showReplyForm ? 'Cancel' : 'Reply'}
                </button>
                {showReplyForm && (
                    <div className="mt-4">
                        <CommentForm videoId={videoId} parent_id={comment.$id} onCommentPosted={handleReplyPosted} />
                    </div>
                )}
                {replies.length > 0 && (
                    // --- MODIFIED: Border is semi-transparent ---
                    <div className="flex flex-col gap-6 mt-6 pl-6 border-l-2 border-gray-200/50 dark:border-gray-700/50">
                        {replies.map(reply => (
                            <CommentItem
                                key={reply.$id}
                                comment={reply}
                                replies={[]}
                                videoId={videoId}
                                onCommentPosted={onCommentPosted}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Main Comments Component (MODIFIED) ---
const Comments = ({ videoId }) => {
    // --- Logic (Unchanged) ---
    const [allComments, setAllComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastId, setLastId] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const COMMENTS_PER_PAGE = 25;

    const fetchComments = async (isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }
        try {
            let queries = [
                Query.equal('videoId', videoId),
                Query.orderDesc('$createdAt'),
                Query.limit(COMMENTS_PER_PAGE)
            ];
            if (isLoadMore && lastId) {
                queries.push(Query.cursorAfter(lastId));
            }
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_COMMENTS,
                queries
            );
            if (isLoadMore) {
                setAllComments(prev => {
                    const existingIds = new Set(prev.map(c => c.$id));
                    const newUnique = response.documents.filter(doc => !existingIds.has(doc.$id));
                    return [...prev, ...newUnique];
                });
            } else {
                setAllComments(response.documents);
            }
            setHasMore(response.documents.length === COMMENTS_PER_PAGE);
            if (response.documents.length > 0) {
                setLastId(response.documents[response.documents.length - 1].$id);
            }
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        }
        setLoading(false);
        setLoadingMore(false);
    };

    useEffect(() => {
        fetchComments(false);
    }, [videoId]);

    const handleCommentPosted = (newComment) => {
        setAllComments(prev => [newComment, ...prev]);
    };

    const nestedComments = useMemo(() => {
        const commentMap = {};
        const topLevelComments = [];
        allComments.forEach(c => {
            commentMap[c.$id] = { ...c, replies: [] };
        });
        allComments.forEach(c => {
            if (c.parent_id && commentMap[c.parent_id]) {
                 commentMap[c.parent_id].replies.push(commentMap[c.$id]);
            } else if (!c.parent_id) {
                 topLevelComments.push(commentMap[c.$id]);
            }
        });
        topLevelComments.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));
        topLevelComments.forEach(c => c.replies.sort((a, b) => new Date(a.$createdAt) - new Date(b.$createdAt)));
        return topLevelComments;
    }, [allComments]);
    // --- End Logic ---

    return (
        <div className="w-full text-neutral-900 dark:text-gray-100">
            <h3 className="mb-4 text-xl font-semibold dark:text-gray-100">
                Comments
            </h3>

            <CommentForm videoId={videoId} onCommentPosted={handleCommentPosted} />

            {/* --- MODIFIED: Border is semi-transparent --- */}
            <hr className="border-t border-white/20 my-6 dark:border-gray-700/50" />

            <div className="flex flex-col gap-6">
                {loading && <p className="text-neutral-500 dark:text-gray-400">Loading comments...</p>}

                {!loading && nestedComments.length === 0 && (
                    <p className="text-neutral-600 dark:text-gray-400">No comments yet. Be the first!</p>
                )}

                {nestedComments.map(comment => (
                    <CommentItem
                        key={comment.$id}
                        comment={comment}
                        replies={comment.replies}
                        videoId={videoId}
                        onCommentPosted={handleCommentPosted}
                    />
                ))}

                {/* --- MODIFIED: Button is semi-transparent --- */}
                {hasMore && (
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => fetchComments(true)}
                            disabled={loadingMore}
                            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50/50 rounded-full hover:bg-blue-100/50 disabled:opacity-50 dark:bg-gray-800/50 dark:text-blue-400 dark:hover:bg-gray-700/50"
                        >
                            {loadingMore ? 'Loading...' : 'Load more comments'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Comments;