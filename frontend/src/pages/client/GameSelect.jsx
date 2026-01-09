import { useState, useEffect } from 'react';
import { gameAPI } from '../../services/api';

const GameSelect = () => {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await gameAPI.getGames();
        setGames(response.data.data || []);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (isLoading) {
    return <div className="loading">Dang tai danh sach game...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px', textAlign: 'center' }}>🎮 Chon tro choi</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
      }}>
        {games.map((game) => (
          <div 
            key={game.id} 
            className="card"
            style={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: '15px',
              textAlign: 'center' 
            }}>
              {getGameIcon(game.slug)}
            </div>
            <h3 style={{ marginBottom: '10px', textAlign: 'center' }}>{game.name}</h3>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '0.9rem',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              {game.description}
            </p>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              onClick={() => {
                // TODO: Navigate to game
                alert(`Game ${game.name} se duoc mo. Tinh nang dang phat trien!`);
              }}
            >
              Choi ngay
            </button>
          </div>
        ))}
      </div>

      {games.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Chua co game nao. Hay lien he admin de them game!
        </div>
      )}
    </div>
  );
};

// Helper function to get game icon
const getGameIcon = (slug) => {
  const icons = {
    'caro-5': '⭕',
    'caro-4': '🔴',
    'tic-tac-toe': '❌',
    'snake': '🐍',
    'match-3': '💎',
    'memory': '🧠',
    'free-draw': '🎨',
  };
  return icons[slug] || '🎮';
};

export default GameSelect;
