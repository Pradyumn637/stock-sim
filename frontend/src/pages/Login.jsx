import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User as UserIcon } from 'lucide-react';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await login(credentials.username, credentials.password);
            navigate('/');
        } catch (err) {
            setError("Invalid credentials. Please attempt again.");
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="card shadow-xl" style={{ width: '400px', padding: '3rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', background: '#eff6ff', borderRadius: '50%', color: 'var(--accent-primary)', marginBottom: '1.5rem' }}>
                        <Lock size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Sign In</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Access your Fintech Portfolio</p>
                </div>
                
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}><b>{error}</b></div>}
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>ACCOUNT USERNAME</label>
                        <input type="text" value={credentials.username} onChange={e => setCredentials({...credentials, username: e.target.value})} placeholder="e.g. trader_jon" required />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>SECURE PASSWORD</label>
                        <input type="password" value={credentials.password} onChange={e => setCredentials({...credentials, password: e.target.value})} placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '52px', fontSize: '1rem' }}>LOGIN TO DASHBOARD</button>
                    <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        New to Trademart? <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 700, textDecoration: 'none' }}>Create Account</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
