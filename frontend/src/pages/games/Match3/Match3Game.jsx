import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatrixBoard, GameControls } from '../../../components/game';
import GameRating from '../../../components/game/GameRating';
import { useGameController } from '../../../hooks';
import { useAuth } from '../../../contexts/AuthContext';
import { gameAPI } from '../../../services/api';
import './Match3Game.css';

// Cau hinh game
const GRID_SIZE = 8; // 8x8
const COLORS = [
  '#E53935', // Red (bright red)
  '#1E88E5', // Blue (bright blue)
  '#FDD835', // Yellow (bright yellow)
  '#43A047', // Green (bright green)
  '#8E24AA', // Purple (bright purple)
  '#00ACC1', // Cyan (teal - instead of orange)
];
const TARGET_SCORE = 1000; // Diem muc tieu de thang

// Tao mau ngau nhien
const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

// Tao grid ban dau (dam bao khong co match san)
const createInitialGrid = () => {
  const grid = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      let color;
      do {
        color = getRandomColor();
      } while (
        // Kiem tra khong co 3 o cung mau lien tiep theo hang ngang
        (x >= 2 && row[x - 1] === color && row[x - 2] === color) ||
        // Kiem tra khong co 3 o cung mau lien tiep theo hang doc
        (y >= 2 && grid[y - 1][x] === color && grid[y - 2][x] === color)
      );
      row.push(color);
    }
    grid.push(row);
  }
  return grid;
};

// Kiem tra va tim cac o match
const findMatches = (grid) => {
  const matches = new Set();
  
  // Kiem tra hang ngang
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE - 2; x++) {
      const color = grid[y][x];
      if (color && color === grid[y][x + 1] && color === grid[y][x + 2]) {
        matches.add(`${x},${y}`);
        matches.add(`${x + 1},${y}`);
        matches.add(`${x + 2},${y}`);
        // Kiem tra them neu co 4 hoac 5 o
        if (x + 3 < GRID_SIZE && color === grid[y][x + 3]) {
          matches.add(`${x + 3},${y}`);
          if (x + 4 < GRID_SIZE && color === grid[y][x + 4]) {
            matches.add(`${x + 4},${y}`);
          }
        }
      }
    }
  }
  
  // Kiem tra hang doc
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE - 2; y++) {
      const color = grid[y][x];
      if (color && color === grid[y + 1][x] && color === grid[y + 2][x]) {
        matches.add(`${x},${y}`);
        matches.add(`${x},${y + 1}`);
        matches.add(`${x},${y + 2}`);
        // Kiem tra them neu co 4 hoac 5 o
        if (y + 3 < GRID_SIZE && color === grid[y + 3][x]) {
          matches.add(`${x},${y + 3}`);
          if (y + 4 < GRID_SIZE && color === grid[y + 4][x]) {
            matches.add(`${x},${y + 4}`);
          }
        }
      }
    }
  }
  
  return Array.from(matches).map((pos) => {
    const [x, y] = pos.split(',').map(Number);
    return { x, y };
  });
};

// Xoa cac o match va cho rot xuong
const removeMatchesAndDrop = (grid, matches) => {
  const newGrid = grid.map((row) => [...row]);
  
  // Danh dau cac o can xoa
  matches.forEach(({ x, y }) => {
    newGrid[y][x] = null;
  });
  
  // Cho cac o rot xuong
  for (let x = 0; x < GRID_SIZE; x++) {
    let writePos = GRID_SIZE - 1;
    for (let y = GRID_SIZE - 1; y >= 0; y--) {
      if (newGrid[y][x] !== null) {
        if (y !== writePos) {
          newGrid[writePos][x] = newGrid[y][x];
          newGrid[y][x] = null;
        }
        writePos--;
      }
    }
    // Dien mau moi vao cac o trong o tren
    for (let y = writePos; y >= 0; y--) {
      newGrid[y][x] = getRandomColor();
    }
  }
  
  return newGrid;
};

