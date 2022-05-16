/* eslint-disable react/jsx-props-no-spreading */
import { TextField, TextFieldProps } from '@mui/material';
import { StyleSheet, css } from 'aphrodite';
import Theme from '../../main/util/theme';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const themeColors = currentTheme.getColors();
const componentStyle = currentTheme.getComponentStyle('search');

const searchStyles = StyleSheet.create({
  searchbarContainer: {
    position: 'fixed',
    bottom: 15,
    left: 10,
    width: 'fit-content',
    height: 'fit-content',
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    justifyContent: 'center',
    border: '1px solid transparent',
    zIndex: 260,
  },
  searchbarContainerInner: {
    backgroundColor: themeColors.textLight,
    borderRadius: '80%',
    padding: '8px',
    width: '52px',
    height: '52px',
    opacity: 0.2,
    transition:
      'width 0.2s ease-out, opacity 0.2s ease-in-out, border-radius 0s ease-in-out',
    ':focus-within': {
      opacity: 1,
      width: 'fit-content',
      borderRadius: '4px',
    },
    ':hover': {
      opacity: 0.8,
    },
  },
  searchbar: {
    width: '64px',
    minWidth: '64px',
    height: '100%',
    transition: 'width 0.2s ease-in-out',
    opacity: 0,
    ':focus-within': {
      width: '600px',
      minWidth: '300px',
      opacity: 1,
    },
  },

  ...componentStyle,
}) as any;

type NewSearchProps = Omit<TextFieldProps, 'variant'>;
const SearchBar = (props: TextFieldProps & NewSearchProps) => {
  // Copy props to be able to mutate them
  const { ...newProps } = props;
  const { className } = newProps;
  newProps.className = `${css(searchStyles.searchbar)}${
    className ? ` ${className}` : ''
  }`;

  return (
    <div className={css(searchStyles.searchbarContainer)}>
      <div className={css(searchStyles.searchbarContainerInner)}>
        <TextField {...newProps} variant="filled" />
      </div>
    </div>
  );
};

export default SearchBar;
