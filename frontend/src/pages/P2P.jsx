import React, { useState, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../AuthContext';
import { Tag, Users, Trash2, ShoppingCart, Info } from 'lucide-react';

const P2P = () => {
    const { user } = useAuth();
    const [listings, setListings] = useState([]);
    const [holdings, setholdings] = useState([]);
    const [form, setForm] = useState({ stock: '', quantity: 1, price: 0 });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const fetchData = async () => {
        try {
            const [listRes, portRes] = await Promise.all([
                API.get('p2p/'),
                API.get('portfolio/')
            ]);
            setListings(listRes.data);
            setholdings(portRes.data);
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
            await API.post('p2p/', form);
            setMessage({ text: "Listing created successfully", type: 'success' });
            fetchData();
        } catch (err) { setMessage({ text: err.response?.data?.error || "Creation failed", type: 'danger' }); }
        finally { setLoading(false); }
    };

    const buyListing = async (id) => {
        setLoading(true);
        try {
            await API.post(`p2p/${id}/buy/`);
            setMessage({ text: "Listing purchased!", type: 'success' });
            fetchData();
        } catch (err) { setMessage({ text: err.response?.data?.error || "Purchase failed", type: 'danger' }); }
        finally { setLoading(false); }
    };

    const deleteListing = async (id) => {
        try {
            await API.delete(`p2p/${id}/`);
            fetchData();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="p2p-view">
            <h1 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>P2P Marketplace</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div className="card shadow-md">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>Sell Assets</h2>
                    <form onSubmit={createListing}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>SELECT ASSET</label>
                        <select value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required>
                            <option value="">-- Choose Stock --</option>
                            {holdings.map(h => <option key={h.id} value={h.stock}>{h.symbol} ({h.quantity} units)</option>)}
                        </select>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>QUANTITY</label>
                        <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} min="1" required />
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>PRICE PER UNIT</label>
                        <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} step="0.01" required />
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={loading}>CREATE LISTING</button>
                    </form>
                </div>

                <div>
                    <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                        {listings.map(l => (
                            <div key={l.id} className="card shadow-sm" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{l.symbol}</h3>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Seller: <b>@{l.seller_username}</b></p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>${parseFloat(l.price).toFixed(2)}</h3>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>UNIT PRICE</p>
                                    </div>
                                </div>
                                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <Info size={16} color="var(--text-secondary)" />
                                    <p style={{ fontSize: '0.85rem' }}>Stock Quantity: <b>{l.quantity} units</b></p>
                                </div>
                                {l.seller_username === user?.username ? (
                                    <button onClick={() => deleteListing(l.id)} className="btn" style={{ width: '100%', background: '#fee2e2', color: '#991b1b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Trash2 size={16} /> DELETE LISTING
                                    </button>
                                ) : (
                                    <button onClick={() => buyListing(l.id)} disabled={loading} className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <ShoppingCart size={16} /> BUY NOW
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default P2P;
