// src/pages/HomePage.js
//
// UPDATED: This page now listens to the global BibleContext
// and changes its layout.

import React, { useState } from 'react';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VERSES } from '../appwriteConfig'; 
import { Query } from 'appwrite';
import Feed from '../components/Feed';
import { useQuery } from '@tanstack/react-query';

// --- 1. IMPORT BIBLE AND SIDEBAR COMPONENTS ---
import { useBible } from '../context/BibleContext';
import BiblePanel from '../components/BibleFeature/BiblePanel';
import SuggestedVideos from '../components/SuggestedVideos';


// --- Book Icon Component (This is the full code) ---
const BookIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);

// --- Data Fetching Function (This is the full code) ---
const fetchRandomVerse = async () => {
    // 1. Get the total count of verses
    const countResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID_VERSES,
        [Query.limit(1)] // Efficient query just to get the 'total'
    );
    
    const totalVerses = countResponse.total;
    if (totalVerses === 0) {
        throw new Error("No verses uploaded yet.");
    }

    // 2. Pick a random number between 0 and (total - 1)
    const randomOffset = Math.floor(Math.random() * totalVerses);

    // 3. Fetch the document at that random offset
    const verseResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID_VERSES,
        [Query.offset(randomOffset), Query.limit(1)
]
    );
    
    return verseResponse.documents[0];
};

// --- HomePage Component ---
const HomePage = () => {
    const [searchTerm] = useState(null); 
    
    // --- 2. GET BIBLE STATE ---
    const { bibleView } = useBible();

    const { 
        data: dailyVerse, 
        isLoading: verseLoading, 
        isError: verseError 
    } = useQuery({
        queryKey: ['dailyVerse'],
        queryFn: fetchRandomVerse,
        staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
        refetchOnWindowFocus: false, // Don't refetch just for switching tabs
    });

    // --- 3. DYNAMIC GRID LOGIC ---
    let gridColsClass = 'lg:grid-cols-3'; // Default: [Verse + Feed] + [Suggested]
    if (bibleView === 'sidebar') {
        gridColsClass = 'lg:grid-cols-2'; // [Verse + Feed] + [Bible]
    } else if (bibleView === 'fullscreen') {
        gridColsClass = 'lg:grid-cols-1'; // [Bible] only
    }

    return (
        // --- 4. APPLY DYNAMIC GRID ---
        <div className={`max-w-screen-xl mx-auto grid grid-cols-1 lg:gap-x-6 gap-y-6 p-4 sm:p-6 lg:p-8 ${gridColsClass}`}>
            
            {/* --- COLUMN 1: Main Content (Verse + Feed) --- */}
            {/* This column is HIDDEN in fullscreen mode */}
            {bibleView !== 'fullscreen' && (
                <div className={bibleView === 'sidebar' ? 'lg:col-span-1' : 'lg:col-span-2'}>
                    
                    {/* 1. Daily Random Verse Section */}
                    <div className="border-b border-gray-200 bg-amber-50 p-6 shadow-sm rounded-lg mb-6">
                        
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <BookIcon className="h-6 w-6 text-amber-700" />
                            <h2 className="text-lg font-semibold text-amber-700">
                                Verse of the Day
                            </h2>
                        </div>
                        
                        <div className="text-center min-h-[80px]"> {/* min-height prevents layout shift */}
                            {verseLoading ? (
                                <p className="italic text-gray-500">Loading today's inspiration...</p>
                            ) : verseError ? (
                                <p className="font-semibold text-red-500">Failed to load verse.</p>
                            ) : (
                                dailyVerse && (
                                    <blockquote className="relative">
                                        <p className="mb-3 text-2xl font-medium italic text-gray-800">
                                            "{dailyVerse.verseText}"
                                        </p>
                                        <footer className="text-md font-semibold text-amber-800">
                                            — {dailyVerse.reference}
                                        </footer>
                                    </blockquote>
                                )
                            )}
                        </div>
                    </div>

                    {/* 2. Main Video Feed */}
                    <Feed searchTerm={searchTerm} category="general" /> 
                    
                </div>
            )}

            {/* --- COLUMN 2: Suggested Videos (Only for 'closed' view) --- */}
            {bibleView === 'closed' && (
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <SuggestedVideos />
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
    );
};

export default HomePage;