// src/pages/HomePage.js
import React, { useState } from 'react';
import { databases } from '../appwriteConfig';
import { DATABASE_ID, COLLECTION_ID_VERSES } from '../appwriteConfig'; 
import { Query } from 'appwrite';
import Feed from '../components/Feed';
import { useQuery } from '@tanstack/react-query';

// --- Book Icon Component ---
const BookIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);

// --- Data Fetching Function ---
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
        [Query.offset(randomOffset), Query.limit(1)]
    );
    
    return verseResponse.documents[0];
};

// --- HomePage Component ---
const HomePage = () => {
    // This state is here in case you want to add a search bar *above* the feed later
    const [searchTerm] = useState(null); 

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

    return (
        <div className="w-full">
            
            {/* 1. Daily Random Verse Section (Styled for light theme) */}
            <div className="border-b border-gray-200 bg-amber-50 p-6 shadow-sm">
                
                {/* --- Section Header --- */}
                <div className="flex items-center justify-center gap-3 mb-4">
                    <BookIcon className="h-6 w-6 text-amber-700" />
                    <h2 className="text-lg font-semibold text-amber-700">
                        Verse of the Day
                    </h2>
                </div>
                
                {/* --- Verse Content --- */}
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
            <Feed searchTerm={searchTerm} /> 
            
        </div>
    );
};

export default HomePage;