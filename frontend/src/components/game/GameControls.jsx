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
      <div className="controls-row controls-row--top">
        {showHint && (
          <button
            className={classnames('control-btn control-btn--hint', {
              'control-btn--pressed': pressedKeys.hint,
            })}
            onClick={() => handleClick('hint')}
          >
            <span className="control-icon">💡</span>
            <span className="control-label">Hint (H)</span>
          </button>
        )}
      </div>

      <div className="controls-row controls-row--middle">
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
          <span className="control-label">Enter</span>
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

      <div className="controls-row controls-row--bottom">
        <button
          className={classnames('control-btn control-btn--back', {
            'control-btn--pressed': pressedKeys.back,
          })}
          onClick={() => handleClick('back')}
        >
          <span className="control-icon">↩</span>
          <span className="control-label">Back (Esc)</span>
        </button>
      </div>

      <div className="controls-help">
        <p>Dieu khien: ← → Enter Esc H</p>
      </div>
    </div>
  );
};

export default GameControls;
