import React, { useState, useEffect, useRef } from 'react';
import { databases, storage } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import {
    DATABASE_ID,
    COLLECTION_ID_VIDEOS,
    BUCKET_ID_VIDEOS,
} from '../appwriteConfig';
import { ID, Permission, Role } from 'appwrite';
// 1. Import AWS SDK for R2 Uploads
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

// --- Constants ---
const MAX_VIDEO_SIZE = 5 * 1024 * 1024 * 1024; // 5GB (R2 handles large files well)
const MAX_THUMB_SIZE = 5 * 1024 * 1024;        // 5MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
const ALLOWED_THUMB_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

// --- Initialize R2 Client ---
const r2Client = new S3Client({
    region: "auto",
    endpoint: process.env.REACT_APP_R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.REACT_APP_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_R2_SECRET_ACCESS_KEY,
    },
});

// --- UI Components (Spinner, Alert, Inputs) ---
const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const Alert = ({ type, message }) => {
    const isError = type === 'error';
    const bgColor = isError ? 'bg-red-100/80 dark:bg-red-900/80' : 'bg-green-100/80 dark:bg-green-900/80';
    const textColor = isError ? 'text-red-700 dark:text-red-200' : 'text-green-700 dark:text-green-200';
    return (
        <div className={`border ${isError ? 'border-red-400' : 'border-green-400'} ${bgColor} ${textColor} px-4 py-3 rounded-md relative`} role="alert">
            <span className="block sm:inline">{message}</span>
        </div>
    );
};

const FormInput = ({ id, label, value, onChange, required = false, ...props }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">{label}</label>
        <input id={id} value={value} onChange={onChange} required={required} className="w-full px-3 py-2 text-gray-900 border border-gray-300/50 rounded-md bg-white/50 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100" {...props} />
    </div>
);

const FormTextarea = ({ id, label, value, onChange }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">{label}</label>
        <textarea id={id} value={value} onChange={onChange} rows="4" className="w-full px-3 py-2 text-gray-900 border border-gray-300/50 rounded-md bg-white/50 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100" />
    </div>
);

const FormFileInput = ({ id, label, onChange, required, accept, file, clearFile }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">{label}</label>
        {file ? (
            <div className="flex items-center justify-between w-full px-3 py-2 border border-gray-300/50 rounded-md bg-gray-50/50 dark:bg-gray-700/50">
                <span className="text-sm truncate dark:text-gray-300">{file.name}</span>
                <button type="button" onClick={clearFile} className="ml-2 text-red-600">&times;</button>
            </div>
        ) : (
            <input type="file" id={id} onChange={onChange} required={required} accept={accept} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50/80 file:text-blue-700 hover:file:bg-blue-100/80" />
        )}
    </div>
);

const FormSelect = ({ id, label, value, onChange, required, children }) => (
    <div className="mb-6">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">{label}</label>
        <select id={id} value={value} onChange={onChange} required={required} className="w-full px-3 py-2 text-gray-900 border border-gray-300/50 rounded-md bg-white/50 dark:bg-gray-700/50 dark:text-gray-100">{children}</select>
    </div>
);

