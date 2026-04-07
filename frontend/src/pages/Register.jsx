import React, { useState } from 'react';
import API from '../api';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await API.post('register/', formData);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed. Try a different username.");
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="card" style={{ width: '400px', padding: '2.5rem' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Open Account</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>Get $50,000 starting balance instantly.</p>
                
                {success && <div style={{ color: 'var(--success)', marginBottom: '1rem', textAlign: 'center' }}><b>Account created! Redirecting...</b></div>}
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}><b>{error}</b></div>}
                
                <form onSubmit={handleSubmit}>
                    <label>Username</label>
                    <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                    <label>Email Address</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <label>Choose Password</label>
                    <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>REGISTER</button>
                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)' }}>Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
