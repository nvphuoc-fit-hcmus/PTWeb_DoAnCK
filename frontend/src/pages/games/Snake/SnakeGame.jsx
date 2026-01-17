import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { gameAPI } from "../../../services/api";
import { GameReview, GameInstructions } from "../../../components/game";
import "./SnakeGame.css";

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_FOOD = { x: 15, y: 15 };
const GAME_SPEED = 150;
const GAME_SLUG = "snake";

const SnakeGame = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [gameId, setGameId] = useState(null);
  const gameLoopRef = useRef(null);
  const directionRef = useRef(direction);

  // Update direction ref when direction changes
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const fetchGameInfo = async () => {
    try {
      const response = await gameAPI.getGamesByName("snake");
      if (response && response.length > 0) {
        setGameId(response[0].id);
      }
    } catch (error) {
      console.error("Error fetching game info:", error);
    }
  };

  useEffect(() => {
    fetchGameInfo();
  }, []);

  // Generate random food position
  const generateFood = useCallback((currentSnake) => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      )
    );
    return newFood;
  }, []);

  // Check collision with walls or self
  const checkCollision = useCallback((head, snakeBody) => {
    // Wall collision
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      return true;
    }
    // Self collision
    return snakeBody.some(
      (segment) => segment.x === head.x && segment.y === head.y
    );
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!isPlaying || gameOver) return;

    setSnake((currentSnake) => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      // Move head
      head.x += directionRef.current.x;
      head.y += directionRef.current.y;

      // Check collision
      if (checkCollision(head, newSnake)) {
        setGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check if food eaten
      if (head.x === food.x && head.y === food.y) {
        setScore((prev) => prev + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [isPlaying, gameOver, food, checkCollision, generateFood]);

  // Start game loop
  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(gameLoop, GAME_SPEED);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isPlaying, gameOver, gameLoop]);

  // Handle keyboard input
  const handleKeyPress = useCallback(
    (e) => {
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
        // Prevent reverse direction
        const currentDir = directionRef.current;
        if (
          newDirection.x !== -currentDir.x ||
          newDirection.y !== -currentDir.y ||
          (newDirection.x === 0 && newDirection.y === 0)
        ) {
          setDirection(newDirection);
        }
      }
    },
    [isPlaying]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  // Start game
  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(INITIAL_FOOD);
  };

  // Reset game
  const resetGame = () => {
    setIsPlaying(false);
    setGameOver(false);
    setScore(0);
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(INITIAL_FOOD);
  };

  // Save score when game over
  useEffect(() => {
    if (gameOver && user && score > 0) {
      const saveScore = async () => {
        try {
          setIsSaving(true);
          await gameAPI.saveHighScore("snake", score);
        } catch (error) {
          console.error("Error saving score:", error);
        } finally {
          setIsSaving(false);
        }
      };
      saveScore();
    }
  }, [gameOver, user, score]);

  // Render grid cell
  const renderCell = (x, y) => {
    const isSnakeHead = snake[0] && snake[0].x === x && snake[0].y === y;
    const isSnakeBody = snake
      .slice(1)
      .some((segment) => segment.x === x && segment.y === y);
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

  return (
    <div className="snake-game">
      <GameInstructions gameSlug={GAME_SLUG} />

      <div className="game-header">
        <h1>🐍 Rắn săn mồi</h1>
        <div className="game-info">
          <div className="score">
            Điểm: <span className="score-value">{score}</span>
          </div>
          <div className="length">
            Độ dài: <span className="length-value">{snake.length}</span>
          </div>
        </div>
      </div>

      {gameOver && (
        <div className="game-over-message">
          💀 Game Over! Điểm cuối: {score}
          {isSaving && <span className="saving"> Đang lưu điểm...</span>}
        </div>
      )}

      <div className="snake-board">
        {Array(GRID_SIZE)
          .fill()
          .map((_, y) =>
            Array(GRID_SIZE)
              .fill()
              .map((_, x) => renderCell(x, y))
          )}
      </div>

      <div className="game-instructions">
        {!isPlaying && !gameOver && (
          <div className="start-message">
            🎮 Nhấn "Bắt đầu" để chơi! Sử dụng phím mũi tên hoặc WASD để di
            chuyển.
          </div>
        )}
        {isPlaying && (
          <div className="playing-message">
            🚀 Chơi nào! Ăn nhiều táo để tăng điểm!
          </div>
        )}
      </div>

      <div className="game-controls">
        {!isPlaying && !gameOver && (
          <button className="btn btn-primary" onClick={startGame}>
            🎮 Bắt đầu
          </button>
        )}
        {(isPlaying || gameOver) && (
          <button className="btn btn-secondary" onClick={resetGame}>
            🔄 Chơi lại
          </button>
        )}
        <button className="btn btn-primary" onClick={() => navigate("/games")}>
          🏠 Về trang chọn game
        </button>
      </div>

      {gameId && <GameReview gameId={gameId} gameName="Rắn săn mồi" />}
    </div>
  );
};

export default SnakeGame;
