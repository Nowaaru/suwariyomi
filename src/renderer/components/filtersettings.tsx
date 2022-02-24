import {
  Radio,
  Checkbox,
  Button,
  RadioGroup,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Select,
  Typography,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import React, { useState, Fragment, useCallback } from 'react';
import { css, StyleSheet } from 'aphrodite';
import propTypes from 'prop-types';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import Search from '@mui/icons-material/Search';

import type {
  SearchFilterFieldTypes,
  Selectable,
  Checkable,
  SearchFilterFieldTypeCheckbox3,
} from '../../main/sources/static/base';

type GenericSourceFilterType = {
  [key: string]: any;
};

/*
  In the filter settings, each key is a group name.
  These will be converted into headers.

  Each group will have a value which is an array of field objects.
  These will be converted into their respective type;
  for example, an object with type 'select' will be converted into a select.

  Checkboxes relate to an array type. When a checkbox is ticked,
  the value will be added to the array. When a checkbox is unticked,
  the value will be removed from the array.

  Radios relate to a single type. When a radio is selected,
  the value will be set to the selected value.

  Selects relate to a single type. When a select is selected,
  the value will be set to the selected value.
*/

const stylesObject = {
  bottomMargin: {
    marginBottom: '1rem',
  },

  FormControlLabel: {
    color: '#ffffff',
  },

  selectComponentSelected: {
    color: '#ffffff',
  },

  FormLabel: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 500,
    fontSize: '1.2rem',
    color: '#ffffff',
  },
  Red: {
    color: '#DF2935',
  },
  FilledWhite: {
    background:
      'radial-gradient(circle at center, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 50%, transparent 51%)',
  },
  Group: {
    marginBottom: '1rem',
  },
  textField: {
    width: '100%',
    backgroundColor: 'rgba(28, 27, 24, 0.2)',
    color: '#FFFFFF',
    marginBottom: '6px',
    borderRadius: '1px',
  },
  searchAdornment: {},

  muiRootFieldset: {
    borderColor: '#DF2935',
  },

  muiRootFieldsetHover: {
    borderColor: '#DF2935',
  },

  labelRootFocused: {
    color: '#FFFFFF',
  },

  outlinedLabelShrunken: {
    color: '#FFFFFF',
  },

  rootOutlinedInput: {
    color: '#FFFFFF66',
    transition: 'color 0.3s ease-in-out',
  },

  rootOutlinedInputFocused: {
    color: '#FFFFFF',
  },

  /*
          '& .MuiOutlinedInput-root.Mui-focused fieldset': {
            borderColor: '#DF2935',
          },
          '& .MuiOutlinedInput-root:hover fieldset': {
            borderColor: '#DF2935',
          },
          '& label.MuiInputLabel-root.Mui-focused': {
            color: 'white',
          },

          '& .MuiInputLabel-outlined.MuiInputLabel-shrink': {
            color: 'white',
          },

          '& .MuiOutlinedInput-root input.MuiOutlinedInput-input': {
            transition: 'color 0.3s ease-in-out',
            color: '#FFFFFF66',
          },

          '& .MuiOutlinedInput-root.Mui-focused input.MuiOutlinedInput-input': {
            color: '#FFFFFF',
          },
          */
};
const styles = StyleSheet.create(stylesObject as any) as typeof stylesObject;

const filterSettingsPropTypes = {
  filterSettings: propTypes.shape({
    fieldType: propTypes.oneOf(['checkbox', 'radio', 'select']),
    noDisplay: propTypes.bool,
    writeTo: propTypes.string,
    choices: propTypes.arrayOf(
      propTypes.shape({
        display: propTypes.string,
        value: propTypes.oneOfType([
          propTypes.string,
          propTypes.number,
          propTypes.shape({
            label: propTypes.string,
            value: propTypes.oneOfType([propTypes.string, propTypes.number]),
          }),
        ]),
      })
    ),
  }).isRequired,
  sourceFilters: propTypes.shape({
    [propTypes.string as any]: propTypes.oneOf([
      propTypes.string,
      propTypes.number,
      propTypes.arrayOf(propTypes.string),
    ]),
  }).isRequired,
  onSubmit: propTypes.func.isRequired,
};

type FilterSettingsProps = {
  filterSettings: SearchFilterFieldTypes;
  sourceFilters: GenericSourceFilterType;
  onSubmit?: (filters: GenericSourceFilterType) => void;
};

