import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Link, useNavigate } from 'react-router-dom';

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
            setError("Invalid credentials. Please try again.");
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="card" style={{ width: '400px', padding: '2.5rem' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Login</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>Welcome back to TRADEMART</p>
                
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}><b>{error}</b></div>}
                
                <form onSubmit={handleSubmit}>
                    <label>Username</label>
                    <input type="text" value={credentials.username} onChange={e => setCredentials({...credentials, username: e.target.value})} required />
                    <label>Password</label>
                    <input type="password" value={credentials.password} onChange={e => setCredentials({...credentials, password: e.target.value})} required />
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>LOGIN</button>
                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                        Don't have an account? <Link to="/register" style={{ color: 'var(--accent-primary)' }}>Register now</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
