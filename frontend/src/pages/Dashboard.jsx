import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ balance: 0, portfolio_value: 0, total_value: 0 });
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, portRes, transRes] = await Promise.all([
                    API.get('user/'),
                    API.get('portfolio/'),
                    API.get('transactions/')
                ]);

                const portValue = portRes.data.reduce((acc, p) => 
                    acc + (parseFloat(p.quantity) * parseFloat(p.current_price)), 0);
                
                setStats({
                    balance: parseFloat(userRes.data.balance),
                    portfolio_value: portValue,
                    total_value: parseFloat(userRes.data.balance) + portValue
                });
                setTransactions(transRes.data.slice(0, 5));
            } catch (error) {
                console.error("Dashboard data fetch failed", error);
            }
        };

        fetchData();
        const poll = setInterval(fetchData, 10000); // Polling every 10s
        return () => clearInterval(poll);
    }, []);

    const StatCard = ({ title, value, color }) => (
        <div className="card">
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{title}</h3>
            <p style={{ fontSize: '2rem', fontWeight: '800', color, margin: '0.5rem 0' }}>${value.toLocaleString()}</p>
        </div>
    );

    return (
        <div className="dashboard">
            <h1>Welcome back, {user?.username}</h1>
            <p style={{ marginBottom: '2rem' }}>Here's what's happening with your portfolio today.</p>

            <div className="stat-grid">
                <StatCard title="Wallet Balance" value={stats.balance} color="var(--accent-primary)" />
                <StatCard title="Portfolio Value" value={stats.portfolio_value} color="var(--success)" />
                <StatCard title="Total Assets" value={stats.total_value} color="#fff" />
            </div>

            <div className="card">
                <h2 style={{ marginBottom: '1.5rem' }}>Recent Activity</h2>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>SYMBOL</th>
                            <th>TYPE</th>
                            <th>QTY</th>
                            <th>PRICE</th>
                            <th>DATE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(t => (
                            <tr key={t.id}>
                                <td><b>{t.symbol}</b></td>
                                <td style={{ color: t.type.includes('BUY') ? 'var(--success)' : 'var(--danger)' }}>{t.type}</td>
                                <td>{t.quantity}</td>
                                <td>${t.price}</td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    {new Date(t.timestamp).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
