import React, { useState, useEffect } from 'react';
import API from '../api';

const Market = () => {
    const [stocks, setStocks] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const fetchStocks = async () => {
        try {
            const res = await API.get('stocks/');
            setStocks(res.data);
        } catch (error) {
            console.error("Market data fetch failed", error);
        }
    };

    useEffect(() => {
        fetchStocks();
        const poll = setInterval(fetchStocks, 5000); // 5s polling for market prices
        return () => clearInterval(poll);
    }, []);

    const handleTrade = async (type) => {
        if (!selectedStock) return;
        setLoading(true);
        setMessage(null);
        try {
            const res = await API.post(type === 'BUY' ? 'buy/' : 'sell/', {
                stock_id: selectedStock.id,
                quantity: quantity
            });
            setMessage({ text: res.data.message, type: 'success' });
            setSelectedStock(null);
        } catch (error) {
            setMessage({ text: error.response?.data?.error || "Trade failed", type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="market">
            <h1 style={{ marginBottom: '1.5rem' }}>Live Market</h1>
            {message && (
                <div className={`card ${message.type}`} style={{ padding: '1rem', border: 'none', background: `var(--${message.type})`, color: '#000', marginBottom: '1rem' }}>
                    <b>{message.text}</b>
                </div>
            )}
            
            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>STOCK</th>
                            <th>SYMBOL</th>
                            <th>PRICE</th>
                            <th>24H CHANGE</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.map(s => (
                            <tr key={s.id}>
                                <td><b>{s.name}</b></td>
                                <td><span style={{ color: 'var(--accent-primary)' }}>{s.symbol}</span></td>
                                <td>${parseFloat(s.price).toFixed(2)}</td>
                                <td className={parseFloat(s.change_percent) >= 0 ? 'price-up' : 'price-down'}>
                                    {parseFloat(s.change_percent) >= 0 ? '+' : ''}{parseFloat(s.change_percent).toFixed(2)}%
                                </td>
                                <td>
                                    <button onClick={() => setSelectedStock(s)} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Trade</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedStock && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '400px', padding: '2rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Trade {selectedStock.symbol}</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Market Price: ${parseFloat(selectedStock.price).toFixed(2)}</p>
                        <p style={{ marginBottom: '1.5rem' }}>Estimated Total: ${(selectedStock.price * quantity).toFixed(2)}</p>
                        
                        <label>Quantity</label>
                        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" disabled={loading} />
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <button onClick={() => handleTrade('BUY')} className="btn" style={{ background: 'var(--success)', color: '#000' }} disabled={loading}>BUY</button>
                            <button onClick={() => handleTrade('SELL')} className="btn" style={{ background: 'var(--danger)', color: '#000' }} disabled={loading}>SELL</button>
                        </div>
                        <button onClick={() => setSelectedStock(null)} className="btn" style={{ marginTop: '1rem', width: '100%', background: 'var(--bg-tertiary)', color: '#fff' }} disabled={loading}>CLOSE</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Market;
