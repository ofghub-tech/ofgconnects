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
import './App.css'; // Global CSS for layout

// --- Protected Route Component ---
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// --- Global Layout Component ---
const AppLayout = ({ children, isSidebarOpen, toggleSidebar }) => {
    return (
        // Sidebar-closed class controls the slide-out effect in App.css
        <div className={`app-layout ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
            <Sidebar isSidebarOpen={isSidebarOpen} />
            <div className="main-content-area">
                <Header toggleSidebar={toggleSidebar} />
                <main className="page-content-wrapper">
                    {children}
                </main>
            </div>
        </div>
    );
};

function App() {
  const { loading } = useAuth();
  // Global state for sidebar open/close status
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  if (loading) {
    return <p>Loading application...</p>
  }

  return (
    <Router>
      <Routes>
        {/* Public Route: Login Page */}
        <Route path="/" element={<LoginPage />} />
        
        {/* Wildcard Route to apply AppLayout to all protected paths */}
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
                  <Route path="/shorts" element={<ShortsPage />} />
                  <Route path="/offline" element={<OfflinePage />} />
                  <Route path="/songs" element={<SongsPage />} />
                  <Route path="/kids" element={<KidsPage />} />
                  
                  {/* The /profile/:userId route has been removed */}
                  
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