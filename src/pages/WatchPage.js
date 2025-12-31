// src/pages/WatchPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import SuggestedVideos from '../components/SuggestedVideos';
import Comments from '../components/Comments';
import LikeButton from '../components/LikeButton';
import ShareButton from '../components/ShareButton';
import FollowButton from '../components/FollowButton';
import AdBanner from '../components/AdBanner'; // <--- Import AdBanner
import Avatar from '../components/Avatar';     // <--- Import Avatar

const WatchPage = () => {
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVideo = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS,
                    id
                );
                setVideo(response);
                
                // View Count Logic
                try {
                     const currentViews = response.view_count || response.views || 0;
                     await databases.updateDocument(
                        DATABASE_ID,
                        COLLECTION_ID_VIDEOS,
                        id,
                        { view_count: currentViews + 1 }
                     );
                } catch(e) {
                    console.log("View update failed", e);
                }

            } catch (err) {
                console.error("Error fetching video:", err);
                setError(err.message || "Could not load video");
            }
            setLoading(false);
        };

        if (id) {
            fetchVideo();
        }
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-black">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
    );

    if (error || !video) return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center px-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Video not found</h2>
            <p className="text-gray-500">{error || "The video you are looking for does not exist or has been removed."}</p>
        </div>
    );

    // MAPPING: Use 'video_url'
    const videoSource = video.video_url || video.videoUrl;
    const thumbnailSource = video.thumbnailUrl || video.thumbnail_url;

    return (
        <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100">
            <div className="max-w-[1800px] mx-auto p-0 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
                
                {/* Left Side: Player & Info */}
                <div className="lg:w-3/4 flex flex-col gap-4">
                    
                    {/* Player Container */}
                    <div className="w-full bg-black sm:rounded-xl overflow-hidden shadow-lg aspect-video relative group">
                        {videoSource ? (
                            <video 
                                controls 
                                autoPlay 
                                className="w-full h-full object-contain"
                                src={videoSource}
                                poster={thumbnailSource}
                            >
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <div className="flex items-center justify-center h-full text-white">
                                Error: No video source URL found.
                            </div>
                        )}
                    </div>

                    {/* Video Title & Details */}
                    <div className="px-4 sm:px-0">
                        <h1 className="text-xl sm:text-2xl font-bold mt-2">{video.title}</h1>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-gray-200 dark:border-gray-800">
                            
                            {/* Channel Info */}
                            <div className="flex items-center gap-3">
                                <Link to={`/channel/${video.userId}`}>
                                    {/* --- UPDATED: Uses Avatar Component --- */}
                                    <Avatar 
                                        url={video.creatorAvatar} 
                                        name={video.username} 
                                        size="md" 
                                    />
                                </Link>
                                <div>
                                    <Link to={`/channel/${video.userId}`} className="font-semibold text-base hover:underline">
                                        {video.username}
                                    </Link>
                                    <p className="text-xs text-gray-500">
                                        {video.creatorId === video.userId ? 'Owner' : ''}
                                    </p>
                                </div>
                                <FollowButton targetUserId={video.userId} />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 justify-end">
                                <LikeButton videoId={video.$id} initialLikes={video.likes || []} />
                                <ShareButton />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-gray-100 dark:bg-[#1f1f1f] p-3 rounded-xl text-sm whitespace-pre-wrap mt-4">
                            <div className="font-semibold mb-2">
                                 {video.view_count || 0} views • {new Date(video.$createdAt).toLocaleDateString()}
                            </div>
                            <p>{video.description || "No description provided."}</p>
                        </div>

                        <Comments videoId={video.$id} />
                    </div>
                </div>

                {/* Right Side: Suggested Videos & Ads */}
                <div className="lg:w-1/4 px-4 sm:px-0">
                    
                    {/* --- SIDEBAR AD --- */}
                    {/* Hidden on mobile, visible on Large screens */}
                    <AdBanner 
                        slotId="5592018392" 
                        className="mb-6 hidden lg:flex" 
                    />
                    
                    <h3 className="text-lg font-bold mb-4 hidden lg:block">Up Next</h3>
                    <SuggestedVideos currentVideo={video} />
                </div>
            </div>
        </div>
    );
};

export default WatchPage;