// Hoan doi 2 o
const swapCells = (grid, pos1, pos2) => {
  const newGrid = grid.map((row) => [...row]);
  const temp = newGrid[pos1.y][pos1.x];
  newGrid[pos1.y][pos1.x] = newGrid[pos2.y][pos2.x];
  newGrid[pos2.y][pos2.x] = temp;
  return newGrid;
};

// Kiem tra 2 o co ke nhau khong
const areAdjacent = (pos1, pos2) => {
  const dx = Math.abs(pos1.x - pos2.x);
  const dy = Math.abs(pos1.y - pos2.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
};

// Tim goi y (mot cap o co the hoan doi de tao match)
const findHint = (grid) => {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      // Thu hoan doi voi o ben phai
      if (x < GRID_SIZE - 1) {
        const testGrid = swapCells(grid, { x, y }, { x: x + 1, y });
        if (findMatches(testGrid).length > 0) {
          return [{ x, y }, { x: x + 1, y }];
        }
      }
      // Thu hoan doi voi o ben duoi
      if (y < GRID_SIZE - 1) {
        const testGrid = swapCells(grid, { x, y }, { x, y: y + 1 });
        if (findMatches(testGrid).length > 0) {
          return [{ x, y }, { x, y: y + 1 }];
        }
      }
    }
  }
  return null;
};

