import classnames from 'classnames';
import './GameControls.css';

/**
 * GameControls - Hien thi 5 nut dieu khien tren man hinh
 * 
 * @param {Object} pressedKeys - Trang thai cac phim dang nhan
 * @param {Function} onButtonPress - Callback khi nhan nut
 * @param {boolean} showHint - Hien thi nut Hint hay khong
 */
const GameControls = ({
  pressedKeys = {},
  onButtonPress = null,
  showHint = true,
  className = '',
}) => {
  const handleClick = (action) => {
    if (onButtonPress) {
      onButtonPress(action);
    }
  };

  return (
    <div className={classnames('game-controls', className)}>
      {/* Navigation Cluster - D-pad style */}
      <div className="navigation-cluster">
        {/* Up button - top position */}
        <button
          className={classnames('control-btn control-btn--up', {
            'control-btn--pressed': pressedKeys.up,
          })}
          onClick={() => handleClick('up')}
        >
          <span className="control-icon">▲</span>
          <span className="control-label">Up</span>
        </button>

        {/* Middle row: Left + Select + Right */}
        <div className="nav-middle-row">
          <button
            className={classnames('control-btn control-btn--left', {
              'control-btn--pressed': pressedKeys.left,
            })}
            onClick={() => handleClick('left')}
          >
            <span className="control-icon">◀</span>
            <span className="control-label">Left</span>
          </button>

          <button
            className={classnames('control-btn control-btn--enter', {
              'control-btn--pressed': pressedKeys.enter,
            })}
            onClick={() => handleClick('enter')}
          >
            <span className="control-icon">✓</span>
            <span className="control-label">Select</span>
          </button>

          <button
            className={classnames('control-btn control-btn--right', {
              'control-btn--pressed': pressedKeys.right,
            })}
            onClick={() => handleClick('right')}
          >
            <span className="control-icon">▶</span>
            <span className="control-label">Right</span>
          </button>
        </div>

        {/* Down button - bottom position */}
        <button
          className={classnames('control-btn control-btn--down', {
            'control-btn--pressed': pressedKeys.down,
          })}
          onClick={() => handleClick('down')}
        >
          <span className="control-icon">▼</span>
          <span className="control-label">Down</span>
        </button>
      </div>

      {/* Function Buttons - Pill shaped, horizontal row */}
      <div className="function-buttons">
        {showHint && (
          <button
            className={classnames('control-btn control-btn--hint control-btn--pill', {
              'control-btn--pressed': pressedKeys.hint,
            })}
            onClick={() => handleClick('hint')}
          >
            <span className="control-icon">💡</span>
            <span className="control-label">Hint (H)</span>
          </button>
        )}
        
        <button
          className={classnames('control-btn control-btn--back control-btn--pill', {
            'control-btn--pressed': pressedKeys.back,
          })}
          onClick={() => handleClick('back')}
        >
          <span className="control-icon">↩</span>
          <span className="control-label">Undo (Esc)</span>
        </button>
      </div>

      {/* Help text */}
      <div className="controls-help">
        <p>Controls: ← ↑ ↓ → Enter Esc H</p>
      </div>
    </div>
  );
};

export default GameControls;
