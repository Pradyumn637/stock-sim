import React, { useEffect, useState } from 'react';
import api from '../api';

const AdminPanel = () => {
  const [stocks, setStocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showAddStock, setShowAddStock] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  
  // New Stock Form
  const [newStock, setNewStock] = useState({ symbol: '', name: '', price: '' });
  // New Event Form
  const [newEvent, setNewEvent] = useState({ title: '', description: '', stock_id: '', impact_percent: '', scheduled_time: '' });

  const loadAll = async () => {
    console.log("TOKEN:", localStorage.getItem("token"));
    try {
      const [sRes, uRes, eRes, lRes] = await Promise.all([
        api.get('stocks/'),
        api.get('admin/users/'),
        api.get('admin/events/'),
        api.get('admin/leaderboard/')
      ]);
      setStocks(sRes.data || []);
      setUsers(uRes.data || []);
      setEvents(eRes.data || []);
      setLeaderboard(lRes.data || []);
    } catch (e) {
      console.error("Error loading admin data:", e);
      setEvents([]);
      setLeaderboard([]);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateStock = async (e) => {
    e.preventDefault();
    await api.post('stocks/', newStock);
    setShowAddStock(false);
    loadAll();
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    await api.post('admin/events/', { ...newEvent, stock: newEvent.stock_id });
    setShowAddEvent(false);
    loadAll();
  };

  const editPrice = async (s) => {
    const newPrice = window.prompt(`New price for ${s.symbol}?`, s.price);
    if (newPrice && newPrice !== s.price) {
      await api.patch(`admin/stocks/${s.id}/`, { price: newPrice });
      loadAll();
    }
  };

  const toggleAdmin = async (userId) => {
    await api.post('admin/toggle-admin/', { user_id: userId });
    loadAll();
  };

  const deleteStock = async (id) => {
    if (!window.confirm("Delete this stock? All related data (portfolios, transactions, alerts) will be lost.")) return;
    await api.delete(`admin/stocks/${id}/`);
    loadAll();
  };

  const marketControl = async (action) => {
    if (['reset', 'crash', 'skyrocket'].includes(action)) {
      if (!window.confirm(`Are you sure you want to ${action} the market?`)) return;
    }
    try {
      await api.post(`admin/market/${action}/`);
      loadAll();
    } catch (e) {
      alert(`Error: ${e.response?.data?.error || e.message}`);
    }
  };

  if (!events) return <div style={{padding: 20}}>Loading...</div>;
  if (!leaderboard) return <div style={{padding: 20}}>Loading...</div>;

  return (
    <div style={{paddingBottom: 100}}>
      <h1>Admin Dashboard</h1>

      {/* Market Controls */}
      <section style={{marginBottom: 40}}>
        <h2>Market Control System</h2>
        <div style={{display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap'}}>
          <button onClick={() => marketControl('pause')} style={{background: '#f39c12', width: 140}}>Pause Market</button>
          <button onClick={() => marketControl('resume')} style={{background: '#27ae60', width: 140}}>Resume Market</button>
          <button onClick={() => marketControl('reset')} style={{background: '#34495e', width: 140}}>Reset Prices</button>
          <button onClick={() => marketControl('crash')} style={{background: '#e74c3c', width: 140}}>Market Crash</button>
          <button onClick={() => marketControl('skyrocket')} style={{background: '#9b59b6', width: 140}}>Skyrocket</button>
        </div>
      </section>

      {/* Leaderboard Table */}
      <section style={{marginBottom: 40}}>
        <h2>Global Leaderboard</h2>
        <table>
          <thead>
            <tr><th>Rank</th><th>Username</th><th>Balance</th><th>Portfolio Value</th><th>Profit</th></tr>
          </thead>
          <tbody>
            {leaderboard.map((u, i) => (
              <tr key={u.username}>
                <td>{i + 1}</td>
                <td>{u.username}</td>
                <td>${u.balance.toLocaleString()}</td>
                <td>${u.portfolio_value.toLocaleString()}</td>
                <td className={u.total_profit >= 0 ? 'price-up' : 'price-down'}>
                  ${u.total_profit.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Stocks Management */}
      <section style={{marginBottom: 40}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2>Stocks</h2>
          <button onClick={() => setShowAddStock(true)} style={{width: 150}}>Add Stock</button>
        </div>
        <table>
          <thead>
            <tr><th>Symbol</th><th>Name</th><th>Current Price</th><th>Action</th></tr>
          </thead>
          <tbody>
            {stocks.map(s => (
              <tr key={s.id}>
                <td>{s.symbol}</td>
                <td>{s.name}</td>
                <td>${s.price}</td>
                <td>
                  <div style={{display: 'flex', gap: 8}}>
                    <button onClick={() => editPrice(s)} style={{width: 60, padding: 4, background: 'white', color: 'var(--primary-color)', border: '1px solid var(--primary-color)'}}>Edit</button>
                    <button onClick={() => deleteStock(s.id)} style={{width: 70, padding: 4, background: 'white', color: 'var(--danger)', border: '1px solid var(--danger)'}}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Events Management */}
      <section style={{marginBottom: 40}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2>Scheduled Events</h2>
          <button onClick={() => setShowAddEvent(true)} style={{width: 150}}>Schedule Event</button>
        </div>
        <table>
          <thead>
            <tr><th>Title</th><th>Stock</th><th>Impact</th><th>Scheduled Time</th><th>Executed</th><th>Action</th></tr>
          </thead>
          <tbody>
            {events.map(ev => (
              <tr key={ev.id}>
                <td>{ev.title}</td>
                <td>{ev.stock_symbol}</td>
                <td className={ev.impact_percent >= 0 ? 'price-up' : 'price-down'}>{ev.impact_percent}%</td>
                <td>{new Date(ev.scheduled_time).toLocaleString()}</td>
                <td>{ev.is_executed ? '✅' : '⏳'}</td>
                <td>
                  <button onClick={() => deleteEvent(ev.id)} style={{width: 70, padding: 4, background: 'white', color: 'var(--danger)', border: '1px solid var(--danger)'}}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* User Management */}
      <section>
        <h2>Users</h2>
        <table>
          <thead>
            <tr><th>Username</th><th>Email</th><th>Balance</th><th>Admin</th><th>Action</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>${u.balance}</td>
                <td>{u.is_staff ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => toggleAdmin(u.id)} style={{width: 120, padding: 4, background: 'white', color: 'var(--primary-color)', border: '1px solid var(--primary-color)'}}>
                    {u.is_staff ? 'Demote' : 'Promote'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Modals */}
      {showAddStock && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add New Stock</h2>
            <form onSubmit={handleCreateStock}>
              <input placeholder="Symbol (e.g. AAPL)" onChange={e => setNewStock({...newStock, symbol: e.target.value})} required />
              <input placeholder="Company Name" onChange={e => setNewStock({...newStock, name: e.target.value})} required />
              <input placeholder="Starting Price" type="number" step="0.01" onChange={e => setNewStock({...newStock, price: e.target.value})} required />
              <div style={{display: 'flex', gap: 16}}>
                <button type="button" onClick={() => setShowAddStock(false)} style={{background: '#ccc'}}>Cancel</button>
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddEvent && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Schedule Market Event</h2>
            <form onSubmit={handleCreateEvent}>
              <input placeholder="Event Title" onChange={e => setNewEvent({...newEvent, title: e.target.value})} required />
              <textarea placeholder="Description" style={{width: '100%', marginBottom: 12, padding: 8}} onChange={e => setNewEvent({...newEvent, description: e.target.value})} required />
              <select onChange={e => setNewEvent({...newEvent, stock_id: e.target.value})} style={{width: '100%', padding: 10, marginBottom: 16}} required>
                <option value="">Target Stock</option>
                {stocks.map(s => <option key={s.id} value={s.id}>{s.symbol}</option>)}
              </select>
              <input placeholder="Impact % (e.g. 5 or -10)" type="number" onChange={e => setNewEvent({...newEvent, impact_percent: e.target.value})} required />
              <input type="datetime-local" onChange={e => setNewEvent({...newEvent, scheduled_time: e.target.value})} required />
              <div style={{display: 'flex', gap: 16}}>
                <button type="button" onClick={() => setShowAddEvent(false)} style={{background: '#ccc'}}>Cancel</button>
                <button type="submit">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
