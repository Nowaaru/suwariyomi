/* eslint-disable react/destructuring-assignment */
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

import { createTheme, ThemeProvider } from '@mui/system';
import { css, StyleSheet } from 'aphrodite';
import { useState } from 'react';
import type { ChangeEvent } from 'react';

import ArrowBackIosNewSharpIcon from '@mui/icons-material/ArrowBackIosNewSharp';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';

const styles = StyleSheet.create({
  paginationbox: {
    height: 'fit-content',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  paginationinput: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'fit-content',
    height: 'fit-content',
    border: '1px solid #11111100',
    borderRadius: '4px',
    padding: '6px 0px',
    margin: '0 4px',
    backgroundColor: 'rgba(0,0,0,0.2)',
    color: '#FFFFFF',
    transition: 'background-color 0.2s ease-in-out, caret-color 1s ease-in-out',
    caretColor: 'rgba(255,255,255,0)',
    ':focus-within': {
      caretColor: 'rgba(255,255,255,1)',
      backgroundColor: 'rgba(0,0,0,0.4)',
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
    transition: 'color 0.1s ease-in-out 0s',
    ':hover': {
      color: '##DF2935',
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
};
const ShortPagination = ({ disabled = false, page }: PaginationProps) => {
  const [value, setValue] = useState(String(page)); // display page number
  if (value.length > 5) setValue(value.slice(0, 5));

  const onValueChange = (newValue: string) => {
    if (newValue.length > 5) return setValue(newValue.slice(0, 5));
    const newerValue = newValue.match(/^\d*$/) ? newValue : value;

    return setValue(newerValue);
  };

  const onFocusLost = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value || event.target.value.trim().length === 0) {
      console.log('???');
      setValue(String(page));
    }
  };

  return (
    <Box className={css(styles.paginationbox)}>
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
    </Box>
  );
};

export default ShortPagination;