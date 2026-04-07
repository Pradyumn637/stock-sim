import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';

const P2PTrading = () => {
  const [listings, setListings] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newListing, setNewListing] = useState({ stock: '', quantity: '', price_per_share: '' });
  const { fetchUser } = useAuth();

  const loadData = async () => {
    try {
      const lRes = await api.get('p2p/');
      setListings(lRes.data);
    } catch (e) {
      console.error("P2P Load Error", e);
      setListings([]);
    }
    
    try {
      const pRes = await api.get('portfolio/');
      setPortfolio(Array.isArray(pRes.data) ? pRes.data : []);
    } catch (e) {
      console.error("Portfolio Load Error", e);
      setPortfolio([]);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('p2p/', newListing);
      setShowCreate(false);
      loadData();
      alert('Listing created!');
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to create listing');
    }
  };

  const handleBuy = async (id, maxQty) => {
    const qty = window.prompt(`How many shares? (Max: ${maxQty})`, maxQty);
    if (!qty) return;
    try {
      await api.post(`p2p/buy/${id}/`, { quantity: qty });
      loadData();
      fetchUser();
      alert('Purchase successful!');
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to buy listing');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`p2p/${id}/`);
      loadData();
      alert('Listing removed');
    } catch (e) {
      alert('Delete failed');
    }
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1>P2P Market</h1>
        <button onClick={() => setShowCreate(true)} style={{width: 150}}>Create Listing</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Seller</th>
            <th>Stock</th>
            <th>Quantity</th>
            <th>Price / Share</th>
            <th>Total Cost</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {listings.map(l => (
            <tr key={l.id}>
              <td>{l.seller_username}</td>
              <td>{l.stock_symbol}</td>
              <td>{l.quantity}</td>
              <td>${l.price_per_share}</td>
              <td><strong>${(l.quantity * l.price_per_share).toLocaleString()}</strong></td>
              <td>
                <div style={{display: 'flex', gap: 8}}>
                  <button onClick={() => handleBuy(l.id, l.quantity)} style={{width: 60, padding: 8, background: '#eee', color: 'black', border: '1px solid #ddd'}}>Buy</button>
                  <button onClick={() => handleDelete(l.id)} style={{width: 70, padding: 8, background: 'white', color: 'var(--danger)', border: '1px solid var(--danger)'}}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {listings.length === 0 && <tr><td colSpan="6">No listings available.</td></tr>}
        </tbody>
      </table>

      {showCreate && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>List Stock for P2P</h2>
            <form onSubmit={handleCreate}>
              <select value={newListing.stock} onChange={e => setNewListing({...newListing, stock: e.target.value})} required>
                <option value="">{portfolio.length === 0 ? '-- No stocks in portfolio --' : 'Select from Portfolio'}</option>
                {portfolio.map(p => (
                  <option key={p.id} value={p.stock} style={{color: '#000'}}>
                    {p.symbol} (Owned: {p.quantity})
                  </option>
                ))}
              </select>
              <input placeholder="Quantity" type="number" onChange={e => setNewListing({...newListing, quantity: e.target.value})} required />
              <input placeholder="Price Per Share" type="number" step="0.01" onChange={e => setNewListing({...newListing, price_per_share: e.target.value})} required />
              <div style={{display: 'flex', gap: 16}}>
                <button type="button" onClick={() => setShowCreate(false)} style={{background: '#ccc'}}>Cancel</button>
                <button type="submit">List Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default P2PTrading;
