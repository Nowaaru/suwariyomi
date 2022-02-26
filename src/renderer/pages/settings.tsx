import { useState, useEffect } from 'react';
import { StyleSheet, css } from 'aphrodite';
import {
  Tab,
  Tabs,
  Box,
  IconButton,
  Tooltip,
  Typography,
  Button,
} from '@mui/material';

import CodeIcon from '@mui/icons-material/Code';
import SecurityIcon from '@mui/icons-material/Security';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import CollectionsBookmarkSharpIcon from '@mui/icons-material/CollectionsBookmarkSharp';
import SettingsBackupRestoreTwoToneIcon from '@mui/icons-material/SettingsBackupRestoreTwoTone';

import { useNavigate } from 'react-router-dom';
import { mapValues } from 'lodash';

import type { DefaultSettings } from '../../main/util/settings';
import { settingsSchemata } from '../util/auxiliary';

import Select from '../components/select';
import Switch from '../components/switch';

const stylesObject = {
  container: {
    width: '96%',
    height: '100%',
    position: 'relative',
    padding: '0px 12px 12px 12px',
  },

  optionContainer: {
    '::after': {
      content: '""',
      display: 'block',
      height: '1px',
      // left to right white gradient
      background:
        'linear-gradient(to left, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1))',
      width: '80%',
      marginTop: '8px',
      marginBottom: '16px',
    },
    position: 'relative',
    width: '100%',
    height: 'fit-content',
    overflowY: 'auto',
  },

  optionLabel: {
    fontFamily: '"Roboto", "Poppins", "Helvetica", "Arial", sans-serif',
    fontSize: '1.25rem',
    fontWeight: 'normal',
    lineHeight: '1.5',
    color: '#FFFFFF',
    verticalAlign: 'middle',
    minWidth: '70%',
    maxWidth: '70%',
    display: 'inline-flex',
    flexDirection: 'column',
  },

  optionLabelDescription: {
    display: 'inline-block',
    fontFamily: '"Roboto", "Poppins", "Helvetica", "Arial", sans-serif',
    fontSize: '0.7rem',
    fontWeight: '200',
    marginTop: '4px',
  },

  tabs: {
    width: '165px',
    display: 'inline-flex',
    marginBottom: '12px',
  },

  tab: {
    color: '#FFFFFF',
    marginRight: '12px',
    padding: '6px',
    boxSizing: 'border-box',
    width: '165px',
    height: '36px',
  },

  tabSelected: {
    color: '#DF2935',
  },

  settingContainer: {
    float: 'right',
    width: 'calc(100% - 165px)',
    boxSizing: 'border-box',
    marginTop: '48px',
    paddingLeft: '24px',
    height: '100%',
    overflowY: 'auto',
    paddingBottom: '64px',
    '::-webkit-scrollbar': {
      width: '4px',
    },
    '::-webkit-scrollbar-thumb': {
      background: '#FFFFFF',
      ':hover': {
        background: '#DF2935',
      },
    },
  },

  backButton: {
    position: 'absolute',
    marginLeft: '12px',
    color: 'white',
    zIndex: 1600,
    top: '12px',
    left: 0,
  },

  selectComponentSelected: {
    color: '#DF2935',
    // backgroundColor: '#FFFFFF',
  },

  resetButton: {
    border: '1px solid #DF2935',
    color: '#DF2935',
    minWidth: '150px',
    width: 'fit-content',
    height: '42px',
    ':hover': {
      backgroundColor: '#DF2935',
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
  },
};

const categoryIcons: {
  [key in keyof DefaultSettings]: JSX.Element;
} = {
  general: <TuneRoundedIcon />,
  appearance: <PaletteOutlinedIcon />,
  library: <CollectionsBookmarkSharpIcon />,
  reader: <MenuBookRoundedIcon />,
  downloads: <DownloadRoundedIcon />,
  browse: <ExploreOutlinedIcon />,
  tracking: <AutorenewOutlinedIcon />,
  backup: <SettingsBackupRestoreTwoToneIcon />,
  security: <SecurityIcon />,
  advanced: <CodeIcon />,
};

// i.e., SettingsGeneral.tsx should only update when the General settings change, and SettingsReader.tsx should
// only update when the Reader settings change
const settingsResetText = [
  'Reset',
  'Are you sure?',
  'Really really sure?',
  'Actually?',
  'Okay...',
  'No going back now!',
];
const Settings = () => {
  const [settings, setSettings] = useState(window.electron.settings.getAll());
  const [settingsLocation, setSettingsLocation] =
    useState<keyof DefaultSettings>('general');
  const [timesClicked, setTimesClicked] = useState(0);
  const Navigate = useNavigate();

  useEffect(() => {
    window.electron.settings.overwrite(settings);
  }, [settings]);

  useEffect(() => {
    setTimesClicked(0);
  }, [settingsLocation]);

  // TODO: Cross-check the settings schema with the actual settings
  // to ensure that the settings are valid and that there are
  // no settings that are not in the schema.

  // @ts-ignore Aphrodite sucks.
  const styles = StyleSheet.create(stylesObject);
  return (
    <div className={css(styles.container)}>
      <Tooltip title="Back">
        <IconButton
          className={css(styles.backButton)}
          onClick={() => Navigate('/')}
          size="large"
        >
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>
      <Tabs
        orientation="vertical"
        scrollButtons
        value={settingsLocation}
        variant="scrollable"
        onChange={(_, value) => setSettingsLocation(value)}
        className={css(styles.tabs)}
        sx={{
          '.MuiTabs-indicator': {
            backgroundColor: '#FFFFFF',
          },
        }}
      >
        {(Object.keys(settings) as Array<keyof DefaultSettings>).map((key) => {
          return (
            <Tab
              key={key}
              value={key}
              label={key}
              sx={{
                // On selected
                '&.Mui-selected': stylesObject.tabSelected,
                borderRight: 1,
                borderColor: '#DF2935',
              }}
              icon={categoryIcons[key] ?? undefined}
              iconPosition="start"
              className={css(styles.tab)}
            />
          );
        })}
      </Tabs>
      <div className={css(styles.settingContainer)}>
        {[
          ...Object.values(
            mapValues(settingsSchemata[settingsLocation], (value, key) => {
              const {
                type,
                label,
                description,
                options,
                default: defaultValue,
              } = value;

              const serializedOptions: {
                [optionValue: string]: string;
              } = {};

              if (options) {
                (options as { label: string; value: string }[]).forEach(
                  (option) => {
                    serializedOptions[option.value] = option.label;
                  }
                );
              }

              // @ts-ignore Typescript is a godawful language.
              const currentValue = settings[settingsLocation][key];
              let elementToDisplay: JSX.Element | null = null;
              switch (type) {
                case 'select':
                  elementToDisplay = (
                    <Select
                      value={String(currentValue ?? defaultValue)}
                      values={serializedOptions}
                      onChange={(event) => {
                        setSettings((prevSettings) => {
                          const newSettings = {
                            ...prevSettings,
                            [settingsLocation]: {
                              ...prevSettings[settingsLocation],
                              [key]: event.target?.value ?? defaultValue,
                            },
                          };

                          return newSettings;
                        });
                      }}
                    />
                  );
                  break;
                case 'switch':
                  elementToDisplay = (
                    <Switch
                      checked={currentValue ?? defaultValue}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>,
                        isChecked: boolean
                      ) => {
                        setSettings((prevSettings) => {
                          const newSettings = {
                            ...prevSettings,
                            [settingsLocation]: {
                              ...prevSettings[settingsLocation],
                              [key]: isChecked,
                            },
                          };

                          return newSettings;
                        });
                      }}
                    />
                  );
                  break;
                default:
                  elementToDisplay = null;
                  break;
              }

              return (
                <Box key={key} className={css(styles.optionContainer)}>
                  <Typography className={css(styles.optionLabel)}>
                    {label}
                    <Typography className={css(styles.optionLabelDescription)}>
                      {description}
                    </Typography>
                  </Typography>
                  {elementToDisplay}
                </Box>
              );
            })
          ),
          settingsLocation === 'advanced' && (
            <Box className={css(styles.optionContainer)}>
              <Typography className={css(styles.optionLabel)}>
                Reset to Default Settings
                <Typography className={css(styles.optionLabelDescription)}>
                  {`This can't be undone! If you want to proceed, click the button ${
                    settingsResetText.length - timesClicked
                  } time${
                    settingsResetText.length - timesClicked === 1 ? '' : 's'
                  }.`}
                </Typography>
              </Typography>
              <Button
                variant="outlined"
                className={css(styles.resetButton)}
                color="secondary"
                onClick={() => {
                  if (timesClicked >= settingsResetText.length - 1) {
                    window.electron.settings.flush();
                    setSettings(window.electron.settings.getAll());
                    setTimesClicked(0);
                  } else {
                    setTimesClicked(timesClicked + 1);
                  }
                }}
              >
                {settingsResetText[timesClicked]}
              </Button>
            </Box>
          ),
        ]}
      </div>
    </div>
  );
};

export default Settings;
