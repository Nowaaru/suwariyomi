import { Tooltip } from '@mui/material';
import { StyleSheet, css } from 'aphrodite';

const styles = StyleSheet.create({
  isDisabled: {
    filter: 'lighten(25%)',
  },
  loginItem: {
    transition: 'filter 1s linear',
    display: 'flex',
    width: '64px',
    height: '64px',
    background: 'rgb(14, 14, 14)',
    border: '2px solid rgb(14, 14, 14)',
    borderRadius: '100%',
    marginRight: '10px',
    marginBottom: '10px',
    cursor: 'pointer',

    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    width: '100%',
    height: '100%',
  },
});

const LoginItem = ({
  src = '',
  alt = 'Login Item' as string,
  title = 'Login Item' as string,
  disabledtitle = 'Already logged in!' as string,
  isDisabled = false as boolean,
  onClick = (() => {}) as () => void,
}) => {
  return (
    <Tooltip title={isDisabled ? disabledtitle : alt || title} placement="top">
      <span>
        <button
          disabled={isDisabled}
          type="button"
          onClick={onClick}
          className={`login-item ${css(styles.loginItem)}`}
        >
          <img
            src={src}
            alt={alt}
            title={title || alt}
            className={css(styles.img, isDisabled ? styles.isDisabled : false)}
          />
        </button>
      </span>
    </Tooltip>
  );
};

export default LoginItem;
