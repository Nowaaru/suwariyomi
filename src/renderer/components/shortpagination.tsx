/* eslint-disable react/destructuring-assignment */
import Box from '@mui/material/Box';

import { css, StyleSheet } from 'aphrodite';
import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';

import ArrowBackIosNewSharpIcon from '@mui/icons-material/ArrowBackIosNewSharp';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import { Paper } from '@mui/material';

const styles = StyleSheet.create({
  paginationbox: {
    position: 'fixed',
    height: 'fit-content',
    width: '100%',
    bottom: '15px',
    opacity: 0.75,
    transition: 'opacity 0.2s ease-in-out',
    ':hover': {
      opacity: 1,
    },
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
    width: 'fit-content',
    height: 'fit-content',
    border: '1px solid #11111100',
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
    color: '#FFFFFF',
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
      color: '#DF2935',
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
});

type PaginationProps = {
  // eslint-disable-next-line react/require-default-props
  disabled?: boolean;
  page: number;
  // eslint-disable-next-line react/require-default-props
  onUpdate?: (page: number) => void;
};
const ShortPagination = ({
  disabled = false,
  page,
  onUpdate = () => {},
}: PaginationProps) => {
  const [value, setValue] = useState(String(page)); // display page number
  if (value.length > 5) setValue(value.slice(0, 5));

  const onValueChange = (newValue: string) => {
    if (newValue.length > 5) return setValue(newValue.slice(0, 5));
    const newerValue = newValue.match(/^\d*$/) ? newValue : value;
    if (newerValue === value) return undefined; // so state doesn't update (no clue if react checks for this internally so better to be safe than sorry!)

    const newestValue = String(Math.max(1, Number(newerValue))); // i'm genuinely just a terrible person
    if (onUpdate) onUpdate(Number(newestValue));
    return setValue(newestValue);
  };

  const onFocusLost = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value || event.target.value.trim().length === 0) {
      onValueChange(String(page));
    }
  };

  useEffect(() => {
    // This is a hack to make sure that if the page prop changes, the input value is updated
    setValue(String(page));
  }, [page]);

  return (
    <Box className={css(styles.paginationbox)}>
      <Paper className={css(styles.paginationBoxInner)}>
        <button
          disabled={disabled}
          type="button"
          className={css(
            styles.paginationbutton,
            styles.left,
            disabled ? styles.disabled : false
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
            onBlur={onFocusLost}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              onValueChange(e.target.value);
            }}
          />
        </div>
        <button
          type="button"
          disabled={disabled}
          className={css(
            styles.paginationbutton,
            styles.right,
            disabled ? styles.disabled : false
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
    </Box>
  );
};

export default ShortPagination;
