// src/pages/MySpacePage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import { Link } from 'react-router-dom';
import UploadForm from '../components/UploadForm';
import Modal from '../components/Modal';

// Keep the old CSS import if it styles your video list
// import './MySpacePage.css'; // <-- REMOVED THIS LINE TO FIX THE ERROR

const MySpacePage = () => {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);

    const fetchUserVideos = async () => {
        setLoading(true);
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID_VIDEOS,
                [Query.equal('userId', user.$id), Query.orderDesc('$createdAt')]
            );
            setVideos(response.documents);
        } catch (error) {
            console.error('Failed to fetch user videos:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (user) {
            fetchUserVideos();
        }
    }, [user]);

    // --- THIS IS THE NEW HANDLER ---
    // This function will be passed to UploadForm
    // It will be called after a successful upload
    const handleUploadComplete = () => {
        setShowUploadModal(false); // Close the modal
        fetchUserVideos(); // Refresh the video list
    };

    return (
        // --- MODIFIED: Added dark mode classes ---
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-full dark:bg-gray-900">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    {/* --- MODIFIED: Added dark mode classes --- */}
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Space</h1>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors"
                    >
                        Upload Video
                    </button>
                </div>

                {/* --- This Modal now shows the new form --- */}
                {showUploadModal && (
                    <Modal onClose={() => setShowUploadModal(false)}>
                        <UploadForm 
                            onUploadSuccess={handleUploadComplete} // <-- PASS THE HANDLER
                        />
                    </Modal>
                )}

                {/* --- MODIFIED: Added dark mode classes --- */}
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 dark:text-gray-200">My Videos</h2>
                {loading ? (
                    // --- MODIFIED: Added dark mode classes ---
                    <p className="dark:text-gray-300">Loading videos...</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videos.length === 0 ? (
                            // --- MODIFIED: Added dark mode classes ---
                            <p className="text-gray-500 col-span-full dark:text-gray-400">You haven't uploaded any videos yet.</p>
                        ) : (
                            videos.map((video) => (
                                <Link to={`/watch/${video.$id}`} key={video.$id} className="video-card-link group">
                                    {/* --- MODIFIED: Added dark mode classes --- */}
                                    <div className="bg-white rounded-lg shadow overflow-hidden transition-transform duration-300 group-hover:scale-105 dark:bg-gray-800">
                                        <img
                                            src={video.thumbnailUrl} // Use the new thumbnail URL
                                            alt={video.title}
                                            className="w-full h-32 object-cover"
                                        />
                                        <div className="p-4">
                                            {/* --- MODIFIED: Added dark mode classes --- */}
                                            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                                                {video.title}
                                            </h3>
                                            {/* You can add more details here, like views or date */}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MySpacePage;