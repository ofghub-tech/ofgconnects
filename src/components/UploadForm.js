// src/components/UploadForm.js
import React, { useState } from 'react';
import { databases, storage } from '../appwriteConfig';
import { 
    DATABASE_ID, 
    COLLECTION_ID_VIDEOS, 
    BUCKET_ID_VIDEOS, 
    BUCKET_ID_THUMBNAILS 
} from '../appwriteConfig';
import { ID } from 'appwrite';
import { useAuth } from '../context/AuthContext';
import './UploadForm.css';

const UploadForm = ({ onUploadSuccess }) => {
    const { user } = useAuth(); // Get the current logged-in user
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !videoFile || !thumbnailFile) {
            alert('Please provide a Title, a Thumbnail, and a Video file.');
            return;
        }

        setUploading(true);

        try {
            // --- 1. UPLOAD THUMBNAIL ---
            console.log('Uploading thumbnail...');
            const thumbnailFileResponse = await storage.createFile(
                BUCKET_ID_THUMBNAILS,
                ID.unique(),
                thumbnailFile
            );
            const thumbnailFileId = thumbnailFileResponse.$id;
            console.log('Thumbnail uploaded:', thumbnailFileId);

            // --- 2. UPLOAD VIDEO ---
            console.log('Uploading video...');
            const videoFileResponse = await storage.createFile(
                BUCKET_ID_VIDEOS,
                ID.unique(),
                videoFile
            );
            const videoFileId = videoFileResponse.$id;
            console.log('Video uploaded:', videoFileId);

            // --- 3. CREATE THE DOCUMENT (Matching your attributes) ---
            console.log('Creating document in database...');
            const documentPayload = {
                title: title,
                description: description || null, // Send null if description is empty
                videoUrl: videoFileId,      // Storing the file ID
                thumbnailUrl: thumbnailFileId,  // Storing the file ID
                likeCount: 0,               // Initialize at 0
                commentCount: 0,            // Initialize at 0
                profiles: user.$id          // Link to the user's auth ID
            };

            const documentResponse = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                ID.unique(),
                documentPayload
            );

            console.log('Document created:', documentResponse);
            alert('Video uploaded successfully!');
            
            if (onUploadSuccess) {
                onUploadSuccess();
            }
            
            // Clear the form
            setTitle('');
            setDescription('');
            setVideoFile(null);
            setThumbnailFile(null);
            e.target.reset();

        } catch (error) {
            console.error('Upload failed:', error);
            alert(`Upload failed: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="upload-form">
            <h3>Upload a New Video</h3>
            
            <div className="form-group">
                <label>Title (required)</label>
                <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={uploading}
                />
            </div>
            
            <div className="form-group">
                <label>Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={uploading}
                />
            </div>
            
            <div className="form-group">
                <label>Thumbnail (Image, required)</label>
                <input 
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files[0])}
                    disabled={uploading}
                    className="file-input"
                />
            </div>

            <div className="form-group">
                <label>Video File (required)</label>
                <input 
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                    disabled={uploading}
                    className="file-input"
                />
            </div>

            <button type="submit" className="submit-btn" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </form>
    );
};

export default UploadForm;