// --- MAIN COMPONENT ---
const UploadForm = ({ onUploadSuccess }) => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    
    // Form Data
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    
    // Files
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    
    // Status
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    const uploadedThumbId = useRef(null);
    const isSubmitted = useRef(false);

    // Thumbnail Preview Effect
    useEffect(() => {
        if (!thumbnailFile) { setThumbnailPreview(null); return; }
        const objectUrl = URL.createObjectURL(thumbnailFile);
        setThumbnailPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [thumbnailFile]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (!isSubmitted.current && uploadedThumbId.current) {
                try { storage.deleteFile(BUCKET_ID_VIDEOS, uploadedThumbId.current); } catch (e) { }
            }
        };
    }, []);

    const resetForm = () => {
        setTitle(''); setDescription(''); setTags(''); setCategory('');
        setVideoFile(null); setThumbnailFile(null); setThumbnailPreview(null);
        setStep(1); setIsUploading(false); setError(null); setSuccess(null);
        setUploadProgress(0); isSubmitted.current = false; uploadedThumbId.current = null;
    };

    const handleVideoFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
            setError('Invalid video format. Use MP4, WebM, or MOV.');
            return;
        }
        if (file.size > MAX_VIDEO_SIZE) {
            setError('Video too large (Max 5GB).');
            return;
        }
        setVideoFile(file);
        setStep(2); // Go to details page
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) setThumbnailFile(file);
    };

    // --- R2 UPLOAD LOGIC ---
    const uploadVideoToR2 = async (file, uniqueFileId) => {
        const fileName = `${uniqueFileId}_${file.name.replace(/\s+/g, '_')}`; // Clean filename
        
        const upload = new Upload({
            client: r2Client,
            params: {
                Bucket: process.env.REACT_APP_R2_TEMP_BUCKET_NAME,
                Key: fileName,
                Body: file,
                ContentType: file.type,
            },
        });

        upload.on("httpUploadProgress", (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(percent);
        });

        await upload.done();
        
        // Return the Public View URL
        // If you don't have a custom domain, R2 public links are usually:
        // https://<BUCKET_NAME>.<ACCOUNT_HASH>.r2.dev/<KEY>
        // But better to use the variable we set in .env
        const publicUrl = `${process.env.REACT_APP_R2_PUBLIC_DOMAIN}/${fileName}`;
        
        return { fileUrl: publicUrl, fileId: fileName };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !category || !tags) {
            setError('Please fill required fields.');
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            // 1. Generate Unique ID
            const uniqueId = ID.unique();

            // 2. Upload Video to R2 (Cloudflare)
            const { fileUrl, fileId: r2FileKey } = await uploadVideoToR2(videoFile, uniqueId);
            
            // 3. Upload Thumbnail to Appwrite (if exists)
            let thumbnailUrlString = null;
            if (thumbnailFile) {
                const thumbId = ID.unique();
                uploadedThumbId.current = thumbId;
                await storage.createFile(BUCKET_ID_VIDEOS, thumbId, thumbnailFile, [Permission.read(Role.any())]);
                thumbnailUrlString = storage.getFileView(BUCKET_ID_VIDEOS, thumbId);
            }

            // 4. Save Metadata to Appwrite Database
            await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                uniqueId, // Use same ID for Doc and Video ID prefix
                {
                    title,
                    description,
                    userId: user.$id,
                    username: user.name,
                    category,
                    tags: tags.trim(),
                    
                    // The Magic Links
                    videoUrl: fileUrl,       // Points to R2 Temp initially
                    thumbnailUrl: thumbnailUrlString,
                    
                    // Automation Flags
                    adminStatus: 'pending',        // Admin needs to approve
                    compressionStatus: 'waiting',  // Worker needs to pick this up
                    sourceFileId: r2FileKey,       // Key for Worker to download
                    
                    likeCount: 0,
                    commentCount: 0,
                    view_count: 0
                }
            );

            isSubmitted.current = true;
            setSuccess('Video Uploaded Successfully! Waiting for Admin Approval.');
            if (onUploadSuccess) onUploadSuccess();
            setTimeout(resetForm, 2000);

        } catch (err) {
            console.error(err);
            setError(`Upload Failed: ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
            {step === 1 && (
                <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-gray-100">Upload Video</h2>
                    {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
                    <FormFileInput
                        id="videoFile" label="Select Video File" onChange={handleVideoFileChange} required={true}
                        accept={ALLOWED_VIDEO_TYPES.join(',')} file={null} clearFile={() => { }}
                    />
                </>
            )}

            {step === 2 && (
                <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-gray-100">Video Details</h2>
                    <form onSubmit={handleSubmit}>
                        {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
                        {success && <div className="mb-4"><Alert type="success" message={success} /></div>}

                        {/* Progress Bar */}
                        {isUploading && (
                            <div className="mb-6 p-4 bg-blue-50/50 border border-blue-200/50 rounded-md dark:bg-blue-900/20">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Uploading to R2 Storage...</span>
                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                            </div>
                        )}

                        <FormInput id="title" label="Video Title" value={title} onChange={(e) => setTitle(e.target.value)} required={true} />
                        <FormInput id="tags" label="Tags" value={tags} onChange={(e) => setTags(e.target.value)} required={true} placeholder="e.g. gospel, worship" />
                        <FormTextarea id="description" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormFileInput id="thumbnailFile" label="Thumbnail" onChange={handleThumbnailChange} accept={ALLOWED_THUMB_TYPES.join(',')} file={thumbnailFile} clearFile={() => setThumbnailFile(null)} />
                            {thumbnailPreview && <img src={thumbnailPreview} alt="Preview" className="h-32 rounded-md object-cover border border-gray-300" />}
                        </div>

                        <FormSelect id="category" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} required={true}>
                            <option value="">Select Category</option>
                            <option value="general">General</option>
                            <option value="shorts">Shorts</option>
                            <option value="songs">Songs</option>
                            <option value="kids">Kids</option>
                        </FormSelect>

                        <button type="submit" disabled={isUploading} className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isUploading ? 'Processing...' : 'Publish Video'}
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};

export default UploadForm;