const Match3Game = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Game state
  const [grid, setGrid] = useState(() => createInitialGrid());
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(30);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [hint, setHint] = useState(null);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showRating, setShowRating] = useState(false);
  
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
    mode: 'grid', // Changed from 'linear' to support Up/Down navigation
    enabled: !isAnimating && !gameOver,
    onAction: (action) => {
      if (action === 'enter') {
        handleCellSelect();
      } else if (action === 'back') {
        handleBack();
      } else if (action === 'hint') {
        showHintHandler();
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

  // Xu ly chon o
  const handleCellSelect = useCallback(() => {
    if (isAnimating || gameOver) return;
    
    setHint(null);
    
    if (selectedCell === null) {
      // Chon o dau tien
      setSelectedCell({ x: cursor.x, y: cursor.y });
    } else {
      // Chon o thu hai
      const newPos = { x: cursor.x, y: cursor.y };
      
      if (selectedCell.x === newPos.x && selectedCell.y === newPos.y) {
        // Bo chon neu click vao cung o
        setSelectedCell(null);
        return;
      }
      
      if (areAdjacent(selectedCell, newPos)) {
        // Hoan doi neu 2 o ke nhau
        performSwap(selectedCell, newPos);
      } else {
        // Chon o moi neu khong ke nhau
        setSelectedCell(newPos);
      }
    }
  }, [cursor, selectedCell, isAnimating, gameOver]);

  // Thuc hien hoan doi
  const performSwap = async (pos1, pos2) => {
    setIsAnimating(true);
    
    // Hoan doi
    let newGrid = swapCells(grid, pos1, pos2);
    setGrid(newGrid);
    
    // Kiem tra match
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    let matches = findMatches(newGrid);
    
    if (matches.length === 0) {
      // Khong co match, hoan doi lai
      newGrid = swapCells(newGrid, pos1, pos2);
      setGrid(newGrid);
      setSelectedCell(null);
      setIsAnimating(false);
      return;
    }
    
    // Giam so luot di
    setMoves((prev) => prev - 1);
    setSelectedCell(null);
    
    // Xu ly combo
    let comboCount = 0;
    
    while (matches.length > 0) {
      comboCount++;
      
      // Tinh diem
      const matchScore = matches.length * 10 * comboCount;
      setScore((prev) => prev + matchScore);
      
      // Hien thi combo
      if (comboCount > 1) {
        setCombo(comboCount);
        setShowCombo(true);
        setTimeout(() => setShowCombo(false), 1000);
      }
      
      // Xoa matches va cho rot
      await new Promise((resolve) => setTimeout(resolve, 300));
      newGrid = removeMatchesAndDrop(newGrid, matches);
      setGrid(newGrid);
      
      // Kiem tra tiep
      await new Promise((resolve) => setTimeout(resolve, 300));
      matches = findMatches(newGrid);
    }
    
    setIsAnimating(false);
    setCombo(0);
  };

  // Hien thi goi y
  const showHintHandler = () => {
    if (hint) {
      setHint(null);
      return;
    }
    
    const hintPair = findHint(grid);
    if (hintPair) {
      setHint(hintPair);
      // Tu dong an sau 3 giay
      setTimeout(() => setHint(null), 3000);
    }
  };

  // Quay lai
  const handleBack = () => {
    if (selectedCell) {
      setSelectedCell(null);
    } else {
      navigate('/games');
    }
  };

  // Kiem tra game over hoac win
  useEffect(() => {
    if (score >= TARGET_SCORE && !isAnimating) {
      // THANG!
      setGameOver(true);
      setIsWin(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Luu diem
      if (user) {
        saveScore();
      }
    } else if (moves <= 0 && !isAnimating) {
      // HET LUOT
      setGameOver(true);
      setIsWin(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Luu diem
      if (user) {
        saveScore();
      }
    }
  }, [moves, score, isAnimating]);

  // Luu diem
  const saveScore = async () => {
    try {
      await gameAPI.saveGame({
        game_id: '66666666-6666-6666-6666-666666666666', // Match-3 game ID
        state: JSON.stringify({ grid, score }),
        score,
        time_elapsed: timeElapsed,
      });
    } catch (error) {
      console.error('Loi khi luu diem:', error);
    }
  };

  // Save game manually
  const handleSaveGame = () => {
    try {
      const saveData = {
        grid,
        score,
        moves,
        timeElapsed,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('match3_saved', JSON.stringify(saveData));
      alert('✅ Game saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('❌ Error saving game!');
    }
  };

  // Load saved game
  const handleLoadGame = () => {
    try {
      const saved = localStorage.getItem('match3_saved');
      if (!saved) {
        alert('No saved game found!');
        return;
      }
      
      const saveData = JSON.parse(saved);
      setGrid(saveData.grid);
      setScore(saveData.score);
      setMoves(saveData.moves);
      setTimeElapsed(saveData.timeElapsed);
      setGameOver(false);
      setIsWin(false);
      setSelectedCell(null);
      setHint(null);
      
      alert(`✅ Game loaded! (Saved at: ${new Date(saveData.timestamp).toLocaleString()})`);
    } catch (error) {
      console.error('Load error:', error);
      alert('❌ Error loading game!');
    }
  };

  // Submit rating
  const handleSubmitRating = async ({ rating, comment }) => {
    try {
      await gameAPI.submitReview('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', rating, comment);
      alert('✅ Thank you for your rating!');
    } catch (error) {
      console.error('Rating error:', error);
      throw error;
    }
  };

  // Choi lai
  const restartGame = () => {
    setGrid(createInitialGrid());
    setScore(0);
    setMoves(30);
    setSelectedCell(null);
    setGameOver(false);
    setIsWin(false);
    setTimeElapsed(0);
    setHint(null);
    setCombo(0);
    
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

  // Tao grid de hien thi (them hieu ung cho selected, hint)
  const displayGrid = grid.map((row, y) =>
    row.map((color, x) => {
      // Kiem tra o duoc chon
      if (selectedCell && selectedCell.x === x && selectedCell.y === y) {
        return color; // Se duoc xu ly boi CSS class
      }
      return color;
    })
  );

  return (
    <div className="match3-game">
      <div className="game-header">
        <h1>🍬 Match-3</h1>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score}/{TARGET_SCORE}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Moves</span>
            <span className="stat-value">{moves}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Time</span>
            <span className="stat-value">{formatTime(timeElapsed)}</span>
          </div>
          
          {/* Save/Load as stat boxes */}
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
          {/* Instructions button */}
          <div 
            className="stat stat-button" 
            onClick={() => setShowInstructions(true)}
            style={{ 
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
            }}
          >
            <span className="stat-label">📖 Guide</span>
          </div>
        </div>
      </div>

      {/* Instructions Modal Overlay */}
      {showInstructions && (
        <div className="instructions-modal-overlay" onClick={() => setShowInstructions(false)}>
          <div className="instructions-modal" onClick={(e) => e.stopPropagation()}>
            <div className="instructions-modal-header">
              <h2>🎮 Match-3 Instructions</h2>
              <button className="modal-close" onClick={() => setShowInstructions(false)}>✕</button>
            </div>
            <div className="instructions-modal-content">
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
                <span className="instruction-icon">✅</span>
                <span className="instruction-text">Select:</span>
                <kbd>Enter</kbd>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🔄</span>
                <span className="instruction-text">Swap 2 adjacent cells</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">⭐</span>
                <span className="instruction-text">Match 3+ same colors</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">💡</span>
                <span className="instruction-text">Hint:</span>
                <kbd>H</kbd>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">↩️</span>
                <span className="instruction-text">Undo:</span>
                <kbd>Esc</kbd>
              </div>
              
              <div className="instruction-divider"></div>
              
              <div className="instruction-item">
                <span className="instruction-icon">💾</span>
                <span className="instruction-text">SAVE: Save current state (grid, score, moves, time) to database</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">📂</span>
                <span className="instruction-text">LOAD: Restore your last saved game</span>
              </div>
              
              <div className="instruction-note">
                <em>💡 Save data is synced with your account - continue on any device!</em>
              </div>
            </div>
          </div>
        </div>
      )}
      {showCombo && combo > 1 && (
        <div className="combo-display">
          COMBO x{combo}!
        </div>
      )}

      <div className="game-container">
        <div className="game-board">
          <MatrixBoard
            grid={displayGrid}
            cursor={cursor}
            showCursor={!gameOver}
            cellSize={50}
            glowEffect={true}
            onCellClick={(x, y) => {
              // Cho phep click de debug
              if (!isAnimating && !gameOver) {
                handleAction('enter');
              }
            }}
          />
          
          {/* Hien thi selected cell overlay */}
          {selectedCell && (
            <div
              className="selected-overlay"
              style={{
                left: `${16 + selectedCell.x * (50 + 6) - 3}px`,
                top: `${16 + selectedCell.y * (50 + 6) - 3}px`,
                width: '56px',
                height: '56px',
              }}
            />
          )}
          
          {/* Hien thi hint overlay */}
          {hint && hint.map((pos, i) => (
            <div
              key={i}
              className="hint-overlay"
              style={{
                left: `${16 + pos.x * (50 + 6) - 3}px`,
                top: `${16 + pos.y * (50 + 6) - 3}px`,
                width: '56px',
                height: '56px',
              }}
            />
          ))}
        </div>

        <div className="game-sidebar">
          <GameControls
            pressedKeys={pressedKeys}
            onButtonPress={handleAction}
            showHint={true}
          />
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-modal">
            <h2>{isWin ? '🎉 Victory!' : '😢 Game Over!'}</h2>
            <div className="final-stats">
              <div className="final-stat">
                <span>Score</span>
                <strong>{score}</strong>
              </div>
              <div className="final-stat">
                <span>Moves Left</span>
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
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowRating(true)}
                style={{ background: '#FFD700', color: '#000' }}
              >
                ⭐ Rate Game
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/games')}>
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRating && (
        <GameRating
          gameId="eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"
          gameName="Match-3"
          onSubmit={handleSubmitRating}
          onClose={() => setShowRating(false)}
        />
      )}
    </div>
  );
};

export default Match3Game;
