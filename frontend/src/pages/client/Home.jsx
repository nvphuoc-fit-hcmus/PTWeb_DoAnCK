import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '60px 20px',
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
        borderRadius: '16px',
        marginBottom: '40px',
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
          🎮 Board Game Platform
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          margin: '0 auto 30px',
        }}>
          Choi cac tro choi co dien tren giao dien LED matrix doc dao.
          Dieu khien chi voi 5 nut: Left, Right, Enter, Back, Hint!
        </p>
        
        {isAuthenticated ? (
          <div>
            <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
              Chao mung, <strong>{user?.display_name}</strong>! San sang choi chua?
            </p>
            <Link to="/games" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '14px 32px' }}>
              🎯 Chon Game
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <Link to="/login" className="btn btn-secondary" style={{ fontSize: '1.1rem', padding: '14px 32px' }}>
              Dang nhap
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '14px 32px' }}>
              Bat dau choi
            </Link>
          </div>
        )}
      </section>

      {/* Games Preview */}
      <section>
        <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>
          🎯 Cac tro choi co san
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {[
            { name: 'Caro 5', icon: '⭕', desc: 'Xep 5 quan lien tiep de thang' },
            { name: 'Caro 4', icon: '🔴', desc: 'Xep 4 quan - Nhanh va thu vi' },
            { name: 'Tic-Tac-Toe', icon: '❌', desc: 'Game co dien 3x3' },
            { name: 'Snake', icon: '🐍', desc: 'Ran san moi - Lon len!' },
            { name: 'Match-3', icon: '💎', desc: 'Ghep 3 vien giong nhau' },
            { name: 'Memory', icon: '🧠', desc: 'Lat the va nho vi tri' },
            { name: 'Free Draw', icon: '🎨', desc: 'Ve tu do tren LED matrix' },
          ].map((game) => (
            <div key={game.name} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{game.icon}</div>
              <h3 style={{ marginBottom: '8px' }}>{game.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{game.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Controls Info */}
      <section style={{ marginTop: '60px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '24px' }}>🕹️ Dieu khien</h2>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap',
        }}>
          {[
            { key: '←', label: 'Left', color: '#3b82f6' },
            { key: '→', label: 'Right', color: '#3b82f6' },
            { key: 'Enter', label: 'Select', color: '#22c55e' },
            { key: 'Esc', label: 'Back', color: '#ef4444' },
            { key: 'H', label: 'Hint', color: '#f59e0b' },
          ].map((btn) => (
            <div key={btn.key} style={{
              padding: '15px 25px',
              backgroundColor: 'var(--bg-secondary)',
              border: `2px solid ${btn.color}`,
              borderRadius: '12px',
              minWidth: '100px',
            }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: btn.color,
                marginBottom: '5px'
              }}>
                {btn.key}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {btn.label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
