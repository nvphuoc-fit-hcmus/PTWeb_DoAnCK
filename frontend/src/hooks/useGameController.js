import { useState, useEffect, useCallback, useRef } from "react";

/**
 * useGameController - Custom hook xu ly 5 nut dieu khien
 *
 * 5 nut chinh: LEFT, RIGHT, ENTER, BACK, HINT
 * Map phim ban phim:
 * - ArrowLeft / A -> LEFT
 * - ArrowRight / D -> RIGHT
 * - Enter / Space -> ENTER
 * - Escape / Backspace / B -> BACK
 * - H / ArrowUp -> HINT
 *
 * @param {Object} options
 * @param {number} options.gridWidth
 * @param {number} options.gridHeight
 * @param {string} options.mode
 * @param {Function} options.onAction
 * @param {boolean} options.enabled
 */
const useGameController = ({
  gridWidth = 20,
  gridHeight = 20,
  mode = "linear",
  onAction = null,
  enabled = true,
} = {}) => {
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  const [direction, setDirection] = useState("right");

  const [pressedKeys, setPressedKeys] = useState({
    left: false,
    right: false,
    enter: false,
    back: false,
    hint: false,
  });

  const holdTimerRef = useRef(null);
  const holdIntervalRef = useRef(null);

  const moveLinear = useCallback(
    (dir) => {
      setCursor((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        if (dir === "left") {
          newX--;
          if (newX < 0) {
            newX = gridWidth - 1;
            newY--;
            if (newY < 0) newY = gridHeight - 1;
          }
        } else if (dir === "right") {
          newX++;
          if (newX >= gridWidth) {
            newX = 0;
            newY++;
            if (newY >= gridHeight) newY = 0;
          }
        }

        return { x: newX, y: newY };
      });
    },
    [gridWidth, gridHeight]
  );

  const moveGrid = useCallback(
    (dir) => {
      setCursor((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        switch (dir) {
          case "left":
            newX = Math.max(0, newX - 1);
            break;
          case "right":
            newX = Math.min(gridWidth - 1, newX + 1);
            break;
          case "up":
            newY = Math.max(0, newY - 1);
            break;
          case "down":
            newY = Math.min(gridHeight - 1, newY + 1);
            break;
          default:
            break;
        }

        return { x: newX, y: newY };
      });
    },
    [gridWidth, gridHeight]
  );

  const moveSnake = useCallback((turn) => {
    setDirection((prevDir) => {
      const directions = ["up", "right", "down", "left"];
      const currentIndex = directions.indexOf(prevDir);

      if (turn === "left") {
        return directions[(currentIndex + 3) % 4];
      } else if (turn === "right") {
        return directions[(currentIndex + 1) % 4];
      }

      return prevDir;
    });
  }, []);

  const handleAction = useCallback(
    (action) => {
      if (!enabled) return;

      switch (action) {
        case "left":
          if (mode === "linear") {
            moveLinear("left");
          } else if (mode === "grid") {
            moveGrid("left");
          } else if (mode === "snake") {
            moveSnake("left");
          }
          break;
        case "right":
          if (mode === "linear") {
            moveLinear("right");
          } else if (mode === "grid") {
            moveGrid("right");
          } else if (mode === "snake") {
            moveSnake("right");
          }
          break;
        case "up":
          if (mode === "grid") {
            moveGrid("up");
          }
          break;
        case "down":
          if (mode === "grid") {
            moveGrid("down");
          }
          break;
        default:
          break;
      }

      if (onAction) {
        onAction(action, cursor);
      }
    },
    [enabled, mode, cursor, moveLinear, moveGrid, moveSnake, onAction]
  );

  const mapKeyToAction = useCallback((key) => {
    const keyMap = {
      ArrowLeft: "left",
      a: "left",
      A: "left",
      ArrowRight: "right",
      d: "right",
      D: "right",
      ArrowUp: "up",
      w: "up",
      W: "up",
      ArrowDown: "down",
      s: "down",
      S: "down",
      Enter: "enter",
      " ": "enter",
      Escape: "back",
      Backspace: "back",
      b: "back",
      B: "back",
      h: "hint",
      H: "hint",
    };
    return keyMap[key] || null;
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      if (!enabled) return;

      const action = mapKeyToAction(e.key);
      if (!action) return;

      e.preventDefault();

      setPressedKeys((prev) => ({ ...prev, [action]: true }));

      handleAction(action);

      if (["left", "right", "up", "down"].includes(action)) {
        if (!holdTimerRef.current) {
          holdTimerRef.current = setTimeout(() => {
            holdIntervalRef.current = setInterval(() => {
              handleAction(action);
            }, 80);
          }, 300);
        }
      }
    },
    [enabled, mapKeyToAction, handleAction]
  );

  const handleKeyUp = useCallback(
    (e) => {
      const action = mapKeyToAction(e.key);
      if (!action) return;

      setPressedKeys((prev) => ({ ...prev, [action]: false }));

      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
      }
    },
    [mapKeyToAction]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);

      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
      }
    };
  }, [enabled, handleKeyDown, handleKeyUp]);

  const resetCursor = useCallback((position = { x: 0, y: 0 }) => {
    setCursor(position);
  }, []);

  const setCursorPosition = useCallback(
    (x, y) => {
      setCursor({
        x: Math.max(0, Math.min(gridWidth - 1, x)),
        y: Math.max(0, Math.min(gridHeight - 1, y)),
      });
    },
    [gridWidth, gridHeight]
  );

  return {
    cursor,
    direction,
    pressedKeys,
    resetCursor,
    setCursorPosition,
    handleAction,
  };
};

export default useGameController;
