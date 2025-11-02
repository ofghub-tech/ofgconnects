// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage'; 

// This is our simple Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth(); // 'user' is used here, so it's fine
  
  if (!user) {
    // If user is not logged in, redirect them to the login page
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  const { loading } = useAuth(); // <-- Removed 'user' from here

  // Show a loading message while we check user status
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
      </Routes>
    </Router>
  );
}

export default App;