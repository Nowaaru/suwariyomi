import {
  Radio,
  Switch,
  Select,
  Checkbox,
  Button,
  MenuItem,
  RadioGroup,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
} from '@mui/material';
import { useState, useEffect, Fragment } from 'react';
import { css, StyleSheet } from 'aphrodite';
import propTypes from 'prop-types';
import type {
  SearchFilterFieldTypes,
  SearchFilterFieldTypeRadio,
  SearchFilterFieldTypeSelect,
  Selectable,
  Option,
  Checkable,
} from '../../sources/static/base';
import SourceBase from '../../sources/static/base';

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
  FormControlLabel: {
    color: '#ffffff',
  },
  FormLabel: {
    color: '#ffffff',
  },
});

const filterSettingsPropTypes = {
  filterSettings: propTypes.shape({
    fieldType: propTypes.oneOf(['checkbox', 'radio', 'select']),
    writeTo: propTypes.string,
    choices: propTypes.arrayOf(
      propTypes.oneOf([
        propTypes.shape({
          display: propTypes.string,
          value: propTypes.string,
        }),
        propTypes.shape({
          display: propTypes.string,
          value: propTypes.number,
        }),
      ])
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

  // Convert each filter field to a component
  const filterFields = Object.keys(filterSettings).map((field) => {
    const { fieldType, writeTo } = filterSettings[field];
    const fieldChoices = filterSettings[field].choices;

    if (!fieldChoices)
      throw new Error(
        `No options for ${
          field ? String(field) : '<no name>'
        } in field ${field}.`
      );

    if (fieldType) {
      return (
        <div>
          <FormGroup>
            <FormLabel className={css(styles.FormLabel)}>{field}</FormLabel>
            {(fieldChoices as Checkable[]).map((choice: Checkable) => {
              return (
                <FormControlLabel
                  key={choice.display}
                  className={css(styles.FormControlLabel)}
                  control={
                    <Checkbox
                      defaultChecked={sourceFiltersState[writeTo]?.includes(
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
        </div>
      );
    }

    return null;
  });
  return (
    <>
      {filterFields}
      <Button
        variant="contained"
        color="primary"
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
