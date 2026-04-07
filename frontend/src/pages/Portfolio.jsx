import React, { useState, useEffect } from 'react';
import API from '../api';
import { TrendingUp, TrendingDown, Clock, BarChart3 } from 'lucide-react';

const Portfolio = () => {
    const [holdings, setholdings] = useState([]);
    const [stats, setStats] = useState({ value: 0, cost: 0, pnl: 0 });

    const fetchHoldings = async () => {
        try {
            const res = await API.get('portfolio/');
            setholdings(res.data);
            const val = res.data.reduce((acc, h) => acc + (parseFloat(h.quantity) * parseFloat(h.current_price)), 0);
            const cost = res.data.reduce((acc, h) => acc + (parseFloat(h.quantity) * parseFloat(h.avg_price)), 0);
            setStats({ value: val, cost, pnl: val - cost });
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchHoldings();
        const poll = setInterval(fetchHoldings, 10000);
        return () => clearInterval(poll);
    }, []);

    const ProfitLoss = ({ avg, current }) => {
        const diff = (parseFloat(current) - parseFloat(avg)).toFixed(2);
        const percent = ((diff / parseFloat(avg)) * 100).toFixed(2);
        const color = diff >= 0 ? 'var(--success)' : 'var(--danger)';
        return (
            <div style={{ color, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                {diff >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                ${Math.abs(diff).toFixed(2)} ({diff >= 0 ? '+' : ''}{percent}%)
            </div>
        );
    };

    return (
        <div className="portfolio-view">
            <h1 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Portfolio Analysis</h1>
            
            <div className="stock-grid" style={{ marginBottom: '2rem' }}>
                <div className="card shadow-lg" style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>Assets Under Management</p>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>${stats.value.toLocaleString()}</h2>
                </div>
                <div className="card">
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Unrealized Gains</p>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: stats.pnl >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {stats.pnl >= 0 ? '+' : ''}${stats.pnl.toLocaleString()}
                    </h2>
                </div>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Asset Allocation</h2>
                    <BarChart3 size={20} color="var(--text-secondary)" />
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>SYMBOL</th>
                            <th>ASSET NAME</th>
                            <th>UNIT PRICE</th>
                            <th>QUANTITY</th>
                            <th>MARKET VALUE</th>
                            <th>PERFORMANCE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {holdings.map(h => (
                            <tr key={h.id}>
                                <td><span style={{ padding: '0.35rem 0.75rem', background: '#f1f5f9', borderRadius: '6px', fontWeight: 800 }}>{h.symbol}</span></td>
                                <td><b>{h.name}</b></td>
                                <td>${parseFloat(h.avg_price).toFixed(2)}</td>
                                <td>{h.quantity}</td>
                                <td><b>${(h.quantity * h.current_price).toFixed(2)}</b></td>
                                <td><ProfitLoss avg={h.avg_price} current={h.current_price} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Portfolio;
