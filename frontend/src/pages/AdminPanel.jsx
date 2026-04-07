import React, { useState, useEffect } from 'react';
import API from '../api';

const AdminPanel = () => {
    const [stocks, setStocks] = useState([]);
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({ stock: '', title: '', impact_percent: 0, scheduled_time: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const fetchData = async () => {
        try {
            const [stockRes, eventRes] = await Promise.all([
                API.get('stocks/'),
                API.get('events/')
            ]);
            setStocks(stockRes.data);
            setEvents(eventRes.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchData();
        const poll = setInterval(fetchData, 10000);
        return () => clearInterval(poll);
    }, []);

    const createEvent = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await API.post('events/', newEvent);
            setMessage({ text: "Event scheduled successfully", type: 'success' });
            fetchData();
        } catch (err) { setMessage({ text: "Failed to schedule event", type: 'danger' }); }
        finally { setLoading(false); }
    };

    return (
        <div className="admin-panel">
            <h1 style={{ marginBottom: '1.5rem' }}>Admin Control Center</h1>
            {message && <div className={`card ${message.type}`} style={{ padding: '1rem', marginBottom: '1rem' }}><b>{message.text}</b></div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="card">
                    <h2>Schedule Market Event</h2>
                    <form onSubmit={createEvent} style={{ marginTop: '1.5rem' }}>
                        <label>Target Stock</label>
                        <select value={newEvent.stock} onChange={e => setNewEvent({...newEvent, stock: e.target.value})} required>
                            <option value="">-- Choose Stock --</option>
                            {stocks.map(s => <option key={s.id} value={s.id}>{s.symbol} ({s.name})</option>)}
                        </select>
                        <label>Event Name</label>
                        <input value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="e.g. CEO Resignation" required />
                        <label>Impact Percentage (e.g. -20 for 20% drop)</label>
                        <input type="number" value={newEvent.impact_percent} onChange={e => setNewEvent({...newEvent, impact_percent: e.target.value})} required />
                        <label>Execution Time</label>
                        <input type="datetime-local" value={newEvent.scheduled_time} onChange={e => setNewEvent({...newEvent, scheduled_time: e.target.value})} required />
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>TRIGGER EVENT</button>
                    </form>
                </div>

                <div className="card">
                    <h2>Upcoming/Past Events</h2>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>STOCK</th>
                                <th>IMPACT</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((ev, idx) => (
                                <tr key={idx}>
                                    <td><b>{ev.stock_symbol}</b></td>
                                    <td style={{ color: ev.impact_percent >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                        {ev.impact_percent >= 0 ? '+' : ''}{ev.impact_percent}%
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.8rem', background: ev.is_executed ? 'var(--bg-tertiary)' : 'var(--accent-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#000' }}>
                                            {ev.is_executed ? 'EXECUTED' : 'PENDING'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
