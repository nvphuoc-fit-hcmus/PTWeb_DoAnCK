import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { gameAPI } from "../../../services/api";
import { GameReview, GameInstructions } from "../../../components/game";
import "./TicTacToeGame.css";

const BOARD_SIZE = 3;
const WIN_CONDITION = 3;
const GAME_SLUG = "tic-tac-toe";

const TicTacToeGame = () => {
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
  const [winningLine, setWinningLine] = useState(null);
  const [gameId, setGameId] = useState(null);

  const fetchGameInfo = async () => {
    try {
      const response = await gameAPI.getGames("tic-tac-toe");
      if (response && response.length > 0) {
        setGameId(response[0].id);
      }
    } catch (error) {
      console.error("Error fetching game info:", error);
    }
  };

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
    setWinningLine(null);
  }, []);

  useEffect(() => {
    initializeBoard();
    fetchGameInfo();
  }, [initializeBoard]);

  const checkWinner = useCallback((board, row, col, player) => {
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    for (const [dx, dy] of directions) {
      let count = 1;
      const line = [[row, col]];

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
        line.push([r, c]);
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
        line.unshift([r, c]);
        r -= dx;
        c -= dy;
      }

      if (count >= WIN_CONDITION) {
        setWinningLine(line);
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
            await gameAPI.saveHighScore("tic-tac-toe", moveCount + 1);
          } catch (error) {
            console.error("Error saving score:", error);
          } finally {
            setIsSaving(false);
          }
        }
      } else if (moveCount + 1 === BOARD_SIZE * BOARD_SIZE) {
        setGameOver(true);
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
    let className = "tictactoe-cell";
    if (board[row][col]) {
      className += ` ${board[row][col].toLowerCase()}`;
    }
    if (lastMove && lastMove[0] === row && lastMove[1] === col) {
      className += " last-move";
    }
    if (winningLine && winningLine.some(([r, c]) => r === row && c === col)) {
      className += " winning";
    }
    return className;
  };

  return (
    <div className="tictactoe-game">
      <GameInstructions gameSlug={GAME_SLUG} />

      <div className="game-header">
        <h1>❌ Tic-Tac-Toe</h1>
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

      {winner && (
        <div className="winner-message">
          🎉 Người chơi{" "}
          <span className={`player ${winner.toLowerCase()}`}>{winner}</span>{" "}
          thắng!
          {isSaving && <span className="saving"> Đang lưu điểm...</span>}
        </div>
      )}

      {gameOver && !winner && (
        <div className="draw-message">🤝 Hòa! Bàn cờ đã đầy.</div>
      )}

      <div className="tictactoe-board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="tictactoe-row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={getCellClassName(rowIndex, colIndex)}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell && (
                  <div className={`symbol ${cell.toLowerCase()}`}>{cell}</div>
                )}
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

      {gameId && <GameReview gameId={gameId} gameName="Tic-Tac-Toe" />}
    </div>
  );
};

export default TicTacToeGame;
