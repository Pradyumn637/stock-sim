import React, { useState, useEffect } from 'react';
import API from '../api';
import { 
    Activity, Calendar, Trophy, Sliders, 
    Plus, Trash, ArrowUp, ArrowDown, RotateCcw, Pause, Play, Trash2
} from 'lucide-react';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('stocks');
    const [stocks, setStocks] = useState([]);
    const [events, setEvents] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const [stockForm, setStockForm] = useState({ symbol: '', name: '', price: 0 });
    const [eventForm, setEventForm] = useState({ stock: '', title: '', impact_percent: 0, scheduled_time: '' });

    const fetchData = async () => {
        try {
            const [stockRes, eventRes, leadRes] = await Promise.all([
                API.get('stocks/'),
                API.get('events/'),
                API.get('leaderboard/')
            ]);
            setStocks(stockRes.data);
            setEvents(eventRes.data);
            setLeaderboard(leadRes.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const executeAction = async (action) => {
        setLoading(true);
        try {
            const res = await API.post(`market/control/${action}/`);
            setMessage({ text: res.data.message, type: 'success' });
            fetchData();
        } catch (err) { setMessage({ text: "Action failed", type: 'danger' }); }
        finally { setLoading(false); setTimeout(() => setMessage(null), 3000); }
    };

    const addStock = async (e) => {
        e.preventDefault();
        try { await API.post('stocks/', stockForm); fetchData(); } 
        catch (err) { console.error(err); }
    };

    const deleteStock = async (id) => {
        try { await API.delete(`stocks/${id}/`); fetchData(); }
        catch (err) { console.error(err); }
    };

    const scheduleEvent = async (e) => {
        e.preventDefault();
        try { await API.post('events/', eventForm); fetchData(); }
        catch (err) { console.error(err); }
    };

    const ControlButton = ({ label, action, Icon, color }) => (
        <button onClick={() => executeAction(action)} disabled={loading} className="btn" style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            background: `${color}10`, color, border: `1px solid ${color}30`, padding: '1.5rem', width: '100%'
        }}>
            <Icon size={24} />
            <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>{label}</span>
        </button>
    );

    return (
        <div className="admin-view">
            <h1 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Admin Center</h1>
            {message && <div className={`card ${message.type}`} style={{ padding: '1rem', marginBottom: '1rem', background: '#d1fae5', color: '#065f46' }}>{message.text}</div>}

            <div className="card" style={{ display: 'flex', gap: '1rem', padding: '0.5rem', marginBottom: '2rem', background: '#f1f5f9' }}>
                {['stocks', 'events', 'leaderboard', 'controls'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className="btn" style={{ 
                        flex: 1, textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700,
                        background: activeTab === tab ? '#fff' : 'transparent', 
                        color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}>
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'stocks' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                    <div className="card shadow-md">
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>Add Asset</h2>
                        <form onSubmit={addStock}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>SYMBOL</label>
                            <input value={stockForm.symbol} onChange={e => setStockForm({...stockForm, symbol: e.target.value})} placeholder="e.g. BTC" required />
                            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>NAME</label>
                            <input value={stockForm.name} onChange={e => setStockForm({...stockForm, name: e.target.value})} placeholder="Bitcoin" required />
                            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>STARTING PRICE ($)</label>
                            <input type="number" step="0.01" value={stockForm.price} onChange={e => setStockForm({...stockForm, price: e.target.value})} required />
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>ADD ASSET</button>
                        </form>
                    </div>
                    <div className="card shadow-sm" style={{ padding: 0 }}>
                        <table className="data-table">
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    <th style={{ paddingLeft: '2rem' }}>SYMBOL</th>
                                    <th>NAME</th>
                                    <th>PRICE</th>
                                    <th style={{ textAlign: 'right', paddingRight: '2rem' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.map(s => (
                                    <tr key={s.id}>
                                        <td style={{ paddingLeft: '2rem' }}><b>{s.symbol}</b></td>
                                        <td>{s.name}</td>
                                        <td><b>${parseFloat(s.price).toFixed(2)}</b></td>
                                        <td style={{ textAlign: 'right', paddingRight: '2rem' }}>
                                            <button onClick={() => deleteStock(s.id)} style={{ color: '#ef4444', background: 'none', border: 'none' }}><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'events' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                    <div className="card shadow-md">
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem' }}>Schedule Event</h2>
                        <form onSubmit={scheduleEvent}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>TARGET STOCK</label>
                            <select value={eventForm.stock} onChange={e => setEventForm({...eventForm, stock: e.target.value})} required>
                                <option value="">-- Select --</option>
                                {stocks.map(s => <option key={s.id} value={s.id}>{s.symbol}</option>)}
                            </select>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>TITLE</label>
                            <input value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} placeholder="Major Partnership" required />
                            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>IMPACT % (-100 to +100)</label>
                            <input type="number" value={eventForm.impact_percent} onChange={e => setEventForm({...eventForm, impact_percent: e.target.value})} required />
                            <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>EXECUTION TIME</label>
                            <input type="datetime-local" value={eventForm.scheduled_time} onChange={e => setEventForm({...eventForm, scheduled_time: e.target.value})} required />
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>SCHEDULE EVENT</button>
                        </form>
                    </div>
                    <div className="card shadow-sm" style={{ padding: 0 }}>
                        <table className="data-table">
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    <th style={{ paddingLeft: '2rem' }}>STOCK</th>
                                    <th>TITLE</th>
                                    <th>IMPACT</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map(ev => (
                                    <tr key={ev.id}>
                                        <td style={{ paddingLeft: '2rem' }}><b>{ev.stock_symbol}</b></td>
                                        <td>{ev.title}</td>
                                        <td style={{ color: ev.impact_percent >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 800 }}>{ev.impact_percent}%</td>
                                        <td>{ev.is_executed ? '✅ EXECUTED' : '🕒 PENDING'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'leaderboard' && (
                <div className="card shadow-sm" style={{ padding: 0 }}>
                    <table className="data-table">
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ paddingLeft: '2rem' }}>RANK</th>
                                <th>USER</th>
                                <th>BALANCE</th>
                                <th>PORTFOLIO</th>
                                <th>TOTAL VALUE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((u, idx) => (
                                <tr key={idx}>
                                    <td style={{ paddingLeft: '2rem' }}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</td>
                                    <td><b>{u.username}</b></td>
                                    <td>${parseFloat(u.balance).toLocaleString()}</td>
                                    <td>${parseFloat(u.portfolio).toLocaleString()}</td>
                                    <td style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>${parseFloat(u.total_value).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'controls' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <ControlButton label="PAUSE MARKET" action="pause" Icon={Pause} color="#f59e0b" />
                    <ControlButton label="RESUME MARKET" action="resume" Icon={Play} color="var(--success)" />
                    <ControlButton label="CRASH MARKET" action="crash" Icon={ArrowDown} color="var(--danger)" />
                    <ControlButton label="SKYROCKET MARKET" action="skyrocket" Icon={ArrowUp} color="var(--success)" />
                    <ControlButton label="RESET APP" action="reset" Icon={RotateCcw} color="#64748b" />
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
