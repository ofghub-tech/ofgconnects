// src/components/UploadForm.js
import React, { useState, useEffect, useRef } from 'react';
import { databases, storage } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import {
    DATABASE_ID,
    COLLECTION_ID_VIDEOS,
    BUCKET_ID_VIDEOS,
} from '../appwriteConfig';
import { ID, Permission, Role } from 'appwrite';

// --- Constants (Unchanged) ---
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_THUMB_SIZE = 5 * 1024 * 1024;   // 5MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
const ALLOWED_THUMB_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

// --- Spinner (Unchanged) ---
const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// --- Alert Component (MODIFIED: Semi-transparent) ---
const Alert = ({ type, message }) => {
    const isError = type === 'error';
    const bgColor = isError ? 'bg-red-100/80 dark:bg-red-900/80' : 'bg-green-100/80 dark:bg-green-900/80';
    const borderColor = isError ? 'border-red-400 dark:border-red-700' : 'border-green-400 dark:border-green-700';
    const textColor = isError ? 'text-red-700 dark:text-red-200' : 'text-green-700 dark:text-green-200';
    const iconColor = isError ? 'text-red-400 dark:text-red-300' : 'text-green-400 dark:text-green-300';

    const icon = isError ? (
        <svg className={`h-5 w-5 ${iconColor}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
    ) : (
        <svg className={`h-5 w-5 ${iconColor}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
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

// --- FormInput (MODIFIED: Semi-transparent) ---
const FormInput = ({ id, label, type = "text", value, onChange, required = false, ...props }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full px-3 py-2 text-gray-900 placeholder:text-gray-400 border border-gray-300/50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100 dark:placeholder-gray-400"
            {...props}
        />
    </div>
);

// --- FormTextarea (MODIFIED: Semi-transparent) ---
const FormTextarea = ({ id, label, value, onChange }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            {label}
        </label>
        <textarea
            id={id}
            value={value}
            onChange={onChange}
            rows="4"
            className="w-full px-3 py-2 text-gray-900 placeholder:text-gray-400 border border-gray-300/50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100 dark:placeholder-gray-400"
        />
    </div>
);

// --- FormFileInput (MODIFIED: Semi-transparent) ---
const FormFileInput = ({ id, label, onChange, required = false, accept, file, clearFile }) => {
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                {label} {required && <span className="text-red-500">*</span>} {!required && <span className="text-gray-500 text-xs dark:text-gray-400">(Optional)</span>}
            </label>
            {file ? (
                <div className="flex items-center justify-between w-full px-3 py-2 border border-gray-300/50 rounded-md bg-gray-50/50 dark:bg-gray-700/50 dark:border-gray-600/50">
                    <span className="text-sm text-gray-700 truncate dark:text-gray-300">{file.name}</span>
                    <button
                        type="button"
                        onClick={clearFile}
                        className="ml-2 text-red-600 hover:text-red-800 font-medium dark:text-red-400 dark:hover:text-red-300"
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
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50/80 file:text-blue-700
                                hover:file:bg-blue-100/80
                                dark:file:bg-blue-900/80 dark:file:text-blue-300
                                dark:hover:file:bg-blue-800/80"
                />
            )}
        </div>
    );
};

// --- FormSelect (MODIFIED: Semi-transparent) ---
const FormSelect = ({ id, label, value, onChange, required = false, children }) => (
    <div className="mb-6">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            id={id}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full px-3 py-2 text-gray-900 border border-gray-300/50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100"
        >
            {children}
        </select>
    </div>
);

const UploadForm = ({ onUploadSuccess }) => {
    // --- Logic (Unchanged) ---
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSubmittingDetails, setIsSubmittingDetails] = useState(false);
    const [videoUploadResponse, setVideoUploadResponse] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const isSubmitted = useRef(false);
    const uploadedFileIds = useRef({ video: null, thumbnail: null });

    useEffect(() => {
        return () => {
            if (!isSubmitted.current) {
                const { video, thumbnail } = uploadedFileIds.current;
                if (video) try { storage.deleteFile(BUCKET_ID_VIDEOS, video); } catch (e) { }
                if (thumbnail) try { storage.deleteFile(BUCKET_ID_VIDEOS, thumbnail); } catch (e) { }
            }
        };
    }, []);

    useEffect(() => {
        if (!thumbnailFile) {
            setThumbnailPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(thumbnailFile);
        setThumbnailPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [thumbnailFile]);

    const resetForm = () => {
        setTitle(''); setDescription(''); setTags(''); setCategory('');
        setVideoFile(null); setThumbnailFile(null); setThumbnailPreview(null);
        setStep(1); setIsUploadingVideo(false); setIsSubmittingDetails(false);
        setVideoUploadResponse(null); setError(null); setSuccess(null);
        setUploadProgress(0);
        isSubmitted.current = false;
        uploadedFileIds.current = { video: null, thumbnail: null };
    };

    const clearThumbnailFile = () => setThumbnailFile(null);

    const handleVideoFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !user) return;
        if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
            setError('Invalid video format. Please use MP4, WebM, or MOV.');
            e.target.value = "";
            return;
        }
        if (file.size > MAX_VIDEO_SIZE) {
            setError(`Video is too large. Maximum size is ${MAX_VIDEO_SIZE / (1024 * 1024)}MB.`);
            e.target.value = "";
            return;
        }
        setVideoFile(file);
        setStep(2);
        setIsUploadingVideo(true);
        setUploadProgress(0);
        setError(null);
        setSuccess(null);
        try {
            const newVideoId = ID.unique();
            uploadedFileIds.current.video = newVideoId;
            const videoUpload = await storage.createFile(
                BUCKET_ID_VIDEOS,
                newVideoId,
                file,
                [Permission.read(Role.any())],
                (progress) => {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    setUploadProgress(percent);
                }
            );
            const videoUrlString = storage.getFileView(videoUpload.bucketId, videoUpload.$id);
            setVideoUploadResponse({ fileId: newVideoId, urlString: videoUrlString });
            setIsUploadingVideo(false);
        } catch (err) {
            console.error('Video upload failed:', err);
            setError(`Video upload failed: ${err.message}. Please try a smaller file or check your connection.`);
            uploadedFileIds.current.video = null;
            setIsUploadingVideo(false);
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!ALLOWED_THUMB_TYPES.includes(file.type)) {
                setError('Invalid thumbnail format. Use PNG, JPG, or WEBP.');
                e.target.value = "";
                return;
            }
            if (file.size > MAX_THUMB_SIZE) {
                setError(`Thumbnail is too large. Maximum size is ${MAX_THUMB_SIZE / (1024 * 1024)}MB.`);
                e.target.value = "";
                return;
            }
            setError(null);
        }
        setThumbnailFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoUploadResponse || isUploadingVideo) {
            setError('Please wait for the video to finish processing.');
            return;
        }
        if (!title || !category || !tags) {
            setError('Please fill out all required fields.');
            return;
        }
        setIsSubmittingDetails(true);
        setError(null);
        let thumbnailUrlString = null;
        let newThumbnailId = null;
        try {
            const { fileId: videoFileId, urlString: videoUrlString } = videoUploadResponse;
            if (thumbnailFile) {
                newThumbnailId = ID.unique();
                uploadedFileIds.current.thumbnail = newThumbnailId;
                await storage.createFile(BUCKET_ID_VIDEOS, newThumbnailId, thumbnailFile, [Permission.read(Role.any())]);
                thumbnailUrlString = storage.getFileView(BUCKET_ID_VIDEOS, newThumbnailId);
            }
            const tagsString = tags.trim();
            await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                videoFileId,
                {
                    videoUrl: videoUrlString,
                    thumbnailUrl: thumbnailUrlString,
                    title, description, userId: user.$id, username: user.name,
                    category, 
                    tags: tagsString,
                    likeCount: 0, commentCount: 0,
                }
            );
            isSubmitted.current = true;
            setSuccess('Upload successful! Your video is now live.');
            if (onUploadSuccess) onUploadSuccess();
            resetForm();
        } catch (err) {
            console.error('Database submission failed:', err);
            setError(`Submission failed: ${err.message}`);
        }
        setIsSubmittingDetails(false);
    };

    const isSubmitDisabled = isUploadingVideo || isSubmittingDetails || !videoUploadResponse || !title || !tags || !category;
    let buttonText = isUploadingVideo ? `Uploading Video (${uploadProgress}%)...` : (isSubmittingDetails ? 'Publishing...' : 'Publish Video');
    // --- End Logic ---

    return (
        // --- MODIFIED: Removed all wrapper styles, as modal provides them ---
        <div>
            {step === 1 && (
                <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-gray-100">Upload Your Video</h2>
                    <p className="text-gray-600 mb-6 dark:text-gray-400">Select a video file to begin (Max 500MB). Supported: MP4, WebM, MOV.</p>
                    {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
                    <FormFileInput
                        id="videoFile" label="Video File" onChange={handleVideoFileChange} required={true}
                        accept={ALLOWED_VIDEO_TYPES.join(',')} file={null} clearFile={() => { }}
                    />
                </>
            )}

            {step === 2 && (
                <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-gray-100">Enter Video Details</h2>
                    <form onSubmit={handleSubmit}>
                        {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
                        {success && <div className="mb-4"><Alert type="success" message={success} /></div>}

                        {/* --- MODIFIED: Semi-transparent status box --- */}
                        <div className="mb-4 p-3 bg-gray-50/50 rounded-md border border-gray-200/50 dark:bg-gray-700/50 dark:border-gray-600/50">
                            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                                Video Status: {videoFile?.name}
                            </label>
                            
                            {isUploadingVideo ? (
                                <div className="w-full bg-gray-200/50 rounded-full h-4 dark:bg-gray-600/50 overflow-hidden">
                                    <div 
                                        className="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-out" 
                                        style={{ width: `${uploadProgress}%` }}
                                    >
                                        <span className="text-xs text-white font-medium flex items-center justify-center h-full">
                                            {uploadProgress > 10 && `${uploadProgress}%`}
                                        </span>
                                    </div>
                                </div>
                            ) : videoUploadResponse ? (
                                <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Upload Complete (100%)
                                </span>
                            ) : error ? (
                                <span className="text-sm font-medium text-red-600 dark:text-red-400">Upload Failed</span>
                            ) : null}
                        </div>

                        <FormInput id="title" label="Video Title" value={title} onChange={(e) => setTitle(e.target.value)} required={true} />
                        <FormInput id="tags" label="Tags" value={tags} onChange={(e) => setTags(e.target.value)} required={true} placeholder="e.g. gospel, worship, testimony" />
                        <p className="text-xs text-gray-500 -mt-2 mb-4 dark:text-gray-400">Separate tags with a comma (,).</p>
                        <FormTextarea id="description" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormFileInput
                                id="thumbnailFile" label="Thumbnail Image (Max 5MB)"
                                onChange={handleThumbnailChange}
                                required={false} accept={ALLOWED_THUMB_TYPES.join(',')}
                                file={thumbnailFile} clearFile={clearThumbnailFile}
                            />
                            {thumbnailPreview ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Preview</label>
                                    <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-auto rounded-md border border-gray-300/50 dark:border-gray-600/50" />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Preview</label>
                                    {/* --- MODIFIED: Semi-transparent --- */}
                                    <div className="flex items-center justify-center w-full h-[125px] border-2 border-gray-300/50 border-dashed rounded-md bg-gray-50/50 dark:bg-gray-700/50 dark:border-gray-600/50">
                                        <span className="text-gray-400 dark:text-gray-500">No thumbnail</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <FormSelect id="category" label="Category" value={category} onChange={(e) => setCategory(e.targe.value)} required={true}>
                            <option value="">Select a Category</option>
                            <option value="general">General Video</option>
                            <option value="shorts">Short Video</option>
                            <option value="songs">Song</option>
                            <option value="kids">Kids Video</option>
                        </FormSelect>

                        <button type="submit" disabled={isSubmitDisabled} className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200">
                            {(isUploadingVideo || isSubmittingDetails) && <Spinner />} {buttonText}
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};

export default UploadForm;