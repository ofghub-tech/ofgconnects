// src/pages/HomePage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // This will contain all the new styles
import Feed from '../components/Feed'; 
import UploadForm from '../components/UploadForm'; 
import Modal from '../components/Modal';

const HomePage = () => {
    const { user, logoutUser } = useAuth(); 
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); // New state for search

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
        // We'll need to refresh the feed component directly later for search, 
        // but for now, a full page reload is fine.
        window.location.reload(); 
    };

    return (
        <div className="app-layout"> {/* New overall layout container */}
            <aside className="sidebar"> {/* New sidebar */}
                <div className="logo-section">
                    <img src="/ofg-logo.png" alt="OfgConnects Logo" className="app-logo" /> {/* You'll need to add a logo image here */}
                    <h1>OfgConnects</h1>
                </div>
                <nav className="main-nav">
                    {/* These will eventually be real routes */}
                    <button className="nav-item active" onClick={() => navigate('/home')}>
                        <span className="icon">🏠</span> Home
                    </button>
                    <button className="nav-item" onClick={() => navigate('/shorts')}>
                        <span className="icon">🎬</span> Shorts
                    </button>
                    <button className="nav-item" onClick={() => navigate('/following')}>
                        <span className="icon">🤝</span> Following
                    </button>
                    <button className="nav-item" onClick={() => navigate('/myspace')}>
                        <span className="icon">👤</span> Myspace
                    </button>
                    <button className="nav-item" onClick={() => console.log('Offline clicked')}>
                        <span className="icon">🔌</span> Offline
                    </button>
                    <button className="nav-item" onClick={() => console.log('Kids clicked')}>
                        <span className="icon">🧒</span> Kids
                    </button>
                </nav>
            </aside>

            <div className="main-content-area"> {/* Main content area for header and feed */}
                <header className="top-header"> {/* New top header for search and user */}
                    <div className="search-bar-container">
                        <input 
                            type="text" 
                            placeholder="Search" 
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="search-icon">🔍</button>
                    </div>
                    <div className="user-profile-section">
                        {/* You can add a profile image here later */}
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
                        {/* A placeholder for the user avatar, matching your design */}
                        <div className="user-avatar">
                            <span className="avatar-icon">🧑</span>
                        </div>
                    </div>
                </header>

                <main className="feed-area"> {/* Where the Feed component will render */}
                    <Feed searchTerm={searchTerm} /> {/* Pass searchTerm to Feed */}
                </main>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <UploadForm onUploadSuccess={handleUploadSuccess} />
            </Modal>
        </div>
    );
};

export default HomePage;