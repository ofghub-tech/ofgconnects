// src/components/Modal.js
import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) {
        return null; // Don't render anything if the modal is closed
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close-btn" onClick={onClose}>
                    &times; {/* This is an "X" icon */}
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;