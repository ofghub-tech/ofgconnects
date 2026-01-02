// src/pages/ShortsPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases, account } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VIDEOS } from '../appwriteConfig';
import { Query } from 'appwrite';
import { FaComment, FaShare, FaExclamationCircle } from 'react-icons/fa'; 
import './ShortsPage.css';

const ShortsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        // 1. Get Current User (Used for Follow button visibility)
        const checkUser = async () => {
            try {
                const user = await account.get();
                setCurrentUserId(user.$id);
            } catch (e) {
                console.log("User not logged in");
            }
        };
        checkUser();

        // 2. Fetch Videos
        const fetchShorts = async () => {
            setLoading(true);
            try {
                if (!DATABASE_ID || !COLLECTION_ID_VIDEOS) throw new Error("Missing Config IDs");

                let fetchedVideos = [];
                // Fetch specific video if ID exists
                if (id) {
                    try {
                        const specificVideo = await databases.getDocument(DATABASE_ID, COLLECTION_ID_VIDEOS, id);
                        fetchedVideos.push(specificVideo);
                    } catch (e) { console.warn("Video not found"); }
                }

                // --- FIX APPLIED HERE: Filter by category 'shorts' ---
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS,
                    [
                        Query.equal('category', 'shorts'), // <--- ONLY SHOW SHORTS
                        Query.limit(10), 
                        Query.orderDesc('$createdAt')
                    ]
                );

                const newVideos = response.documents.filter(doc => doc.$id !== id);
                setVideos([...fetchedVideos, ...newVideos]);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchShorts();
    }, [id]);

    if (error) return <div className="error-container"><FaExclamationCircle /> {error}</div>;
    if (loading) return <div className="loading-container">Loading Shorts...</div>;

    return (
        <div className="shorts-container">
            {videos.map((video) => (
                <SingleShort 
                    key={video.$id} 
                    video={video} 
                    currentUserId={currentUserId} 
                    navigate={navigate}
                />
            ))}
        </div>
    );
};

// --- Sub-Component ---
const SingleShort = ({ video, currentUserId, navigate }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Interaction States
    const [isFollowing, setIsFollowing] = useState(false); 

    // 1. Scroll & Auto-Play Logic
    useEffect(() => {
        const options = { threshold: 0.6 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!videoRef.current) return;
                if (entry.isIntersecting) {
                    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                } else {
                    if (videoRef.current) {
                        videoRef.current.pause();
                        videoRef.current.currentTime = 0; // Reset
                    }
                    setIsPlaying(false);
                }
            });
        }, options);

        if (videoRef.current) observer.observe(videoRef.current);
        return () => observer.disconnect();
    }, []);

    // 2. Handle Follow
    const handleFollow = () => {
        if (!currentUserId) return alert("Please login to follow!");
        setIsFollowing(!isFollowing);
        console.log("Follow toggled for:", video.userId);
    };

    // 3. Handle Share
    const handleShare = async () => {
        const shareData = {
            title: video.title,
            text: `Check out this video by ${video.username}`,
            url: window.location.origin + `/shorts/watch/${video.$id}`,
        };

        if (navigator.share) {
            try { await navigator.share(shareData); } catch (e) {}
        } else {
            navigator.clipboard.writeText(shareData.url);
            alert("Link copied to clipboard!");
        }
    };

    // 4. Handle Comment
    const handleComment = () => {
        navigate(`/watch/${video.$id}`);
    };

    const videoSource = video.video_url || video.videoUrl;
    if (!videoSource) return null;

    return (
        <div className="short-item">
            <div className="video-wrapper">
                <video
                    ref={videoRef}
                    src={videoSource}
                    className="short-video"
                    loop
                    playsInline
                    onClick={() => {
                        if (isPlaying) videoRef.current.pause();
                        else videoRef.current.play();
                        setIsPlaying(!isPlaying);
                    }}
                />
                
                {/* Overlay UI */}
                <div className="short-overlay">
                    <div className="short-info">
                        <div className="user-header">
                            <h3>@{video.username || "User"}</h3>
                            
                            {/* Follow Button */}
                            {currentUserId !== video.userId && (
                                <button 
                                    className={`follow-btn ${isFollowing ? 'following' : ''}`} 
                                    onClick={handleFollow}
                                >
                                    {isFollowing ? "Following" : "Follow"}
                                </button>
                            )}
                        </div>
                        <p>{video.title}</p>
                    </div>
                    
                    <div className="short-actions">
                        {/* Comment Button */}
                        <button className="action-btn" onClick={handleComment}>
                            <FaComment /> 
                            <span>Comment</span>
                        </button>

                        {/* Share Button */}
                        <button className="action-btn" onClick={handleShare}>
                            <FaShare /> 
                            <span>Share</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShortsPage;