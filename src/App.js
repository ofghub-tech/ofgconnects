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

// --- NEW PAGE IMPORTS ---
import HistoryPage from './pages/HistoryPage';
import WatchLaterPage from './pages/WatchLaterPage';
import LikedVideosPage from './pages/LikedVideosPage';
// --- END NEW PAGE IMPORTS ---

// NO LONGER NEEDED: import './App.css';

// --- Protected Route Component ---
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" />;
  }
  return children;
};

// --- Global Layout Component (Refactored with Tailwind) ---
const AppLayout = ({ children, isSidebarOpen, toggleSidebar }) => {
    return (
        // Replaced 'app-layout'
        <div className="flex h-screen overflow-hidden bg-white">
            <Sidebar isSidebarOpen={isSidebarOpen} />
            
            {/* Replaced 'main-content-area' */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header toggleSidebar={toggleSidebar} />
                
                {/* Replaced 'page-content-wrapper' */}
                {/* This is the main scrolling area with the light gray background */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
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
    // Let's use Tailwind for a simple loading screen
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
                  <Route path="/watch/:videoId" element={<WatchPage />} />
                  <Route path="/myspace" element={<MySpacePage />} />
                  <Route path="/following" element={<FollowingPage />} />
                  
                  {/* --- NEW ROUTES ADDED --- */}
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/watch-later" element={<WatchLaterPage />} />
                  <Route path="/liked-videos" element={<LikedVideosPage />} />
                  {/* --- END NEW ROUTES --- */}
                  
                  <Route path="/shorts" element={<ShortsPage />} />
                  <Route path="/offline" element={<OfflinePage />} />
                  <Route path="/songs" element={<SongsPage />} />
                  <Route path="/kids" element={<KidsPage />} />
                  
                  {/* Redirect any unmatched protected route to home */}
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
