// src/components/UploadForm.js
import React, { useState, useEffect } from 'react';
import { databases, storage } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import { 
    DATABASE_ID, 
    COLLECTION_ID_VIDEOS,
    BUCKET_ID_VIDEOS,
    // BUCKET_ID_THUMBNAILS is not strictly needed if BUCKET_ID_VIDEOS is your only bucket
} from '../appwriteConfig';
import { ID, Permission, Role } from 'appwrite';

// --- UI ENHANCEMENT: Reusable Spinner Component ---
const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// --- UI ENHANCEMENT: Reusable Alert Component ---
const Alert = ({ type, message }) => {
    const isError = type === 'error';
    const bgColor = isError ? 'bg-red-100' : 'bg-green-100';
    const borderColor = isError ? 'border-red-400' : 'border-green-400';
    const textColor = isError ? 'text-red-700' : 'text-green-700';
    const icon = isError ? (
        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
    ) : (
        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
    );

    return (
        <div className={`border ${borderColor} ${bgColor} ${textColor} px-4 py-3 rounded-md relative`} role="alert">
            <div className="flex">
                <div className="py-1">{icon}</div>
                <div className="ml-3">
                    <span className="block sm:inline">{message}</span>
                </div>
            </div>
        </div>
    );
};

// --- Reusable Input Component ---
const FormInput = ({ id, label, type = "text", value, onChange, required = false, ...props }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
            {label}
        </label>
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            {...props}
        />
    </div>
);

// --- Reusable Textarea Component ---
const FormTextarea = ({ id, label, value, onChange }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
            {label}
        </label>
        <textarea
            id={id}
            value={value}
            onChange={onChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
    </div>
);

// --- UI ENHANCEMENT: Improved File Input Component ---
const FormFileInput = ({ id, label, onChange, required = false, accept, file, clearFile }) => {
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
                {label} { !required && <span className="text-gray-500 text-xs">(Optional)</span> }
            </label>
            {file ? (
                <div className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <button
                        type="button"
                        onClick={clearFile}
                        className="ml-2 text-red-600 hover:text-red-800 font-medium"
                    >
                        &times;
                    </button>
                </div>
            ) : (
                <input
                    type="file"
                    id={id}
                    onChange={onChange}
                    required={required}
                    accept={accept}
                    className="block w-full text-sm text-gray-500
                                 file:mr-4 file:py-2 file:px-4
                                 file:rounded-full file:border-0
                                 file:text-sm file:font-semibold
                                 file:bg-blue-50 file:text-blue-700
                                 hover:file:bg-blue-100"
                />
            )}
        </div>
    );
};

// --- Reusable Select Component ---
const FormSelect = ({ id, label, value, onChange, children }) => (
    <div className="mb-6">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
            {label}
        </label>
        <select
            id={id}
            value={value}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
            {children}
        </select>
    </div>
);


