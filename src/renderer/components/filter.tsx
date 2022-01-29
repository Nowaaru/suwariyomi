import { StyleSheet, css } from 'aphrodite';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useScrollTrigger,
} from '@mui/material';

import FilterListIcon from '@mui/icons-material/FilterList';
import React, { useState } from 'react';

const styles = StyleSheet.create({
  appBarContainer: {
    position: 'absolute',
    width: 'fit-content',
    height: 'fit-content',
    bottom: '15px',
    right: '25px',
    overflow: 'hidden',
  },

  appBar: {
    position: 'relative',
    backgroundColor: '#080708',
    color: '#ffffff',
    width: '128px',
    height: 'fit-content',
    borderRadius: '5%',
    transition: 'width 0.2s ease-in-out, height 0.2s ease-in-out',
  },

  small: {
    width: '48px',
    height: '48px',
  },

  buttonSmall: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  },

  filterIcon: {
    color: '#DF2935',
    transition: 'color 0.2s ease-in-out, transform 0.2s ease-in-out',
    ':hover': {
      color: '#FFFFFF',
    },
  },

  toolbarsmall: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    padding: '0px',
  },

  buttonWrapper: {
    cursor: 'pointer',
    padding: '0',
    border: 'none',
    background: 'none',
    outline: 'none',
  },
});

type FilterProps = {
  onClick: () => void;
  scrollTarget: Node | Window;
};
const FilterButton = ({ onClick, scrollTarget }: FilterProps) => {
  const didScroll = useScrollTrigger({
    disableHysteresis: false,
    target: scrollTarget,
    threshold: 100,
  });

  const [didHover, setHoverState] = useState(false);
  const displaySmall = didScroll && !didHover;

  console.log(`did scroll: ${didScroll}`);
  return (
    <div className={css(styles.appBarContainer)}>
      <button
        type="button"
        onClick={onClick}
        className={css(styles.buttonWrapper)}
        onMouseEnter={() => setHoverState(true)}
        onMouseLeave={() => setHoverState(false)}
      >
        <AppBar
          color="primary"
          className={css(styles.appBar, displaySmall && styles.small)}
        >
          <Toolbar
            variant="dense"
            className={css(displaySmall && styles.toolbarsmall)}
          >
            <IconButton
              edge={displaySmall ? false : 'start'}
              sx={
                !displaySmall
                  ? {
                      mr: 2,
                    }
                  : undefined
              }
            >
              <FilterListIcon className={css(styles.filterIcon)} />
            </IconButton>
            {!displaySmall ? <Typography>Filter</Typography> : null}
          </Toolbar>
        </AppBar>
      </button>
    </div>
  );
};

export default FilterButton;
