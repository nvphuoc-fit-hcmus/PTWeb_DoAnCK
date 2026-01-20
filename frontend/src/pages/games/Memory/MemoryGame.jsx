import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatrixBoard, GameControls } from '../../../components/game';
import { useGameController } from '../../../hooks';
import { useAuth } from '../../../contexts/AuthContext';
import { gameAPI } from '../../../services/api';
import './MemoryGame.css';

// Cau hinh game
const GRID_SIZE = 4; // 4x4 = 16 the = 8 cap
const CARD_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3',
  '#DDA0DD', '#FF9F43', '#6C5CE7', '#00CEC9',
];
const CARD_BACK = '#2d3436'; // Mau mat sau the
const CARD_MATCHED = 'transparent'; // Mau khi da ghep xong (bien mat)

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
        isDisappearing: false, // Trang thai dang bien mat
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
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Timer
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef(null);
  
  // Refs cho cac handler de tranh stale closure
  const handleCardFlipRef = useRef(null);
  const handleBackRef = useRef(null);
  const showHintRef = useRef(null);

  // Game controller
  const {
    cursor,
    pressedKeys,
    handleAction,
  } = useGameController({
    gridWidth: GRID_SIZE,
    gridHeight: GRID_SIZE,
    mode: 'grid', // Changed from 'linear' for 4-directional navigation
    enabled: !isChecking && !gameOver,
    onAction: (action) => {
      if (action === 'enter') {
        handleCardFlipRef.current?.();
      } else if (action === 'back') {
        handleBackRef.current?.();
      } else if (action === 'hint') {
        showHintRef.current?.();
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
        // Match! Bat dau hieu ung bien mat
        setTimeout(() => {
          // Buoc 1: Bat dau animation bien mat
          setCards((prev) =>
            prev.map((row, y) =>
              row.map((c, x) => {
                if (
                  (x === first.x && y === first.y) ||
                  (x === second.x && y === second.y)
                ) {
                  return { ...c, isDisappearing: true };
                }
                return c;
              })
            )
          );
          
          // Buoc 2: Sau khi animation xong, set isMatched
          setTimeout(() => {
            setCards((prev) =>
              prev.map((row, y) =>
                row.map((c, x) => {
                  if (
                    (x === first.x && y === first.y) ||
                    (x === second.x && y === second.y)
                  ) {
                    return { ...c, isMatched: true, isDisappearing: false };
                  }
                  return c;
                })
              )
            );
            setMatchedPairs((prev) => prev + 1);
            setScore((prev) => prev + 100);
            setFlippedCards([]);
            setIsChecking(false);
          }, 400); // Thoi gian animation
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

  // Goi y - chi hien 1 cap the giong nhau
  const showHint = () => {
    if (gameOver || isChecking) return;
    
    // Tim 1 cap the chua match
    const unmatchedCards = [];
    cards.forEach((row, y) => {
      row.forEach((card, x) => {
        if (!card.isMatched && !card.isDisappearing) {
          unmatchedCards.push({ x, y, color: card.color });
        }
      });
    });
    
    // Tim 1 cap co cung mau
    let hintPair = null;
    for (let i = 0; i < unmatchedCards.length; i++) {
      for (let j = i + 1; j < unmatchedCards.length; j++) {
        if (unmatchedCards[i].color === unmatchedCards[j].color) {
          hintPair = [unmatchedCards[i], unmatchedCards[j]];
          break;
        }
      }
      if (hintPair) break;
    }
    
    if (!hintPair) return;
    
    // Tru diem khi dung hint
    setScore((prev) => Math.max(0, prev - 30));
    
    // Chi lat 2 the cua cap duoc goi y
    setCards((prev) =>
      prev.map((row, y) =>
        row.map((c, x) => {
          if (
            (x === hintPair[0].x && y === hintPair[0].y) ||
            (x === hintPair[1].x && y === hintPair[1].y)
          ) {
            return { ...c, isFlipped: true, isHinted: true };
          }
          return c;
        })
      )
    );
    
    // Up lai sau 1.5 giay
    setTimeout(() => {
      setCards((prev) =>
        prev.map((row) =>
          row.map((c) => {
            if (c.isHinted) {
              return { ...c, isFlipped: false, isHinted: false };
            }
            return c;
          })
        )
      );
    }, 1500);
  };

  // Quay lai
  const handleBack = () => {
    navigate('/games');
  };
  
  // Gan refs de tranh stale closure
  useEffect(() => {
    handleCardFlipRef.current = handleCardFlip;
    handleBackRef.current = handleBack;
    showHintRef.current = showHint;
  }, [handleCardFlip, handleBack, showHint]);

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

  // Save game manually
  const handleSaveGame = () => {
    if (gameOver) return;
    try {
      const saveData = {
        cards,
        score,
        moves,
        matchedPairs,
        timeElapsed,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('memory_saved', JSON.stringify(saveData));
      alert('✅ Game saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('❌ Error saving game!');
    }
  };

  // Load saved game
  const handleLoadGame = () => {
    try {
      const saved = localStorage.getItem('memory_saved');
      if (!saved) {
        alert('No saved game found!');
        return;
      }
      
      const saveData = JSON.parse(saved);
      setCards(saveData.cards);
      setScore(saveData.score);
      setMoves(saveData.moves);
      setMatchedPairs(saveData.matchedPairs);
      setTimeElapsed(saveData.timeElapsed);
      setGameOver(false);
      setFlippedCards([]);
      setIsChecking(false);
      
      alert(`✅ Game loaded! (Saved at: ${new Date(saveData.timestamp).toLocaleString()})`);
    } catch (error) {
      console.error('Load error:', error);
      alert('❌ Error loading game!');
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
        return CARD_MATCHED; // transparent
      }
      if (card.isDisappearing) {
        return card.color; // Giu mau trong luc disappear de animation dep
      }
      if (card.isFlipped) {
        return card.color;
      }
      return CARD_BACK;
    })
  );
  
  // Tao grid class de apply animation
  const cellClassGrid = cards.map((row) =>
    row.map((card) => {
      const classes = [];
      if (card.isDisappearing) classes.push('disappearing');
      if (card.isMatched) classes.push('matched');
      if (card.isHinted) classes.push('hinted');
      return classes.join(' ');
    })
  );

  return (
    <div className="memory-game">
      <div className="game-header">
        <h1>🧠 Memory Game</h1>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Moves</span>
            <span className="stat-value">{moves}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Pairs</span>
            <span className="stat-value">{matchedPairs}/{CARD_COLORS.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Time</span>
            <span className="stat-value">{formatTime(timeElapsed)}</span>
          </div>
          
          {/* Save/Load buttons */}
          <div 
            className="stat stat-button" 
            onClick={handleSaveGame}
            style={{ 
              cursor: gameOver ? 'not-allowed' : 'pointer',
              opacity: gameOver ? 0.5 : 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
          >
            <span className="stat-label">💾 Save</span>
          </div>
          <div 
            className="stat stat-button" 
            onClick={handleLoadGame}
            style={{ 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: 'none',
            }}
          >
            <span className="stat-label">📂 Load</span>
          </div>
        </div>
      </div>

      <div className="game-container">
        <div className="game-board memory-board">
          <MatrixBoard
            grid={displayGrid}
            cellClassGrid={cellClassGrid}
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
          
          <div className="game-instructions-wrapper">
            <button 
              className="instructions-toggle"
              onClick={() => setShowInstructions(!showInstructions)}
            >
              <span>Instructions</span>
              <span className={`arrow ${showInstructions ? 'up' : 'down'}`}>
                {showInstructions ? '▲' : '▼'}
              </span>
            </button>
            
            {showInstructions && (
              <div className="game-instructions">
                <div className="instruction-item">
                  <span className="instruction-icon">🎮</span>
                  <span className="instruction-text">Move:</span>
                  <div className="key-group">
                    <kbd>↑</kbd>
                    <kbd>↓</kbd>
                    <kbd>←</kbd>
                    <kbd>→</kbd>
                  </div>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🎴</span>
                  <span className="instruction-text">Flip card:</span>
                  <kbd>Enter</kbd>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🎯</span>
                  <span className="instruction-text">Match 2 same colors</span>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">💡</span>
                  <span className="instruction-text">Hint (-30 pts):</span>
                  <kbd>H</kbd>
                </div>
                <div className="instruction-item">
                  <span className="instruction-icon">🚪</span>
                  <span className="instruction-text">Exit:</span>
                  <kbd>Esc</kbd>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <h2>🎉 Victory!</h2>
            <div className="final-stats">
              <div className="final-stat">
                <span>Score</span>
                <strong>{score}</strong>
              </div>
              <div className="final-stat">
                <span>Pairs Matched</span>
                <strong>{matchedPairs}/{CARD_COLORS.length}</strong>
              </div>
              <div className="final-stat">
                <span>Moves</span>
                <strong>{moves}</strong>
              </div>
              <div className="final-stat">
                <span>Time</span>
                <strong>{formatTime(timeElapsed)}</strong>
              </div>
            </div>
            <div className="game-over-buttons">
              <button className="btn btn-primary" onClick={restartGame}>
                Play Again
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/games')}>
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;
