// src/App.js
import React, { useState } from 'react';
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

// --- (ProtectedRoute and AppLayout components - No change) ---
// ... (paste the existing components here)
const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/" />;
    }
    return children;
};
const AppLayout = ({ children, isSidebarOpen, toggleSidebar }) => {
    return (
        // Added dark:bg-gray-900
        <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header toggleSidebar={toggleSidebar} />
                {/* --- THIS IS THE CHANGE --- */}
                {/* Added dark:bg-gray-950 */}
                <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-950">
                {/* --- END CHANGE --- */}
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

    if (loading) {
        return (
            // Added dark:bg-gray-950 and dark:text-gray-300
            <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading application...</p>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                {/* Public Route: Login Page */}
                <Route path="/" element={<LoginPage />} />
                
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