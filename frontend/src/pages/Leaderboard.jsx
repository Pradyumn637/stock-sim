import React, { useState, useEffect } from 'react';
import API from '../api';

const Leaderboard = () => {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await API.get('leaderboard/');
                setPlayers(res.data);
            } catch (err) { console.error(err); }
        };
        fetchLeaderboard();
        const poll = setInterval(fetchLeaderboard, 30000);
        return () => clearInterval(poll);
    }, []);

    return (
        <div className="leaderboard">
            <h1 style={{ marginBottom: '1.5rem' }}>Global Leaderboard</h1>
            <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>Top traders ranked by total portfolio value + wallet balance.</p>

            <div className="card" style={{ padding: '0' }}>
                <table className="data-table">
                    <thead>
                        <tr style={{ background: 'var(--bg-tertiary)' }}>
                            <th style={{ paddingLeft: '2rem' }}>RANK</th>
                            <th>USER</th>
                            <th>TOTAL VALUE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((p, idx) => (
                            <tr key={idx} style={{ background: idx === 0 ? 'rgba(56,189,248,0.1)' : 'transparent' }}>
                                <td style={{ paddingLeft: '2rem' }}>
                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                </td>
                                <td><b>{p.username}</b></td>
                                <td style={{ color: 'var(--accent-primary)', fontSize: '1.2rem', fontWeight: '800' }}>
                                    ${parseFloat(p.total_value).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;
