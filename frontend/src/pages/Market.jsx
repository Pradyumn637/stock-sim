import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';

const Market = () => {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [tradeType, setTradeType] = useState('BUY'); // 'BUY' or 'SELL'
  const { fetchUser } = useAuth();

  const loadStocks = async () => {
    try {
      const res = await api.get('stocks/');
      setStocks(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadStocks();
    const timer = setInterval(loadStocks, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleTrade = async (e) => {
    e.preventDefault();
    try {
      const endpoint = tradeType === 'BUY' ? 'buy/' : 'sell/';
      await api.post(endpoint, { stock_id: selectedStock.id, quantity });
      setSelectedStock(null);
      setQuantity(1);
      fetchUser();
      alert('Trade successful!');
    } catch (e) {
      alert(e.response?.data?.error || 'Trade failed');
    }
  };

  return (
    <div>
      <h1>Market</h1>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th>Price</th>
            <th>Change %</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map(s => (
            <tr key={s.id}>
              <td>{s.symbol}</td>
              <td>{s.name}</td>
              <td style={{fontWeight: 500}}>${s.price}</td>
              <td className={s.change_percent >= 0 ? 'price-up' : 'price-down'}>
                {s.change_percent >= 0 ? '+' : ''}{s.change_percent}%
              </td>
              <td>
                <button onClick={() => { setSelectedStock(s); setTradeType('BUY'); }} style={{width: 60, marginRight: 8}}>Buy</button>
                <button onClick={() => { setSelectedStock(s); setTradeType('SELL'); }} style={{width: 60, backgroundColor: 'white', color: 'var(--text-color)', border: '1px solid var(--border-color)'}}>Sell</button>
                <button onClick={async () => { await api.post('watchlist/toggle/', { stock_id: s.id }); alert('Watchlist updated'); }} style={{width: 40, backgroundColor: 'white', padding: 0}} title="Watchlist">⭐</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedStock && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{tradeType === 'BUY' ? 'Buy' : 'Sell'} {selectedStock.symbol}</h2>
            <p>Current Price: <strong>${selectedStock.price}</strong></p>
            <form onSubmit={handleTrade}>
              <div style={{marginBottom: 16}}>
                <label>Quantity</label>
                <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" required />
                <p>Total {tradeType === 'BUY' ? 'Cost' : 'Earnings'}: ${(quantity * selectedStock.price).toLocaleString()}</p>
              </div>
              <div style={{display: 'flex', gap: 16}}>
                <button type="button" onClick={() => setSelectedStock(null)} style={{backgroundColor: '#ccc'}}>Cancel</button>
                <button type="submit">Confirm {tradeType === 'BUY' ? 'Buy' : 'Sell'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Market;
