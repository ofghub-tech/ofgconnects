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
import SongsPage from './pages/SongsPage';
import KidsPage from './pages/KidsPage';
import Sidebar from './components/Sidebar'; // <-- ORIGINAL IMPORT
import HistoryPage from './pages/HistoryPage'; // <-- ORIGINAL IMPORT
import WatchLaterPage from './pages/WatchLaterPage'; // <-- ORIGINAL IMPORT
import LikedVideosPage from './pages/LikedVideosPage'; // <-- ORIGINAL IMPORT
import ShortsWatchPage from './pages/ShortsWatchPage'; // <-- ORIGINAL IMPORT
import VideoRouter from './components/VideoRouter'; // <-- ORIGINAL IMPORT
import SongsWatchPage from './pages/SongsWatchPage'; // <-- ORIGINAL IMPORT
import KidsWatchPage from './pages/KidsWatchPage'; // <-- ORIGINAL IMPORT
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage'; 

// --- 1. IMPORT BIBLE COMPONENTS AND CONTEXT ---
import { useBible } from './context/BibleContext';
import GlobalBibleIcon from './components/BibleFeature/GlobalBibleIcon';
import BiblePanel from './components/BibleFeature/BiblePanel';
// --- END IMPORTS ---

// --- (ProtectedRoute - No change) ---
const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/" />;
    }
    return children;
};

// --- (AppLayout - No change) ---
const AppLayout = ({ children, isSidebarOpen, toggleSidebar }) => {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-950">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header toggleSidebar={toggleSidebar} />
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

    // --- 2. GET BIBLE VIEW STATE ---
    const { bibleView } = useBible();

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    return (
        <Router>
            {/* --- 3. ADD BIBLE UI (GLOBAL) --- */}
            {/* The Icon is always rendered */}
            <GlobalBibleIcon />

            {/* Render the panel in sidebar mode */}
            {bibleView === 'sidebar' && (
                <div className="fixed top-0 right-0 z-40 h-full w-full max-w-md p-4 pt-20">
                    {/* pt-20 to account for header height, adjust as needed */}
                    <div className="h-full w-full">
                         <BiblePanel />
                    </div>
                </div>
            )}

            {/* Render the panel in fullscreen mode */}
            {bibleView === 'fullscreen' && (
                <div className="fixed inset-0 z-40 bg-gray-100 dark:bg-gray-950 p-4 pt-20">
                     {/* pt-20 to account for header height, adjust as needed */}
                     <div className="h-full w-full max-w-4xl mx-auto">
                        <BiblePanel />
                     </div>
                </div>
            )}
            {/* --- END BIBLE UI --- */}

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
                                    <Route path="/search" element={<SearchPage />} />
                                    
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
                                    <Route path="/songs" element={<SongsPage />} />
                                    <Route path="/kids" element={<KidsPage />} />

                                    {/* --- NEW SETTINGS ROUTE --- */}
                                    <Route path="/settings" element={<SettingsPage />} />
                                    
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