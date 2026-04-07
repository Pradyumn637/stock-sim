import React, { useEffect, useState } from 'react';
import api from '../api';

const Alerts = () => {
  const [stocks, setStocks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stockId, setStockId] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [condition, setCondition] = useState('ABOVE');

  const loadAlerts = () => api.get('alerts/').then(res => setAlerts(res.data));
  const loadStocks = () => api.get('stocks/').then(res => setStocks(res.data));

  useEffect(() => {
    loadAlerts();
    loadStocks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('alerts/', { stock_id: stockId, target_price: targetPrice, condition: condition });
      setStockId('');
      setTargetPrice('');
      setCondition('ABOVE');
      loadAlerts();
    } catch (e) {
      alert('Failed to set alert: ' + (e.response?.data?.error || e.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`alerts/${id}/`);
      loadAlerts();
    } catch (e) {
      alert('Delete failed');
    }
  };

  return (
    <div>
      <h1>Price Alerts</h1>

      <div className="stat-card" style={{ maxWidth: 400, marginBottom: 32 }}>
        <h3>Create New Alert</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>Stock</label>
            <select value={stockId} onChange={e => setStockId(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ddd' }} required>
              <option value="">Select Stock</option>
              {stocks.map(s => <option key={s.id} value={s.id}>{s.symbol} (${s.price})</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Condition</label>
            <select value={condition} onChange={e => setCondition(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 4, border: '1px solid #ddd' }} required>
              <option value="ABOVE">Price Above</option>
              <option value="BELOW">Price Below</option>
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Target Price (Optional)</label>
            <input value={targetPrice} onChange={e => setTargetPrice(e.target.value)} type="number" step="0.01" placeholder="Empty = any change" />
          </div>
          <button type="submit">Set Alert</button>
        </form>
      </div>

      <h2>Existing Alerts</h2>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Condition</th>
            <th>Target Price</th>
            <th>Status</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map(a => (
            <tr key={a.id}>
              <td>{a.stock_symbol}</td>
              <td>{a.condition}</td>
              <td>{a.target_price ? `$${a.target_price}` : 'Any change'}</td>
              <td>{a.is_triggered ? <span style={{ color: 'var(--success)' }}>Triggered</span> : 'Pending'}</td>
              <td>{new Date(a.created_at).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleDelete(a.id)} style={{width: 70, padding: 4, background: 'white', color: 'var(--danger)', border: '1px solid var(--danger)'}}>Delete</button>
              </td>
            </tr>
          ))}
          {alerts.length === 0 && <tr><td colSpan="6">No alerts set.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default Alerts;