const UploadForm = () => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [category, setCategory] = useState('general');
    
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (!thumbnailFile) {
            setThumbnailPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(thumbnailFile);
        setThumbnailPreview(objectUrl);

        // Cleanup function to revoke the object URL
        return () => URL.revokeObjectURL(objectUrl);
    }, [thumbnailFile]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setVideoFile(null);
        setThumbnailFile(null);
        setThumbnailPreview(null); // Clear preview
        setCategory('general');
    };

    const clearVideoFile = () => setVideoFile(null);
    const clearThumbnailFile = () => setThumbnailFile(null);


    // ===================================================================
    // --- FINAL 'handleSubmit' FUNCTION (Schema aligned) ---
    // ===================================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title || !videoFile || !user) {
            setError('Please fill out all required fields (Title and Video File).');
            return;
        }

        setIsUploading(true);
        setError(null);
        setSuccess(null);

        let thumbnailUrl = null;
        let thumbnailFileId = null; 

        try {
            // --- 1. Generate a unique ID for the VIDEO and the DOCUMENT ---
            const newVideoId = ID.unique();

            // --- 2. Upload Video File ---
            const videoUpload = await storage.createFile(
                BUCKET_ID_VIDEOS,
                newVideoId, // The video's unique ID
                videoFile,
                [
                    Permission.read(Role.any()) 
                ]
            );
            const videoUrl = storage.getFileView(videoUpload.bucketId, videoUpload.$id);

            // --- 3. OPTIONALLY Upload Thumbnail File ---
            if (thumbnailFile) {
                const newThumbnailId = ID.unique();
                thumbnailFileId = newThumbnailId; // Store this ID

                await storage.createFile(
                    BUCKET_ID_VIDEOS, // Using the SAME bucket
                    newThumbnailId, // Using the SEPARATE thumbnail ID
                    thumbnailFile,
                    [
                        Permission.read(Role.any())
                    ]
                );
                // Get file view using the storage service directly
                thumbnailUrl = storage.getFileView(BUCKET_ID_VIDEOS, newThumbnailId);
            }

            // --- 4. Create Database Document ---
            await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                newVideoId, // Use the video's ID as the document ID
                {
                    // Fields matching your Appwrite schema:
                    videoUrl: videoUrl.href,
                    title: title,
                    description: description,
                    thumbnailUrl: thumbnailUrl ? thumbnailUrl.href : null,
                    userId: user.$id, // MATCHES SCHEMA
                    username: user.name,
                    category: category,
                    
                    // FIX: 'likeCount' is REQUIRED in your schema, sending default 0
                    likeCount: 0, 
                    
                    // FIX: 'commentCount' is REQUIRED in your schema, sending default 0
                    commentCount: 0,
                    
                    // Recommended fields for future management (MUST BE ADDED TO SCHEMA)
                    videoFileId: newVideoId,
                    thumbnailFileId: thumbnailFileId 
                }
            );

            setSuccess('Upload successful! Your video is now live.');
            resetForm();
            
        } catch (err) {
            console.error('Upload failed:', err);
            // Log the Appwrite error object for full details
            setError(`Upload failed: ${err.message || 'Something went wrong. Please check your Appwrite configuration.'}`);
        }
        setIsUploading(false);
    };
    // ===================================================================
    // --- END OF UPDATED FUNCTION ---
    // ===================================================================


    return (
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-xl my-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Your Video</h2>
            
            <form onSubmit={handleSubmit}>
                
                {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
                {success && <div className="mb-4"><Alert type="success" message={success} /></div>}

                <FormInput
                    id="title"
                    label="Video Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required={true}
                />

                <FormTextarea
                    id="description"
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <FormFileInput
                    id="videoFile"
                    label="Video File"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                    required={true}
                    accept="video/mp4,video/webm"
                    file={videoFile} 
                    clearFile={clearVideoFile} 
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormFileInput
                        id="thumbnailFile"
                        label="Thumbnail Image" 
                        onChange={(e) => setThumbnailFile(e.target.files[0])} 
                        required={false}
                        accept="image/png,image/jpeg,image/webp"
                        file={thumbnailFile} 
                        clearFile={clearThumbnailFile}
                    />
                    
                    {/* --- Thumbnail Preview --- */}
                    {thumbnailPreview ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                            <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-auto rounded-md border border-gray-300" />
                        </div>
                    ) : (
                          <div>
                            {/* FIX: Corrected typo */}
                            <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                            <div className="flex items-center justify-center w-full h-[125px] border-2 border-gray-300 border-dashed rounded-md bg-gray-50">
                                <span className="text-gray-400">No thumbnail</span>
                            </div>
                        </div>
                    )}
                </div>


                <FormSelect
                    id="category"
                    label="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="general">General Video</option>
                    <option value="shorts">Short Video</option>
                </FormSelect> 
                {/* FIX: Removed stray typo */}


                <button 
                    type="submit" 
                    disabled={isUploading}
                    className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm
                                 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    {isUploading && <Spinner />}
                    {isUploading ? 'Uploading...' : 'Upload Video'}
                </button>
            </form>
        </div>
    );
};

export default UploadForm;