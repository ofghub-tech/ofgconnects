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
import OfflinePage from './pages/OfflinePage';
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
        <div className="flex h-screen overflow-hidden bg-white">
            <Sidebar isSidebarOpen={isSidebarOpen} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header toggleSidebar={toggleSidebar} />
                <main className="flex-1 overflow-y-auto bg-gray-50">
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
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <p className="text-lg font-medium text-gray-700">Loading application...</p>
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
                                    <Route path="/offline" element={<OfflinePage />} />
                                    <Route path="/songs" element={<SongsPage />} />
                                    <Route path="/kids" element={<KidsPage />} />
                                    
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