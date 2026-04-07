import React, { useEffect, useState } from 'react';
import api from '../api';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await api.get('portfolio/');
      setPortfolio(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <h1>My Portfolio</h1>
      {loading ? <p>Loading...</p> : (
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Avg Price</th>
              <th>Current Price</th>
              <th>Value</th>
              <th>P/L %</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map(item => {
              const profit = (item.current_price - item.avg_price) / item.avg_price * 100;
              return (
                <tr key={item.id}>
                  <td>{item.symbol}</td>
                  <td>{item.quantity}</td>
                  <td>${item.avg_price}</td>
                  <td>${item.current_price}</td>
                  <td>${(item.quantity * item.current_price).toLocaleString()}</td>
                  <td className={profit >= 0 ? 'price-up' : 'price-down'}>
                    {profit >= 0 ? '+' : ''}{profit.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
            {portfolio.length === 0 && <tr><td colSpan="6">No positions yet.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Portfolio;
