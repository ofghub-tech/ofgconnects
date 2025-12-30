import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BibleProvider } from './context/BibleContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// --- NEW IMPORT: The Smart Widget Wrapper ---
import BibleWidget from './components/BibleFeature/BibleWidget';

// Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import WatchPage from './pages/WatchPage';
import ShortsPage from './pages/ShortsPage';
import ShortsWatchPage from './pages/ShortsWatchPage';
import MySpacePage from './pages/MySpacePage';
import SearchPage from './pages/SearchPage';
import HistoryPage from './pages/HistoryPage';
import LikedVideosPage from './pages/LikedVideosPage';
import SettingsPage from './pages/SettingsPage';
import SongsPage from './pages/SongsPage';
import KidsPage from './pages/KidsPage';
import FollowingPage from './pages/FollowingPage';
import WatchLaterPage from './pages/WatchLaterPage';

// --- Protected Route Component ---
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen bg-black" />; // Loading state
    return user ? children : <Navigate to="/login" />;
};

function App() {
    // Note: We no longer need local state (isBibleOpen) here
    // The BibleContext inside BibleWidget handles all of that now.

    return (
        <Router>
            <AuthProvider>
                <BibleProvider>
                    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-blue-500/30">
                        
                        {/* --- FIXED ELEMENTS --- */}
                        <Header />
                        <Sidebar />
                        
                        {/* --- MAIN CONTENT WRAPPER --- */}
                        <main className="pt-24 pl-20 pr-4 sm:pl-24 lg:pr-8 min-h-screen transition-all duration-300">
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/login" element={<LoginPage />} />
                                
                                {/* Protected Routes */}
                                <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                                <Route path="/watch/:id" element={<ProtectedRoute><WatchPage /></ProtectedRoute>} />
                                <Route path="/shorts" element={<ProtectedRoute><ShortsPage /></ProtectedRoute>} />
                                <Route path="/shorts/watch/:id" element={<ProtectedRoute><ShortsWatchPage /></ProtectedRoute>} />
                                <Route path="/myspace" element={<ProtectedRoute><MySpacePage /></ProtectedRoute>} />
                                <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
                                <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                                <Route path="/liked" element={<ProtectedRoute><LikedVideosPage /></ProtectedRoute>} />
                                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                                <Route path="/songs" element={<ProtectedRoute><SongsPage /></ProtectedRoute>} />
                                <Route path="/kids" element={<ProtectedRoute><KidsPage /></ProtectedRoute>} />
                                <Route path="/following" element={<ProtectedRoute><FollowingPage /></ProtectedRoute>} />
                                <Route path="/watch-later" element={<ProtectedRoute><WatchLaterPage /></ProtectedRoute>} />
                            </Routes>
                        </main>

                        {/* --- FLOATING FEATURES --- */}
                        {/* This single component replaces the previous Icon+Panel combo */}
                        <BibleWidget />

                    </div>
                </BibleProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;