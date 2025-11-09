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
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';

// --- BIBLE IMPORTS ---
import { useBible } from './context/BibleContext';
import GlobalBibleIcon from './components/BibleFeature/GlobalBibleIcon';
import BiblePanel from './components/BibleFeature/BiblePanel';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();
    if (!user) {
        return <Navigate to="/" />;
    }
    return children;
};

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

function App() {
    const { loading } = useAuth();
    // --- CHANGE IS HERE: Set default to 'false' ---
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
    const { bibleView } = useBible();

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    if (loading) return null; 

    return (
        <Router>
            {/* --- BIBLE UI --- */}
            <GlobalBibleIcon />
            {bibleView === 'sidebar' && (
                <div className="fixed top-0 right-0 z-40 h-full w-full max-w-md p-4 pt-20 pointer-events-none">
                    <div className="h-full w-full pointer-events-auto">
                        <BiblePanel />
                    </div>
                </div>
            )}
            {bibleView === 'fullscreen' && (
                <div className="fixed inset-0 z-40 bg-gray-100 dark:bg-gray-950 p-4 pt-20">
                    <div className="h-full w-full max-w-4xl mx-auto">
                        <BiblePanel />
                    </div>
                </div>
            )}
            {/* --- END BIBLE UI --- */}

            <Routes>
                <Route path="/" element={<LoginPage />} />
                
                <Route
                    path="*"
                    element={
                        <ProtectedRoute>
                            <AppLayout isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
                                <Routes>
                                    <Route path="/home" element={<HomePage />} />
                                    <Route path="/search" element={<SearchPage />} />
                                    <Route path="/watch/:videoId" element={<VideoRouter />} />
                                    <Route path="/videos/watch/:videoId" element={<WatchPage />} />
                                    <Route path="/shorts/watch/:videoId" element={<ShortsWatchPage />} />
                                    <Route path="/songs/watch/:videoId" element={<SongsWatchPage />} />
                                    <Route path="/kids/watch/:videoId" element={<KidsWatchPage />} />
                                    <Route path="/myspace" element={<MySpacePage />} />
                                    <Route path="/following" element={<FollowingPage />} />
                                    <Route path="/history" element={<HistoryPage />} />
                                    <Route path="/watch-later" element={<WatchLaterPage />} />
                                    <Route path="/liked-videos" element={<LikedVideosPage />} />
                                    <Route path="/shorts" element={<ShortsPage />} />
                                    <Route path="/songs" element={<SongsPage />} />
                                    <Route path="/kids" element={<KidsPage />} />
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