import { StyleSheet, css } from 'aphrodite';
import { Slider, SliderProps, Box, Typography } from '@mui/material';
import { noop, clamp } from 'lodash';

import type { DefaultSettings } from '../../../main/util/settings';
import { settingsStylesObject, hexToRgb } from '../../util/func';
import type { Schema } from '../../util/auxiliary';
import { useTranslation } from '../../../shared/intl';
import Theme from '../../../main/util/theme';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const themeColors = currentTheme.getColors();
const componentStyle = currentTheme.getComponentStyle('filterslider');

const stylesObject = {
  sliderObject: {
    width: '50%',
    left: '15px',
  },
  sliderRail: {
    backgroundColor: `${themeColors.white.substring(0, 7)}22`,
  },
  sliderHead: {
    color: 'white',
  },
  ...settingsStylesObject,
  ...componentStyle,
};

export const generateSliderStyles = (
  headHexColour: string,
  sliderColor: string
) => ({
  '&.MuiSlider-root': stylesObject.sliderHead,
  '&.MuiSlider-root span.MuiSlider-thumb': stylesObject.sliderHead,
  '&.MuiSlider-root span.MuiSlider-thumb:hover': {
    boxShadow: `0px 0px 0px 8px ${headHexColour}`,
  },
  '&.MuiSlider-root span.MuiSlider-thumb.Mui-active': {
    boxShadow: `0px 0px 0px 8px ${headHexColour}`,
  },
  '&.MuiSlider-root span.MuiSlider-thumb.Mui-focusVisaible': {
    boxShadow: `0px 0px 0px 8px ${headHexColour}`,
  },
  '&.MuiSlider-root span.Mui-active': stylesObject.sliderHead,
  '&.MuiSlider-root .MuiSlider-rail': stylesObject.sliderRail,
  '&.MuiSlider-root .MuiSlider-track': {
    backgroundColor: sliderColor,
    color: sliderColor,
  },
});

const styles = StyleSheet.create(stylesObject as any) as any;
const FilterSlider = (
  sliderProps: SliderProps & {
    schema: Schema;
    settings: DefaultSettings;
    setting: number;
  }
) => {
  const { t } = useTranslation();
  const { onChange = noop, schema, setting: value, settings } = sliderProps;
  const clampedValue = clamp(value, 0, 255);
  const colorConstantHex = `${themeColors.accent.substring(0, 7)}22`; // Strip off opacity that a themer might have added to their accent color
  const colorConstant = hexToRgb(themeColors.accent);
  const isEnabled: boolean = (settings.reader as DefaultSettings['reader'])
    .useCustomColorFilter;
  if (!colorConstant) throw new Error(t('colorslider_error'));

  const sliderColor = `rgba(${(clampedValue / 255) * colorConstant.r}, ${
    (clampedValue / 255) * colorConstant.g
  }, ${(clampedValue / 255) * colorConstant.b}, 1)`;
  return isEnabled ? (
    <Box className={css(styles.optionContainer)}>
      <Typography className={css(styles.optionLabel)}>
        {schema.label}
        <Typography className={css(styles.optionLabelDescription)}>
          {schema.description}
        </Typography>
      </Typography>

      <Slider
        className={css(styles.sliderObject)}
        sx={generateSliderStyles(colorConstantHex, sliderColor)}
        value={clampedValue}
        max={255}
        min={0}
        valueLabelDisplay="auto"
        onChange={(e, newValue) => onChange(newValue)}
      />
    </Box>
  ) : null;
};

export default FilterSlider;
