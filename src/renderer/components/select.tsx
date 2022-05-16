/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/destructuring-assignment */
import { Typography, Select as MaterialSelect, MenuItem } from '@mui/material';
import type { SelectProps as MaterialSelectProps } from '@mui/material/Select';

import { omit } from 'lodash';
import { StyleSheet, css } from 'aphrodite';
import Theme from '../../main/util/theme';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const themeColors = currentTheme.getColors();
const componentStyle = currentTheme.getComponentStyle('select');

const stylesObject = {
  selected: {
    color: 'white',
  },

  legend: {
    opacity: 0,
    transition: 'opacity 0.2s ease-in-out 0.25s',
    visibility: 'hidden',
  },

  selectedLegend: {
    opacity: 1,
    position: 'relative',
    top: '-5px',
    visibility: 'visible',
    color: themeColors.white,
  },

  icon: {
    color: themeColors.white,
  },

  iconSelected: {
    color: themeColors.accent,
  },

  focused: {
    borderColor: themeColors.accent,
  },

  ...componentStyle,
};

// @ts-ignore Aphrodite Sucks: Part 2
const styles = StyleSheet.create(stylesObject) as any;

const Select = (
  props: Exclude<
    Exclude<MaterialSelectProps<string>, 'children'>,
    'renderValue'
  > & {
    values: {
      // OptionValue: OptionLabel
      [optionValue: string]: string;
    };
  }
) => {
  const { value, values, sx, defaultValue } = props;
  if (
    !Object.keys(values).find(
      (optionValue) => optionValue === (value ?? defaultValue)
    )
  )
    throw new Error(`Value "${value ?? defaultValue}" not found in values`);

  return (
    <MaterialSelect
      {...omit(props, 'children', 'renderValue', 'values', 'sx')}
      sx={{
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': stylesObject.focused,
        '&.Mui-focused .MuiOutlinedInput-notchedOutline legend span': {
          ...stylesObject.legend,
          ...stylesObject.selectedLegend,
        },
        '&:not(Mui-focused) svg.MuiSvgIcon-root': {
          ...stylesObject.icon,
        },
        '&.Mui-focused svg.MuiSvgIcon-root': {
          ...stylesObject.iconSelected,
        },
        '&:not(.Mui-focused) .MuiOutlinedInput-notchedOutline legend span':
          stylesObject.legend,
        ...(sx ?? {}),
      }}
      renderValue={(selected) => {
        const displayValue = values[(selected ?? defaultValue) as string];
        return (
          <Typography className={css(styles.selected)}>
            {displayValue}
          </Typography>
        );
      }}
    >
      {Object.keys(values).map((valuesIndex) => (
        <MenuItem key={valuesIndex} value={valuesIndex}>
          {values[valuesIndex]}
        </MenuItem>
      ))}
    </MaterialSelect>
  );
};

export default Select;
