// src/components/Header.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UploadForm from './UploadForm';
import Modal from './Modal';
import './Header.css'; // New CSS file for the Header

const Header = ({ toggleSidebar }) => {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleLogout = async () => {
        try {
            await logoutUser();
            navigate('/');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    const handleUploadSuccess = () => {
        setIsModalOpen(false);
        window.location.reload();
    };

    // Note: Search functionality will be implemented in a later step
    const handleSearch = () => {
        console.log("Searching for:", searchTerm);
        // For now, let's just navigate back to the home page with the search term if needed
        navigate(`/home?search=${searchTerm}`);
    };

    return (
        <header className="top-header">
            {/* 1. Hamburger button to toggle sidebar */}
            <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
                ☰
            </button>
            
            <div className="search-bar-container">
                <input 
                    type="text" 
                    placeholder="Search" 
                    className="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSearch();
                    }}
                />
                <button className="search-icon" onClick={handleSearch}>🔍</button>
            </div>
            
            <div className="user-profile-section">
                <span className="username">{user ? user.name : 'Guest'}</span>
                
                <button onClick={handleLogout} className="logout-btn">
                    Logout
                </button>
                <button 
                    onClick={() => setIsModalOpen(true)} 
                    className="upload-btn"
                >
                    Upload
                </button>
                
                <div className="user-avatar">
                    <span className="avatar-icon">🧑</span>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <UploadForm onUploadSuccess={handleUploadSuccess} />
            </Modal>
        </header>
    );
};

export default Header;