/* eslint-disable react/jsx-props-no-spreading */
import {
  TextField as MaterialTextField,
  TextFieldProps as MaterialTextFieldProps,
} from '@mui/material';

const TextField = (props: MaterialTextFieldProps) => {
  const { sx } = props;
  const textFieldRoot = `&.MuiTextField-root`;
  const textFieldInput = `${textFieldRoot} .MuiInputBase-input`;
  const textFieldSetFocused = `${textFieldRoot} .MuiOutlinedInput-root.Mui-focused fieldset`;

  const textFieldLabelFocused = `${textFieldRoot} label.MuiInputLabel-root.Mui-focused`;
  const textFieldLabel = `${textFieldRoot} label.MuiInputLabel-root`;

  console.log(textFieldLabelFocused);
  return (
    <MaterialTextField
      {...{
        ...props,
        sx: {
          [textFieldInput]: {
            color: 'white',
          },
          [textFieldSetFocused]: {
            borderColor: '#DF2935',
          },
          [textFieldLabelFocused]: {
            color: '#DF2935',
          },
          [textFieldLabel]: {
            color: 'white',
          },
          ...(sx ?? {}),
        },
      }}
    />
  );
};

export default TextField;
