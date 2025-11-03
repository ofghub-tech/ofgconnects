// src/components/UploadForm.js
import React, { useState } from 'react';
import { databases, storage } from '../appwriteConfig';
import { 
    DATABASE_ID, 
    COLLECTION_ID_VIDEOS, 
    COLLECTION_ID_SHORTS, 
    BUCKET_ID_VIDEOS, 
    BUCKET_ID_THUMBNAILS,
    ENDPOINT,
    PROJECT_ID
} from '../appwriteConfig';
import { ID, Permission, Role } from 'appwrite';
import { useAuth } from '../context/AuthContext';
// NO LONGER NEEDED: import './UploadForm.css';

// ★ Renamed prop from 'onUploadSuccess' to 'onCloseModal' to match Header.js
const UploadForm = ({ onCloseModal }) => {
    const { user } = useAuth();
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('General'); 
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [isShort, setIsShort] = useState(false);
    const [isCheckingVideo, setIsCheckingVideo] = useState(false);

    // --- Tailwind Class Definitions ---
    // Defined here to keep the JSX clean (DRY principle)
    
    // Base classes for text inputs, textareas, and selects
    const inputBaseClasses = "w-full p-3 rounded border border-gray-600 bg-[#3a3a3a] text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";
    
    // Specific classes for file inputs, which are styled differently
    const fileInputClasses = "w-full rounded border border-gray-600 bg-[#3a3a3a] text-sm text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded-l file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-gray-200 hover:file:bg-gray-500";
    
    // --- End of Class Definitions ---


    const handleVideoFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setVideoFile(null);
            setIsShort(false);
            return;
        }

        setVideoFile(file);
        setIsCheckingVideo(true);
        setIsShort(false); 

        const video = document.createElement('video');
        video.preload = 'metadata';

        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            const duration = video.duration;
            const ratio = video.videoWidth / video.videoHeight;

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

    const handleSubmit = async (e) => {
        e.preventDefault();

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
            const videoFileResponse = await storage.createFile(
                BUCKET_ID_VIDEOS, 
                ID.unique(),
                videoFile,
                [Permission.read(Role.any())]
            );
            const videoFileId = videoFileResponse.$id;
            const videoUrlString = `${ENDPOINT}/storage/buckets/${BUCKET_ID_VIDEOS}/files/${videoFileId}/view?project=${PROJECT_ID}`;

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
                    category: category,
                    videoUrl: videoUrlString,
                    thumbnailUrl: thumbnailUrlString,
                    likeCount: 0,           
                    commentCount: 0,
                    userId: user.$id,
                    username: user.name
                };
            }

            // --- 3. CREATE THE DOCUMENT ---
            await databases.createDocument(
                DATABASE_ID,
                collectionId,
                ID.unique(),
                payload,
                [Permission.read(Role.any())]
            );

            alert(`Video ${isShort ? 'Short' : ''} uploaded successfully!`);
            
            // ★ Use the correct prop to close the modal
            if (onCloseModal) {
                onCloseModal();
            }
            
            // Reset form
            setTitle('');
            setDescription('');
            setCategory('General');
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
        // .upload-form
        <form onSubmit={handleSubmit} className="w-full">
            
            {/* .upload-form h3 */}
            <h3 className="text-center mb-6 text-2xl font-semibold text-white">
                Upload a New Video
            </h3>
            
            {/* Title, Description, and Category are only for regular videos */}
            {!isShort && (
                <>
                    {/* .form-group */}
                    <div className="mb-4">
                        {/* .form-group label */}
                        <label className="block mb-2 text-sm font-semibold text-gray-400">
                            Title (required)
                        </label>
                        <input 
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={uploading || isCheckingVideo}
                            className={inputBaseClasses}
                        />
                    </div>
                    
                    {/* .form-group */}
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-semibold text-gray-400">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            disabled={uploading || isCheckingVideo}
                            className={inputBaseClasses}
                        >
                            <option value="General">General</option>
                            <option value="Songs">Songs</option>
                            <option value="Kids">Kids</option>
                        </select>
                    </div>

                    {/* .form-group */}
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-semibold text-gray-400">
                            Description
                        </label>
                        {/* .form-group textarea */}
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={uploading || isCheckingVideo}
                            className={`${inputBaseClasses} min-h-[100px] resize-y`}
                        />
                    </div>
                    
                    {/* .form-group */}
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-semibold text-gray-400">
                            Thumbnail (Image, required)
                        </label>
                        <input 
                            type="file"
                            accept="image/*"
                            onChange={(e) => setThumbnailFile(e.target.files[0])}
                            disabled={uploading || isCheckingVideo}
                            className={fileInputClasses} // .file-input
                        />
                    </div>
                </>
            )}

            {/* .form-group */}
            <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold text-gray-400">
                    Video File (required)
                </label>
                <input 
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    disabled={uploading || isCheckingVideo}
                    className={fileInputClasses} // .file-input
                />
            </div>
            
            {isCheckingVideo && (
                <p className="my-2 text-sm italic text-gray-400">
                    Checking video properties...
                </p>
            )}
            
            {isShort && !isCheckingVideo && (
                // Inline style converted to Tailwind
                <p className="my-2 text-sm font-bold text-[#4CAF50]">
                    This video will be uploaded as a Short.
                </p>
            )}

            {/* .submit-btn (New Tailwind styles) */}
            <button 
                type="submit" 
                className="w-full p-3 mt-4 text-lg font-semibold text-white bg-blue-600 rounded transition-colors hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed" 
                disabled={uploading || isCheckingVideo}
            >
                {uploading ? 'Uploading...' : 'Upload'}
            </button>
        </form>
    );
};

export default UploadForm;