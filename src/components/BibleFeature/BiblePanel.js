// src/components/BibleFeature/BiblePanel.js
import React, { useState, useMemo, useEffect } from 'react';
import { bibleBooks } from '../../data/bibleData.js';
import { databases } from '../../appwriteConfig.js'; 
import { 
    DATABASE_ID, 
    COLLECTION_ID_VERSES
} from '../../appwriteConfig.js';
import { Query } from 'appwrite';
import { useBible } from '../../context/BibleContext'; // <-- 1. IMPORT CONTEXT

// --- Icon Components ---
const ChevronLeftIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg> );
const SearchIcon = (props) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg> );

// --- NEW ICONS ---
// Maximize Icon (Arrow-up-right)
const MaximizeIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
    </svg>
);
// Minimize Icon (Arrow-down-left)
const MinimizeIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" />
    </svg>
);
// --- END NEW ICONS ---

const FilterButton = ({ label, activeFilter, setFilter }) => (
    <button
        onClick={() => setFilter(label)}
        className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors shadow-sm ${
            activeFilter === label
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
    >
        {label}
    </button>
);

export default function BiblePanel() {
    // --- 2. GET ALL FUNCTIONS FROM CONTEXT ---
    const { bibleView, openBibleFullscreen, openBibleSidebar } = useBible();

    const [filter, setFilter] = useState('All');
    const [selectedBook, setSelectedBook] = useState(null);
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [verses, setVerses] = useState([]);
    const [loadingVerses, setLoadingVerses] = useState(false);

    // ... (All other logic: filteredBooks, chapters, useEffect, etc. stays exactly the same) ...
    const filteredBooks = useMemo(() => {
        return bibleBooks.filter(book => {
            const matchesTestament = filter === 'All' || book.testament === filter;
            const matchesSearch = book.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesTestament && matchesSearch;
        });
    }, [filter, searchTerm]);

    const chapters = useMemo(() => {
        if (!selectedBook) return [];
        return Array.from({ length: selectedBook.chapters }, (_, i) => i + 1);
    }, [selectedBook]);

    useEffect(() => {
        if (!selectedBook || !selectedChapter) {
            setVerses([]); 
            return;
        }
        const fetchVerses = async () => {
            setLoadingVerses(true);
            try {
                if (!DATABASE_ID || !COLLECTION_ID_VERSES) {
                    setVerses([{ $id: 'error', verse: '!', text: 'Configuration error.' }]);
                    return;
                }
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_VERSES, 
                    [
                        Query.equal('book', selectedBook.name),
                        Query.equal('chapter', selectedChapter),
                        Query.limit(175)
                    ]
                );
                const sortedVerses = response.documents.sort((a, b) => Number(a.verse) - Number(b.verse));
                setVerses(sortedVerses);
            } catch (error) {
                setVerses([{ $id: 'error', verse: '!', text: `Failed to load verses.` }]);
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
        if (selectedBook && selectedChapter) return `${selectedBook.name} ${selectedChapter}`;
        if (selectedBook) return selectedBook.name;
        return 'The Holy Bible';
    };

    // ... (renderBookList, renderChapterGrid, renderVerseView stay exactly the same) ...
    const renderBookList = () => (
        <>
            <div className="p-3 space-y-3 border-b border-gray-200">
                <div className="relative">
                    <input type="text" placeholder="Search for a book..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-2 pl-10 text-gray-900 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <SearchIcon className="absolute w-5 h-5 text-gray-500 transform -translate-y-1/2 left-3.5 top-1/2" />
                </div>
                <div className="flex justify-center space-x-2">
                    <FilterButton label="All" activeFilter={filter} setFilter={setFilter} />
                    <FilterButton label="Old" activeFilter={filter} setFilter={setFilter} />
                    <FilterButton label="New" activeFilter={filter} setFilter={setFilter} />
                </div>
            </div>
            <div className="flex-1 p-3 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {filteredBooks.map(book => (
                        <button key={book.id} onClick={() => handleBookSelect(book)} className="w-full p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <span className="text-xs font-medium text-gray-500 uppercase">{book.testament}</span>
                            <h3 className="text-base font-semibold text-gray-900">{book.name}</h3>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
    const renderChapterGrid = () => (
        <div className="flex-1 p-3 overflow-y-auto">
            <div className="grid grid-cols-5 gap-2 md:grid-cols-6 lg:grid-cols-7">
                {chapters.map(chapterNum => (
                    <button key={chapterNum} onClick={() => handleChapterSelect(chapterNum)} className="flex items-center justify-center w-full text-base font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg shadow-sm aspect-square hover:bg-blue-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {chapterNum}
                    </button>
                ))}
            </div>
        </div>
    );
    const renderVerseView = () => (
        <div className="flex-1 p-4 overflow-y-auto bg-white">
            {loadingVerses ? <p className="text-gray-500">Loading...</p> : (
                <div className="text-gray-800">
                    {verses.map(verse => (
                        <div key={verse.$id} className="py-2 border-b border-gray-200 last:border-b-0">
                            <p className="text-base leading-relaxed">
                                <span className="pr-2 text-sm font-bold text-blue-600 align-top">{verse.verse}</span>
                                <span className="text-gray-700">{verse.text}</span>
                            </p>
                        </div>
                    ))}
                    {verses.length === 0 && <p className="text-gray-500">No verses found.</p>}
                </div>
            )}
        </div>
    );

    // --- Main Return ---
    return (
        <div className="flex flex-col w-full h-full bg-gray-50 border border-gray-300 rounded-lg shadow-md overflow-hidden">
            
            {/* --- 3. UPDATED HEADER --- */}
            <header className="flex items-center justify-between p-3 border-b border-gray-200 flex-shrink-0">
                {/* Back button */}
                <div className="w-10">
                    {(selectedBook || selectedChapter) && (
                        <button onClick={handleBack} className="p-1.5 text-gray-600 rounded-full hover:bg-gray-200" aria-label="Go back">
                            <ChevronLeftIcon />
                        </button>
                    )}
                </div>

                <h2 className="text-base font-bold text-center text-gray-900 truncate">
                    {getTitle()}
                </h2>

                {/* --- NEW Maximize/Minimize Button --- */}
                <div className="w-10 flex justify-end">
                    {bibleView === 'sidebar' && (
                        <button onClick={openBibleFullscreen} className="p-1.5 text-gray-600 rounded-full hover:bg-gray-200" aria-label="Maximize">
                            <MaximizeIcon />
                        </button>
                    )}
                    {bibleView === 'fullscreen' && (
                         <button onClick={openBibleSidebar} className="p-1.5 text-gray-600 rounded-full hover:bg-gray-200" aria-label="Minimize">
                            <MinimizeIcon />
                        </button>
                    )}
                </div>
            </header>

            {/* Content Area (Scrollable) */}
            {selectedBook 
                ? selectedChapter 
                    ? renderVerseView() 
                    : renderChapterGrid()
                : renderBookList()
            }
        </div>
    );
}