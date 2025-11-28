// src/pages/AdminPage.js
import React, { useState, useEffect } from 'react';
import { databases, storage } from '../appwriteConfig';
import { 
    DATABASE_ID, 
    COLLECTION_ID_VIDEOS, 
    BUCKET_ID_VIDEOS 
} from '../appwriteConfig';
import { r2Client } from '../r2Config';
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Query } from 'appwrite';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'approved'
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideos, setSelectedVideos] = useState([]); // For bulk compression

    // --- 1. SECURITY CHECK ---
    // Replace with your actual admin email
    const ADMIN_EMAILS = ['admin@ofgconnects.com', 'your_email@gmail.com']; 
    
    useEffect(() => {
        // If user is loaded and NOT an admin, kick them out
        if (user && !ADMIN_EMAILS.includes(user.email)) {
            alert("Access Denied: Admins only.");
            navigate('/home');
        }
    }, [user, navigate]);

    // --- 2. FETCH VIDEOS ---
    const fetchVideos = async () => {
        setLoading(true);
        try {
            const statusQuery = activeTab === 'pending' ? 'pending' : 'approved';
            
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                [
                    Query.equal('adminStatus', statusQuery),
                    Query.orderDesc('$createdAt')
                ]
            );
            setVideos(response.documents);
            setSelectedVideos([]); // Reset selections on tab change
        } catch (error) {
            console.error("Error fetching videos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchVideos();
    }, [activeTab, user]);

    // --- 3. APPROVE VIDEO ---
    const handleApprove = async (videoId) => {
        try {
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                videoId,
                { adminStatus: 'approved' }
            );
            // Remove from local list to update UI instantly
            setVideos(prev => prev.filter(v => v.$id !== videoId));
        } catch (error) {
            console.error("Error approving video:", error);
            alert("Failed to approve video.");
        }
    };

    // --- 4. REJECT & DELETE VIDEO ---
    const handleReject = async (video) => {
        const confirmDelete = window.confirm(`Are you sure you want to permanently delete "${video.title}"?`);
        if (!confirmDelete) return;

        try {
            // A. Delete from R2 (Cloudflare)
            if (video.sourceFileId) {
                const deleteParams = {
                    Bucket: process.env.REACT_APP_R2_BUCKET_NAME || 'ofg-connects-temp', // Ensure this matches your .env
                    Key: video.sourceFileId,
                };
                await r2Client.send(new DeleteObjectCommand(deleteParams));
                console.log("Deleted from R2");
            }

            // B. Delete Thumbnail from Appwrite (if exists)
            // We try to extract ID from URL or assume you added a thumbnailId field
            if (video.thumbnailUrl) {
                // Attempt to parse ID from URL if you didn't save thumbnailId separately
                // URL format: .../files/[FILE_ID]/view...
                const match = video.thumbnailUrl.match(/\/files\/([^\/]+)\//);
                if (match && match[1]) {
                    try {
                        await storage.deleteFile(BUCKET_ID_VIDEOS, match[1]);
                        console.log("Deleted Thumbnail");
                    } catch (e) {
                        console.warn("Thumbnail already deleted or not found");
                    }
                }
            }

            // C. Delete Document from Database
            await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_VIDEOS, video.$id);

            // Update UI
            setVideos(prev => prev.filter(v => v.$id !== video.$id));
            alert("Video rejected and files deleted.");

        } catch (error) {
            console.error("Error rejecting video:", error);
            alert(`Failed to delete: ${error.message}`);
        }
    };

    // --- 5. BULK COMPRESS (For Approved Tab) ---
    const handleBulkCompress = async () => {
        if (selectedVideos.length === 0) return;

        try {
            const promises = selectedVideos.map(videoId => 
                databases.updateDocument(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS,
                    videoId,
                    { compressionStatus: 'queued' } // Your worker script should listen for this
                )
            );
            
            await Promise.all(promises);
            alert(`Queued ${selectedVideos.length} videos for compression!`);
            setSelectedVideos([]);
            fetchVideos(); // Refresh to show status
        } catch (error) {
            console.error("Error starting compression:", error);
        }
    };

    const toggleSelection = (videoId) => {
        setSelectedVideos(prev => 
            prev.includes(videoId) 
                ? prev.filter(id => id !== videoId)
                : [...prev, videoId]
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-300 dark:border-gray-700 pb-2">
                <button 
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                >
                    Pending Approvals
                </button>
                <button 
                    onClick={() => setActiveTab('approved')}
                    className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === 'approved' ? 'bg-green-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                >
                    Ready for Compression
                </button>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="text-center py-10">Loading videos...</div>
            ) : (
                <div className="space-y-4">
                    {videos.length === 0 && <p className="text-gray-500 italic">No videos found in this category.</p>}

                    {/* Bulk Actions Bar */}
                    {activeTab === 'approved' && videos.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center mb-4 sticky top-0 z-10 border border-gray-200 dark:border-gray-700">
                            <span className="font-semibold">{selectedVideos.length} selected</span>
                            <button 
                                onClick={handleBulkCompress}
                                disabled={selectedVideos.length === 0}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                Start Compression Job
                            </button>
                        </div>
                    )}

                    {/* Video Cards */}
                    <div className="grid gap-4">
                        {videos.map(video => (
                            <div key={video.$id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col md:flex-row gap-4 items-start border border-gray-200 dark:border-gray-700">
                                
                                {/* Checkbox */}
                                {activeTab === 'approved' && (
                                    <div className="mt-8 md:mt-0">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedVideos.includes(video.$id)}
                                            onChange={() => toggleSelection(video.$id)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                    </div>
                                )}

                                {/* Thumbnail */}
                                <div className="w-full md:w-48 aspect-video bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                                    {video.thumbnailUrl ? (
                                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover"/>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-xs text-gray-500">No Thumb</div>
                                    )}
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg truncate">{video.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">By: {video.username || 'Unknown'} | Cat: {video.category}</p>
                                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-300 line-clamp-2">{video.description}</p>
                                    
                                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-mono">
                                        <span className={`px-2 py-1 rounded ${video.adminStatus === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            Status: {video.adminStatus}
                                        </span>
                                        <span className={`px-2 py-1 rounded ${video.compressionStatus === 'queued' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-200 text-gray-800'}`}>
                                            Compression: {video.compressionStatus}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2 w-full md:w-auto min-w-[140px]">
                                    {activeTab === 'pending' ? (
                                        <>
                                            <a 
                                                href={video.videoUrl} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="text-blue-600 hover:text-blue-800 text-sm text-center mb-2 font-medium"
                                            >
                                                Preview Video
                                            </a>
                                            
                                            <button 
                                                onClick={() => handleApprove(video.$id)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-sm transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleReject(video)}
                                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow-sm transition-colors"
                                            >
                                                Reject & Delete
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center md:text-right pt-2">
                                           {video.compressionStatus === 'queued' ? (
                                               <span className="text-green-500 font-bold flex items-center justify-end gap-1">
                                                   ✓ Queued
                                               </span>
                                           ) : (
                                               <span className="text-gray-400 text-sm">Waiting for selection</span>
                                           )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;