// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import WatchPage from './pages/WatchPage';
import MySpacePage from './pages/MySpacePage';
import FollowingPage from './pages/FollowingPage';
import ShortsPage from './pages/ShortsPage'; // 1. Import the new page

// This is our simple Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <p>Loading application...</p>
  }

  return (
    <Router>
      <Routes>
        {/* Public Route: Login Page */}
        <Route path="/" element={<LoginPage />} />
        
        {/* Protected Route: Home Page */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />

        {/* Protected Route: Watch Page */}
        <Route 
          path="/watch/:videoId" 
          element={
            <ProtectedRoute>
              <WatchPage />
            </ProtectedRoute>
          } 
        />

        {/* Protected Route: MySpace */}
        <Route 
          path="/myspace" 
          element={
            <ProtectedRoute>
              <MySpacePage />
            </ProtectedRoute>
          } 
        />

        {/* Protected Route: Following */}
        <Route 
          path="/following" 
          element={
            <ProtectedRoute>
              <FollowingPage />
            </ProtectedRoute>
          } 
        />

        {/* 2. Add the new Protected Route for Shorts */}
        <Route 
          path="/shorts" 
          element={
            <ProtectedRoute>
              <ShortsPage />
            </ProtectedRoute>
          } 
        />

      </Routes>
    </Router>
  );
}

export default App;