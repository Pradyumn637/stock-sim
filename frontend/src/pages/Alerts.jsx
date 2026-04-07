import React, { useState, useEffect } from 'react';
import API from '../api';
import { Bell, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [form, setForm] = useState({ stock: '', target_price: 0, condition: 'ABOVE' });

    const fetchData = async () => {
        try {
            const [alertRes, stockRes] = await Promise.all([
                API.get('alerts/'),
                API.get('stocks/')
            ]);
            setAlerts(alertRes.data);
            setStocks(stockRes.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const create = async (e) => {
        e.preventDefault();
        try {
            await API.post('alerts/', form);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const remove = async (id) => {
        try {
            await API.delete(`alerts/${id}/`);
            fetchData();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="alerts-view">
            <h1 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Price Alerts</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem' }}>
                <div className="card shadow-md">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>Set New Alert</h2>
                    <form onSubmit={create}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>SELECT STOCK</label>
                        <select value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required>
                            <option value="">-- Choose Stock --</option>
                            {stocks.map(s => <option key={s.id} value={s.id}>{s.symbol} ({s.name})</option>)}
                        </select>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>CONDITION</label>
                        <select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}>
                            <option value="ABOVE">Price Goes Above</option>
                            <option value="BELOW">Price Goes Below</option>
                        </select>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>TARGET PRICE ($)</label>
                        <input type="number" step="0.01" value={form.target_price} onChange={e => setForm({...form, target_price: e.target.value})} required />
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>CREATE ALERT</button>
                    </form>
                </div>

                <div className="card shadow-sm" style={{ padding: '0' }}>
                    <table className="data-table">
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ paddingLeft: '2rem' }}>STOCK</th>
                                <th>CONDITION</th>
                                <th>TARGET</th>
                                <th style={{ textAlign: 'right', paddingRight: '2rem' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.map(a => (
                                <tr key={a.id}>
                                    <td style={{ paddingLeft: '2rem' }}><b>{a.symbol}</b></td>
                                    <td>
                                        <span style={{ color: a.condition === 'ABOVE' ? 'var(--success)' : 'var(--danger)', fontWeight: 800 }}>
                                            {a.condition === 'ABOVE' ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {a.condition}
                                        </span>
                                    </td>
                                    <td><b>${parseFloat(a.target_price).toFixed(2)}</b></td>
                                    <td style={{ textAlign: 'right', paddingRight: '2rem' }}>
                                        <button onClick={() => remove(a.id)} className="btn" style={{ color: '#ef4444' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {alerts.length === 0 && <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No price alerts active.</div>}
                </div>
            </div>
        </div>
    );
};

export default Alerts;
