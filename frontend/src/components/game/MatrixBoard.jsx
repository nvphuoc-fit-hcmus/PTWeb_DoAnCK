import { memo } from "react";
import classnames from "classnames";
import "./MatrixBoard.css";

/**
 * MatrixBoard - Component ma tran LED
 * Nhan vao mang 2 chieu chua ma mau va render thanh luoi LED
 * Thiet ke moi: cac o tron voi duong noi giua chung
 *
 * @param {Array} grid
 * @param {Array} cellClassGrid - Mang 2 chieu chua class tuy chinh cho moi cell
 * @param {Object} cursor
 * @param {Function} onCellClick
 * @param {number} cellSize
 * @param {boolean} showCursor
 * @param {boolean} glowEffect
 * @param {boolean} showConnectors - Hien thi duong noi giua cac o
 */
const MatrixBoard = memo(
  ({
    grid = [],
    cellClassGrid = null,
    cursor = null,
    onCellClick = null,
    cellSize = 24,
    showCursor = true,
    glowEffect = true,
    showConnectors = true,
    className = "",
  }) => {
    const rows = grid.length;
    const cols = rows > 0 ? grid[0].length : 0;

    // Gap between cells
    const gapSize = 6;

    const gridStyle = {
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
      gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
      gap: `${gapSize}px`,
      padding: "16px",
      borderRadius: "16px",
    };

    const renderCell = (color, rowIndex, colIndex) => {
      const isCursor =
        showCursor && cursor && cursor.x === colIndex && cursor.y === rowIndex;
      const hasColor =
        color &&
        color !== "transparent" &&
        color !== "#000000" &&
        color !== "#1a1a1a";
      
      // Lay class tuy chinh tu cellClassGrid
      const customClass = cellClassGrid?.[rowIndex]?.[colIndex] || "";

      const cellClasses = classnames("matrix-cell", customClass, {
        "matrix-cell--active": hasColor,
        "matrix-cell--cursor": isCursor,
        "matrix-cell--glow": glowEffect && hasColor,
        // Them class de ve duong noi
        "matrix-cell--connect-right": showConnectors && colIndex < cols - 1,
        "matrix-cell--connect-bottom": showConnectors && rowIndex < rows - 1,
      });

      const cellStyle = {
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        backgroundColor: hasColor ? color : undefined,
        // CSS variables for connector positioning
        "--cell-size": `${cellSize}px`,
        "--gap-size": `${gapSize}px`,
      };

      return (
        <div
          key={`cell-${rowIndex}-${colIndex}`}
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

