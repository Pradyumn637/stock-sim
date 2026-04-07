import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Market from './pages/Market';
import Portfolio from './pages/Portfolio';
import P2P from './pages/P2P';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const NavLink = ({ to, label, icon }) => (
    <Link to={to} className={`nav-link ${location.pathname === to ? 'active' : ''}`}>
      <span style={{ marginRight: '12px' }}>{icon}</span>
      {label}
    </Link>
  );

  return (
    <div className="sidebar">
      <div className="sidebar-logo">TRADEMART</div>
      <NavLink to="/" label="Dashboard" icon="📊" />
      <NavLink to="/market" label="Market" icon="📈" />
      <NavLink to="/portfolio" label="Portfolio" icon="💼" />
      <NavLink to="/marketplace" label="Marketplace" icon="🤝" />
      <NavLink to="/leaderboard" label="Leaderboard" icon="🏆" />
      {user.is_staff && <NavLink to="/admin" label="Admin" icon="⚙️" />}
      
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Logged in as <b>{user.username}</b>
        </p>
        <button onClick={logout} className="btn btn-primary" style={{ width: '100%', background: '#ff4444', color: '#fff' }}>
          Logout
        </button>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AppContent = () => (
  <div className="app-container">
    <Sidebar />
    <div className="main-content">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/market" element={<ProtectedRoute><Market /></ProtectedRoute>} />
        <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
        <Route path="/marketplace" element={<ProtectedRoute><P2P /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
      </Routes>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;