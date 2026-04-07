import React, { useEffect, useState } from 'react';
import api from '../api';

const Watchlist = () => {
  const [data, setData] = useState([]);

  const load = () => api.get('watchlist/').then(res => setData(res.data));

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const remove = async (id) => {
    await api.post('watchlist/toggle/', { stock_id: id });
    load();
  };

  return (
    <div>
      <h1>My Watchlist</h1>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Current Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              <td>{item.stock_symbol}</td>
              <td>${item.stock_price}</td>
              <td>
                <button onClick={() => remove(item.stock)} style={{width: 80, padding: 8, background: 'white', color: 'var(--danger)', border: '1px solid var(--danger)'}}>Remove</button>
              </td>
            </tr>
          ))}
          {data.length === 0 && <tr><td colSpan="3">No stocks in watchlist.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default Watchlist;
