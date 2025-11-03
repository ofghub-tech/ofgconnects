// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VERSES, COLLECTION_ID_VIDEOS } from '../appwriteConfig'; 
import { Query } from 'appwrite';
import Feed from '../components/Feed';
import './HomePage.css';

const HomePage = () => {
    // State
    const [searchTerm] = useState(null); 
    const [dailyVerse, setDailyVerse] = useState(null);
    const [verseLoading, setVerseLoading] = useState(true);
    const [videos, setVideos] = useState([]); 
    const [videosLoading, setVideosLoading] = useState(true); 

    // ------------------------------------
    // 1. LOGIC TO FETCH MAIN VIDEO FEED
    // ------------------------------------
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_VIDEOS, 
                    [Query.limit(25), Query.orderDesc('$createdAt')] 
                );
                setVideos(response.documents);
            } catch (error) {
                console.error("Failed to fetch videos for the feed:", error);
            }
            setVideosLoading(false);
        };
        fetchVideos();
    }, []); 


    // ------------------------------------
    // 2. LOGIC TO FETCH RANDOM DAILY VERSE
    // ------------------------------------
    useEffect(() => {
        const fetchRandomVerse = async () => {
            try {
                // --- ★ THE FIX IS HERE ★ ---
                // We changed Query.limit(0) to Query.limit(1)
                // Appwrite does not allow a limit of 0.
                const countResponse = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_VERSES,
                    [Query.limit(1)] 
                );
                // --- ★ END OF FIX ★ ---

                const totalVerses = countResponse.total;
                if (totalVerses === 0) {
                    setDailyVerse({ verseText: "No verses uploaded yet.", reference: "" });
                    setVerseLoading(false);
                    return;
                }
                const randomOffset = Math.floor(Math.random() * totalVerses);
                const verseResponse = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_VERSES,
                    [Query.offset(randomOffset), Query.limit(1)]
                );
                
                if (verseResponse.documents.length > 0) {
                    const fetchedVerse = verseResponse.documents[0];
                    setDailyVerse(fetchedVerse);
                    localStorage.setItem('dailyBibleVerse', JSON.stringify(fetchedVerse)); 
                }

            } catch (error) {
                // Now we can go back to a clean catch block
                console.error("Failed to fetch daily verse:", error); 
                setDailyVerse({ 
                    verseText: "Failed to load verse.", 
                    reference: "Check Appwrite connection." 
                });
            }
            setVerseLoading(false);
        };

        // Cache check logic
        const lastFetchTime = localStorage.getItem('lastVerseFetch');
        const now = new Date().getTime();
        const oneDay = 24 * 60 * 60 * 1000;
        const storedVerse = localStorage.getItem('dailyBibleVerse');

        if (!lastFetchTime || (now - lastFetchTime > oneDay)) {
            fetchRandomVerse();
            localStorage.setItem('lastVerseFetch', String(now));
        } else if (storedVerse) {
            setDailyVerse(JSON.parse(storedVerse));
            setVerseLoading(false);
        } else {
            fetchRandomVerse();
        }
        
    }, []); 

    // ------------------------------------
    // 3. RENDER FUNCTION
    // ------------------------------------
    return (
        <div className="feed-area-wrapper">
            
            {/* 1. Daily Random Verse Section */}
            <div className="daily-verse-container">
                {verseLoading ? (
                    <p className="verse-loading">Loading today's inspiration...</p>
                ) : (
                    dailyVerse && (
                        <>
                            <p className="verse-text">{dailyVerse.verseText}</p>
                            <span className="verse-reference">{dailyVerse.reference}</span>
                        </>
                    )
                )}
            </div>

            {/* 2. Main Video Feed */}
            <div className="main-video-feed">
                {videosLoading ? (
                    <p>Loading videos for your feed...</p>
                ) : (
                    <Feed searchTerm={searchTerm} videos={videos} /> 
                )}
            </div>
            
        </div>
    );
};

export default HomePage;