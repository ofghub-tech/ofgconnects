// src/components/UploadForm.js
import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { databases, storage } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import { 
    DATABASE_ID, 
    COLLECTION_ID_VIDEOS,
    BUCKET_ID_VIDEOS,
} from '../appwriteConfig';
import { ID, Permission, Role } from 'appwrite';

// --- (Spinner - No change needed) ---
const Spinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// --- MODIFIED: Alert component with dark mode classes ---
const Alert = ({ type, message }) => {
    const isError = type === 'error';
    const bgColor = isError ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900';
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
// --- (End reusable components) ---

// --- MODIFIED: Added dark mode classes ---
const FormInput = ({ id, label, type = "text", value, onChange, required = false, ...props }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            {label} { required && <span className="text-red-500">*</span> }
        </label>
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full px-3 py-2 text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
            {...props}
        />
    </div>
);

// --- MODIFIED: Added dark mode classes ---
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
            className="w-full px-3 py-2 text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
        />
    </div>
);

// --- MODIFIED: Added dark mode classes ---
const FormFileInput = ({ id, label, onChange, required = false, accept, file, clearFile }) => {
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                {label} { required && <span className="text-red-500">*</span> } { !required && <span className="text-gray-500 text-xs dark:text-gray-400">(Optional)</span> }
            </label>
            {file ? (
                <div className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
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
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100
                                dark:file:bg-blue-900 dark:file:text-blue-300
                                dark:hover:file:bg-blue-800"
                />
            )}
        </div>
    );
};

// --- MODIFIED: Added dark mode classes ---
const FormSelect = ({ id, label, value, onChange, required = false, children }) => (
    <div className="mb-6">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
            {label} { required && <span className="text-red-500">*</span> }
        </label>
        <select
            id={id}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        >
            {children}
        </select>
    </div>
);


