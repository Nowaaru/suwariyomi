/* eslint-disable react/jsx-props-no-spreading */
import { ButtonProps, Button as MuiButton, Tooltip } from '@mui/material';
import { StyleSheet, css } from 'aphrodite';
import Theme from '../../main/util/theme';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const themeColors = currentTheme.getColors();
const componentStyle = currentTheme.getComponentStyle('trackeritem');

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
    color: themeColors.accent,
    minWidth: '80px',
  },

  ...componentStyle,
}) as any;

const Button = (
  props: ButtonProps & {
    tooltipTitle?: string;
    label?: string;
    tooltipPlacement?: 'top' | 'bottom';
  }
) => {
  const { tooltipTitle, tooltipPlacement, label, onClick, ...rest } = props;
  return (
    <div className={css(styles.buttonContainer)}>
      <Tooltip title={tooltipTitle ?? ''} placement={tooltipPlacement ?? 'top'}>
        <MuiButton
          {...rest}
          className={css(styles.button)}
          sx={{
            '&:hover': {
              backgroundColor: `${themeColors.white.substring(
                0,
                7
              )}11 !important`,
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
  tooltipPlacement: 'top',
  label: 'Button',
};

export default Button;
