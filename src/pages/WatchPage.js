// src/pages/WatchPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases } from '../appwriteConfig';
import { useAuth } from '../context/AuthContext';
import { useBible } from '../context/BibleContext'; // <-- 1. IMPORT
import { 
    DATABASE_ID, 
    COLLECTION_ID_VIDEOS,
    COLLECTION_ID_HISTORY
} from '../appwriteConfig';
import { ID, Query, Permission, Role } from 'appwrite';
import Comments from '../components/Comments';
import FollowButton from '../components/FollowButton';
import LikeButton from '../components/LikeButton';
import ShareButton from '../components/ShareButton';
import SuggestedVideos from '../components/SuggestedVideos';
import BiblePanel from '../components/BibleFeature/BiblePanel';

const WATCH_LATER_KEY = 'ofg_watch_later_list';

// ... (BookmarkIcon and BookmarkIconSolid components remain the same) ...
const BookmarkIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg> );
const BookmarkIconSolid = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg> );

const WatchPage = () => {
    const { videoId } = useParams();
    const { user } = useAuth();
    const { bibleView } = useBible(); // <-- 2. GET THE NEW STATE
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);

    // ... (All your video logic stays the same) ...
    const checkSavedStatus = (id) => { const savedList = JSON.parse(localStorage.getItem(WATCH_LATER_KEY) || '[]'); return savedList.includes(id); };
    const toggleSavedStatus = (id) => { let savedList = JSON.parse(localStorage.getItem(WATCH_LATER_KEY) || '[]'); if (savedList.includes(id)) { savedList = savedList.filter(vId => vId !== id); setIsSaved(false); } else { savedList.push(id); setIsSaved(true); } localStorage.setItem(WATCH_LATER_KEY, JSON.stringify(savedList)); };
    const logVideoView = async (userId, videoId) => { if (!userId) return; try { const existingView = await databases.listDocuments( DATABASE_ID, COLLECTION_ID_HISTORY, [ Query.equal('userId', userId), Query.equal('videoId', videoId), Query.orderDesc('$createdAt'), Query.limit(1) ] ); if (existingView.total > 0) { const lastViewTime = new Date(existingView.documents[0].$createdAt); const fiveMinutes = 5 * 60 * 1000; if (Date.now() - lastViewTime.getTime() < fiveMinutes) { return; } } await databases.createDocument( DATABASE_ID, COLLECTION_ID_HISTORY, ID.unique(), { userId: userId, videoId: videoId }, [ Permission.read(Role.user(userId)), Permission.write(Role.user(userId)) ] ); } catch (e) { console.error('Failed to log video view:', e); } };
    useEffect(() => { const getVideo = async () => { setLoading(true); try { const response = await databases.getDocument( DATABASE_ID, COLLECTION_ID_VIDEOS, videoId ); setVideo(response); setIsSaved(checkSavedStatus(response.$id)); if (user) { logVideoView(user.$id, videoId); } } catch (error) { console.error('Failed to fetch video:', error); } setLoading(false); }; getVideo(); }, [videoId, navigate, user, setLoading, setIsSaved]);
    const actionButtonClasses = ` flex items-center justify-center gap-2 py-2 px-4 h-9 rounded-full font-medium text-sm text-neutral-800 bg-gray-100 hover:bg-gray-200 transition-colors duration-200 ease-in-out whitespace-nowrap dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 `;
    const saveButtonClasses = ` ${actionButtonClasses} ${isSaved ? 'bg-gray-200 font-semibold dark:bg-gray-600' : ''} `;
    if (loading) { return ( <div className="flex w-full h-full min-h-[70vh] items-center justify-center p-10 bg-white dark:bg-gray-950"> <p className="text-xl text-neutral-500 dark:text-gray-400">Loading video...</p> </div> ); }
    if (!video) { return ( <div className="flex w-full h-full min-h-[70vh] items-center justify-center p-10 bg-white dark:bg-gray-950"> <p className="text-xl text-red-600">Video not found or failed to load.</p> </div> ); }

    // --- 3. DYNAMIC GRID LOGIC ---
    let gridColsClass = 'lg:grid-cols-3'; // Default: Video + Suggested
    if (bibleView === 'sidebar') {
        gridColsClass = 'lg:grid-cols-2'; // Video + Bible
    } else if (bibleView === 'fullscreen') {
        gridColsClass = 'lg:grid-cols-1'; // Bible only
    }

    return (
        <div className="w-full bg-white text-neutral-900 dark:bg-gray-950 dark:text-white font-sans p-4 sm:p-6 lg:p-8">
            <div className={`max-w-screen-xl mx-auto grid grid-cols-1 lg:gap-x-6 gap-y-6 ${gridColsClass}`}>

                {/* --- COLUMN 1: Video Player & Comments --- */}
                {/* This column is HIDDEN in fullscreen mode */}
                {bibleView !== 'fullscreen' && (
                    <div className={bibleView === 'sidebar' ? 'lg:col-span-1' : 'lg:col-span-2'}>
                        
                        <div className="w-full aspect-video rounded-lg bg-black mb-4 overflow-hidden">
                            <video controls src={video.videoUrl} className="w-full h-full">
                                Your browser does not support the video tag.
                            </video>
                        </div>

                        <h1 className="mb-3 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            {video.title}
                        </h1>

                        {video.username && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex justify-center items-center text-xl font-bold text-white shrink-0">
                                        {video.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-base font-semibold text-neutral-800 dark:text-gray-200">
                                        {video.username}
                                    </span>
                                    <FollowButton creatorId={video.userId} creatorName={video.username} />
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <LikeButton videoId={video.$id} initialLikeCount={video.likeCount || 0} />
                                    <ShareButton videoId={video.$id} videoTitle={video.title} />
                                    <button
                                        className={saveButtonClasses}
                                        onClick={() => toggleSavedStatus(video.$id)}
                                        title={isSaved ? 'Remove from Save List' : 'Add to Save List'}
                                    >
                                        {isSaved
                                            ? <BookmarkIconSolid className="h-5 w-5" />
                                            : <BookmarkIcon className="h-5 w-5" />
                                        }
                                        {isSaved ? 'Saved' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="mt-4 p-4 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-700">
                            <p className="text-sm text-neutral-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {video.description || 'No description provided.'}
                            </p>
                        </div>
                        
                        <hr className="border-t border-gray-200 dark:border-gray-700 my-6" />

                        <Comments videoId={videoId} />
                    </div>
                )}
                
                {/* --- COLUMN 2: Suggested Videos (Only for 'closed' view) --- */}
                {bibleView === 'closed' && (
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <SuggestedVideos currentVideo={video} />
                    </div>
                )}

                {/* --- COLUMN 3: Bible Panel (For 'sidebar' and 'fullscreen' view) --- */}
                {bibleView !== 'closed' && (
                    <div className="lg:col-span-1 flex flex-col gap-6">
                         <div className="w-full h-full min-h-[500px] lg:h-[80vh]">
                            <BiblePanel />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WatchPage;