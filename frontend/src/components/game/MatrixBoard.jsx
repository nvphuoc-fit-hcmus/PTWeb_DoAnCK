import { memo } from 'react';
import classnames from 'classnames';
import './MatrixBoard.css';

/**
 * MatrixBoard - Component ma tran LED
 * Nhan vao mang 2 chieu chua ma mau va render thanh luoi LED
 * 
 * @param {Array} grid - Mang 2 chieu chua ma mau (vd: '#FF0000', 'red', null)
 * @param {Object} cursor - Vi tri con tro { x, y }
 * @param {Function} onCellClick - Callback khi click vao o (optional, cho debug)
 * @param {number} cellSize - Kich thuoc moi o (px), mac dinh 20
 * @param {boolean} showCursor - Hien thi con tro hay khong
 * @param {boolean} glowEffect - Bat hieu ung phat sang
 */
const MatrixBoard = memo(({
  grid = [],
  cursor = null,
  onCellClick = null,
  cellSize = 20,
  showCursor = true,
  glowEffect = true,
  className = '',
}) => {
  const rows = grid.length;
  const cols = rows > 0 ? grid[0].length : 0;

  // Tao style cho grid container
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    gap: '2px',
    padding: '10px',
    backgroundColor: '#111',
    borderRadius: '8px',
    boxShadow: '0 0 20px rgba(0, 255, 0, 0.2)',
  };

  // Render moi cell
  const renderCell = (color, rowIndex, colIndex) => {
    const isCursor = showCursor && cursor && cursor.x === colIndex && cursor.y === rowIndex;
    const hasColor = color && color !== 'transparent' && color !== '#000000';

    const cellClasses = classnames('matrix-cell', {
      'matrix-cell--active': hasColor,
      'matrix-cell--cursor': isCursor,
      'matrix-cell--glow': glowEffect && hasColor,
    });

    const cellStyle = {
      width: `${cellSize}px`,
      height: `${cellSize}px`,
      backgroundColor: hasColor ? color : '#1a1a1a',
      boxShadow: glowEffect && hasColor 
        ? `0 0 ${cellSize / 2}px ${color}, inset 0 0 ${cellSize / 4}px rgba(255,255,255,0.3)` 
        : 'none',
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
    <div className={classnames('matrix-board', className)}>
      <div className="matrix-grid" style={gridStyle}>
        {grid.map((row, rowIndex) =>
          row.map((color, colIndex) => renderCell(color, rowIndex, colIndex))
        )}
      </div>
      
      {/* Hien thi thong tin debug */}
      {cursor && (
        <div className="matrix-info">
          <span>Vi tri: ({cursor.x}, {cursor.y})</span>
          <span>Kich thuoc: {cols}x{rows}</span>
        </div>
      )}
    </div>
  );
});

MatrixBoard.displayName = 'MatrixBoard';

export default MatrixBoard;
