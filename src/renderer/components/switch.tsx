/* eslint-disable react/jsx-props-no-spreading */
import {
  Switch as MaterialSwitch,
  SwitchProps as MaterialSwitchProps,
  Tooltip,
} from '@mui/material';
import { omit } from 'lodash';

const stylesObject = {
  switchTrackOn: {
    opacity: 0.6,
    backgroundColor: '#DF2935',
  },

  switchTrackOff: {
    opacity: 0.6,
    backgroundColor: '#FFFFFF',
  },

  switchBase: {
    color: 'white',
  },

  switchThumb: {},

  switchThumbOn: {
    color: 'white',
    backgroundColor: '#DF2935',
  },

  switchHoverOn: {
    backgroundColor: '#DF293522',
  },

  switchHover: {
    backgroundColor: '#FFFFFF11',
  },
};

const Switch = (
  props: MaterialSwitchProps & Pick<Required<MaterialSwitchProps>, 'checked'>
) => {
  const { checked, onChange } = props;
  return (
    <Tooltip title={checked ? 'On' : 'Off'}>
      <MaterialSwitch
        {...omit(props, 'children', 'sx')}
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

export default Switch;
