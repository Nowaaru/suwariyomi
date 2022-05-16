/* eslint-disable react/jsx-props-no-spreading */
import {
  TextField as MaterialTextField,
  TextFieldProps as MaterialTextFieldProps,
} from '@mui/material';

import Theme from '../../main/util/theme';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const themeColors = currentTheme.getColors();
const componentStyle = currentTheme.getComponentStyle('textfield');

const TextField = (props: MaterialTextFieldProps) => {
  const { sx } = props;
  const textFieldRoot = `&.MuiTextField-root`;
  const textFieldInput = `${textFieldRoot} .MuiInputBase-input`;
  const textFieldSetFocused = `${textFieldRoot} .MuiOutlinedInput-root.Mui-focused fieldset`;

  const textFieldLabelFocused = `${textFieldRoot} label.MuiInputLabel-root.Mui-focused`;
  const textFieldLabel = `${textFieldRoot} label.MuiInputLabel-root`;

  return (
    <MaterialTextField
      {...{
        ...props,
        sx: {
          [textFieldInput]: {
            color: themeColors.white,
            textAlign: 'center',
          },
          [textFieldSetFocused]: {
            borderColor: themeColors.accent,
          },
          [textFieldLabelFocused]: {
            color: themeColors.accent,
          },
          [textFieldLabel]: {
            color: themeColors.white,
          },
          ...(sx ?? {}),
          ...componentStyle,
        },
      }}
    />
  );
};

export default TextField;
