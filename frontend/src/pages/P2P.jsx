import React, { useState, useEffect } from 'react';
import API from '../api';

const P2P = () => {
    const [listings, setListings] = useState([]);
    const [holdings, setholdings] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [newListing, setNewListing] = useState({ stock: '', quantity: 0, price: 0 });
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            const [listRes, portRes, stockRes] = await Promise.all([
                API.get('p2p/'),
                API.get('portfolio/'),
                API.get('stocks/')
            ]);
            setListings(listRes.data);
            setholdings(portRes.data);
            setStocks(stockRes.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchData();
        const poll = setInterval(fetchData, 10000);
        return () => clearInterval(poll);
    }, []);

    const createListing = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post('p2p/', newListing);
            setMessage({ text: "Listing created successfully", type: 'success' });
            fetchData();
        } catch (err) { setMessage({ text: err.response?.data?.error || "Failed to create listing", type: 'danger' }); }
        finally { setLoading(false); }
    };

    const buyListing = async (id) => {
        setLoading(true);
        try {
            await API.post(`p2p/${id}/buy/`);
            setMessage({ text: "Listing bought successfully", type: 'success' });
            fetchData();
        } catch (err) { setMessage({ text: err.response?.data?.error || "Failed to buy listing", type: 'danger' }); }
        finally { setLoading(false); }
    };

    return (
        <div className="marketplace">
            <h1 style={{ marginBottom: '1.5rem' }}>P2P Marketplace</h1>
            {message && <div className={`card ${message.type}`} style={{ padding: '1rem', marginBottom: '1rem' }}><b>{message.text}</b></div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="card">
                    <h2>Create Listing</h2>
                    <form onSubmit={createListing} style={{ marginTop: '1.5rem' }}>
                        <label>Select Stock</label>
                        <select value={newListing.stock} onChange={e => setNewListing({...newListing, stock: e.target.value})} required>
                            <option value="">-- Choose Stock --</option>
                            {holdings.map(h => <option key={h.id} value={h.stock}>{h.symbol} ({h.quantity} available)</option>)}
                        </select>
                        <label>Quantity</label>
                        <input type="number" value={newListing.quantity} onChange={e => setNewListing({...newListing, quantity: e.target.value})} required />
                        <label>Price per share</label>
                        <input type="number" value={newListing.price} onChange={e => setNewListing({...newListing, price: e.target.value})} required />
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>CREATE LISTING</button>
                    </form>
                </div>

                <div className="listings-grid">
                    {listings.map(l => (
                        <div key={l.id} className="card shadow-sm" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--accent-primary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{l.symbol}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Seller: <b>{l.seller_username}</b></p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <h3 style={{ color: 'var(--success)', marginBottom: '0.25rem' }}>${l.price}</h3>
                                    <p style={{ fontSize: '0.85rem' }}>Qty: <b>{l.quantity}</b></p>
                                </div>
                            </div>
                            <button onClick={() => buyListing(l.id)} disabled={loading} className="btn" style={{ width: '100%', marginTop: '1rem', background: 'var(--bg-tertiary)', color: '#fff' }}>
                                BUY NOW
                            </button>
                        </div>
                    ))}
                    {listings.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No listings available.</p>}
                </div>
            </div>
        </div>
    );
};

export default P2P;
