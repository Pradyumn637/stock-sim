import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';

const Dashboard = () => {
  const { user, fetchUser } = useAuth();
  const [portfolio, setPortfolio] = useState([]);
  const [news, setNews] = useState([]);
  const [pVal, setPVal] = useState(0);

  const loadData = async () => {
    try {
      const [pRes, nRes] = await Promise.all([
        api.get('portfolio/'),
        api.get('news/')
      ]);
      setPortfolio(pRes.data);
      setNews(nRes.data);
      
      const total = pRes.data.reduce((acc, item) => acc + (item.quantity * item.current_price), 0);
      setPVal(total);
      fetchUser();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 5000); // Polling every 5s
    return () => clearInterval(timer);
  }, []);

  const totalWealth = parseFloat(user?.balance || 0) + pVal;
  const initialBalance = 100000;
  const pl = totalWealth - initialBalance;

  return (
    <div>
      <h1>Welcome, {user?.username}!</h1>
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="label">Available Balance</div>
          <div className="value">${parseFloat(user?.balance || 0).toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="label">Portfolio Value</div>
          <div className="value">${pVal.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="label">Net Profit/Loss</div>
          <div className={`value ${pl >= 0 ? 'price-up' : 'price-down'}`}>
            {pl >= 0 ? '+' : ''}${pl.toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px'}}>
        <div>
          <h3>My Portfolio</h3>
          <table>
            <thead>
              <tr><th>Symbol</th><th>Quantity</th><th>Price</th><th>Value</th></tr>
            </thead>
            <tbody>
              {portfolio.map(item => (
                <tr key={item.id}>
                  <td>{item.symbol}</td>
                  <td>{item.quantity}</td>
                  <td>${item.current_price}</td>
                  <td>${(item.quantity * item.current_price).toLocaleString()}</td>
                </tr>
              ))}
              {portfolio.length === 0 && <tr><td colSpan="4">No holdings.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="news-footer">
        <h3>Market News</h3>
        {news.map(n => (
          <div key={n.id} style={{marginBottom: 16, pb: 16, borderBottom: '1px solid #eee'}}>
            <strong>{n.title}</strong>
            <p style={{fontSize: 14, color: '#666', margin: '4px 0'}}>{n.content}</p>
            <small style={{color: '#999'}}>{new Date(n.timestamp).toLocaleString()}</small>
          </div>
        ))}
        {news.length === 0 && <p>No news yet.</p>}
      </div>
    </div>
  );
};

export default Dashboard;
