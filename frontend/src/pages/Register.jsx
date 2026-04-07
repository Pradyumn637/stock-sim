import React, { useState } from 'react';
import API from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, ShieldCheck } from 'lucide-react';

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
            setError(err.response?.data?.error || "Registration failed. Username may already exist.");
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="card shadow-xl" style={{ width: '450px', padding: '3.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', background: '#eff6ff', borderRadius: '50%', color: 'var(--success)', marginBottom: '1.5rem' }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Open Account</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Start Trading with the Fintech Standard</p>
                </div>
                
                {success && <div style={{ color: 'var(--success)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}><b>Account created! Redirecting to sign in...</b></div>}
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}><b>{error}</b></div>}
                
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>USER IDENTIFIER</label>
                        <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="trader_name" required />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>EMAIL ADDRESS</label>
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="example@fintech.com" required />
                    </div>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>SECURE PASSWORD</label>
                        <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '52px', fontSize: '1rem' }}>CREATE ACCOUNT</button>
                    <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Already a member? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 700, textDecoration: 'none' }}>Log In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
