import { CircularProgress, Backdrop } from '@mui/material';

const LoadingModal = ({ className }: { className?: string }) => {
  return (
    <Backdrop open className={className}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

LoadingModal.defaultProps = {
  className: '',
};

export default LoadingModal;
