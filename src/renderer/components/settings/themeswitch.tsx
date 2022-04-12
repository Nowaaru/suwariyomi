/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable react/jsx-props-no-spreading */

import { Box, Typography, UseSwitchProps } from '@mui/material';

import { StyleSheet, css } from 'aphrodite';
import { noop } from 'lodash';
import React from 'react';
import ModeNightIcon from '@mui/icons-material/ModeNight';
import ModeDayIcon from '@mui/icons-material/LightMode';

import { settingsStylesObject } from '../../util/func';
import type { Schema } from '../../util/auxiliary';
import Switch from '../switch';

const styles = StyleSheet.create({
  switchContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  switchIcon: {
    color: 'white',
    transition: 'color 0.2s ease-in-out',
    position: 'relative',
    top: '7px',
  },
  dayIcon: {
    marginLeft: '-4px',
  },
  nightIcon: {
    marginRight: '-4px',
  },
  iconOff: {
    color: '#FFFFFF00',
  },
  ...settingsStylesObject,
} as any) as any;

const ThemeSwitch = (
  switchProps: UseSwitchProps & {
    schema: Schema;
    setting: string;
  }
) => {
  const { onChange = noop, schema, setting } = switchProps;
  const checked = setting === 'dark';

  return (
    <Box className={css(styles.optionContainer)}>
      <Typography className={css(styles.optionLabel)}>
        {schema.label}
        <Typography className={css(styles.optionLabelDescription)}>
          {schema.description}
        </Typography>
      </Typography>
      <ModeNightIcon
        className={css(
          styles.switchIcon,
          styles.nightIcon,
          checked && styles.iconOff
        )}
      />
      <Switch
        checked={checked}
        onChange={() => onChange(checked ? 'light' : 'dark')}
        tooltipOff="Dark Mode"
        tooltipOn="Light Mode"
      />
      <ModeDayIcon
        className={css(
          styles.switchIcon,
          styles.dayIcon,
          !checked && styles.iconOff
        )}
      />
    </Box>
  );
};

export default ThemeSwitch;
