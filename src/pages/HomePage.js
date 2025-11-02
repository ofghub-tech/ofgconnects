// src/pages/HomePage.js
import React, { useState } from 'react'; // 1. Import useState
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Feed from '../components/Feed'; 
import UploadForm from '../components/UploadForm'; 
import Modal from '../components/Modal'; // 2. Import our new Modal

const HomePage = () => {
    const { user, logoutUser } = useAuth(); 
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false); // 3. State for the modal

    const handleLogout = async () => {
        // ... (logout logic)
    };

    // 4. Function to close modal and refresh feed
    const handleUploadSuccess = () => {
        setIsModalOpen(false);
        window.location.reload(); // Refresh the page to see new video
    };

    return (
        <div className="home-container">
            <header className="home-header">
                <h1>OfgConnects</h1>
                <div className="user-info">
                    <span>Welcome, {user ? user.name : 'Guest'}!</span>
                    
                    {/* 5. ADD THE UPLOAD BUTTON */}
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="upload-btn"
                    >
                        Upload
                    </button>
                    
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>
            </header>

            <main className="home-content">
                {/* 6. The form is GONE from here */}
                {/* The <hr /> is GONE from here */}
                <Feed />
            </main>

            {/* 7. ADD THE MODAL COMPONENT */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <UploadForm onUploadSuccess={handleUploadSuccess} />
            </Modal>
        </div>
    );
};

export default HomePage;