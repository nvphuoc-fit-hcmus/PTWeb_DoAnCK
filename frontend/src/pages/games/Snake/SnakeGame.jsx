import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { gameAPI } from "../../../services/api";
import { GameReview, GameInstructions } from "../../../components/game";
import "./SnakeGame.css";

const DEFAULT_GRID_SIZE = 20;
const DEFAULT_GAME_SPEED = 200;
const GAME_SLUG = "snake";

const SnakeGame = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Config state - loaded from API
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [gameSpeed, setGameSpeed] = useState(DEFAULT_GAME_SPEED);
  const [configLoaded, setConfigLoaded] = useState(false);

  // Initial positions based on grid size
  const getInitialSnake = (size) => [{ x: Math.floor(size / 2), y: Math.floor(size / 2) }];
  const getInitialFood = (size) => ({ x: Math.floor(size * 0.75), y: Math.floor(size * 0.75) });

  const [snake, setSnake] = useState([]);
  const [direction, setDirection] = useState({ x: 0, y: -1 });
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [hasStarted, setHasStarted] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingGame, setIsLoadingGame] = useState(false);
  const [gameId, setGameId] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const gameLoopRef = useRef(null);
  const directionRef = useRef(direction);
  const gridSizeRef = useRef(gridSize);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    gridSizeRef.current = gridSize;
  }, [gridSize]);

  useEffect(() => {
    const initGame = async () => {
      try {
        const res = await gameAPI.getGame(GAME_SLUG);
        if (res.data.data) {
          const gameData = res.data.data;
          const gId = gameData.id;
          setGameId(gId);
          
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
          const speed = config?.initialSpeed || DEFAULT_GAME_SPEED;
          
          setGridSize(size);
          setGameSpeed(speed);
          setSnake(getInitialSnake(size));
          setFood(getInitialFood(size));
          setConfigLoaded(true);
          
          if (user) {
            await createNewSession(gId, size);
          }
        }
      } catch (error) {
        console.error("Error fetching game info:", error);
        // Fallback to defaults
        setSnake(getInitialSnake(DEFAULT_GRID_SIZE));
        setFood(getInitialFood(DEFAULT_GRID_SIZE));
        setConfigLoaded(true);
      }
    };
    initGame();
  }, [user]);

  const createNewSession = async (gId, size = gridSize) => {
    try {
      const sessionRes = await gameAPI.startGame(gId, { gridSize: size });
      const newSessionId =
        sessionRes.data.data.id || sessionRes.data.data.session_id;
      setSessionId(newSessionId);
    } catch (err) {
      console.error("Failed to start game session:", err);
    }
  };

  const generateFood = useCallback((currentSnake) => {
    const currentGridSize = gridSizeRef.current;
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * currentGridSize),
        y: Math.floor(Math.random() * currentGridSize),
      };
    } while (
      currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y,
      )
    );
    return newFood;
  }, []);

  const checkCollision = useCallback((head, snakeBody) => {
    return snakeBody.some(
      (segment) => segment.x === head.x && segment.y === head.y,
    );
  }, []);

  const gameLoop = useCallback(() => {
    if (!isPlaying || gameOver) return;

    const currentGridSize = gridSizeRef.current;

    setSnake((currentSnake) => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      head.x += directionRef.current.x;
      head.y += directionRef.current.y;

      if (head.x >= currentGridSize) head.x = 0;
      else if (head.x < 0) head.x = currentGridSize - 1;

      if (head.y >= currentGridSize) head.y = 0;
      else if (head.y < 0) head.y = currentGridSize - 1;

      if (checkCollision(head, newSnake)) {
        setGameOver(true);
        setIsPlaying(false);
        setHasStarted(false);
        return currentSnake;
      }

      newSnake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        setScore((prev) => prev + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [isPlaying, gameOver, food, checkCollision, generateFood]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(gameLoop, gameSpeed);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, gameOver, gameLoop, gameSpeed]);

  const handleKeyPress = useCallback(
    (e) => {
      if (!isPlaying && !gameOver && hasStarted) {
        setIsPlaying(true);
      }

      if (!isPlaying) return;

      const keyDirections = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 },
        s: { x: 0, y: 1 },
        a: { x: -1, y: 0 },
        d: { x: 1, y: 0 },
      };
      const newDirection = keyDirections[e.key];
      if (newDirection) {
        const currentDir = directionRef.current;
        if (
          newDirection.x !== -currentDir.x ||
          newDirection.y !== -currentDir.y
        ) {
          setDirection(newDirection);
        }
      }
    },
    [isPlaying, gameOver, hasStarted],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const handleStartNewGame = () => {
    setIsPlaying(true);
    setHasStarted(true);
    setGameOver(false);
    setScore(0);
    setSnake(getInitialSnake(gridSize));
    setDirection({ x: 0, y: -1 });
    setFood(getInitialFood(gridSize));

    if (user && gameId) createNewSession(gameId, gridSize);
  };

  const handleResumeGame = () => {
    setIsPlaying(true);
  };

  const resetGame = () => {
    setIsPlaying(false);
    setHasStarted(false);
    setGameOver(false);
    setScore(0);
    setSnake(getInitialSnake(gridSize));
    if (user && gameId) createNewSession(gameId, gridSize);
  };

  const handleSaveGame = async () => {
    if (!user || !sessionId || gameOver) {
      alert("Không thể lưu lúc này.");
      return;
    }
    try {
      setIsSaving(true);
      const gameState = { snake, food, direction, score };
      await gameAPI.saveGame(sessionId, JSON.stringify(gameState), score, 0);
      alert("💾 Đã lưu game thành công!");
    } catch (error) {
      console.error("Error saving game:", error);
      alert("Lỗi khi lưu game!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadGame = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập!");
      return;
    }
    try {
      setIsLoadingGame(true);
      const res = await gameAPI.getSavedGames();
      const savedGames = res.data.data || [];
      const mySavedGame = savedGames.find((g) => g.game_slug === GAME_SLUG);

      if (!mySavedGame) {
        alert("Không tìm thấy bản lưu nào!");
        return;
      }

      const loadRes = await gameAPI.loadGame(mySavedGame.id);
      const gameData = loadRes.data.data;

      if (!gameData || !gameData.state) {
        alert("Dữ liệu lỗi!");
        return;
      }

      let loadedState = gameData.state;
      if (typeof loadedState === "string") {
        try {
          loadedState = JSON.parse(loadedState);
        } catch (e) {}
      }

      if (loadedState.snake) setSnake(loadedState.snake);
      if (loadedState.food) setFood(loadedState.food);
      if (loadedState.direction) {
        setDirection(loadedState.direction);
        directionRef.current = loadedState.direction;
      }
      if (loadedState.score) setScore(loadedState.score);

      setSessionId(mySavedGame.id);
      setGameOver(false);
      setHasStarted(true);
      setIsPlaying(false);

      alert("📂 Đã tải game! Nhấn 'Tiếp tục' để chơi.");
    } catch (error) {
      console.error("Lỗi load game:", error);
      alert("Không thể tải game cũ.");
    } finally {
      setIsLoadingGame(false);
    }
  };

  useEffect(() => {
    if (gameOver && user && score > 0) {
      const saveScore = async () => {
        try {
          await gameAPI.saveHighScore(GAME_SLUG, score);
        } catch (error) {
          console.error("Error saving high score:", error);
        }
      };
      saveScore();
    }
  }, [gameOver, user, score]);

  const renderCell = (x, y) => {
    const isSnakeHead = snake[0] && snake[0].x === x && snake[0].y === y;
    const isSnakeBody = snake.slice(1).some((s) => s.x === x && s.y === y);
    const isFood = food.x === x && food.y === y;

    let cellClass = "snake-cell";
    if (isSnakeHead) cellClass += " snake-head";
    else if (isSnakeBody) cellClass += " snake-body";
    else if (isFood) cellClass += " food";

    return (
      <div key={`${x}-${y}`} className={cellClass}>
        {isFood && "🍎"}
        {isSnakeHead && "👁️"}
      </div>
    );
  };

  // Show loading while config is being fetched
  if (!configLoaded) {
    return (
      <div className="snake-game">
        <div className="game-header">
          <h1>🐍 Rắn săn mồi</h1>
        </div>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Đang tải cấu hình game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="snake-game">
      <div className="game-header">
        <h1>🐍 Rắn săn mồi</h1>
      </div>

      <div className="game-layout">
        <div className="left-panel">
          <div className="game-info-card">
            <div className="score">
              Điểm: <span className="score-value">{score}</span>
            </div>
            <div className="length">
              Độ dài: <span className="length-value">{snake.length}</span>
            </div>
          </div>

          <div className="game-controls">
            {!isPlaying && !gameOver ? (
              hasStarted ? (
                <button
                  className="btn-resume"
                  onClick={handleResumeGame}
                  style={{ backgroundColor: "#0984e3" }}
                >
                  ▶️ Tiếp tục
                </button>
              ) : (
                <button
                  className="btn-start"
                  onClick={handleStartNewGame}
                  style={{ backgroundColor: "#00b894" }}
                >
                  🎮 Bắt đầu
                </button>
              )
            ) : (
              <button
                className="btn-pause"
                onClick={() => setIsPlaying(false)}
                style={{ backgroundColor: "#fab1a0", color: "#2d3436" }}
              >
                ⏸️ Tạm dừng
              </button>
            )}

            <button
              className="btn-save"
              onClick={handleSaveGame}
              disabled={isSaving || gameOver || !user}
              style={{ backgroundColor: "#27ae60" }}
            >
              {isSaving ? "Đang lưu..." : "💾 Lưu Game"}
            </button>

            <button
              className="btn-load"
              onClick={handleLoadGame}
              disabled={isLoadingGame || !user}
              style={{ backgroundColor: "#e67e22" }}
            >
              {isLoadingGame ? "Đang tải..." : "📂 Tải ván cũ"}
            </button>

            <button
              className="btn-reset"
              onClick={resetGame}
              style={{ backgroundColor: "#636e72" }}
            >
              🔄 Chơi lại
            </button>
            <button
              className="btn-home"
              onClick={() => navigate("/games")}
              style={{ backgroundColor: "#0984e3" }}
            >
              🏠 Về trang chọn game
            </button>
          </div>

          {gameId && <GameReview gameId={gameId} gameName="Rắn săn mồi" />}
        </div>

        <div className="center-panel">
          {gameOver && <div className="game-over-message">💀 Game Over!</div>}

          {!isPlaying && !gameOver && hasStarted && (
            <div className="game-status-text">
              Đang tạm dừng - Nhấn "Tiếp tục" để chơi
            </div>
          )}

          <div className="snake-board" style={{ 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`
          }}>
            {Array(gridSize)
              .fill()
              .map((_, y) =>
                Array(gridSize)
                  .fill()
                  .map((_, x) => renderCell(x, y)),
              )}
          </div>
        </div>

        <div className="right-panel">
          <GameInstructions gameSlug={GAME_SLUG} />
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
