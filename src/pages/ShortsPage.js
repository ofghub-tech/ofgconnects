// src/pages/ShortsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { 
    DATABASE_ID, 
    COLLECTION_ID_VIDEOS // <-- CHANGED: Use the main videos collection
} from '../appwriteConfig';
import { Query } from 'appwrite';
// REMOVED: Modal is no longer needed
// import './ShortsPage.css'; // <-- REMOVED THIS LINE TO FIX THE ERROR

const ShortsPage = () => {
    const navigate = useNavigate();
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(true);
    // REMOVED: Modal state is no longer needed
    
    useEffect(() => {
        const getShorts = async () => {
            setLoading(true);
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS, // <-- CHANGED: Use main videos collection
                    [
                        // --- THIS IS THE NEW QUERY ---
                        // This query ensures we ONLY get "shorts" videos
                        Query.equal('category', 'shorts'),
                        // --- END NEW QUERY ---
                        Query.orderDesc('$createdAt')
                    ]
                );
                setShorts(response.documents);
            } catch (error) {
                console.error('Failed to fetch shorts:', error);
            }
            setLoading(false);
        };

        getShorts();
    }, []);

    // REMOVED: Modal handler functions are no longer needed

    // Helper to safely play video on hover, catching errors
    const handleMouseOver = (e) => {
        e.target.play().catch(error => {
            // Ignore "interrupted" errors if user mouses away quickly
        });
    };

    const handleMouseOut = (e) => {
        e.target.pause();
    };

    return (
        <>
            {/* --- MODIFIED: Replaced custom class with Tailwind --- */}
            <div className="p-4 sm:p-6 lg:p-8 min-h-full bg-gray-50 dark:bg-gray-900">
                {/* --- MODIFIED: Replaced custom class with Tailwind --- */}
                <h1 className="text-3xl font-bold text-gray-900 mb-6 dark:text-gray-100">Shorts</h1>
                
                {/* --- MODIFIED: Added dark mode text --- */}
                {loading && <p className="text-gray-600 dark:text-gray-400">Loading shorts...</p>}

                {!loading && shorts.length === 0 && (
                    // --- MODIFIED: Replaced custom class with Tailwind ---
                    <p className="text-gray-600 dark:text-gray-400">
                        No shorts have been uploaded yet.
                    </p>
                )}

                {/* --- MODIFIED: Replaced custom class with Tailwind --- */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {shorts.map(short => (
                        <div 
                            key={short.$id} 
                            // --- MODIFIED: Replaced custom class with Tailwind ---
                            className="relative aspect-[9/16] rounded-lg overflow-hidden shadow-md cursor-pointer group transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 bg-gray-800"
                            // --- THIS IS THE NAVIGATION FIX ---
                            // Click now navigates to the VideoRouter
                            onClick={() => navigate(`/watch/${short.$id}`)} 
                        >
                            <video 
                                src={short.videoUrl} 
                                // --- MODIFIED: Replaced custom class with Tailwind ---
                                className="w-full h-full object-cover"
                                loop
                                muted
                                playsInline
                                onMouseOver={handleMouseOver} // Use safe handler
                                onMouseOut={handleMouseOut}
                            />
                            {/* --- MODIFIED: Replaced custom class with Tailwind --- */}
                            <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/60 to-transparent">
                                {/* --- MODIFIED: Replaced custom class with Tailwind --- */}
                                <span className="text-white text-sm font-medium truncate">{short.username}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* REMOVED: The entire Modal component is gone */}
        </>
    );
};

export default ShortsPage;