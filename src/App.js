// src/App.js
import React, { useState } from 'react';
import MigrationPage from './pages/MigrationPage';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import WatchPage from './pages/WatchPage';
import MySpacePage from './pages/MySpacePage';
import FollowingPage from './pages/FollowingPage';
import ShortsPage from './pages/ShortsPage';
// import OfflinePage from './pages/OfflinePage'; // <-- REMOVED
import SongsPage from './pages/SongsPage';
import KidsPage from './pages/KidsPage';
import Sidebar from './components/Sidebar'; 
import HistoryPage from './pages/HistoryPage';
import WatchLaterPage from './pages/WatchLaterPage';
import LikedVideosPage from './pages/LikedVideosPage';
import ShortsWatchPage from './pages/ShortsWatchPage'; 
import VideoRouter from './components/VideoRouter';     
import SongsWatchPage from './pages/SongsWatchPage';
import KidsWatchPage from './pages/KidsWatchPage';

// --- NEW PAGE IMPORT ---
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage'; // <-- ADD THIS
// --- END NEW PAGE IMPORT ---

// --- (ProtectedRoute - No change) ---
const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/" />;
    }
    return children;
};

// --- (AppLayout - MODIFIED FOR GLASS UI) ---
const AppLayout = ({ children, isSidebarOpen, toggleSidebar }) => {
    return (
        // --- FIX 1: Set the base background color that will show through the glass ---
        // We use bg-gray-100 dark:bg-gray-950 as the *main* app background
        <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-950">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header toggleSidebar={toggleSidebar} />
                
                {/* --- FIX 2: Remove the background from <main> so it's transparent --- */}
                {/* The content will scroll over the main app background */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};
// --- (End components) ---

function App() {
    const { loading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    /* --- THIS BLOCK IS NOW REMOVED (FIX for BUG 1) --- */

    return (
        <Router>
            <Routes>
                {/* Public Route: Login Page */}
                <Route path="/" element={<LoginPage />} />
                <Route path="/migrate-data" element={<MigrationPage />} />
                
                {/* Wildcard Route to apply AppLayout */}
                <Route 
                    path="*" 
                    element={
                        <ProtectedRoute>
                            <AppLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                                
                                {/* Nested Routes for the main content area */}
                                <Routes>
                                    <Route path="/home" element={<HomePage />} />

                                    {/* --- NEW SEARCH ROUTE --- */}
                                    <Route path="/search" element={<SearchPage />} />
                                    {/* --- END NEW ROUTE --- */}
                                    
                                    {/* --- VIDEO ROUTING LOGIC --- */}
                                    <Route path="/watch/:videoId" element={<VideoRouter />} /> 
                                    <Route path="/videos/watch/:videoId" element={<WatchPage />} />
                                    <Route path="/shorts/watch/:videoId" element={<ShortsWatchPage />} />
                                    <Route path="/songs/watch/:videoId" element={<SongsWatchPage />} />
                                    <Route path="/kids/watch/:videoId" element={<KidsWatchPage />} />
                                    
                                    {/* ... (all other routes) ... */}
                                    <Route path="/myspace" element={<MySpacePage />} />
                                    <Route path="/following" element={<FollowingPage />} />
                                    <Route path="/history" element={<HistoryPage />} />
                                    <Route path="/watch-later" element={<WatchLaterPage />} />
                                    <Route path="/liked-videos" element={<LikedVideosPage />} />
                                    <Route path="/shorts" element={<ShortsPage />} />
                                    {/* <Route path="/offline" element={<OfflinePage />} /> */}{/* <-- REMOVED */}
                                    <Route path="/songs" element={<SongsPage />} />
                                    <Route path="/kids" element={<KidsPage />} />

                                    {/* --- NEW SETTINGS ROUTE --- */}
                                    <Route path="/settings" element={<SettingsPage />} />
                                    {/* --- END NEW SETTINGS ROUTE --- */}
                                    
                                    <Route path="*" element={<Navigate to="/home" />} /> 
                                </Routes>

                            </AppLayout>
                        </ProtectedRoute>
                    }
                />

            </Routes>
        </Router>
    );
}

export default App;