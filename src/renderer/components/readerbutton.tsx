import { IconButton } from '@mui/material';

const ReaderButton = ({
  className,
  divClassName,

  onClick,
  onMouseMove,
  onMouseLeave,
  clickIcon,
}: {
  className: string;
  divClassName: string;

  onClick: VoidFunction;
  onMouseMove: VoidFunction;
  onMouseLeave: VoidFunction;
  clickIcon: JSX.Element;
}) => {
  return (
    <div
      className={className}
      onClick={onClick}
      onKeyPress={() => {}}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      role="button"
      tabIndex={-1}
    >
      <div className={divClassName}>{clickIcon}</div>
    </div>
  );
};

export default ReaderButton;
