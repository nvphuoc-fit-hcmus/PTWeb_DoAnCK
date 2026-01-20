import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { gameAPI } from "../../../services/api";
import { GameReview, GameInstructions } from "../../../components/game";
import "./Caro5Game.css";

const BOARD_SIZE = 15;
const WIN_CONDITION = 5;
const GAME_SLUG = "caro-5";

const Caro5Game = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [board, setBoard] = useState(
    Array(BOARD_SIZE)
      .fill()
      .map(() => Array(BOARD_SIZE).fill(null)),
  );
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [lastMove, setLastMove] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingGame, setIsLoadingGame] = useState(false);
  const [gameId, setGameId] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const initializeBoard = useCallback(() => {
    setBoard(
      Array(BOARD_SIZE)
        .fill()
        .map(() => Array(BOARD_SIZE).fill(null)),
    );
    setCurrentPlayer("X");
    setWinner(null);
    setGameOver(false);
    setMoveCount(0);
    setLastMove(null);
  }, []);

  useEffect(() => {
    const initGame = async () => {
      initializeBoard();
      try {
        const res = await gameAPI.getGame(GAME_SLUG);
        if (res.data.data) {
          const gId = res.data.data.id;
          setGameId(gId);
          if (user) {
            await createNewSession(gId);
          }
        }
      } catch (error) {
        console.error("Error fetching game info:", error);
      }
    };

    initGame();
  }, [initializeBoard, user]);

  const createNewSession = async (gId) => {
    try {
      const sessionRes = await gameAPI.startGame(gId, {
        boardSize: BOARD_SIZE,
      });
      const newSessionId =
        sessionRes.data.data.id || sessionRes.data.data.session_id;
      setSessionId(newSessionId);
    } catch (err) {
      console.error("Failed to start game session:", err);
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
      if (count >= WIN_CONDITION) return true;
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
            await gameAPI.saveHighScore(GAME_SLUG, moveCount + 1);
          } catch (error) {
            console.error("Error saving high score:", error);
          }
        }
      } else {
        setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
      }
    },
    [board, currentPlayer, gameOver, user, checkWinner, moveCount],
  );

  const handleSaveGame = async () => {
    if (!user || !sessionId || gameOver) {
      alert(
        "Không thể lưu game lúc này (Chưa đăng nhập hoặc game đã kết thúc).",
      );
      return;
    }

    try {
      setIsSaving(true);
      const gameState = JSON.stringify(board);
      await gameAPI.saveGame(sessionId, gameState, moveCount, 0);
      alert("💾 Đã lưu game thành công!");
    } catch (error) {
      console.error("Error saving game:", error);
      alert("Lỗi khi lưu game!");
    } finally {
      setIsSaving(false);
    }
  };

  // --- MỚI: LOAD GAME (TIẾP TỤC GAME) ---
  const handleLoadGame = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để tải game cũ!");
      return;
    }

    try {
      setIsLoadingGame(true);
      const res = await gameAPI.getSavedGames();
      const savedGames = res.data.data || [];

      const mySavedGame = savedGames.find((g) => g.game_slug === GAME_SLUG);

      if (!mySavedGame) {
        alert("Không tìm thấy bản lưu nào của trò chơi này!");
        return;
      }

      const loadRes = await gameAPI.loadGame(mySavedGame.id);
      const gameData = loadRes.data.data;

      if (!gameData || !gameData.state) {
        alert("Dữ liệu game bị lỗi, không thể tải!");
        return;
      }

      let loadedBoard = gameData.state;
      if (typeof loadedBoard === "string") {
        try {
          loadedBoard = JSON.parse(loadedBoard);
        } catch (e) {
          console.error("Lỗi parse board:", e);
        }
      }

      const loadedMoveCount = gameData.score || 0;

      setBoard(loadedBoard);
      setMoveCount(loadedMoveCount);
      setSessionId(mySavedGame.id);

      setCurrentPlayer(loadedMoveCount % 2 === 0 ? "X" : "O");

      setGameOver(false);
      setWinner(null);
      alert("📂 Đã tải lại ván chơi cũ!");
    } catch (error) {
      console.error("Lỗi khi tải game:", error);
      alert("Không thể tải game cũ (Xem console để biết chi tiết).");
    } finally {
      setIsLoadingGame(false);
    }
  };

  const resetGame = async () => {
    initializeBoard();
    if (user && gameId) {
      await createNewSession(gameId);
    }
  };

  const getCellClassName = (row, col) => {
    let className = "caro-cell";
    if (board[row][col]) className += ` ${board[row][col].toLowerCase()}`;
    if (lastMove && lastMove[0] === row && lastMove[1] === col)
      className += " last-move";
    return className;
  };

  return (
    <div className="caro5-game">
      <div className="game-header">
        <h1>⭕ Caro 5 hàng</h1>
      </div>

      <div className="game-layout">
        <div className="left-panel">
          <div className="game-info-card">
            <div className="current-player">
              Lượt của:{" "}
              <span className={`player ${currentPlayer.toLowerCase()}`}>
                {currentPlayer}
              </span>
            </div>
            <div className="move-count">Nước đi: {moveCount}</div>
          </div>

          <div className="game-controls">
            <button
              className="btn-save"
              onClick={handleSaveGame}
              disabled={isSaving || gameOver || !user}
              style={{ backgroundColor: "#27ae60", color: "white" }}
            >
              {isSaving ? "Đang lưu..." : "💾 Lưu Game"}
            </button>

            <button
              className="btn-load"
              onClick={handleLoadGame}
              disabled={isLoadingGame || !user}
              style={{ backgroundColor: "#e67e22", color: "white" }}
            >
              {isLoadingGame ? "Đang tải..." : "📂 Tiếp tục ván cũ"}
            </button>

            <button className="btn btn-secondary" onClick={resetGame}>
              🔄 Chơi lại từ đầu
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/games")}
            >
              🏠 Về trang chọn game
            </button>
          </div>

          {gameId && <GameReview gameId={gameId} gameName="Caro 5 hàng" />}
        </div>

        <div className="center-panel">
          {winner && <div className="winner-message">🎉 {winner} thắng!</div>}

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
        </div>

        <div className="right-panel">
          <GameInstructions gameSlug={GAME_SLUG} />
        </div>
      </div>
    </div>
  );
};

export default Caro5Game;
