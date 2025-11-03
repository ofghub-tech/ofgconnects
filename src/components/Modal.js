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
            className="fixed inset-0 w-full h-screen bg-black/85 flex justify-center items-center z-[1000]"
            // Enhancement: Add this onClick to close the modal when clicking the dark overlay
            // This is a common and expected UX pattern.
            onClick={onClose} 
        >
            
            {/* .modal-content */}
            <div 
                className="relative w-[90%] max-w-[600px] max-h-[90vh] overflow-y-auto bg-[#282828] text-gray-200 p-8 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.5)]"
                // Stop click from bubbling up to the overlay, so clicking the modal doesn't close it
                onClick={e => e.stopPropagation()} 
            >
                
                {/* .modal-close-btn */}
                <button 
                    className="absolute top-4 right-4 bg-transparent border-none text-2xl font-bold text-gray-500 cursor-pointer transition-colors hover:text-gray-200" 
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