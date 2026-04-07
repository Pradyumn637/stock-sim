import React, { useEffect, useState } from 'react';
import api from '../api';

const Transactions = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get('transactions/').then(res => setData(res.data));
  }, []);

  return (
    <div>
      <h1>Transaction History</h1>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Symbol</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map(t => (
            <tr key={t.id}>
              <td>{new Date(t.timestamp).toLocaleString()}</td>
              <td style={{color: t.type.includes('BUY') ? 'var(--success)' : 'var(--danger)'}}>{t.type}</td>
              <td>{t.symbol}</td>
              <td>{t.quantity}</td>
              <td>${t.price}</td>
              <td>${(t.quantity * t.price).toLocaleString()}</td>
            </tr>
          ))}
          {data.length === 0 && <tr><td colSpan="6">No transactions found.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
