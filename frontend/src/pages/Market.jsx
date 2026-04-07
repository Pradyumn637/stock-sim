import React, { useState, useEffect } from 'react';
import API from '../api';
import StockChart from '../components/StockChart';
import { Eye, TrendingUp, TrendingDown, Clock, X } from 'lucide-react';

const Market = () => {
    const [stocks, setStocks] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [candles, setCandles] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const fetchStocks = async () => {
        try {
            const res = await API.get('stocks/');
            setStocks(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchStocks();
        const poll = setInterval(fetchStocks, 5000);
        return () => clearInterval(poll);
    }, []);

    const openStockDetail = async (stock) => {
        setSelectedStock(stock);
        setCandles([]); // Clear old candles
        try {
            const res = await API.get(`stocks/${stock.id}/candles/`);
            setCandles(res.data);
        } catch (err) { console.error(err); }
    };

    const handleTrade = async (type) => {
        setLoading(true);
        try {
            const res = await API.post(type === 'BUY' ? 'buy/' : 'sell/', {
                stock_id: selectedStock.id,
                quantity: quantity
            });
            setMessage({ text: res.data.message, type: 'success' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ text: err.response?.data?.error || "Trade failed", type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const addToWatchlist = async (id) => {
        try {
            await API.post('watchlist/', { stock: id });
            setMessage({ text: "Added to Watchlist!", type: 'success' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) { console.error(err); }
    };

    return (
        <div className="market-view">
            <h1 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Global Market</h1>
            {message && (
                <div className={`card ${message.type}`} style={{ padding: '0.75rem', marginBottom: '1.5rem', background: message.type === 'success' ? '#d1fae5' : '#fee2e2', color: message.type === 'success' ? '#065f46' : '#991b1b', border: 'none' }}>
                    <b>{message.text}</b>
                </div>
            )}

            <div className="stock-grid">
                {stocks.map(s => (
                    <div key={s.id} className="card" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => openStockDetail(s)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{s.symbol}</h3>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{s.name}</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); addToWatchlist(s.id); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
                                <Eye size={18} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>${parseFloat(s.price).toFixed(2)}</p>
                            <span style={{ 
                                display: 'flex', alignItems: 'center', gap: '4px',
                                color: parseFloat(s.change_percent) >= 0 ? 'var(--success)' : 'var(--danger)',
                                fontWeight: 700, fontSize: '0.875rem'
                            }}>
                                {parseFloat(s.change_percent) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                {parseFloat(s.change_percent) >= 0 ? '+' : ''}{parseFloat(s.change_percent).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {selectedStock && (
                <div className="modal-overlay" onClick={() => setSelectedStock(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '2.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{selectedStock.name} ({selectedStock.symbol})</h2>
                                <p style={{ color: 'var(--text-secondary)' }}>Live Market Price: <b>${parseFloat(selectedStock.price).toFixed(2)}</b></p>
                            </div>
                            <button onClick={() => setSelectedStock(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <div className="card" style={{ marginBottom: '2rem', background: '#f8fafc' }}>
                            {candles.length > 0 ? <StockChart data={candles} /> : <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Loading Charts...</div>}
                        </div>

                        <div className="card" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', alignItems: 'flex-end' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>ORDER QUANTITY</label>
                                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" style={{ margin: 0 }} />
                            </div>
                            <button onClick={() => handleTrade('BUY')} className="btn" style={{ background: 'var(--success)', color: '#fff', height: '48px' }} disabled={loading}>BUY</button>
                            <button onClick={() => handleTrade('SELL')} className="btn" style={{ background: 'var(--danger)', color: '#fff', height: '48px' }} disabled={loading}>SELL</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Market;
