import React, { useState, useEffect, useRef } from 'react';
import { databases } from '../appwriteConfig'; 
import { useAuth } from '../context/AuthContext';
import {
    DATABASE_ID,
    COLLECTION_ID_VIDEOS,
} from '../appwriteConfig';
import { ID } from 'appwrite';

// Import R2 Client and Commands
import { r2Client } from '../r2Config'; 
import { Upload } from "@aws-sdk/lib-storage";
import { DeleteObjectCommand } from "@aws-sdk/client-s3"; 

// --- Constants ---
const MAX_VIDEO_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
const MAX_THUMB_SIZE = 5 * 1024 * 1024;        // 5MB

// --- UPDATED: Restrict to MP4 and MOV for mobile compatibility ---
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime']; 
const ALLOWED_THUMB_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

// --- UI Components ---
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
    
    // Refs
    const isSubmitted = useRef(false);
    const currentUploadRef = useRef(null); // Tracks the active upload instance
    const uploadedFileKeyRef = useRef(null); // Tracks the file key to delete if things go wrong

    // Cleanup on unmount (If user navigates away while uploading)
    useEffect(() => {
        return () => {
            if (currentUploadRef.current) {
                console.log("Navigated away, aborting upload...");
                currentUploadRef.current.abort();
            }
        };
    }, []);

    // Thumbnail Preview Effect
    useEffect(() => {
        if (!thumbnailFile) { setThumbnailPreview(null); return; }
        const objectUrl = URL.createObjectURL(thumbnailFile);
        setThumbnailPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [thumbnailFile]);

    const resetForm = () => {
        setTitle(''); setDescription(''); setTags(''); setCategory('');
        setVideoFile(null); setThumbnailFile(null); setThumbnailPreview(null);
        setStep(1); setIsUploading(false); setError(null); setSuccess(null);
        setUploadProgress(0); isSubmitted.current = false;
        currentUploadRef.current = null;
        uploadedFileKeyRef.current = null;
    };

    const handleVideoFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // --- UPDATED ERROR MESSAGE ---
        if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
            setError('Invalid video format. Please use MP4 or MOV to ensure mobile compatibility.');
            return;
        }
        
        if (file.size > MAX_VIDEO_SIZE) {
            setError('Video too large (Max 5GB).');
            return;
        }
        setVideoFile(file);
        setStep(2); 
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) setThumbnailFile(file);
    };

    // --- HELPER: DELETE FILE IF UPLOAD FAILS ---
    const deleteFileFromR2 = async (bucket, key) => {
        try {
            const command = new DeleteObjectCommand({
                Bucket: bucket,
                Key: key,
            });
            await r2Client.send(command);
            console.log(`Cleaned up partial/failed file: ${key}`);
        } catch (err) {
            console.error("Failed to cleanup file:", err);
        }
    };

    // --- GENERIC R2 UPLOAD FUNCTION ---
    const uploadToR2 = async (file, bucketName, domainUrl, uniqueFileId, isVideo = false) => {
        // --- FIX IS HERE: Aggressively sanitize filename ---
        // Replaces anything that is NOT a letter, number, dot, or hyphen with an underscore
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); 
        const fileName = `${uniqueFileId}_${cleanName}`;
        
        // Save the key in case we need to delete it on error
        if (isVideo) uploadedFileKeyRef.current = fileName;

        const upload = new Upload({
            client: r2Client,
            params: {
                Bucket: bucketName,
                Key: fileName,
                Body: file,
                ContentType: file.type,
            },
            // 5MB part size for better multipart handling
            partSize: 5 * 1024 * 1024, 
            leavePartsOnError: false, 
        });

        // Store reference if it's the main video
        if (isVideo) currentUploadRef.current = upload;

        if (isVideo) {
            upload.on("httpUploadProgress", (progress) => {
                const percent = Math.round((progress.loaded / progress.total) * 100);
                setUploadProgress(percent);
            });
        }

        await upload.done();
        
        // Clear reference after success
        if (isVideo) currentUploadRef.current = null;

        const publicUrl = `${domainUrl}/${fileName}`;
        return { publicUrl, fileName };
    };

    // --- CANCEL HANDLER ---
    const handleCancelUpload = async () => {
        if (currentUploadRef.current) {
            try {
                // 1. Abort the upload stream
                await currentUploadRef.current.abort();
                setIsUploading(false);
                setUploadProgress(0);
                setError("Upload cancelled by user.");
                
                // 2. Double check cleanup (Library usually handles it, but safety first)
                if (uploadedFileKeyRef.current) {
                    await deleteFileFromR2(process.env.REACT_APP_R2_TEMP_BUCKET_NAME, uploadedFileKeyRef.current);
                }
            } catch (err) {
                console.error("Error cancelling:", err);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !category || !tags) {
            setError('Please fill required fields.');
            return;
        }

        setIsUploading(true);
        setError(null);

        // Define these outside try block so catch block can access them
        const uniqueId = ID.unique();
        let r2FileKey = null;

        try {
            
            // 1. Upload Video to R2 (TEMP BUCKET)
            const videoUploadResult = await uploadToR2(
                videoFile, 
                process.env.REACT_APP_R2_TEMP_BUCKET_NAME, 
                process.env.REACT_APP_R2_PUBLIC_DOMAIN, 
                uniqueId,
                true // isVideo
            );
            
            const videoUrl = videoUploadResult.publicUrl;
            r2FileKey = videoUploadResult.fileName;

            // 2. Upload Thumbnail to R2 (MAIN BUCKET) - Optional
            let thumbnailUrlString = null;
            if (thumbnailFile) {
                const { publicUrl } = await uploadToR2(
                    thumbnailFile,
                    process.env.REACT_APP_R2_BUCKET_ID,
                    process.env.REACT_APP_R2_MAIN_DOMAIN,
                    `${uniqueId}_thumb`,
                    false
                );
                thumbnailUrlString = publicUrl;
            }

            // 3. Save Metadata to Appwrite Database
            await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                uniqueId, 
                {
                    title,
                    description,
                    userId: user.$id,
                    username: user.name,
                    category,
                    tags: tags.trim(),
                    url_4k: videoUrl,       
                    thumbnailUrl: thumbnailUrlString,
                    adminStatus: 'pending',
                    compressionStatus: 'waiting',
                    sourceFileId: r2FileKey,
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
            
            // --- CLEANUP ON FAILURE ---
            // If the error was NOT a user cancellation (AbortError), execute cleanup
            if (err.name !== 'AbortError') {
                setError(`Upload Failed: ${err.message}`);
                
                // If we have a file key, DELETE IT from R2 so we don't pay for failed uploads
                if (uploadedFileKeyRef.current) {
                    console.log("Upload failed, deleting partial file...");
                    await deleteFileFromR2(process.env.REACT_APP_R2_TEMP_BUCKET_NAME, uploadedFileKeyRef.current);
                }
            } else {
                console.log("Upload aborted successfully.");
            }
        } finally {
            if (!currentUploadRef.current) {
                // Only turn off loading if we aren't still aborting
                setIsUploading(false);
            }
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

                        {/* Progress Bar with Cancel Button */}
                        {isUploading && (
                            <div className="mb-6 p-4 bg-blue-50/50 border border-blue-200/50 rounded-md dark:bg-blue-900/20">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Uploading to OFG Storage...</span>
                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-3">
                                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                                {/* CANCEL BUTTON */}
                                <button 
                                    type="button" 
                                    onClick={handleCancelUpload}
                                    className="text-xs text-red-600 hover:text-red-800 font-medium underline"
                                >
                                    Cancel Upload
                                </button>
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