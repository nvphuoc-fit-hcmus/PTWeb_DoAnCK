import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatrixBoard, GameControls } from '../../components/game';
import { useGameController } from '../../hooks';
import { useAuth } from '../../contexts/AuthContext';
import { gameAPI } from '../../services/api';
import './MemoryGame.css';

// Cau hinh game
const GRID_SIZE = 4; // 4x4 = 16 the = 8 cap
const CARD_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3',
  '#DDA0DD', '#FF9F43', '#6C5CE7', '#00CEC9',
];
const CARD_BACK = '#2d3436'; // Mau mat sau the
const CARD_MATCHED = '#1a1a1a'; // Mau khi da ghep xong

// Tao mang cac cap the va xao tron
const createCards = () => {
  // Tao 8 cap mau
  const cards = [...CARD_COLORS, ...CARD_COLORS];
  
  // Xao tron (Fisher-Yates shuffle)
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  
  // Chuyen thanh mang 2D
  const grid = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      row.push({
        color: cards[y * GRID_SIZE + x],
        isFlipped: false,
        isMatched: false,
      });
    }
    grid.push(row);
  }
  
  return grid;
};

const MemoryGame = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Game state
  const [cards, setCards] = useState(() => createCards());
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [flippedCards, setFlippedCards] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  // Timer
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef(null);

  // Game controller
  const {
    cursor,
    pressedKeys,
    handleAction,
  } = useGameController({
    gridWidth: GRID_SIZE,
    gridHeight: GRID_SIZE,
    mode: 'linear',
    enabled: !isChecking && !gameOver,
    onAction: (action) => {
      if (action === 'enter') {
        handleCardFlip();
      } else if (action === 'back') {
        handleBack();
      } else if (action === 'hint') {
        showHint();
      }
    },
  });

  // Timer effect
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Lat the
  const handleCardFlip = useCallback(() => {
    if (isChecking || gameOver) return;
    
    const card = cards[cursor.y][cursor.x];
    
    // Bo qua neu da lat hoac da match
    if (card.isFlipped || card.isMatched) return;
    
    // Lat the
    const newCards = cards.map((row, y) =>
      row.map((c, x) => {
        if (x === cursor.x && y === cursor.y) {
          return { ...c, isFlipped: true };
        }
        return c;
      })
    );
    setCards(newCards);
    
    const newFlipped = [...flippedCards, { x: cursor.x, y: cursor.y }];
    setFlippedCards(newFlipped);
    
    // Kiem tra neu da lat 2 the
    if (newFlipped.length === 2) {
      setIsChecking(true);
      setMoves((prev) => prev + 1);
      
      const [first, second] = newFlipped;
      const card1 = newCards[first.y][first.x];
      const card2 = newCards[second.y][second.x];
      
      if (card1.color === card2.color) {
        // Match!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((row, y) =>
              row.map((c, x) => {
                if (
                  (x === first.x && y === first.y) ||
                  (x === second.x && y === second.y)
                ) {
                  return { ...c, isMatched: true };
                }
                return c;
              })
            )
          );
          setMatchedPairs((prev) => prev + 1);
          setScore((prev) => prev + 100);
          setFlippedCards([]);
          setIsChecking(false);
        }, 500);
      } else {
        // Khong match, up lai
        setTimeout(() => {
          setCards((prev) =>
            prev.map((row, y) =>
              row.map((c, x) => {
                if (
                  (x === first.x && y === first.y) ||
                  (x === second.x && y === second.y)
                ) {
                  return { ...c, isFlipped: false };
                }
                return c;
              })
            )
          );
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  }, [cards, cursor, flippedCards, isChecking, gameOver]);

  // Goi y - lat tat ca the trong 2 giay
  const showHint = () => {
    if (gameOver) return;
    
    // Tru diem khi dung hint
    setScore((prev) => Math.max(0, prev - 50));
    
    // Lat tat ca the
    setCards((prev) =>
      prev.map((row) =>
        row.map((c) => ({ ...c, isFlipped: true }))
      )
    );
    
    // Up lai sau 2 giay
    setTimeout(() => {
      setCards((prev) =>
        prev.map((row) =>
          row.map((c) => ({ ...c, isFlipped: c.isMatched }))
        )
      );
    }, 2000);
  };

  // Quay lai
  const handleBack = () => {
    navigate('/games');
  };

  // Kiem tra thang
  useEffect(() => {
    if (matchedPairs === CARD_COLORS.length) {
      setGameOver(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Tinh diem bonus dua tren thoi gian va so luot
      const timeBonus = Math.max(0, 500 - timeElapsed * 2);
      const moveBonus = Math.max(0, 300 - moves * 10);
      setScore((prev) => prev + timeBonus + moveBonus);
      
      // Luu diem
      if (user) {
        saveScore();
      }
    }
  }, [matchedPairs]);

  // Luu diem
  const saveScore = async () => {
    try {
      await gameAPI.saveGame({
        game_id: '55555555-5555-5555-5555-555555555555', // Memory game ID
        state: JSON.stringify({ matchedPairs, moves }),
        score,
        time_elapsed: timeElapsed,
      });
    } catch (error) {
      console.error('Loi khi luu diem:', error);
    }
  };

  // Choi lai
  const restartGame = () => {
    setCards(createCards());
    setScore(0);
    setMoves(0);
    setMatchedPairs(0);
    setFlippedCards([]);
    setGameOver(false);
    setTimeElapsed(0);
    
    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
  };

  // Format thoi gian
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Tao grid de hien thi
  const displayGrid = cards.map((row) =>
    row.map((card) => {
      if (card.isMatched) {
        return CARD_MATCHED;
      }
      if (card.isFlipped) {
        return card.color;
      }
      return CARD_BACK;
    })
  );

  return (
    <div className="memory-game">
      <div className="game-header">
        <h1>🧠 Co Tri Nho</h1>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Diem</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Luot</span>
            <span className="stat-value">{moves}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Cap</span>
            <span className="stat-value">{matchedPairs}/{CARD_COLORS.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Thoi gian</span>
            <span className="stat-value">{formatTime(timeElapsed)}</span>
          </div>
        </div>
      </div>

      <div className="game-container">
        <div className="game-board memory-board">
          <MatrixBoard
            grid={displayGrid}
            cursor={cursor}
            showCursor={!gameOver}
            cellSize={60}
            glowEffect={true}
          />
        </div>

        <div className="game-sidebar">
          <GameControls
            pressedKeys={pressedKeys}
            onButtonPress={handleAction}
            showHint={true}
          />
          
          <div className="game-instructions">
            <h3>Huong dan</h3>
            <ul>
              <li>Di chuyen: ← →</li>
              <li>Lat the: Enter</li>
              <li>Tim 2 the cung mau</li>
              <li>Goi y (-50 diem): H</li>
              <li>Thoat: Esc</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <h2>🎉 Chien thang!</h2>
            <div className="final-stats">
              <div className="final-stat">
                <span>Diem so</span>
                <strong>{score}</strong>
              </div>
              <div className="final-stat">
                <span>So luot</span>
                <strong>{moves}</strong>
              </div>
              <div className="final-stat">
                <span>Thoi gian</span>
                <strong>{formatTime(timeElapsed)}</strong>
              </div>
            </div>
            <div className="game-over-buttons">
              <button className="btn btn-primary" onClick={restartGame}>
                Choi lai
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/games')}>
                Thoat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;
