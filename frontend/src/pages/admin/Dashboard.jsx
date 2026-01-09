import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getStats();
        setStats(response.data.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="loading">Dang tai thong ke...</div>;
  }

  const statCards = [
    { label: 'Tong nguoi dung', value: stats?.total_users || 0, icon: '👥', color: '#3b82f6' },
    { label: 'Nguoi dung active', value: stats?.active_users || 0, icon: '✅', color: '#22c55e' },
    { label: 'Tong so game', value: stats?.total_games || 0, icon: '🎮', color: '#8b5cf6' },
    { label: 'Tong luot choi', value: stats?.total_sessions || 0, icon: '📊', color: '#f59e0b' },
    { label: 'Luot choi 24h', value: stats?.sessions_last_24h || 0, icon: '⏰', color: '#ef4444' },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>📊 Dashboard</h1>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px',
      }}>
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="card"
            style={{ borderLeft: `4px solid ${stat.color}` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '8px' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                  {stat.value}
                </div>
              </div>
              <div style={{ fontSize: '2.5rem' }}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>⚡ Hanh dong nhanh</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <a href="/admin/users" className="btn btn-secondary">
            👥 Quan ly Users
          </a>
          <a href="/admin/games" className="btn btn-secondary">
            🎮 Quan ly Games
          </a>
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            🔄 Lam moi
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
