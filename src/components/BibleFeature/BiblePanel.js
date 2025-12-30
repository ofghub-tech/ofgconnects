import React, { useState, useMemo, useEffect } from 'react';
import { databases, DATABASE_ID, COLLECTION_ID_BIBLE } from '../../appwriteConfig.js'; // Ensure path is correct
import { Query } from 'appwrite';
import { useBible } from '../../context/BibleContext';
import { bibleMetadata } from '../../data/bibleMetadata.js';

// --- Icon Components ---
const ChevronLeftIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>);
const MaximizeIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>);
const MinimizeIcon = (props) => (<svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" /></svg>);

export default function BiblePanel() {
    const { bibleView, openBibleFullscreen, openBibleSidebar, language } = useBible();
    const [selectedBook, setSelectedBook] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [verses, setVerses] = useState([]);
    const [loadingVerses, setLoadingVerses] = useState(false);
    
    // Memoize static data
    const filteredBooks = useMemo(() => bibleMetadata, []);
    const chapters = useMemo(() => {
        if (!selectedBook) return [];
        return Array.from({ length: selectedBook.chapters }, (_, i) => i + 1);
    }, [selectedBook]);

    // Fetch Logic
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

    // Handlers
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

    // Render Components
    const renderBookList = () => (
        <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {filteredBooks.map(book => (
                    <button
                        key={book.name_en}
                        onClick={() => handleBookSelect(book)}
                        className="w-full p-3 text-left bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{book.name_en}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-telugu">{book.name_te}</p>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderChapterGrid = () => (
        <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-5 gap-2">
                {chapters.map(chapterNum => (
                    <button
                        key={chapterNum}
                        onClick={() => handleChapterSelect(chapterNum)}
                        className="flex items-center justify-center w-full aspect-square text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                    >
                        {chapterNum}
                    </button>
                ))}
            </div>
        </div>
    );

    const renderVerseView = () => (
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-900">
            {loadingVerses ? (
                <div className="flex justify-center items-center h-full text-gray-500">Loading...</div>
            ) : (
                <div className="space-y-4">
                    {verses.map(verse => (
                        <div key={verse.$id} className="pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                            <div className="flex gap-2">
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1">{verse.verse}</span>
                                <div>
                                    <p className="text-lg text-gray-900 dark:text-gray-100 font-telugu leading-relaxed mb-1">
                                        {verse.text_te}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {verse.text_en}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {verses.length === 0 && !loadingVerses && <p className="text-center text-gray-500">No verses found.</p>}
                </div>
            )}
        </div>
    );

    return (
        // Wrapper fills the parent (BibleWidget) completely
        <div className="flex flex-col w-full h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Header */}
            <header className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="w-10">
                    {(selectedBook || selectedChapter) && (
                        <button onClick={handleBack} className="p-2 text-gray-600 rounded-full dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <ChevronLeftIcon />
                        </button>
                    )}
                </div>
                
                <h2 className="text-sm font-bold text-center truncate px-2 flex-1">
                    {getTitle()}
                </h2>

                <div className="w-10 flex justify-end">
                    {bibleView === 'sidebar' ? (
                        <button onClick={openBibleFullscreen} className="p-2 text-gray-600 rounded-full dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <MaximizeIcon />
                        </button>
                    ) : (
                        <button onClick={openBibleSidebar} className="p-2 text-gray-600 rounded-full dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <MinimizeIcon />
                        </button>
                    )}
                </div>
            </header>

            {/* Content Area */}
            {selectedBook ? (selectedChapter ? renderVerseView() : renderChapterGrid()) : renderBookList()}
        </div>
    );
}