/* eslint-disable react/jsx-props-no-spreading */
import { ButtonProps, Button as MuiButton, Tooltip } from '@mui/material';
import { StyleSheet, css } from 'aphrodite';

const styles = StyleSheet.create({
  buttonContainer: {
    width: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box',
    padding: '8px',
  },

  button: {
    display: 'flex',
    fontWeight: 'bold',
    color: '#DF2935',
    minWidth: '80px',
  },
});

const Button = (
  props: ButtonProps & { tooltipTitle?: string; label?: string }
) => {
  const { tooltipTitle, label, onClick, ...rest } = props;
  return (
    <div className={css(styles.buttonContainer)}>
      <Tooltip title={tooltipTitle ?? ''} placement="top">
        <MuiButton
          {...rest}
          className={css(styles.button)}
          sx={{
            '&:hover': {
              backgroundColor: '#FFFFFF11 !important',
            },
          }}
          onClick={onClick ?? (() => {})}
        >
          {label ?? 'Button'}
        </MuiButton>
      </Tooltip>
    </div>
  );
};

Button.defaultProps = {
  tooltipTitle: '',
  label: 'Button',
};

export default Button;
