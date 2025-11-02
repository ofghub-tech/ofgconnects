// src/components/Comments.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { 
    DATABASE_ID, 
    COLLECTION_ID_COMMENTS 
} from '../appwriteConfig';
import { ID, Permission, Role, Query } from 'appwrite'; // 1. Import Query
import { useAuth } from '../context/AuthContext';
import './Comments.css';

const Comments = ({ videoId }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [commentBody, setCommentBody] = useState('');

    useEffect(() => {
        getComments();
    }, [videoId]); // Re-fetch if videoId changes

    const getComments = async () => {
        try {
            // 2. This is the updated, efficient query
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_COMMENTS,
                [
                    Query.equal('videoId', videoId) // Use the index
                ]
            );
            // 3. No more client-side filtering needed!
            setComments(response.documents);
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!commentBody.trim()) return; 

        try {
            const payload = {
                content: commentBody,
                videoId: videoId,
                username: user.name
            };

            await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_COMMENTS,
                ID.unique(),
                payload,
                [
                    Permission.read(Role.any()) 
                ]
            );

            setCommentBody(''); 
            getComments(); // Refresh the comment list

        } catch (error) {
            console.error("Failed to post comment:", error);
        }
    };

    return (
        <div className="comments-section">
            <h3>Comments</h3>
            
            <form onSubmit={handleSubmit} className="comment-form">
                <textarea
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder="Add a public comment..."
                    rows="3"
                />
                <button type="submit">Comment</button>
            </form>

            <div className="comment-list">
                {comments.length === 0 && <p>No comments yet.</p>}
                
                {/* 4. Let's show newest comments first */}
                {comments.slice(0).reverse().map(comment => (
                    <div key={comment.$id} className="comment-item">
                        <strong>{comment.username}</strong>
                        <p>{comment.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Comments;