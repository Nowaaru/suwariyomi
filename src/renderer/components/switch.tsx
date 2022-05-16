/* eslint-disable react/jsx-props-no-spreading */
import {
  Switch as MaterialSwitch,
  SwitchProps as MaterialSwitchProps,
  Tooltip,
} from '@mui/material';
import { omit } from 'lodash';
import Theme from '../../main/util/theme';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const themeColors = currentTheme.getColors();
const componentStyle = currentTheme.getComponentStyle('switch');

const stylesObject = {
  switchTrackOn: {
    opacity: 0.6,
    backgroundColor: themeColors.accent,
  },

  switchTrackOff: {
    opacity: 0.6,
    backgroundColor: themeColors.white,
  },

  switchBase: {
    color: themeColors.white,
  },

  switchThumb: {},

  switchThumbOn: {
    color: themeColors.white,
    backgroundColor: themeColors.accent,
  },

  switchHoverOn: {
    backgroundColor: `${themeColors.accent.substring(0, 7)}22`,
  },

  switchHover: {
    backgroundColor:
      themeColors.white.length === 2
        ? themeColors.white
        : `${themeColors.white}11`,
  },

  ...componentStyle,
};

const Switch = (
  props: MaterialSwitchProps &
    Pick<Required<MaterialSwitchProps>, 'checked'> & {
      tooltipOn?: string;
      tooltipOff?: string;
    }
) => {
  const { checked, onChange, tooltipOn, tooltipOff } = props;
  return (
    <Tooltip title={checked ? tooltipOn! : tooltipOff!}>
      <MaterialSwitch
        {...omit(props, 'children', 'sx', 'tooltipOn', 'tooltipOff')}
        onChange={onChange ?? (() => {})}
        sx={{
          // Material UI is pain, part.. like, eight trillion?
          '&.MuiSwitch-root .MuiSwitch-switchBase': stylesObject.switchBase,
          '&.MuiSwitch-root .MuiSwitch-switchBase:hover':
            stylesObject.switchHover,
          '&.MuiSwitch-root .MuiSwitch-switchBase.Mui-checked:hover':
            stylesObject.switchHoverOn,
          '&.MuiSwitch-root span.MuiSwitch-track':
            (checked
              ? stylesObject.switchTrackOn
              : stylesObject.switchTrackOff) ?? {},
          '& .MuiButtonBase-root.MuiSwitch-switchBase .MuiSwitch-thumb':
            stylesObject.switchThumb,
          '& .MuiButtonBase-root.MuiSwitch-switchBase.Mui-checked .MuiSwitch-thumb':
            stylesObject.switchThumbOn,
        }}
      />
    </Tooltip>
  );
};

Switch.defaultProps = {
  tooltipOn: 'On',
  tooltipOff: 'Off',
};

export default Switch;
