import { StyleSheet, css } from 'aphrodite';
import { Slider, SliderProps, Box, Typography } from '@mui/material';
import { noop, clamp } from 'lodash';

import { settingsStylesObject } from '../../util/func';
import type { Schema } from '../../util/auxiliary';

const stylesObject = {
  sliderObject: {
    width: '50%',
    left: '15px',
  },
  sliderRail: {
    backgroundColor: '#FFFFFF44',
  },
  sliderHead: {
    color: 'white',
  },
  ...settingsStylesObject,
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const styles = StyleSheet.create(stylesObject as any) as any;
const FilterSlider = (
  sliderProps: SliderProps & {
    schema: Schema;
    setting: number;
  }
) => {
  const { onChange = noop, schema, setting: value } = sliderProps;
  const clampedValue = clamp(value, 0, 255);
  const colorConstantHex = `${'#DF2935'.substring(0, 7)}22`; // Strip off opacity that a themer might have added to their accent color
  const colorConstant = hexToRgb('#DF2935');
  if (!colorConstant) throw new Error('Could not parse color constant');

  const sliderColor = `rgba(${(clampedValue / 255) * colorConstant.r}, ${
    (clampedValue / 255) * colorConstant.g
  }, ${(clampedValue / 255) * colorConstant.b}, 1)`;
  return (
    <Box className={css(styles.optionContainer)}>
      <Typography className={css(styles.optionLabel)}>
        {schema.label}
        <Typography className={css(styles.optionLabelDescription)}>
          {schema.description}
        </Typography>
      </Typography>

      <Slider
        className={css(styles.sliderObject)}
        sx={{
          '&.MuiSlider-root': styles.sliderHead,
          '&.MuiSlider-root span.MuiSlider-thumb': stylesObject.sliderHead,
          '&.MuiSlider-root span.MuiSlider-thumb:hover': {
            boxShadow: `0px 0px 0px 8px ${colorConstantHex}`,
          },
          '&.MuiSlider-root span.MuiSlider-thumb.Mui-active': {
            boxShadow: `0px 0px 0px 8px ${colorConstantHex}`,
          },
          '&.MuiSlider-root span.MuiSlider-thumb.Mui-focusVisaible': {
            boxShadow: `0px 0px 0px 8px ${colorConstantHex}`,
          },
          '&.MuiSlider-root span.Mui-active': stylesObject.sliderHead,
          '&.MuiSlider-root .MuiSlider-rail': stylesObject.sliderRail,
          '&.MuiSlider-root .MuiSlider-track': {
            backgroundColor: sliderColor,
            color: sliderColor,
          },
        }}
        value={clampedValue}
        max={255}
        min={0}
        valueLabelDisplay="auto"
        onChange={(e, newValue) => onChange(newValue)}
      />
    </Box>
  );
};

export default FilterSlider;