const FilterSettings = ({
  filterSettings,
  sourceFilters,
  onSubmit,
}: FilterSettingsProps) => {
  const [sourceFiltersState, setSourceFiltersState] = useState(sourceFilters);

  const handleChange = useCallback(
    (changeList: Array<[string, any]>) => {
      const currentFilters = { ...sourceFiltersState };
      changeList.forEach(([key, value]) => {
        currentFilters[key] = value;
      });
      setSourceFiltersState(currentFilters);
    },
    [setSourceFiltersState, sourceFiltersState]
  );

  const generateSettingsComponent = useCallback(
    (field: string): React.ReactElement => {
      const { fieldType, writeTo, noDisplay } = filterSettings[field];
      const fieldChoices = filterSettings[field].choices;

      if (!fieldChoices)
        throw new Error(
          `No options for ${
            field ? String(field) : '<no name>'
          } in field ${field}.`
        );

      // TODO: Instead of repetitively making <divs> with <FormGroup>s, make one big div with <FormGroup>s
      // TODO: Change all "!noDisplay"s to noDisplay and swap the logic
      // TODO: Implement a switch type using MaterialUI's useSwitch hook
      switch (fieldType) {
        case 'checkbox3':
          return (
            <FormGroup>
              <FormLabel className={css(styles.FormLabel)}>{field}</FormLabel>
              {(fieldChoices as Checkable[]).map((choice: Checkable) => {
                const { display, value } = choice;
                const { disallowedWriteTo } = filterSettings[
                  field
                ] as SearchFilterFieldTypeCheckbox3;
                const isAllowed = sourceFiltersState[writeTo].includes(value);
                const isDisallowed =
                  sourceFiltersState[disallowedWriteTo].includes(value);

                return (
                  <FormControlLabel
                    key={value}
                    className={css(styles.FormControlLabel)}
                    control={
                      <Checkbox
                        className={
                          isAllowed || isDisallowed
                            ? css(styles.Red)
                            : css(styles.FormControlLabel)
                        }
                        checked={isAllowed || isDisallowed}
                        checkedIcon={
                          isAllowed ? (
                            <CheckBoxIcon
                              className={css(styles.Red, styles.FilledWhite)}
                            />
                          ) : (
                            <IndeterminateCheckBoxIcon
                              className={css(styles.Red, styles.FilledWhite)}
                            />
                          )
                        }
                        icon={
                          <CheckBoxOutlineBlankIcon
                            className={css(styles.Red)}
                          />
                        }
                        onChange={() => {
                          // If checked, add to the array. This means it's allowed.
                          // If unchecked, remove from the checked array and add to the unchecked array. This means it's disallowed.
                          // If unchecked and not in the unchecked array, add to the checked array.
                          const allowedArray = [...sourceFiltersState[writeTo]];
                          const disallowedArray = [
                            ...sourceFiltersState[disallowedWriteTo],
                          ];
                          if (isAllowed) {
                            allowedArray.splice(allowedArray.indexOf(value), 1);
                            disallowedArray.push(value);
                          } else if (isDisallowed) {
                            disallowedArray.splice(
                              disallowedArray.indexOf(value),
                              1
                            );
                          } else allowedArray.push(value);
                          return handleChange([
                            [writeTo, allowedArray],
                            [disallowedWriteTo, disallowedArray],
                          ]);
                        }}
                        color="primary"
                        inputProps={{ 'aria-label': `${display}` }}
                      />
                    }
                    label={display}
                  />
                );
              })}
            </FormGroup>
          );
        case 'checkbox':
          return (
            <FormGroup>
              {!noDisplay ? (
                <FormLabel className={css(styles.FormLabel)}>{field}</FormLabel>
              ) : null}
              {(fieldChoices as Checkable[]).map((choice: Checkable) => {
                return (
                  <FormControlLabel
                    key={choice.display}
                    className={css(styles.FormControlLabel)}
                    control={
                      <Checkbox
                        className={
                          sourceFiltersState[writeTo]?.includes(choice.value)
                            ? css(styles.Red)
                            : css(styles.FormControlLabel)
                        }
                        checkedIcon={
                          <CheckBoxIcon
                            className={css(styles.Red, styles.FilledWhite)}
                          />
                        }
                        icon={
                          <CheckBoxOutlineBlankIcon
                            className={css(styles.Red)}
                          />
                        }
                        checked={sourceFiltersState[writeTo]?.includes(
                          choice.value
                        )}
                        onChange={() => {
                          const newValue = [...sourceFiltersState[writeTo]];
                          if (newValue.includes(choice.value)) {
                            newValue.splice(newValue.indexOf(choice.value), 1);
                          } else {
                            newValue.push(choice.value);
                          }

                          handleChange([[writeTo, newValue]]);
                        }}
                      />
                    }
                    label={choice.display}
                  />
                );
              })}
            </FormGroup>
          );
        case 'radio':
          return (
            <RadioGroup>
              {!noDisplay ? (
                <FormLabel className={css(styles.FormLabel)}>{field}</FormLabel>
              ) : null}
              {(fieldChoices as Selectable[]).map((choice: Selectable) => {
                return (
                  <FormControlLabel
                    key={choice.label}
                    className={css(styles.FormControlLabel)}
                    control={
                      <Radio
                        checked={sourceFiltersState[writeTo] === choice.value}
                        onChange={() => {
                          handleChange([[writeTo, choice.value]]);
                        }}
                      />
                    }
                    label={choice.label}
                  />
                );
              })}
            </RadioGroup>
          );
        case 'select':
          return (
            <FormGroup>
              {!noDisplay ? (
                <FormLabel
                  className={css(styles.FormLabel, styles.bottomMargin)}
                >
                  {field}
                </FormLabel>
              ) : null}
              <Select
                variant="standard"
                value={sourceFiltersState[writeTo]}
                onChange={(event) => {
                  handleChange([[writeTo, event.target.value]]);
                }}
                renderValue={(selected) => {
                  const selectedChoice = (fieldChoices as Selectable[]).find(
                    (choice) => choice.value === selected
                  );
                  return selectedChoice ? (
                    <Typography className={css(styles.selectComponentSelected)}>
                      {selectedChoice.label}
                    </Typography>
                  ) : (
                    selected
                  );
                }}
              >
                {(fieldChoices as Selectable[]).map((choice: Selectable) => {
                  return (
                    <MenuItem key={choice.label} value={choice.value}>
                      {choice.label}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormGroup>
          );
          break;
        default:
          throw new Error(`Unsupported field type ${fieldType} for ${field}.`);
      }
    },
    [sourceFiltersState, filterSettings, handleChange]
  );

  // Convert each filter field to a component
  const filterFields = Object.keys(filterSettings).map(
    generateSettingsComponent
  );

  return (
    <>
      <TextField
        className={css(styles.textField)}
        label="Search"
        value={sourceFiltersState.query}
        onChange={(event) => {
          handleChange([['query', event.target.value]]);
        }}
        sx={{
          '& .MuiOutlinedInput-root.Mui-focused fieldset':
            stylesObject.muiRootFieldset,
          '& .MuiOutlinedInput-root:hover fieldset':
            stylesObject.muiRootFieldsetHover,
          '& label.MuiInputLabel-root.Mui-focused':
            stylesObject.labelRootFocused,

          '& .MuiInputLabel-outlined.MuiInputLabel-shrink':
            stylesObject.outlinedLabelShrunken,

          '& .MuiOutlinedInput-root input.MuiOutlinedInput-input':
            stylesObject.rootOutlinedInput,
          '& .MuiOutlinedInput-root.Mui-focused input.MuiOutlinedInput-input':
            stylesObject.rootOutlinedInputFocused,
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search className={css(styles.Red, styles.searchAdornment)} />
            </InputAdornment>
          ),
        }}
      />
      {filterFields.map((x, i) => (
        <div className={css(styles.Group)} key={`${i + 1}-container-div`}>
          {x}
        </div>
      ))}
      <Button
        variant="contained"
        color="primary"
        size="large"
        sx={{
          marginTop: '-0.5rem',
          marginBottom: '2rem',
        }}
        onClick={() => {
          if (onSubmit)
            onSubmit({
              ...sourceFiltersState,
              query: sourceFiltersState.query?.toLowerCase(),
            });
        }}
      >
        Apply
      </Button>
    </>
  );
};

FilterSettings.propTypes = filterSettingsPropTypes;

export default FilterSettings;
