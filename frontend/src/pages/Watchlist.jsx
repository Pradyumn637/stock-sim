import React, { useState, useEffect } from 'react';
import API from '../api';
import { EyeOff, TrendingUp, TrendingDown, Star } from 'lucide-react';

const Watchlist = () => {
    const [watchlist, setWatchlist] = useState([]);

    const fetchData = async () => {
        try {
            const res = await API.get('watchlist/');
            setWatchlist(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchData();
        const poll = setInterval(fetchData, 10000);
        return () => clearInterval(poll);
    }, []);

    const remove = async (id) => {
        try {
            await API.delete(`watchlist/${id}/`);
            fetchData();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="watchlist-view">
            <h1 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Watchlist</h1>
            <div className="card shadow-sm" style={{ padding: '0' }}>
                <table className="data-table">
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th style={{ paddingLeft: '2rem' }}>SYMBOL</th>
                            <th>NAME</th>
                            <th>CURRENT PRICE</th>
                            <th style={{ textAlign: 'right', paddingRight: '2rem' }}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {watchlist.map(item => (
                            <tr key={item.id}>
                                <td style={{ paddingLeft: '2rem' }}>
                                    <span style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>{item.symbol}</span>
                                </td>
                                <td>{item.name}</td>
                                <td><b>${parseFloat(item.price).toFixed(2)}</b></td>
                                <td style={{ textAlign: 'right', paddingRight: '2rem' }}>
                                    <button onClick={() => remove(item.id)} className="btn" style={{ background: '#fee2e2', color: '#991b1b', padding: '0.5rem' }}>
                                        <EyeOff size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {watchlist.length === 0 && <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>You haven't added any stocks to your watchlist yet.</div>}
            </div>
        </div>
    );
};

export default Watchlist;
