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

    useEffect(() => {
        getComments();
    }, [videoId]); // Re-fetch if videoId changes

    const getComments = async () => {
        setLoading(true);
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_COMMENTS,
                [
                    Query.equal('videoId', videoId), // Use the index
                    Query.orderDesc('$createdAt')    // Fetch newest comments first
                ]
            );
            setComments(response.documents);
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!commentBody.trim() || !user) return; 

        try {
            const payload = {
                content: commentBody,
                videoId: videoId,
                username: user.name,
                userId: user.$id // Store the user's ID
            };

            await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_COMMENTS,
                ID.unique(),
                payload,
                [
                    Permission.read(Role.any()),
                    Permission.update(Role.user(user.$id)), // Author can update
                    Permission.delete(Role.user(user.$id))  // Author can delete
                ]
            );

            setCommentBody(''); 
            getComments(); // Refresh the comment list

        } catch (error) {
            console.error("Failed to post comment:", error);
        }
    };

    return (
        // --- MODIFIED: Added dark mode text ---
        <div className="w-full text-neutral-900 dark:text-gray-100">
            
            {/* --- MODIFIED: Added dark mode text --- */}
            <h3 className="mb-4 text-xl font-semibold dark:text-gray-100">
                {comments.length} Comments
            </h3>
            
            {user ? (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-start gap-3 mb-8">
                    {/* Avatar for current user */}
                    <div className="w-9 h-9 bg-blue-600 rounded-full flex justify-center items-center text-lg font-bold text-white shrink-0 mt-1.5 hidden sm:flex">
                        {user.name.charAt(0).toUpperCase()}
                    </div>

                    {/* --- UPDATED: Added dark mode classes --- */}
                    <textarea
                        value={commentBody}
                        onChange={(e) => setCommentBody(e.target.value)}
                        placeholder="Add a public comment..."
                        rows="1"
                        className="
                            flex-1 w-full p-3 h-12 min-h-[48px] max-h-32
                            bg-white text-neutral-900 placeholder:text-neutral-500
                            border border-gray-300 rounded-lg
                            focus:outline-none focus:ring-2 focus:ring-blue-500
                            resize-y
                            dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400
                            dark:border-gray-600
                        "
                    />
                    
                    {/* --- Green button (looks fine on dark mode) --- */}
                    <button 
                        type="submit"
                        disabled={!commentBody.trim()}
                        className="
                            h-12 px-6 py-2 rounded-lg 
                            bg-green-600 text-white font-medium
                            hover:bg-green-700
                            transition-colors duration-200
                            disabled:bg-gray-400 disabled:cursor-not-allowed
                            shrink-0
                        "
                    >
                        Comment
                    </button>
                </form>
            ) : (
                // --- MODIFIED: Added dark mode classes ---
                <p className="mb-8 text-neutral-600 dark:text-gray-400">
                    Please <a href="/login" className="text-blue-500 hover:underline dark:text-blue-400">log in</a> to post a comment.
                </p>
            )}


            {/* --- Light theme comment list --- */}
            <div className="flex flex-col gap-6">
                {/* --- MODIFIED: Added dark mode classes --- */}
                {loading && (
                    <p className="text-neutral-500 dark:text-gray-400">Loading comments...</p>
                )}
                
                {/* --- MODIFIED: Added dark mode classes --- */}
                {!loading && comments.length === 0 && (
                    <p className="text-neutral-600 dark:text-gray-400">No comments yet.</p>
                )}
                
                {!loading && comments.map(comment => (
                    <div key={comment.$id} className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-blue-600 rounded-full flex justify-center items-center text-lg font-bold text-white shrink-0">
                            {comment.username ? comment.username.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="flex flex-col">
                            {/* --- MODIFIED: Added dark mode classes --- */}
                            <span className="font-semibold text-sm text-neutral-800 dark:text-gray-300">
                                @{comment.username || 'Anonymous'}
                            </span>
                            {/* --- MODIFIED: Added dark mode classes --- */}
                            <p className="text-base text-neutral-900 mt-1 whitespace-pre-wrap dark:text-gray-100">
                                {comment.content}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Comments;