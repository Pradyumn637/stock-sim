import React, { useState, useEffect } from 'react';
import API from '../api';

const Portfolio = () => {
    const [holdings, setholdings] = useState([]);
    const [totalValue, setTotalValue] = useState(0);

    const fetchHoldings = async () => {
        try {
            const res = await API.get('portfolio/');
            setholdings(res.data);
            const val = res.data.reduce((acc, h) => acc + (parseFloat(h.quantity) * parseFloat(h.current_price)), 0);
            setTotalValue(val);
        } catch (error) {
            console.error("Portfolio data fetch failed", error);
        }
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
            <div style={{ color }}>
                <b>{diff >= 0 ? '+' : ''}${diff}</b> ({diff >= 0 ? '+' : ''}{percent}%)
            </div>
        );
    };

    return (
        <div className="portfolio">
            <h1 style={{ marginBottom: '1.5rem' }}>Your Portfolio</h1>
            <div className="card">
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Current Portfolio Value</p>
                <h2 style={{ fontSize: '2.5rem', color: 'var(--success)' }}>${totalValue.toLocaleString()}</h2>
            </div>
            
            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ASSET</th>
                            <th>SYMBOL</th>
                            <th>QTY</th>
                            <th>AVG PRICE</th>
                            <th>MARKET PRICE</th>
                            <th>PROFIT / LOSS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {holdings.map(h => (
                            <tr key={h.id}>
                                <td><b>{h.name}</b></td>
                                <td><span style={{ color: 'var(--accent-primary)' }}>{h.symbol}</span></td>
                                <td>{h.quantity}</td>
                                <td>${parseFloat(h.avg_price).toFixed(2)}</td>
                                <td>${parseFloat(h.current_price).toFixed(2)}</td>
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
