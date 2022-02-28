const ReaderButton = ({
  className,
  divClassName,

  disabled,
  onClick,
  onMouseMove,
  onMouseLeave,
  onWheelCapture,
  clickIcon,
}: {
  className?: string;
  divClassName?: string;

  disabled?: boolean;
  onClick?: VoidFunction;
  onMouseMove?: VoidFunction;
  onMouseLeave?: VoidFunction;
  onWheelCapture?: (event: React.WheelEvent<HTMLDivElement>) => void;
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
      onWheelCapture={onWheelCapture}
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
  onWheelCapture: () => {},
  clickIcon: <div />,
};

export default ReaderButton;
