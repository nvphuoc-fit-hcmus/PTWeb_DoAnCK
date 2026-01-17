import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { gameAPI } from "../../../services/api";
import { GameReview, GameInstructions } from "../../../components/game";
import "./Caro4Game.css";

const BOARD_SIZE = 10;
const WIN_CONDITION = 4;
const GAME_SLUG = "caro-4";

const Caro4Game = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [board, setBoard] = useState(
    Array(BOARD_SIZE)
      .fill()
      .map(() => Array(BOARD_SIZE).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [lastMove, setLastMove] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [gameId, setGameId] = useState(null);

  const initializeBoard = useCallback(() => {
    setBoard(
      Array(BOARD_SIZE)
        .fill()
        .map(() => Array(BOARD_SIZE).fill(null))
    );
    setCurrentPlayer("X");
    setWinner(null);
    setGameOver(false);
    setMoveCount(0);
    setLastMove(null);
  }, []);

  useEffect(() => {
    initializeBoard();
    fetchGameInfo();
  }, [initializeBoard]);

  const fetchGameInfo = async () => {
    try {
      const res = await gameAPI.getGame(GAME_SLUG);
      if (res.data.data) {
        setGameId(res.data.data.id);
      }
    } catch (error) {
      console.error("Error fetching game info:", error);
    }
  };

  const checkWinner = useCallback((board, row, col, player) => {
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    for (const [dx, dy] of directions) {
      let count = 1;

      let r = row + dx;
      let c = col + dy;
      while (
        r >= 0 &&
        r < BOARD_SIZE &&
        c >= 0 &&
        c < BOARD_SIZE &&
        board[r][c] === player
      ) {
        count++;
        r += dx;
        c += dy;
      }

      r = row - dx;
      c = col - dy;
      while (
        r >= 0 &&
        r < BOARD_SIZE &&
        c >= 0 &&
        c < BOARD_SIZE &&
        board[r][c] === player
      ) {
        count++;
        r -= dx;
        c -= dy;
      }

      if (count >= WIN_CONDITION) {
        return true;
      }
    }

    return false;
  }, []);

  const handleCellClick = useCallback(
    async (row, col) => {
      if (board[row][col] || gameOver || !user) return;

      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = currentPlayer;
      setBoard(newBoard);
      setLastMove([row, col]);
      setMoveCount((prev) => prev + 1);

      if (checkWinner(newBoard, row, col, currentPlayer)) {
        setWinner(currentPlayer);
        setGameOver(true);

        if (currentPlayer === "X" && user) {
          try {
            setIsSaving(true);
            await gameAPI.saveHighScore("caro-4", moveCount + 1);
          } catch (error) {
            console.error("Error saving score:", error);
          } finally {
            setIsSaving(false);
          }
        }
      } else {
        setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
      }
    },
    [board, currentPlayer, gameOver, user, checkWinner, moveCount]
  );

  const resetGame = () => {
    initializeBoard();
  };

  const getCellClassName = (row, col) => {
    let className = "caro-cell";
    if (board[row][col]) {
      className += ` ${board[row][col].toLowerCase()}`;
    }
    if (lastMove && lastMove[0] === row && lastMove[1] === col) {
      className += " last-move";
    }
    return className;
  };

  return (
    <div className="caro4-game">
      <div className="game-header">
        <h1>🔴 Caro 4 hàng</h1>
        <div className="game-info">
          <div className="current-player">
            Lượt của:{" "}
            <span className={`player ${currentPlayer.toLowerCase()}`}>
              {currentPlayer}
            </span>
          </div>
          <div className="move-count">Nước đi: {moveCount}</div>
        </div>
      </div>

      <GameInstructions gameSlug={GAME_SLUG} />

      {winner && (
        <div className="winner-message">
          🎉 Người chơi{" "}
          <span className={`player ${winner.toLowerCase()}`}>{winner}</span>{" "}
          thắng!
          {isSaving && <span className="saving"> Đang lưu điểm...</span>}
        </div>
      )}

      {gameOver && !winner && moveCount === BOARD_SIZE * BOARD_SIZE && (
        <div className="draw-message">🤝 Hòa! Bàn cờ đã đầy.</div>
      )}

      <div className="caro-board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="caro-row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={getCellClassName(rowIndex, colIndex)}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="game-controls">
        <button className="btn btn-secondary" onClick={resetGame}>
          🔄 Chơi lại
        </button>
        <button className="btn btn-primary" onClick={() => navigate("/games")}>
          🏠 Về trang chọn game
        </button>
      </div>

      {gameId && <GameReview gameId={gameId} gameName="Caro 4 hàng" />}
    </div>
  );
};

export default Caro4Game;
