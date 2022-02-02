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
} from '@mui/material';
import React, { useState, Fragment, useCallback } from 'react';
import { css, StyleSheet } from 'aphrodite';
import propTypes from 'prop-types';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

import type {
  SearchFilterFieldTypes,
  Selectable,
  Checkable,
  SearchFilterFieldTypeCheckbox3,
} from '../../sources/static/base';

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

const styles = StyleSheet.create({
  bottomMargin: {
    marginBottom: '1rem',
  },

  FormControlLabel: {
    color: '#ffffff',
  },

  White: {
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
});

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

  const handleChange = (field: string, value: any) => {
    setSourceFiltersState((previousValue) => {
      return {
        ...previousValue,
        [field]: value,
      };
    });
  };

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

                console.log(isDisallowed);
                return (
                  <FormControlLabel
                    key={value}
                    control={
                      <Checkbox
                        checked={isAllowed || isDisallowed}
                        checkedIcon={
                          isAllowed ? (
                            <CheckBoxIcon />
                          ) : (
                            <IndeterminateCheckBoxIcon />
                          )
                        }
                        icon={<CheckBoxOutlineBlankIcon />}
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

                            handleChange(disallowedWriteTo, disallowedArray);
                          } else if (isDisallowed) {
                            disallowedArray.splice(
                              disallowedArray.indexOf(value),
                              1
                            );
                          } else allowedArray.push(value);
                          return handleChange(
                            isAllowed || (!isDisallowed && !isAllowed)
                              ? writeTo
                              : disallowedWriteTo,
                            allowedArray
                          );
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

                          handleChange(writeTo, newValue);
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
                          handleChange(writeTo, choice.value);
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
                  handleChange(writeTo, event.target.value);
                }}
                renderValue={(selected) => {
                  const selectedChoice = (fieldChoices as Selectable[]).find(
                    (choice) => choice.value === selected
                  );
                  return selectedChoice ? (
                    <Typography className={css(styles.White)}>
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
    [sourceFiltersState, filterSettings]
  );

  // Convert each filter field to a component
  const filterFields = Object.keys(filterSettings).map(
    generateSettingsComponent
  );

  return (
    <>
      {filterFields.map((x) => (
        <div className={css(styles.Group)}>{x}</div>
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
          if (onSubmit) onSubmit(sourceFiltersState);
        }}
      >
        Apply
      </Button>
    </>
  );
};

FilterSettings.propTypes = filterSettingsPropTypes;

export default FilterSettings;
