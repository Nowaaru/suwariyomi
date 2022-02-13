import { IconButton } from '@mui/material';

const ReaderButton = ({
  className,
  divClassName,

  disabled,
  onClick,
  onMouseMove,
  onMouseLeave,
  clickIcon,
}: {
  className?: string;
  divClassName?: string;

  disabled?: boolean;
  onClick?: VoidFunction;
  onMouseMove?: VoidFunction;
  onMouseLeave?: VoidFunction;
  clickIcon?: JSX.Element;
}) => {
  return !disabled ? (
    <div
      className={className}
      onClick={onClick}
      onKeyPress={() => {}}
      onMouseMoveCapture={onMouseMove}
      onMouseLeave={onMouseLeave}
      role="button"
      tabIndex={-1}
    >
      <div className={divClassName}>{clickIcon}</div>
    </div>
  ) : null;
};

ReaderButton.defaultProps = {
  className: '',
  divClassName: '',
  disabled: false,
  onClick: () => {},
  onMouseMove: () => {},
  onMouseLeave: () => {},
  clickIcon: <div />,
};

export default ReaderButton;