const UploadForm = ({ onUploadSuccess }) => { // <-- MODIFIED: Accept new prop
    const { user } = useAuth();
    
    // Step Management
    const [step, setStep] = useState(1);

    // Form Details State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(''); 
    const [tags, setTags] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    
    // Upload & Submission State
    const [videoFile, setVideoFile] = useState(null);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [isSubmittingDetails, setIsSubmittingDetails] = useState(false);
    const [videoUploadResponse, setVideoUploadResponse] = useState(null); 
    
    // UI State
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // --- NEW LOGIC: Refs for cleanup ---
    const isSubmitted = useRef(false);
    const uploadedFileIds = useRef({
        video: null,
        thumbnail: null
    });

    // --- NEW LOGIC: Cleanup files on unmount if not submitted ---
    useEffect(() => {
        // This return function is the cleanup handler
        return () => {
            if (!isSubmitted.current) {
                console.log('Component unmounting without submission. Cleaning up files...');
                
                const { video, thumbnail } = uploadedFileIds.current;

                if (video) {
                    try {
                        console.log(`Deleting orphaned video: ${video}`);
                        storage.deleteFile(BUCKET_ID_VIDEOS, video);
                    } catch (err) {
                        console.error('Failed to delete orphaned video:', err);
                    }
                }
                if (thumbnail) {
                    try {
                        console.log(`Deleting orphaned thumbnail: ${thumbnail}`);
                        storage.deleteFile(BUCKET_ID_VIDEOS, thumbnail);
                    } catch (err) {
                        console.error('Failed to delete orphaned thumbnail:', err);
                    }
                }
            }
        };
    }, []); // Empty dependency array means this runs only on mount and unmount


    // Thumbnail Preview Effect
    useEffect(() => {
        if (!thumbnailFile) {
            setThumbnailPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(thumbnailFile);
        setThumbnailPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [thumbnailFile]);

    // Reset Form
    const resetForm = () => {
        setTitle('');
        setDescription('');
        setTags('');
        setVideoFile(null);
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setCategory('');
        setStep(1);
        setIsUploadingVideo(false);
        setIsSubmittingDetails(false);
        setVideoUploadResponse(null);
        setError(null);
        setSuccess(null);

        // --- NEW LOGIC: Reset refs ---
        isSubmitted.current = false;
        uploadedFileIds.current = { video: null, thumbnail: null };
    };

    const clearThumbnailFile = () => setThumbnailFile(null);

    // ===================================================================
    // --- Step 1 Function (Handles video selection & starts upload) ---
    // ===================================================================
    const handleVideoFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !user) {
            return;
        }

        setVideoFile(file);
        setStep(2);
        setIsUploadingVideo(true);
        setError(null);
        setSuccess(null);

        try {
            const newVideoId = ID.unique();

            // --- NEW LOGIC: Store video ID in ref ---
            uploadedFileIds.current.video = newVideoId;

            const videoUpload = await storage.createFile(
                BUCKET_ID_VIDEOS,
                newVideoId,
                file,
                [Permission.read(Role.any())]
            );

            // ===============================================================
            // --- THIS IS THE CRASH FIX ---
            // 'storage.getFileView' returns a STRING, not an object.
            // We just use the string directly.
            // ===============================================================
            const videoUrlString = storage.getFileView(videoUpload.bucketId, videoUpload.$id);

            setVideoUploadResponse({
                fileId: newVideoId,
                urlString: videoUrlString // Use the string
            });
            
            setIsUploadingVideo(false);

        } catch (err) {
            console.error('Background video upload failed:', err);
            setError(`Video upload failed: ${err.message}. Please go back and try again.`);
            
            // --- NEW LOGIC: Clear ref on error ---
            uploadedFileIds.current.video = null; 
            setIsUploadingVideo(false);
        }
    };


    // ===================================================================
    // --- Step 2 Function (Handles final details submission) ---
    // ===================================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!videoUploadResponse || isUploadingVideo) {
            setError('Please wait for the video to finish processing.');
            return;
        }
        
        if (!title || !category || !tags) {
            setError('Please fill out all required fields (Title, Tags, Category).');
            return;
        }

        setIsSubmittingDetails(true);
        setError(null);
        setSuccess(null);

        let thumbnailUrlString = null; 
        let newThumbnailId = null; // --- NEW LOGIC: Define ID here ---

        try {
            const { fileId: videoFileId, urlString: videoUrlString } = videoUploadResponse;
            
            if (!videoUrlString) {
                setError('Video URL is missing. Please try uploading the video again.');
                setIsSubmittingDetails(false);
                return;
            }

            if (thumbnailFile) {
                newThumbnailId = ID.unique(); // --- NEW LOGIC: Assign ID ---

                // --- NEW LOGIC: Store thumbnail ID in ref ---
                uploadedFileIds.current.thumbnail = newThumbnailId;

                await storage.createFile(
                    BUCKET_ID_VIDEOS,
                    newThumbnailId,
                    thumbnailFile,
                    [Permission.read(Role.any())]
                );
                
                // --- CRASH FIX ---
                thumbnailUrlString = storage.getFileView(BUCKET_ID_VIDEOS, newThumbnailId);
            }
            
            const tagsArray = tags.split(',')
                                .map(tag => tag.trim())
                                .filter(tag => tag.length > 0);

            const documentToCreate = {
                videoUrl: videoUrlString,
                thumbnailUrl: thumbnailUrlString,
                title: title,
                description: description,
                userId: user.$id,
                username: user.name,
                category: category,
                tags: tagsArray,
                likeCount: 0, 
                commentCount: 0,
            };

            console.log("Submitting document:", documentToCreate);

            await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                videoFileId, // Use the video's ID as the document ID
                documentToCreate
            );

            // --- NEW LOGIC: Mark as submitted ON SUCCESS ---
            isSubmitted.current = true;

            setSuccess('Upload successful! Your video is now live.');

            // --- NEW LOGIC: Call success prop ---
            if (onUploadSuccess) {
                onUploadSuccess();
            }
            
            resetForm(); // This will also reset the refs
            
        } catch (err) {
            console.error('Database submission failed:', err);
            setError(`Submission failed: ${err.message || 'Something went wrong.'}`);

            // --- NEW LOGIC: Cleanup files on database error ---
            console.log('Database error. Cleaning up uploaded files...');
            try {
                // We already have the video ID from the `videoUploadResponse`
                if (videoUploadResponse?.fileId) {
                    console.log(`Deleting orphaned video: ${videoUploadResponse.fileId}`);
                    await storage.deleteFile(BUCKET_ID_VIDEOS, videoUploadResponse.fileId);
                }
                // We stored the new thumbnail ID
                if (newThumbnailId) {
                    console.log(`Deleting orphaned thumbnail: ${newThumbnailId}`);
                    await storage.deleteFile(BUCKET_ID_VIDEOS, newThumbnailId);
                }
            } catch (cleanupErr) {
                console.error('Failed during cleanup:', cleanupErr);
                setError(`Submission failed, and cleanup also failed. Please contact support. Error: ${err.message}`);
            }
        }
        setIsSubmittingDetails(false);
    };
    // ===================================================================
    // --- END OF UPDATED FUNCTIONS ---
    // ===================================================================


    // Calculate button state
    const isSubmitDisabled = 
        isUploadingVideo ||
        isSubmittingDetails ||
        !videoUploadResponse ||
        !title || !tags || !category;

    // Dynamic button text
    let buttonText = 'Publish Video';
    if (isUploadingVideo) {
        buttonText = 'Processing Video...';
    } else if (isSubmittingDetails) {
        buttonText = 'Publishing...';
    }


    return (
        // --- MODIFIED: Added dark mode classes ---
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-xl my-10 dark:bg-gray-800">
            
            {/* ======================= STEP 1: VIDEO UPLOAD ======================= */}
            {step === 1 && (
                <>
                    {/* --- MODIFIED: Added dark mode classes --- */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-gray-100">Upload Your Video</h2>
                    <p className="text-gray-600 mb-6 dark:text-gray-400">Select a video file to begin. You will enter the details on the next step while it uploads.</p>
                    
                    {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
                    
                    <FormFileInput
                        id="videoFile"
                        label="Video File"
                        onChange={handleVideoFileChange}
                        required={true}
                        accept="video/mp4,video/webm"
                        file={null}
                        clearFile={() => {}}
                    />
                </>
            )}

            {/* ======================= STEP 2: DETAILS FORM ======================= */}
            {step === 2 && (
                <>
                    {/* --- MODIFIED: Added dark mode classes --- */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 dark:text-gray-100">Enter Video Details</h2>
                    <form onSubmit={handleSubmit}>
                        
                        {error && <div className="mb-4"><Alert type="error" message={error} /></div>}
                        {success && <div className="mb-4"><Alert type="success" message={success} /></div>}

                        {/* --- MODIFIED: Added dark mode classes --- */}
                        <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Video File</label>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 truncate dark:text-gray-400">{videoFile?.name}</span>
                                {isUploadingVideo && (
                                    <div className="flex items-center text-blue-600 dark:text-blue-400">
                                        <Spinner /> Processing...
                                    </div>
                                )}
                                {!isUploadingVideo && videoUploadResponse && (
                                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Upload Complete</span>
                                )}
                                {!isUploadingVideo && !videoUploadResponse && error && (
                                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Upload Failed</span>
                                )}
                            </div>
                        </div>

                        <FormInput
                            id="title"
                            label="Video Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required={true}
                        />

                        <FormInput
                            id="tags"
                            label="Tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            required={true}
                            placeholder="e.g. gospel, worship, testimony"
                        />
                        {/* --- MODIFIED: Added dark mode classes --- */}
                        <p className="text-xs text-gray-500 -mt-2 mb-4 dark:text-gray-400">Separate tags with a comma (,).</p>

                        <FormTextarea
                            id="description"
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
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
                            
                            {/* Thumbnail Preview */}
                            {thumbnailPreview ? (
                                <div>
                                    {/* --- MODIFIED: Added dark mode classes --- */}
                                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Preview</label>
                                    <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-auto rounded-md border border-gray-300 dark:border-gray-600" />
                                </div>
                            ) : (
                                <div>
                                    {/* --- MODIFIED: Added dark mode classes --- */}
                                    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Preview</label>
                                    <div className="flex items-center justify-center w-full h-[125px] border-2 border-gray-300 border-dashed rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                        <span className="text-gray-400 dark:text-gray-500">No thumbnail</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <FormSelect
                            id="category"
                            label="Category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required={true}
                        >
                            <option value="">Select a Category</option>
                            <option value="general">General Video</option>
                            <option value="shorts">Short Video</option>
                            <option value="songs">Song</option>
                            <option value="kids">Kids Video</option>
                        </FormSelect> 


                        <button 
                            type="submit" 
                            disabled={isSubmitDisabled}
                            className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm
                                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                     disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            {(isUploadingVideo || isSubmittingDetails) && <Spinner />}
                            {buttonText}
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};

export default UploadForm;