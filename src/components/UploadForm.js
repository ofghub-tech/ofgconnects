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
// Restrict to MP4 and MOV for mobile compatibility
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime']; 
const ALLOWED_THUMB_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

// --- HELPER: Generate Thumbnail from Video File ---
const generateVideoThumbnail = (file) => {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");
        
        video.autoplay = false;
        video.muted = true;
        video.playsInline = true;
        video.src = URL.createObjectURL(file);

        // Capture frame at 1.0 second (avoids black start frames)
        const CAPTURE_TIME = 1.0;

        video.onloadeddata = () => {
            video.currentTime = CAPTURE_TIME;
        };

        video.onseeked = () => {
            // Ensure video has dimensions
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                URL.revokeObjectURL(video.src);
                reject("Video dimensions zero");
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob((blob) => {
                URL.revokeObjectURL(video.src);
                if (blob) {
                    // Create a File object that mimics a user upload
                    const thumbFile = new File([blob], "auto-thumb.jpg", { type: "image/jpeg" });
                    resolve(thumbFile);
                } else {
                    reject("Blob creation failed");
                }
            }, "image/jpeg", 0.8); // 80% Quality JPG
        };

        video.onerror = (e) => {
            URL.revokeObjectURL(video.src);
            reject(e);
        };
    });
};

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
    const [isGeneratingThumb, setIsGeneratingThumb] = useState(false); 
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // Refs
    const isSubmitted = useRef(false);
    const currentUploadRef = useRef(null);
    const uploadedFileKeyRef = useRef(null);

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

    const handleVideoFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
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

        // --- Generate Thumbnail Automatically ---
        setIsGeneratingThumb(true);
        try {
            const autoThumb = await generateVideoThumbnail(file);
            setThumbnailFile(autoThumb);
        } catch (err) {
            console.warn("Could not auto-generate thumbnail:", err);
            // Non-blocking error: user can still upload manually
        } finally {
            setIsGeneratingThumb(false);
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) setThumbnailFile(file);
    };

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

    const uploadToR2 = async (file, bucketName, domainUrl, uniqueFileId, isVideo = false) => {
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); 
        const fileName = `${uniqueFileId}_${cleanName}`;
        
        if (isVideo) uploadedFileKeyRef.current = fileName;

        const upload = new Upload({
            client: r2Client,
            params: {
                Bucket: bucketName,
                Key: fileName,
                Body: file,
                ContentType: file.type,
            },
            partSize: 5 * 1024 * 1024, 
            leavePartsOnError: false, 
        });

        if (isVideo) currentUploadRef.current = upload;

        if (isVideo) {
            upload.on("httpUploadProgress", (progress) => {
                const percent = Math.round((progress.loaded / progress.total) * 100);
                setUploadProgress(percent);
            });
        }

        await upload.done();
        
        if (isVideo) currentUploadRef.current = null;

        const publicUrl = `${domainUrl}/${fileName}`;
        return { publicUrl, fileName };
    };

    const handleCancelUpload = async () => {
        if (currentUploadRef.current) {
            try {
                await currentUploadRef.current.abort();
                setIsUploading(false);
                setUploadProgress(0);
                setError("Upload cancelled by user.");
                
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

        const uniqueId = ID.unique();
        let r2FileKey = null;

        try {
            // 1. Upload Video to R2
            const videoUploadResult = await uploadToR2(
                videoFile, 
                process.env.REACT_APP_R2_TEMP_BUCKET_NAME, 
                process.env.REACT_APP_R2_PUBLIC_DOMAIN, 
                uniqueId,
                true 
            );
            
            const videoUrl = videoUploadResult.publicUrl;
            r2FileKey = videoUploadResult.fileName;

            // 2. Upload Thumbnail to R2 (Auto-generated or Manual)
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

            // 3. Save Metadata to Appwrite
            await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                uniqueId, 
                {
                    title,
                    description,
                    userId: user.$id,
                    username: user.name,
                    creatorAvatar: user.prefs?.avatar || null, // <--- Added: Save Avatar URL
                    category,
                    tags: tags.trim(),
                    video_url: videoUrl,
                    thumbnail_url: thumbnailUrlString, 
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
            if (err.name !== 'AbortError') {
                setError(`Upload Failed: ${err.message}`);
                if (uploadedFileKeyRef.current) {
                    await deleteFileFromR2(process.env.REACT_APP_R2_TEMP_BUCKET_NAME, uploadedFileKeyRef.current);
                }
            }
        } finally {
            if (!currentUploadRef.current) setIsUploading(false);
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

                        {isUploading && (
                            <div className="mb-6 p-4 bg-blue-50/50 border border-blue-200/50 rounded-md dark:bg-blue-900/20">
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Uploading to OFG Storage...</span>
                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-3">
                                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                                <button type="button" onClick={handleCancelUpload} className="text-xs text-red-600 hover:text-red-800 font-medium underline">Cancel Upload</button>
                            </div>
                        )}

                        <FormInput id="title" label="Video Title" value={title} onChange={(e) => setTitle(e.target.value)} required={true} />
                        <FormInput id="tags" label="Tags" value={tags} onChange={(e) => setTags(e.target.value)} required={true} placeholder="e.g. gospel, worship" />
                        <FormTextarea id="description" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormFileInput id="thumbnailFile" label="Thumbnail" onChange={handleThumbnailChange} accept={['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].join(',')} file={thumbnailFile} clearFile={() => setThumbnailFile(null)} />
                            
                            {/* Loading State or Preview */}
                            <div className="h-32 w-full border border-gray-300/50 rounded-md bg-white/50 dark:bg-gray-700/50 flex items-center justify-center overflow-hidden">
                                {isGeneratingThumb ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                        <span className="text-xs text-gray-500">Auto-generating cover...</span>
                                    </div>
                                ) : thumbnailPreview ? (
                                    <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs text-gray-400">No thumbnail selected</span>
                                )}
                            </div>
                        </div>

                        <FormSelect id="category" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} required={true}>
                            <option value="">Select Category</option>
                            <option value="general">General</option>
                            <option value="shorts">Shorts</option>
                            <option value="songs">Songs</option>
                            <option value="kids">Kids</option>
                        </FormSelect>

                        <button 
                            type="submit" 
                            disabled={isUploading || isGeneratingThumb} // <--- Disabled while generating
                            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isUploading ? 'Processing...' : isGeneratingThumb ? 'Generating Thumbnail...' : 'Publish Video'}
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};

export default UploadForm;