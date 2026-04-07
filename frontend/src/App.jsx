import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import API from './api';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Market from './pages/Market';
import Portfolio from './pages/Portfolio';
import P2P from './pages/P2P';
import Alerts from './pages/Alerts';
import Watchlist from './pages/Watchlist';
import AdminPanel from './pages/AdminPanel';
import { 
  LayoutDashboard, TrendingUp, Users, Bell, 
  Settings, LogOut, Wallet, Star, ChevronDown 
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const NavLink = ({ to, label, Icon }) => (
    <Link to={to} className={`nav-link ${location.pathname === to ? 'active' : ''}`}>
      <Icon size={18} style={{ marginRight: '12px' }} />
      {label}
    </Link>
  );

  return (
    <div className="sidebar shadow-xl">
      <div className="sidebar-logo">
        <span style={{ color: 'var(--accent-primary)' }}>TRADE</span>MART
      </div>
      <div style={{ marginTop: '1rem' }}>
        <NavLink to="/" label="Dashboard" Icon={LayoutDashboard} />
        <NavLink to="/market" label="Market" Icon={TrendingUp} />
        <NavLink to="/portfolio" label="Portfolio" Icon={Wallet} />
        <NavLink to="/p2p" label="P2P Marketplace" Icon={Users} />
        <NavLink to="/watchlist" label="Watchlist" Icon={Star} />
        <NavLink to="/alerts" label="Alerts" Icon={Bell} />
        {user.is_staff && <NavLink to="/admin" label="Admin Panel" Icon={Settings} />}
      </div>
      
      <div style={{ marginTop: 'auto', padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={logout} className="nav-link" style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}>
          <LogOut size={18} style={{ marginRight: '12px' }} />
          Logout
        </button>
      </div>
    </div>
  );
};

const Topbar = () => {
  const { user } = useAuth();
  const [news, setNews] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchNews = async () => {
      try {
        const res = await API.get('news/');
        setNews(res.data);
      } catch (err) { console.error(err); }
    };
    fetchNews();
    const poll = setInterval(fetchNews, 60000);
    return () => clearInterval(poll);
  }, [user]);

  if (!user) return null;

  return (
    <div className="topbar glass shadow-sm">
      <div className="ticker-container">
        <div className="ticker-content">
          {news.map((item, idx) => (
            <span key={idx} className={`news-item ${item.is_breaking ? 'news-breaking' : ''}`}>
               {item.is_breaking ? '🚨 BREAKING: ' : '• '} {item.title}
            </span>
          ))}
          {news.length === 0 && <span className="news-item">Welcome to TRADEMART • Markets are live • No breaking news at the moment</span>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CASH BALANCE</p>
          <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--success)' }}>${parseFloat(user.balance || 0).toLocaleString()}</p>
        </div>
        <div style={{ height: '40px', width: '40px', background: '#e2e8f0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
          {user.username?.[0]?.toUpperCase()}
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
          <Sidebar />
          <div className="main-content">
            <Topbar />
            <div className="page-container">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/market" element={<ProtectedRoute><Market /></ProtectedRoute>} />
                <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
                <Route path="/p2p" element={<ProtectedRoute><P2P /></ProtectedRoute>} />
                <Route path="/watchlist" element={<ProtectedRoute><Watchlist /></ProtectedRoute>} />
                <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;