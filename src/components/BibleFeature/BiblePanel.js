// src/components/BibleFeature/BiblePanel.js
import React, { useState, useMemo, useEffect } from 'react';
import { databases } from '../../appwriteConfig.js';
import { DATABASE_ID, COLLECTION_ID_BIBLE } from '../../appwriteConfig.js';
import { Query } from 'appwrite';
import { useBible } from '../../context/BibleContext';
import { bibleMetadata } from '../../data/bibleMetadata.js';

// --- Icon Components ---
const ChevronLeftIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>);
const MaximizeIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>);
const MinimizeIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" /></svg>);

export default function BiblePanel() {
    const {
        bibleView,
        openBibleFullscreen,
        openBibleSidebar,
        language,
    } = useBible();

    const [selectedBook, setSelectedBook] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [verses, setVerses] = useState([]);
    const [loadingVerses, setLoadingVerses] = useState(false);

    const filteredBooks = useMemo(() => bibleMetadata, []);

    const chapters = useMemo(() => {
        if (!selectedBook) return [];
        return Array.from({ length: selectedBook.chapters }, (_, i) => i + 1);
    }, [selectedBook]);

    // --- FIX: PAGINATION LOOP ---
    useEffect(() => {
        if (!selectedBook || !selectedChapter) {
            setVerses([]);
            return;
        }
        const fetchVerses = async () => {
            setLoadingVerses(true);
            try {
                let allVerses = [];
                let offset = 0;
                let currentBatchSize = 0;

                // Keep fetching until a batch is smaller than 100
                do {
                    const response = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTION_ID_BIBLE,
                        [
                            Query.equal('book_en', selectedBook.name_en),
                            Query.equal('chapter', selectedChapter),
                            Query.limit(100),
                            Query.offset(offset)
                        ]
                    );
                    const batch = response.documents;
                    currentBatchSize = batch.length;
                    allVerses = [...allVerses, ...batch];
                    offset += 100;
                } while (currentBatchSize === 100);

                const sortedVerses = allVerses.sort((a, b) => Number(a.verse) - Number(b.verse));
                setVerses(sortedVerses);
            } catch (error) {
                console.error("Bible fetch error:", error);
                setVerses([{ $id: 'error', verse: '!', text_en: `Failed to load verses.`, text_te: 'లోపం సంభవించింది.' }]);
            } finally {
                setLoadingVerses(false);
            }
        };
        fetchVerses();
    }, [selectedBook, selectedChapter]);

    const handleBookSelect = (book) => setSelectedBook(book);
    const handleChapterSelect = (chapter) => setSelectedChapter(chapter);
    const handleBack = () => {
        if (selectedChapter) setSelectedChapter(null);
        else if (selectedBook) setSelectedBook(null);
    };

    const getTitle = () => {
        const langKey = language === 'te' ? 'name_te' : 'name_en';
        const fontClass = language === 'te' ? 'font-telugu' : 'font-sans';
        const title = selectedBook ? (selectedChapter ? `${selectedBook[langKey]} ${selectedChapter}` : selectedBook[langKey]) : (language === 'te' ? 'బైబిల్' : 'The Holy Bible');
        return <span className={fontClass}>{title}</span>;
    };

    const renderBookList = () => (
        <div className="flex-1 p-3 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {filteredBooks.map(book => (
                    <button
                        key={book.name_en}
                        onClick={() => handleBookSelect(book)}
                        className="w-full p-3 text-left bg-white/80 border border-gray-200/80 rounded-lg dark:bg-gray-700/80 dark:border-gray-600/80 hover:bg-white/100 dark:hover:bg-gray-600/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            {book.name_en}
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-telugu">
                            {book.name_te}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderChapterGrid = () => (
        <div className="flex-1 p-3 overflow-y-auto">
            <div className="grid grid-cols-5 gap-2 md:grid-cols-6 lg:grid-cols-7">
                {chapters.map(chapterNum => (
                    <button
                        key={chapterNum}
                        onClick={() => handleChapterSelect(chapterNum)}
                        className="flex items-center justify-center w-full text-base font-medium text-gray-700 bg-gray-100/80 border border-gray-300/80 rounded-lg shadow-sm dark:bg-gray-700/80 dark:border-gray-600/80 dark:text-gray-200 aspect-square hover:bg-blue-100/80 dark:hover:bg-blue-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {chapterNum}
                    </button>
                ))}
            </div>
        </div>
    );

    const renderVerseView = () => (
        <div className="flex-1 p-4 overflow-y-auto">
            {loadingVerses ? <p className="text-gray-500 dark:text-gray-400">Loading...</p> : (
                <div className="text-gray-800 dark:text-gray-100">
                    {verses.map(verse => (
                        <div key={verse.$id} className="py-3 border-b border-gray-200/80 dark:border-gray-700/80 last:border-b-0">
                            <p className="text-base leading-relaxed">
                                <span className="pr-2 text-sm font-bold text-blue-600 dark:text-blue-400 align-top">{verse.verse}</span>
                                <span className="block text-xl text-gray-900 dark:text-gray-100 mb-1 font-telugu">
                                    {verse.text_te}
                                </span>
                                <span className="block text-base text-gray-700 dark:text-gray-300">
                                    {verse.text_en}
                                </span>
                            </p>
                        </div>
                    ))}
                    {verses.length === 0 && !loadingVerses && <p className="text-gray-500 dark:text-gray-400">No verses found.</p>}
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col w-full h-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-300/50 dark:border-gray-700/50 rounded-lg shadow-2xl overflow-hidden text-gray-900 dark:text-gray-100">
            <header className="flex items-center justify-between p-3 border-b border-gray-200/80 dark:border-gray-700/80 flex-shrink-0 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="w-10">
                    {(selectedBook || selectedChapter) && (
                        <button onClick={handleBack} className="p-1.5 text-gray-600 rounded-full dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Go back">
                            <ChevronLeftIcon />
                        </button>
                    )}
                </div>
                <h2 className="text-base font-bold text-center truncate">
                    {getTitle()}
                </h2>
                <div className="w-10 flex justify-end">
                    {bibleView === 'sidebar' ? (
                        <button onClick={openBibleFullscreen} className="p-1.5 text-gray-600 rounded-full dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Maximize">
                            <MaximizeIcon />
                        </button>
                    ) : (
                        <button onClick={openBibleSidebar} className="p-1.5 text-gray-600 rounded-full dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Minimize">
                            <MinimizeIcon />
                        </button>
                    )}
                </div>
            </header>
            {selectedBook ? (selectedChapter ? renderVerseView() : renderChapterGrid()) : renderBookList()}
        </div>
    );
}