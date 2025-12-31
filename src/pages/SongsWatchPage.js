import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { useParams, useNavigate, Link } from 'react-router-dom'; // Added Link
import { databases } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import {
    DATABASE_ID,
    COLLECTION_ID_VIDEOS,
    COLLECTION_ID_HISTORY,
    COLLECTION_ID_WATCH_LATER
} from '../appwriteConfig';
import { ID, Query, Permission, Role } from 'appwrite';
import Comments from '../components/Comments';
import FollowButton from '../components/FollowButton';
import LikeButton from '../components/LikeButton';
import ShareButton from '../components/ShareButton';
import SuggestedVideos from '../components/SuggestedVideos';
import Avatar from '../components/Avatar'; // Added Avatar

// --- (ICONS UNCHANGED) ---
const BookmarkIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>);
const BookmarkIconSolid = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>);
const EyeIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);

const SongsWatchPage = () => {
    const { videoId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);
    const [savedDocId, setSavedDocId] = useState(null);
    const [isTogglingSave, setIsTogglingSave] = useState(false);
    
    // Ref to track if view has been counted for the current session
    const viewCountedRef = useRef(false);

    // 1. Check Saved Status
    useEffect(() => {
        const checkSavedStatus = async () => {
            if (!user || !videoId) { setIsSaved(false); setSavedDocId(null); return; }
            try {
                const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID_WATCH_LATER, [Query.equal('userId', user.$id), Query.equal('videoId', videoId), Query.limit(1)]);
                if (response.total > 0) { setIsSaved(true); setSavedDocId(response.documents[0].$id); }
                else { setIsSaved(false); setSavedDocId(null); }
            } catch (error) { console.error("Watch later check failed:", error); }
        };
        checkSavedStatus();
    }, [user, videoId]);

    const handleToggleSave = async () => {
        if (!user) return alert("Please log in to save videos.");
        if (isTogglingSave) return;
        setIsTogglingSave(true);
        try {
            if (isSaved && savedDocId) {
                await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_WATCH_LATER, savedDocId);
                setIsSaved(false); setSavedDocId(null);
            } else {
                const response = await databases.createDocument(DATABASE_ID, COLLECTION_ID_WATCH_LATER, ID.unique(), { userId: user.$id, videoId: videoId }, [Permission.read(Role.user(user.$id)), Permission.write(Role.user(user.$id))]);
                setIsSaved(true); setSavedDocId(response.$id);
            }
        } catch (error) { alert("Failed to update Watch Later."); }
        setIsTogglingSave(false);
    };

    // 2. Fetch Video & Log View
    useEffect(() => {
        viewCountedRef.current = false; // Reset on ID change

        const getVideo = async () => {
            setLoading(true);
            try {
                const response = await databases.getDocument(DATABASE_ID, COLLECTION_ID_VIDEOS, videoId);
                setVideo(response);

                // --- VIEW COUNT LOGIC (Synced with WatchPage) ---
                if (user && !viewCountedRef.current) {
                    viewCountedRef.current = true;
                    try {
                        const historyCheck = await databases.listDocuments(
                            DATABASE_ID, COLLECTION_ID_HISTORY,
                            [Query.equal('userId', user.$id), Query.equal('videoId', videoId), Query.limit(1)]
                        );
                        
                        if (historyCheck.total === 0) {
                            await databases.createDocument(
                                DATABASE_ID, COLLECTION_ID_HISTORY, ID.unique(),
                                { userId: user.$id, videoId: videoId },
                                [Permission.read(Role.user(user.$id)), Permission.write(Role.user(user.$id))]
                            );
                            const newViewCount = (response.view_count || 0) + 1;
                            await databases.updateDocument(DATABASE_ID, COLLECTION_ID_VIDEOS, videoId, { view_count: newViewCount });
                            setVideo(prev => ({ ...prev, view_count: newCount }));
                        }
                    } catch (e) { console.error('View log failed:', e); }
                }
            } catch (error) { console.error('Failed to fetch video:', error); }
            setLoading(false);
        };
        getVideo();
    }, [videoId, navigate, user]);

    if (loading) return <div className="flex w-full h-[70vh] items-center justify-center"><p className="text-neutral-500 dark:text-gray-400">Loading...</p></div>;
    if (!video) return <div className="flex w-full h-[70vh] items-center justify-center"><p className="text-red-600">Video not found.</p></div>;

    return (
        <div className="w-full text-neutral-900 p-4 sm:p-6 lg:p-8 dark:text-gray-100">
            <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-3 lg:gap-x-6 gap-y-6">
                <div className="lg:col-span-2">
                    <div className="w-full aspect-video rounded-xl bg-black mb-4 overflow-hidden">
                        <video 
                            controls 
                            src={video.url_4k || video.videoUrl} 
                            className="w-full h-full"
                        >
                            Not supported.
                        </video>
                    </div>

                    <div className="glass-panel p-4 sm:p-6 mb-6">
                        <h1 className="mb-3 text-xl sm:text-2xl font-bold">{video.title}</h1>
                        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-gray-400 mb-3">
                            <EyeIcon className="w-5 h-5" />
                            <span>{(video.view_count || 0).toLocaleString()} views</span>
                        </div>
                        {video.username && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3 border-y border-white/20 dark:border-gray-700/50 my-4">
                                
                                {/* --- UPDATED LINK & AVATAR SECTION --- */}
                                <div className="flex items-center gap-3">
                                    <Link to={`/channel/${video.userId}`}>
                                        <Avatar 
                                            url={video.creatorAvatar} 
                                            name={video.username} 
                                            size="md" 
                                        />
                                    </Link>
                                    <div>
                                        <Link to={`/channel/${video.userId}`} className="font-semibold text-base hover:underline block">
                                            {video.username}
                                        </Link>
                                        <p className="text-xs text-gray-500">
                                            {video.creatorId === video.userId ? 'Owner' : ''}
                                        </p>
                                    </div>
                                    <FollowButton targetUserId={video.userId} />
                                </div>
                                {/* ------------------------------------- */}

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <LikeButton videoId={video.$id} initialLikeCount={video.likeCount || 0} />
                                    <ShareButton videoId={video.$id} videoTitle={video.title} />
                                    <button
                                        className={`flex items-center justify-center gap-2 py-2 px-4 h-9 rounded-full font-medium text-sm bg-gray-100/50 hover:bg-gray-200/50 dark:bg-gray-700/50 dark:text-gray-100 dark:hover:bg-gray-600/50 transition-colors disabled:opacity-50 ${isSaved ? 'bg-gray-200/70 font-semibold dark:bg-gray-600/70' : ''}`}
                                        onClick={handleToggleSave} disabled={isTogglingSave}
                                    >
                                        {isSaved ? <BookmarkIconSolid className="h-5 w-5" /> : <BookmarkIcon className="h-5 w-5" />}
                                        {isSaved ? 'Saved' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="mt-4 p-4 bg-gray-100/50 hover:bg-gray-200/50 transition-colors rounded-lg cursor-pointer dark:bg-gray-800/50 dark:hover:bg-gray-700/50">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{video.description || 'No description.'}</p>
                        </div>
                    </div>
                    
                    <div className="glass-panel p-4 sm:p-6">
                        <Comments videoId={videoId} />
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <SuggestedVideos currentVideo={video} forceCategory="songs" />
                </div>
            </div>
        </div>
    );
};

export default SongsWatchPage;