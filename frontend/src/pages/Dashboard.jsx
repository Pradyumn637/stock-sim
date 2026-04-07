import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../AuthContext';
import { Wallet, PieChart, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ balance: 0, portfolio_value: 0, total_value: 0, pnl: 0 });
    const [holdings, setholdings] = useState([]);
    const [transactions, setTransactions] = useState([]);

    const fetchData = async () => {
        try {
            const [userRes, portRes, transRes] = await Promise.all([
                API.get('user/'),
                API.get('portfolio/'),
                API.get('transactions/')
            ]);
            const portValue = portRes.data.reduce((acc, p) => acc + (parseFloat(p.quantity) * parseFloat(p.current_price)), 0);
            const portCost = portRes.data.reduce((acc, p) => acc + (parseFloat(p.quantity) * parseFloat(p.avg_price)), 0);
            
            setStats({
                balance: parseFloat(userRes.data.balance),
                portfolio_value: portValue,
                total_value: parseFloat(userRes.data.balance) + portValue,
                pnl: portValue - portCost
            });
            setholdings(portRes.data.slice(0, 5));
            setTransactions(transRes.data.slice(0, 5));
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchData();
        const poll = setInterval(fetchData, 10000);
        return () => clearInterval(poll);
    }, []);

    const StatCard = ({ label, value, Icon, color }) => (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: `${color}10`, color, borderRadius: '12px' }}>
                <Icon size={24} />
            </div>
            <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</p>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>${parseFloat(value).toLocaleString()}</h3>
            </div>
        </div>
    );

    return (
        <div className="dashboard-view">
            <h1 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Overview</h1>
            
            <div className="stock-grid" style={{ marginBottom: '2rem' }}>
                <StatCard label="Total Assets" value={stats.total_value} Icon={PieChart} color="var(--accent-primary)" />
                <StatCard label="Portfolio Value" value={stats.portfolio_value} Icon={Wallet} color="var(--success)" />
                <StatCard label="Profit / Loss" value={stats.pnl} Icon={stats.pnl >= 0 ? TrendingUp : TrendingDown} color={stats.pnl >= 0 ? 'var(--success)' : 'var(--danger)'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Top Holdings</h2>
                        <Link to="/portfolio" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>View Portfolio <ArrowRight size={14} /></Link>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ASSET</th>
                                <th>QTY</th>
                                <th>PRICE</th>
                                <th>VALUE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {holdings.map(h => (
                                <tr key={h.id}>
                                    <td><b>{h.symbol}</b></td>
                                    <td>{h.quantity}</td>
                                    <td>${parseFloat(h.current_price).toFixed(2)}</td>
                                    <td><b>${(h.quantity * h.current_price).toFixed(2)}</b></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>History</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {transactions.map(t => (
                            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <div>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>{t.symbol}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(t.timestamp).toLocaleDateString()}</p>
                                </div>
                                <span style={{ 
                                    fontSize: '0.85rem', fontWeight: 800, 
                                    color: t.type.includes('BUY') ? 'var(--success)' : 'var(--danger)'
                                }}>
                                    {t.type.includes('BUY') ? '+' : '-'}{t.quantity} @ ${t.price}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
