// src/components/Modal.js
import React from 'react';
// NO LONGER NEEDED: import './Modal.css';

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) {
        return null; // Don't render anything if the modal is closed
    }

    return (
        // .modal-overlay
        <div 
            className="fixed inset-0 w-full h-screen bg-black/85 flex justify-center items-center z-[1000] p-4"
            // Enhancement: Add this onClick to close the modal when clicking the dark overlay
            // This is a common and expected UX pattern.
            onClick={onClose} 
        >
            
            {/* .modal-content */}
            {/* --- MODIFIED: Added dark mode classes (and light mode default) --- */}
            <div 
                className="relative w-[90%] max-w-[600px] max-h-[90vh] overflow-y-auto bg-white text-gray-900 p-6 sm:p-8 rounded-lg shadow-xl
                           dark:bg-gray-800 dark:text-gray-200"
                // Stop click from bubbling up to the overlay, so clicking the modal doesn't close it
                onClick={e => e.stopPropagation()} 
            >
                
                {/* .modal-close-btn */}
                {/* --- MODIFIED: Added dark mode classes --- */}
                <button 
                    className="absolute top-4 right-4 bg-transparent border-none text-2xl font-bold text-gray-400 cursor-pointer transition-colors hover:text-gray-800
                               dark:text-gray-500 dark:hover:text-gray-200" 
                    onClick={onClose}
                    aria-label="Close modal" // Added for accessibility
                >
                    &times; {/* This is an "X" icon */}
                </button>
                
                {children}
            </div>
        </div>
    );
};

export default Modal;