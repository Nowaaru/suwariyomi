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
import Theme from '../../../main/util/theme';
import { useTranslation } from '../../../shared/intl';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);
const componentStyle = currentTheme.getComponentStyle('themeswitch');
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
    color: 'transparent',
  },
  ...settingsStylesObject,
  ...componentStyle,
} as any) as any;

const ThemeSwitch = (
  switchProps: UseSwitchProps & {
    schema: Schema;
    setting: string;
  }
) => {
  const { t } = useTranslation();
  const { onChange = noop, schema, setting } = switchProps;
  const checked = setting === 'light';

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
        onChange={() => onChange(checked ? 'dark' : 'light')}
        tooltipOff={t('themeswitch_darkmode')}
        tooltipOn={t('themeswitch_lightmode')}
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
