import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatrixBoard, GameControls } from '../../../components/game';
import GameRating from '../../../components/game/GameRating';
import { useGameController } from '../../../hooks';
import { useAuth } from '../../../contexts/AuthContext';
import { gameAPI } from '../../../services/api';
import './FreeDrawGame.css';

// Default config
const DEFAULT_GRID_SIZE = 20; // 20x20
const DEFAULT_PALETTE_COLORS = [
  '#FFFFFF', // Trang
  '#FF0000', // Do
  '#FF9F43', // Cam
  '#FFE66D', // Vang
  '#00FF00', // Xanh la
  '#4ECDC4', // Xanh ngoc
  '#0000FF', // Xanh duong
  '#6C5CE7', // Tim
  '#FF6B9D', // Hong
  '#000000', // Den (xoa)
];
const GAME_SLUG = 'free-draw';

const FreeDrawGame = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Config state - loaded from API
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [paletteColors, setPaletteColors] = useState(DEFAULT_PALETTE_COLORS);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [gameId, setGameId] = useState(null);

  // Tao grid trong
  const createEmptyGrid = useCallback((size = gridSize) => {
    const grid = [];
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
        row.push('#000000');
      }
      grid.push(row);
    }
    return grid;
  }, [gridSize]);
  
  // State
  const [grid, setGrid] = useState([]);
  const [currentColor, setCurrentColor] = useState('#FFFFFF');
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(1);
  const [colorPaletteIndex, setColorPaletteIndex] = useState(0);
  const [showPalette, setShowPalette] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showRating, setShowRating] = useState(false);
  
  // Ref de theo doi trang thai drawing
  const isDrawingRef = useRef(false);
  const gridSizeRef = useRef(gridSize);

  useEffect(() => {
    gridSizeRef.current = gridSize;
  }, [gridSize]);

  // Load config from API
  useEffect(() => {
    const initGame = async () => {
      try {
        const res = await gameAPI.getGame(GAME_SLUG);
        if (res.data.data) {
          const gameData = res.data.data;
          setGameId(gameData.id);
          
          // Load config from API
          let config = gameData.config;
          if (typeof config === "string") {
            try {
              config = JSON.parse(config);
            } catch (e) {
              console.error("Error parsing config:", e);
              config = {};
            }
          }
          
          // Apply config
          const size = config?.boardSize?.rows || config?.boardSize || DEFAULT_GRID_SIZE;
          const colors = config?.colors || DEFAULT_PALETTE_COLORS;
          
          setGridSize(size);
          setPaletteColors(colors);
          setGrid(createEmptyGrid(size));
          setConfigLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching game info:", error);
        // Fallback to defaults
        setGrid(createEmptyGrid(DEFAULT_GRID_SIZE));
        setConfigLoaded(true);
      }
    };
    
    initGame();
  }, []);

  // Game controller
  const {
    cursor,
    pressedKeys,
    handleAction: baseHandleAction,
  } = useGameController({
    gridWidth: gridSize,
    gridHeight: gridSize,
    mode: 'grid', // Changed from 'linear' for 4-direction navigation
    enabled: !showPalette && configLoaded,
    onAction: (action) => {
      if (action === 'enter') {
        if (showPalette) {
          // Chon mau tu palette
          selectColorFromPalette();
        } else {
          // Toggle ve
          toggleDrawing();
        }
      } else if (action === 'back') {
        if (showPalette) {
          setShowPalette(false);
        } else if (isDrawing) {
          setIsDrawing(false);
          isDrawingRef.current = false;
        } else {
          handleBack();
        }
      } else if (action === 'hint') {
        // Mo palette chon mau
        setShowPalette(!showPalette);
      } else if (action === 'left' || action === 'right') {
        if (showPalette) {
          // Di chuyen trong palette
          navigatePalette(action);
        } else if (isDrawingRef.current) {
          // Ve khi di chuyen
          draw();
        }
      }
    },
  });

  // Custom handle action
  const handleAction = (action) => {
    baseHandleAction(action);
    
    // Ve khi di chuyen neu dang trong che do ve
    if ((action === 'left' || action === 'right') && isDrawingRef.current) {
      setTimeout(() => draw(), 50);
    }
  };

  // Toggle che do ve
  const toggleDrawing = useCallback(() => {
    const newIsDrawing = !isDrawing;
    setIsDrawing(newIsDrawing);
    isDrawingRef.current = newIsDrawing;
    
    if (newIsDrawing) {
      // Luu trang thai truoc khi ve
      saveToHistory();
      draw();
    }
  }, [isDrawing]);

  // Ve tai vi tri con tro
  const draw = useCallback(() => {
    const currentGridSize = gridSizeRef.current;
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) => [...row]);
      
      // Ve theo brush size
      for (let dy = 0; dy < brushSize; dy++) {
        for (let dx = 0; dx < brushSize; dx++) {
          const newY = cursor.y + dy;
          const newX = cursor.x + dx;
          if (newY < currentGridSize && newX < currentGridSize) {
            newGrid[newY][newX] = currentColor;
          }
        }
      }
      
      return newGrid;
    });
  }, [cursor, currentColor, brushSize]);

  // Di chuyen trong palette
  const navigatePalette = (direction) => {
    setColorPaletteIndex((prev) => {
      if (direction === 'left') {
        return prev > 0 ? prev - 1 : paletteColors.length - 1;
      } else {
        return prev < paletteColors.length - 1 ? prev + 1 : 0;
      }
    });
  };

  // Chon mau tu palette
  const selectColorFromPalette = () => {
    setCurrentColor(paletteColors[colorPaletteIndex]);
    setShowPalette(false);
  };

  // Luu vao history
  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(grid.map((row) => [...row]));
    // Giu toi da 50 buoc
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setGrid(history[historyIndex - 1].map((row) => [...row]));
    }
  };

  // Redo
  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      setGrid(history[historyIndex + 1].map((row) => [...row]));
    }
  };

  // Xoa tat ca
  const clearAll = () => {
    saveToHistory();
    setGrid(createEmptyGrid(gridSize));
  };

  // Thay doi brush size
  const changeBrushSize = () => {
    setBrushSize((prev) => (prev >= 3 ? 1 : prev + 1));
  };

  // Fill mau
  const fillColor = () => {
    saveToHistory();
    const currentGridSize = gridSizeRef.current;
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) => [...row]);
      const targetColor = newGrid[cursor.y][cursor.x];
      
      if (targetColor === currentColor) return prevGrid;
      
      // Flood fill algorithm
      const stack = [{ x: cursor.x, y: cursor.y }];
      const visited = new Set();
      
      while (stack.length > 0) {
        const { x, y } = stack.pop();
        const key = `${x},${y}`;
        
        if (visited.has(key)) continue;
        if (x < 0 || x >= currentGridSize || y < 0 || y >= currentGridSize) continue;
        if (newGrid[y][x] !== targetColor) continue;
        
        visited.add(key);
        newGrid[y][x] = currentColor;
        
        stack.push({ x: x + 1, y });
        stack.push({ x: x - 1, y });
        stack.push({ x, y: y + 1 });
        stack.push({ x, y: y - 1 });
      }
      
      return newGrid;
    });
  };

  // Quay lai
  const handleBack = () => {
    navigate('/games');
  };

  // Luu tranh
  const saveArt = async () => {
    if (!user) {
      alert('Ban can dang nhap de luu tranh');
      return;
    }
    
    try {
      console.log('Saving artwork...', { user, grid });
      const result = await gameAPI.saveGame({
        game_id: gameId || '00000000-0000-0000-0000-000000000000', // Free Draw ID (phai khop voi database)
        state: JSON.stringify({ grid }),
        score: 0,
        time_elapsed: 0,
      });
      console.log('Save successful:', result);
      alert('Da luu tranh thanh cong!');
    } catch (error) {
      console.error('Loi khi luu tranh:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Cannot save artwork: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  // Load saved artwork
  const loadArt = () => {
    try {
      const saved = localStorage.getItem('freedraw_saved');
      if (!saved) {
        alert('No saved artwork found!');
        return;
      }
      const saveData = JSON.parse(saved);
      setGrid(saveData.grid);
      if (saveData.currentColor) setCurrentColor(saveData.currentColor);
      alert(`✅ Artwork loaded! (Saved at: ${new Date(saveData.timestamp).toLocaleString()})`);
    } catch (error) {
      console.error('Load error:', error);
      alert('❌ Error loading artwork!');
    }
  };

  // Save to localStorage (manual)
  const handleSaveGame = () => {
    try {
      const saveData = {
        grid,
        currentColor,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('freedraw_saved', JSON.stringify(saveData));
      alert('✅ Artwork saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('❌ Error saving artwork!');
    }
  };

  // Submit rating
  const handleSubmitRating = async ({ rating, comment }) => {
    await gameAPI.submitReview(gameId || '00000000-0000-0000-0000-000000000000', rating, comment);
    alert('✅ Cảm ơn bạn đã đánh giá!');
  };

  // Show loading while config is being fetched
  if (!configLoaded) {
    return (
      <div className="freedraw-game">
        <div className="game-header">
          <h1>🎨 Free Draw</h1>
        </div>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Đang tải cấu hình game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="freedraw-game">
      <div className="game-header">
        <h1>🎨 Free Draw</h1>
        <div className="toolbar">
          <div className="tool-group">
            <span className="tool-label">Color:</span>
            <div
              className="color-preview"
              style={{ backgroundColor: currentColor }}
              onClick={() => setShowPalette(!showPalette)}
            />
          </div>
          
          <div className="tool-group">
            <span className="tool-label">Brush:</span>
            <button className="tool-btn" onClick={changeBrushSize}>
              {brushSize}x{brushSize}
            </button>
          </div>
          
          <div className="tool-group">
            <button className="tool-btn" onClick={fillColor} title="Fill">
              🪣
            </button>
            <button className="tool-btn" onClick={undo} disabled={historyIndex <= 0} title="Undo">
              ↩️
            </button>
            <button className="tool-btn" onClick={redo} disabled={historyIndex >= history.length - 1} title="Redo">
              ↪️
            </button>
            <button className="tool-btn" onClick={clearAll} title="Clear All">
              🗑️
            </button>
          </div>
          
          <div className="tool-group">
            <button className="tool-btn save-btn" onClick={handleSaveGame} title="Save">
              💾 Save
            </button>
            <button className="tool-btn load-btn" onClick={loadArt} title="Load">
              📂 Load
            </button>
            <button className="tool-btn guide-btn" onClick={() => setShowInstructions(true)} title="Guide">
              📖 Guide
            </button>
            <button className="tool-btn" onClick={() => setShowRating(true)} title="Rating" style={{ background: 'linear-gradient(135deg, #f39c12, #e74c3c)' }}>
              ⭐ Rate
            </button>
          </div>
        </div>
        
        <div className="status-bar">
          <span className={isDrawing ? 'status-active' : ''}>
            {isDrawing ? '🖌️ Drawing...' : '✋ Moving'}
          </span>
          <span>Position: ({cursor.x}, {cursor.y})</span>
        </div>
      </div>

      {/* Color Palette Modal */}
      {showPalette && (
        <div className="palette-overlay">
          <div className="palette-modal">
            <h3>Chon mau</h3>
            <div className="palette-colors">
              {paletteColors.map((color, index) => (
                <div
                  key={color}
                  className={`palette-color ${index === colorPaletteIndex ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setCurrentColor(color);
                    setShowPalette(false);
                  }}
                />
              ))}
            </div>
            <p className="palette-hint">← → de chon, Enter de xac nhan, Esc de huy</p>
          </div>
        </div>
      )}

      <div className="game-container">
        <div className="game-board freedraw-board">
          <MatrixBoard
            grid={grid}
            cursor={cursor}
            showCursor={true}
            cellSize={20}
            glowEffect={false}
            showConnectors={true}
            onCellClick={(x, y) => {
              // Cho phep click de ve theo brush size
              const currentGridSize = gridSizeRef.current;
              setGrid((prevGrid) => {
                const newGrid = prevGrid.map((row) => [...row]);
                // Ve theo brush size
                for (let dy = 0; dy < brushSize; dy++) {
                  for (let dx = 0; dx < brushSize; dx++) {
                    const newY = y + dy;
                    const newX = x + dx;
                    if (newY < currentGridSize && newX < currentGridSize) {
                      newGrid[newY][newX] = currentColor;
                    }
                  }
                }
                return newGrid;
              });
            }}
          />
        </div>

        <div className="game-sidebar">
          <GameControls
            pressedKeys={pressedKeys}
            onButtonPress={handleAction}
            showHint={true}
          />
        </div>
      </div>

      {/* Instructions Modal Overlay */}
      {showInstructions && (
        <div className="instructions-modal-overlay" onClick={() => setShowInstructions(false)}>
          <div className="instructions-modal" onClick={(e) => e.stopPropagation()}>
            <div className="instructions-modal-header">
              <h2>🎨 Free Draw Instructions</h2>
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
                <span className="instruction-icon">🖌️</span>
                <span className="instruction-text">Draw/Stop:</span>
                <kbd>Enter</kbd>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🎨</span>
                <span className="instruction-text">Color Palette:</span>
                <kbd>H</kbd>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🖥️</span>
                <span className="instruction-text">Click on cells to draw directly</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">🚪</span>
                <span className="instruction-text">Exit:</span>
                <kbd>Esc</kbd>
              </div>
              
              <div className="instruction-divider"></div>
              
              <div className="instruction-item">
                <span className="instruction-icon">💾</span>
                <span className="instruction-text">SAVE: Save your artwork to browser storage</span>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">📂</span>
                <span className="instruction-text">LOAD: Restore your last saved artwork</span>
              </div>
              
              <div className="instruction-note">
                <em>💡 Your artwork is saved locally - continue where you left off!</em>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRating && (
        <GameRating
          gameId={gameId || "00000000-0000-0000-0000-000000000000"}
          gameName="Free Draw"
          onSubmit={handleSubmitRating}
          onClose={() => setShowRating(false)}
        />
      )}
    </div>
  );
};

export default FreeDrawGame;
