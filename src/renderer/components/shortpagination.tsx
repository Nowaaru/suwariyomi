/* eslint-disable react/destructuring-assignment */
import Box from '@mui/material/Box';

import { css, StyleSheet } from 'aphrodite';
import { useState, useEffect, SyntheticEvent } from 'react';
import type { ChangeEvent } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIosNewSharpIcon from '@mui/icons-material/ArrowBackIosNewSharp';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import { IconButton, Paper } from '@mui/material';

import propTypes from 'prop-types';
import Theme from '../../main/util/theme';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const themeColors = currentTheme.getColors();
const componentStyle = currentTheme.getComponentStyle('shortpagination');

const styles = StyleSheet.create({
  paginationbox: {
    position: 'fixed',
    height: 'fit-content',
    width: '100%',
    bottom: '15px',
    opacity: 0.75,
    transition: 'opacity 0.2s ease-in-out',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ':hover': {
      opacity: 1,
    },
  },

  paginationBoxInner: {
    width: 'fit-content',
    height: 'fit-content',
    display: 'inherit',
    justifyContent: 'inherit',
    alignItems: 'inherit',
    backgroundColor: '#050401',
    padding: '2px 5px',
  },

  paginationinput: {
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'fit-content',
    height: 'fit-content',
    border: '1px solid transparent',
    borderRadius: '0px',
    padding: '6px 0px',
    margin: '0 4px',
    backgroundColor: 'rgba(28, 27, 24, 0.2)',
    color: '#FFFFFF',
    transition: 'background-color 0.2s ease-in-out, caret-color 1s ease-in-out',
    caretColor: 'rgba(255,255,255,0)',
    ':focus-within': {
      caretColor: 'rgba(255,255,255,1)',
      backgroundColor: 'rgba(28, 27, 24, 0.4)',
    },
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },

  paginationinputinner: {
    outline: 'none',
    color: 'inherit',
    border: 'none',
    backgroundColor: 'transparent',
    textAlign: 'center',
    fontFamily: 'inherit',
    caretColor: 'inherit',
  },

  paginationinputdeep: {
    color: themeColors.textLight,
  },

  paginationbutton: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    height: '32px',
    width: '32px',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    transition:
      'left 0.1s ease-in-out 0s, background-color 0.1s ease-in-out 0s, opacity 0.1s ease-in-out 0s',
    cursor: 'pointer',
    left: '0px',
    borderRadius: '50%',
  },

  left: {
    ':hover': {
      left: '-5px',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    ':active': {
      backgroundColor: 'rgba(127, 127, 127, 0.2)',
    },
  },

  right: {
    ':hover': {
      left: '5px',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    ':active': {
      backgroundColor: 'rgba(127, 127, 127, 0.2)',
    },
  },

  paginationicon: {
    color: '#fff',
    position: 'relative',
    transition: 'color 0.2s ease-in-out 0s',
    ':hover': {
      color: themeColors.accent,
    },
  },

  paginationiconr: {
    left: '1px',
  },

  paginationiconl: {
    left: '-1px',
  },

  disabled: {
    opacity: 0.5,
    pointerEvents: 'none',
    cursor: 'not-allowed',
  },

  invisibleButton: {
    opacity: 0,
    pointerEvents: 'none',
  },

  searchButton: {
    opacity: 1,
    position: 'absolute',
    top: '-42px',
    width: 'fit-content',
    height: 'fit-content',
    boxSizing: 'border-box',
    padding: '4px',
    borderRadius: '50%',
    backgroundColor: '#050401',
    transition: 'top 0s ease-in-out, opacity 0.2s ease-in-out',
    borderColor: 'transparent',
    borderWidth: '0px',
    ':hover': {
      bordercolor: themeColors.textLight,
      borderWidth: '6px',
    },
  },

  searchIcon: {
    width: '32px',
    height: '32px',
    color: '#fff',
    transition: 'color 0.2s ease-in-out 0s',
    ':hover': {
      color: themeColors.accent,
    },
  },

  pageIndicator: {
    boxSizing: 'border-box',
    padding: '6px',
    backgroundColor: '#050401',
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: '12px',
    color: themeColors.textLight,
    fontVariant: 'small-caps',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderRadius: '4px',
  },

  minSide: {
    marginRight: '4px',
  },

  maxSide: {
    marginLeft: '4px',
  },

  startReached: {},

  endReached: {},

  ...componentStyle,
}) as any;

type PaginationProps = {
  disabled?: boolean;
  page: number;
  maxpages: number;
  onUpdate?: (page: number) => void;
};
const ShortPagination = ({
  disabled = false,
  page,
  maxpages,
  onUpdate = () => {},
}: PaginationProps) => {
  if (maxpages < 1) throw new Error('maxpages must be greater than 1');
  if (page < 1) throw new Error('page must be greater than 0');
  if (page > maxpages) throw new Error('page must be less than maxpages');

  const [value, setValue] = useState(String(page)); // display page number
  const [searchButtonIsVisible, setVisiblity] = useState(false); // display search button if the text input is focused
  if (value.length > 5) setValue(value.slice(0, 5));

  const onValueChange = (newValue: string, doUpdate = true) => {
    if (newValue.length > 5) return setValue(newValue.slice(0, 5));
    const newerValue = newValue.match(/^\d*$/) ? newValue : value;
    const newestValue = String(
      Math.min(Math.max(1, Number(newerValue)), maxpages)
    ); // i'm genuinely just a terrible person

    if (doUpdate && onUpdate) onUpdate(Number(newestValue));
    return setValue(newestValue);
  };

  // I HAVE NO CLUE HOW TO TYPE THIS FUNCTION PROPERLY HELP ME DEAR GOD
  const onFocusLost = (event: SyntheticEvent<HTMLInputElement, FocusEvent>) => {
    if (searchButtonIsVisible) setTimeout(() => setVisiblity(false), 100);
    const eventTargetValue = event.currentTarget?.value as string;
    const eventWithTarget = (event as unknown as FocusEvent).relatedTarget;

    if (eventWithTarget) {
      onValueChange(value, true);
    } else if (!eventWithTarget || eventTargetValue.trim().length === 0) {
      onValueChange(String(page), false);
    }
  };

  useEffect(() => {
    // This is a hack to make sure that if the page prop changes, the input value is updated
    setValue(String(page));
  }, [page]);

  const endReached = maxpages === Number(page);
  return (
    <Box className={css(styles.paginationbox)}>
      <span
        className={css(
          styles.pageIndicator,
          styles.minSide,
          Number(page) === 1 && styles.startReached
        )}
      >
        MIN 1
      </span>
      <Paper className={css(styles.paginationBoxInner)}>
        <IconButton
          className={css(
            styles.searchButton,
            !searchButtonIsVisible && styles.invisibleButton
          )}
          onClick={() => {
            onValueChange(String(page));
          }}
          disabled={disabled}
        >
          <SearchIcon className={css(styles.searchIcon)} />
        </IconButton>
        <button
          disabled={disabled || page <= 1}
          type="button"
          className={css(
            styles.paginationbutton,
            styles.left,
            disabled || page <= 1 ? styles.disabled : false
          )}
          onClick={() => {
            onValueChange(String(Number(value) - 1));
          }}
        >
          <ArrowBackIosNewSharpIcon
            className={css(styles.paginationicon, styles.paginationiconl)}
          />
        </button>
        <div className={css(styles.paginationinput)}>
          <input
            min={1}
            max={100}
            type="number"
            value={value}
            className={css(
              styles.paginationinputinner,
              disabled ? styles.disabled : false
            )}
            onFocus={() => {
              return setVisiblity(true);
            }}
            onBlur={onFocusLost}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              onValueChange(e.target.value, false);
            }}
          />
        </div>
        <button
          type="button"
          disabled={disabled || page === maxpages}
          className={css(
            styles.paginationbutton,
            styles.right,
            disabled || page === maxpages ? styles.disabled : false
          )}
          onClick={() => {
            onValueChange(String(Number(value) + 1));
          }}
        >
          <ArrowForwardIosSharpIcon
            className={css(styles.paginationicon, styles.paginationiconr)}
          />
        </button>
      </Paper>
      <span
        className={css(
          styles.pageIndicator,
          styles.maxSide,
          endReached && styles.endReached
        )}
      >
        {endReached
          ? 'END REACHED'
          : `MAX ${
              Number.isFinite(maxpages) && Number.isSafeInteger(maxpages)
                ? maxpages
                : '∞'
            }`}
      </span>
    </Box>
  );
};
ShortPagination.propTypes = {
  disabled: propTypes.bool.isRequired,
  onUpdate: propTypes.func.isRequired,
  page: propTypes.number.isRequired,
};
export default ShortPagination;
