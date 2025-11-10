// src/components/Modal.js
import React from 'react';

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) {
        return null;
    }

    return (
        // .modal-overlay (MODIFIED: Darker overlay)
        <div 
            className="fixed inset-0 w-full h-screen bg-black/90 flex justify-center items-center z-[1000] p-4"
            onClick={onClose} 
        >
            
            {/* .modal-content (MODIFIED: Applied .glass-panel) */}
            <div 
                className="glass-panel relative w-[90%] max-w-[600px] max-h-[90vh] overflow-y-auto p-6 sm:p-8"
                onClick={e => e.stopPropagation()} 
            >
                
                {/* .modal-close-btn */}
                <button 
                    className="absolute top-4 right-4 bg-transparent border-none text-2xl font-bold text-gray-400 cursor-pointer transition-colors hover:text-gray-800
                               dark:text-gray-500 dark:hover:text-gray-200" 
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    &times;
                </button>
                
                {children}
            </div>
        </div>
    );
};

export default Modal;