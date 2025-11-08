// src/components/Comments.js
import React, { useState, useEffect, useMemo } from 'react';
import { databases } from '../appwriteConfig';
import {
    DATABASE_ID,
    COLLECTION_ID_COMMENTS
} from '../appwriteConfig';
import { ID, Permission, Role, Query } from 'appwrite';
import { useAuth } from '../context/AuthContext';

// --- CommentForm Component ---
// This is a reusable form for both new comments and replies
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
                parent_id: parent_id, // This is the new attribute
            };

            const response = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_COMMENTS,
                ID.unique(), // <-- This is the fix. No quotes. It's a function call.
                payload,
                [
                    Permission.read(Role.any()),
                    Permission.update(Role.user(user.$id)),
                    Permission.delete(Role.user(user.$id))
                ]
            );

            setCommentBody('');
            onCommentPosted(response); // Send the new comment back to the parent
        } catch (error) {
            console.error("Failed to post comment:", error);
            alert(`Error: Could not post comment. \n\nDetails: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <p className="mb-4 text-neutral-600 dark:text-gray-400">
                Please <a href="/" className="text-blue-500 hover:underline dark:text-blue-400">log in</a> to comment.
            </p>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-start gap-3 mb-4">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex justify-center items-center text-lg font-bold text-white shrink-0 mt-1.5 hidden sm:flex">
                {user.name.charAt(0).toUpperCase()}
            </div>
            <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder={parent_id ? "Add a reply..." : "Add a public comment..."}
                rows="1"
                disabled={isSubmitting}
                className="flex-1 w-full p-3 h-12 min-h-[48px] max-h-32 bg-white text-neutral-900 placeholder:text-neutral-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400 dark:border-gray-600 disabled:opacity-50"
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

// --- CommentItem Component ---
// This renders a single comment and its replies
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
                        <CommentForm
                            videoId={videoId}
                            parent_id={comment.$id}
                            onCommentPosted={handleReplyPosted}
                        />
                    </div>
                )}

                {/* Render nested replies */}
                {replies.length > 0 && (
                    <div className="flex flex-col gap-6 mt-6 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                        {replies.map(reply => (
                            <CommentItem
                                key={reply.$id}
                                comment={reply}
                                replies={[]} // You can make this recursive later if you want
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

// --- Main Comments Component ---
const Comments = ({ videoId }) => {
    const [allComments, setAllComments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch all comments for the video
    const fetchAllComments = async () => {
        setLoading(true);
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_COMMENTS,
                [
                    Query.equal('videoId', videoId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(500) // Fetch all comments to build the tree
                ]
            );
            setAllComments(response.documents);
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAllComments();
    }, [videoId]);

    // Runs when any new comment (or reply) is posted
    const handleCommentPosted = (newComment) => {
        setAllComments(prev => [newComment, ...prev]);
    };

    // This organizes the flat list into a nested tree
    const nestedComments = useMemo(() => {
        const commentMap = {};
        const topLevelComments = [];

        for (const comment of allComments) {
            commentMap[comment.$id] = { ...comment, replies: [] };
        }

        for (const comment of Object.values(commentMap)) {
            if (comment.parent_id && commentMap[comment.parent_id]) {
                commentMap[comment.parent_id].replies.push(comment);
            } else {
                topLevelComments.push(comment);
            }
        }
        
        for(const comment of topLevelComments) {
            comment.replies.sort((a, b) => new Date(a.$createdAt) - new Date(b.$createdAt));
        }
        return topLevelComments;
    }, [allComments]);

    return (
        <div className="w-full text-neutral-900 dark:text-gray-100">
            <h3 className="mb-4 text-xl font-semibold dark:text-gray-100">
                {allComments.length} {allComments.length === 1 ? 'Comment' : 'Comments'}
            </h3>

            {/* Top-level comment form */}
            <CommentForm videoId={videoId} onCommentPosted={handleCommentPosted} />

            {/* Comment List */}
            <hr className="border-t border-gray-200 my-6 dark:border-gray-700" />
            <div className="flex flex-col gap-6">
                {loading && (
                    <p className="text-neutral-500 dark:text-gray-400">Loading comments...</p>
                )}

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
            </div>
        </div>
    );
};

export default Comments;