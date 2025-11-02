// src/components/UploadForm.js
import React, { useState } from 'react';
import { databases, storage } from '../appwriteConfig';
import { 
    DATABASE_ID, 
    COLLECTION_ID_VIDEOS, 
    COLLECTION_ID_SHORTS, // 1. Import new Shorts collection ID
    BUCKET_ID_VIDEOS, 
    BUCKET_ID_THUMBNAILS,
    ENDPOINT,
    PROJECT_ID
} from '../appwriteConfig';
import { ID, Permission, Role } from 'appwrite';
import { useAuth } from '../context/AuthContext';
import './UploadForm.css';

const UploadForm = ({ onUploadSuccess }) => {
    const { user } = useAuth();
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // --- 2. New state for video detection ---
    const [isShort, setIsShort] = useState(false);
    const [isCheckingVideo, setIsCheckingVideo] = useState(false);

    // --- 3. New function to check video properties ---
    const handleVideoFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setVideoFile(null);
            setIsShort(false);
            return;
        }

        setVideoFile(file);
        setIsCheckingVideo(true);
        setIsShort(false); // Reset on new file

        // Load video metadata
        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src); // Clean up memory
            const duration = video.duration;
            const ratio = video.videoWidth / video.videoHeight;

            // Check: duration < 90s AND aspect ratio is ~9:16 (0.5625)
            // We'll allow a small range for the ratio, e.g., 0.5 to 0.6
            if (duration < 90 && ratio > 0.5 && ratio < 0.6) {
                console.log('Video detected as a Short!');
                setIsShort(true);
            } else {
                console.log('Video detected as a regular video.');
                setIsShort(false);
            }
            setIsCheckingVideo(false);
        };

        video.onerror = () => {
            console.error("Error loading video metadata.");
            setIsCheckingVideo(false);
        };

        video.src = URL.createObjectURL(file);
    };

    // --- 4. Updated handleSubmit logic ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if files are selected
        if (!videoFile) {
            alert('Please select a video file.');
            return;
        }
        if (!isShort && (!title || !thumbnailFile)) {
            alert('Please provide a Title and a Thumbnail for your video.');
            return;
        }

        setUploading(true);

        try {
            // --- 1. UPLOAD VIDEO (Common for both) ---
            console.log('Uploading video file...');
            const videoFileResponse = await storage.createFile(
                BUCKET_ID_VIDEOS, // Use the same bucket for all videos
                ID.unique(),
                videoFile,
                [Permission.read(Role.any())]
            );
            const videoFileId = videoFileResponse.$id;
            const videoUrlString = `${ENDPOINT}/storage/buckets/${BUCKET_ID_VIDEOS}/files/${videoFileId}/view?project=${PROJECT_ID}`;
            console.log('Video file uploaded:', videoFileId);

            // --- 2. DEFINE PAYLOAD & COLLECTION based on type ---
            let collectionId;
            let payload;

            if (isShort) {
                // --- UPLOAD AS SHORT ---
                collectionId = COLLECTION_ID_SHORTS;
                payload = {
                    videoUrl: videoUrlString,
                    userId: user.$id,
                    username: user.name,
                    likeCount: 0
                };
            } else {
                // --- UPLOAD AS REGULAR VIDEO ---
                // Upload thumbnail
                console.log('Uploading thumbnail file...');
                const thumbnailFileResponse = await storage.createFile(
                    BUCKET_ID_THUMBNAILS,
                    ID.unique(),
                    thumbnailFile,
                    [Permission.read(Role.any())]
                );
                const thumbnailFileId = thumbnailFileResponse.$id;
                const thumbnailUrlString = `${ENDPOINT}/storage/buckets/${BUCKET_ID_THUMBNAILS}/files/${thumbnailFileId}/view?project=${PROJECT_ID}`;

                collectionId = COLLECTION_ID_VIDEOS;
                payload = {
                    title: title,
                    description: description || null, 
                    videoUrl: videoUrlString,
                    thumbnailUrl: thumbnailUrlString,
                    likeCount: 0,              
                    commentCount: 0,
                    userId: user.$id,
                    username: user.name
                };
            }

            // --- 3. CREATE THE DOCUMENT ---
            console.log(`Creating document in ${collectionId}...`);
            await databases.createDocument(
                DATABASE_ID,
                collectionId,
                ID.unique(),
                payload,
                [Permission.read(Role.any())]
            );

            alert(`Video ${isShort ? 'Short' : ''} uploaded successfully!`);
            
            if (onUploadSuccess) {
                onUploadSuccess();
            }
            
            // Reset form
            setTitle('');
            setDescription('');
            setVideoFile(null);
            setThumbnailFile(null);
            setIsShort(false);
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
            
            {/* --- 5. Conditionally show fields --- */}
            
            {/* Title and Description are hidden for Shorts */}
            {!isShort && (
                <>
                    <div className="form-group">
                        <label>Title (required)</label>
                        <input 
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={uploading || isCheckingVideo}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={uploading || isCheckingVideo}
                        />
                    </div>
                </>
            )}
            
            {/* Thumbnail is hidden for Shorts */}
            {!isShort && (
                <div className="form-group">
                    <label>Thumbnail (Image, required)</label>
                    <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => setThumbnailFile(e.target.files[0])}
                        disabled={uploading || isCheckingVideo}
                        className="file-input"
                    />
                </div>
            )}

            <div className="form-group">
                <label>Video File (required)</label>
                <input 
                    type="file"
                    accept="video/*"
                    // 6. Use the new change handler
                    onChange={handleVideoFileChange}
                    disabled={uploading || isCheckingVideo}
                    className="file-input"
                />
            </div>
            
            {/* 7. Show messages based on detection */}
            {isCheckingVideo && <p>Checking video properties...</p>}
            {isShort && !isCheckingVideo && (
                <p style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    This video will be uploaded as a Short.
                </p>
            )}

            <button type="submit" className="submit-btn" disabled={uploading || isCheckingVideo}>
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </form>
    );
};

export default UploadForm;