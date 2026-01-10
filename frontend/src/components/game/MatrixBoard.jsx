import { memo } from "react";
import classnames from "classnames";
import "./MatrixBoard.css";

/**
 * MatrixBoard - Component ma tran LED
 * Nhan vao mang 2 chieu chua ma mau va render thanh luoi LED
 *
 * @param {Array} grid
 * @param {Object} cursor
 * @param {Function} onCellClick
 * @param {number} cellSize
 * @param {boolean} showCursor
 * @param {boolean} glowEffect
 */
const MatrixBoard = memo(
  ({
    grid = [],
    cursor = null,
    onCellClick = null,
    cellSize = 20,
    showCursor = true,
    glowEffect = true,
    className = "",
  }) => {
    const rows = grid.length;
    const cols = rows > 0 ? grid[0].length : 0;

    const gridStyle = {
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
      gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
      gap: "3px",
      padding: "12px",
      borderRadius: "12px",
    };

    const renderCell = (color, rowIndex, colIndex) => {
      const isCursor =
        showCursor && cursor && cursor.x === colIndex && cursor.y === rowIndex;
      const hasColor =
        color &&
        color !== "transparent" &&
        color !== "#000000" &&
        color !== "#1a1a1a";

      const cellClasses = classnames("matrix-cell", {
        "matrix-cell--active": hasColor,
        "matrix-cell--cursor": isCursor,
        "matrix-cell--glow": glowEffect && hasColor,
      });

      const cellStyle = {
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        backgroundColor: hasColor ? color : undefined,
        boxShadow: hasColor
          ? `0 0 ${
              cellSize / 3
            }px ${color}88, inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.2)`
          : undefined,
      };

      return (
        <div
          key={`${rowIndex}-${colIndex}`}
          className={cellClasses}
          style={cellStyle}
          onClick={() => onCellClick && onCellClick(colIndex, rowIndex)}
          data-x={colIndex}
          data-y={rowIndex}
        />
      );
    };

    return (
      <div className={classnames("matrix-board", className)}>
        <div className="matrix-grid" style={gridStyle}>
          {grid.map((row, rowIndex) =>
            row.map((color, colIndex) => renderCell(color, rowIndex, colIndex))
          )}
        </div>

        {cursor && (
          <div className="matrix-info">
            <span>
              Vị trí: ({cursor.x}, {cursor.y})
            </span>
            <span>
              Kích thước: {cols}x{rows}
            </span>
          </div>
        )}
      </div>
    );
  }
);

MatrixBoard.displayName = "MatrixBoard";

export default MatrixBoard;
