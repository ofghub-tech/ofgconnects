import React from 'react';
import { useBible } from '../../context/BibleContext';
import BiblePanel from './BiblePanel';
import GlobalBibleIcon from './GlobalBibleIcon';

export default function BibleWidget() {
  const { bibleView } = useBible(); // 'closed', 'sidebar', or 'fullscreen'

  // 1. Define the base styles for the floating container
  const baseClasses = "fixed z-40 transition-all duration-300 ease-in-out bg-white dark:bg-gray-900 shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700";
  
  // 2. Define specific styles for "Chatbot Mode" vs "Fullscreen Mode"
  // Chatbot Mode: Fixed dimensions, bottom-right corner
  // Fullscreen Mode: Inset-0 (covers whole screen)
  const viewClasses = bibleView === 'fullscreen'
    ? "inset-0 rounded-none w-full h-full"
    : "bottom-24 right-5 w-[360px] h-[550px] max-h-[80vh] rounded-2xl"; 

  return (
    <>
      {/* The Trigger Button (Always stays in the corner) */}
      <GlobalBibleIcon />

      {/* The Panel Container (Only renders if view is not 'closed') */}
      {bibleView !== 'closed' && (
        <div className={`${baseClasses} ${viewClasses}`}>
          {/* Your existing BiblePanel goes here and fills the container */}
          <BiblePanel />
        </div>
      )}
    </>
  );
}