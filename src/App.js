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
import SearchPage from './pages/SearchPage';
// --- ADDING MISSING SETTINGS IMPORT (from previous fixes) ---
import SettingsPage from './pages/SettingsPage'; 

// --- (ProtectedRoute and AppLayout components - No change) ---

// --- 1. ADDED THE MISSING ICON DEFINITION HERE ---
const GlobalBibleIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0-2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);
// --- END OF ICON DEFINITION ---

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

                {/* --- ADDING ADMIN MIGRATE ROUTE (from your import) --- */}
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
                                    {/* <Route path="/offline" element={<OfflinePage />} /> */}{/* <-- REMOVED */}
                                    <Route path="/songs" element={<SongsPage />} />
                                    <Route path="/kids" element={<KidsPage />} />
                                    
                                    {/* --- ADDING SETTINGS ROUTE (from previous fixes) --- */}
                                    <Route path="/settings" element={<SettingsPage />} />

                                    <Route path="*" element={<Navigate to="/home" />} /> 
                                </Routes>

                            </AppLayout>

                            {/* --- 2. ADD THE NEW FLOATING BIBLE BUTTON --- */}
                            {/* This floats on top of all pages */}
                            <button
                                onClick={() => alert("Bible feature coming soon!")} // Or navigate('/bible')
                                className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                                title="Open Bible"
                            >
                                <GlobalBibleIcon className="h-6 w-6" />
                            </button>

                        </ProtectedRoute>
                    }
                />

            </Routes>
        </Router>
    );
}

export default App;