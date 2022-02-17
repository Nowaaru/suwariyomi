import { useState } from 'react';
import { StyleSheet, css } from 'aphrodite';
import {
  Tab,
  Tabs,
  Box,
  IconButton,
  Tooltip,
  MenuItem,
  Typography,
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

import Select from '../components/select';
import Switch from '../components/switch';

const defaultTestSettings = {
  // The default settings for the application
  general: {
    locale: 'en',
    dateFormat: 'MM/DD/YYYY',
    autoUpdate: true,
  },
  library: {
    refreshCovers: false,
    ignoreArticles: false,
    searchSuggestions: false,
    updateOngoingManga: false,
  },
  appearance: {
    theme: 'dark',
  },
  reader: {
    skipChaptersOfDifferentGroup: false,
    skipChaptersMarkedRead: false,
    readingMode: 'right-to-left',
    navLayoutPaged: 'right-to-left',
    invertTappingPaged: false,
    scaleTypePaged: 'fit-screen',
    cropBordersPaged: false,
    pageLayoutPaged: 'single-page',
    zoomStartPosition: 'automatic',
    navLayoutWebtoon: 'top-to-bottom',
    invertTappingWebtoon: false,
    cropBordersWebtoon: false,
    sidePaddingWebtoon: 'none',
    pageLayoutWebtoon: 'single-page',
    invertDoublePagesWebtoon: false,
    allowZoomOutWebtoon: false,
  },
  downloads: {
    location: '/downloads',
    saveChaptersAsCBZ: false,
    removeWhenMarkedRead: false,
    removeAfterRead: 'never', // 0 = never; 1 = last read chapter; 2 = second to last read chapter; 3 = third to last read chapter, so on...
    downloadNewChapters: false,
    deleteRemovedChapters: false, // Delete downloaded chapters if the source has removed the chapter from the website
  },
  browse: {
    checkForUpdates: true,
    onlySearchPinned: false,
    showNSFWSources: true,
  },
  tracking: {
    syncChaptersAfterReading: true,
    trackWhenAddingToLibrary: false,
  },
  backup: {},
  security: {},
  advanced: {
    sendCrashReports: true,
  },
};
const settingsSchemata: {
  [settingsContainer in keyof typeof defaultTestSettings]: {
    [containerKey in keyof typeof defaultTestSettings[settingsContainer]]: {
      type: 'select' | 'switch' | 'switch' | 'managed'; // where Managed means that the component is provided by the developer and not the app
      label?: string;
      description?: string;
      default?: any;
      options?: {
        label: string;
        value: any;
      }[];
      optionsFunc?: () => any[];
    };
  };
} = {
  general: {
    locale: {
      type: 'select',
      label: 'Language',
      description: 'The language to use for the application',
      default: 'en',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Spanish', value: 'es' },
        { label: 'Japanese', value: 'ja' },
      ],
    },
    dateFormat: {
      type: 'select',
      label: 'Date Format',
      description: 'The format to use for dates',
      default: 'MM/DD/YYYY',
      options: [
        { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
        { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
        { label: 'YYYY/MM/DD', value: 'YYYY/MM/DD' },
      ],
    },
    autoUpdate: {
      label: 'Auto Update',
      description: 'Automatically check for updates to the application',
      type: 'switch',
      default: true,
    },
  },
  library: {
    refreshCovers: {
      type: 'switch',
      label: 'Refresh Covers',
      description: 'When updating, also fetch the latest covers of the manga.',
      default: false,
    },
    ignoreArticles: {
      type: 'switch',
      label: 'Ignore Articles When Searching',
      description:
        'When searching, ignore articles (the, an, a) when searching for manga.',
      default: false,
    },
    searchSuggestions: {
      type: 'switch',
      label: 'Show Search Suggestions',
      description:
        'Show search suggestions when searching for manga. You can press TAB to fill in the search field.',
      default: false,
    },
    updateOngoingManga: {
      type: 'switch',
      label: 'Only Update Ongoing Manga',
      description: 'Only update ongoing manga when updating the library.',
      default: false,
    },
  },
  appearance: {
    theme: {
      type: 'managed',
      label: 'Theme',
      description: 'The look and feel of the application.',
    },
  },
  reader: {
    skipChaptersOfDifferentGroup: {
      type: 'switch',
      label: 'Skip Chapters of Different Group',
      description:
        'If the next chapter has the same chapter number but a different group/language, skip it.',
      default: false,
    },
    skipChaptersMarkedRead: {
      type: 'switch',
      label: 'Skip Chapters Marked Read',
      description: 'If the next chapter is marked read, skip it.',
      default: false,
    },
    readingMode: {
      type: 'select',
      label: 'Reading Mode',
      description: 'The way the manga is read.',
      default: 'right-to-left',
      options: [
        { label: 'Right to Left', value: 'right-to-left' },
        { label: 'Left to Right', value: 'left-to-right' },
      ],
    },
    navLayoutPaged: {
      type: 'select',
      label: 'Navigation Layout',
      description:
        'Where you need to tap to navigate to the next/previous page.',
      default: 'top-to-bottom',
      options: [
        { label: 'Left To Right', value: 'left-to-right' },
        { label: 'Right To Left', value: 'right-to-left' },
        { label: 'Top To Bottom', value: 'top-to-bottom' },
        { label: 'Bottom To Top', value: 'bottom-to-top' },
        { label: 'Kindle', value: 'kindle' },
        { label: 'L-Shaped', value: 'l-shaped' },
        { label: 'Edge', value: 'edge' },
        { label: 'None', value: 'none' },
      ],
    },
    invertTappingPaged: {
      type: 'switch',
      label: 'Invert Tapping',
      description:
        'Invert the way you tap to navigate to the next/previous page.',
      default: false,
    },
    scaleTypePaged: {
      type: 'select',
      label: 'Scale Type',
      description: 'The way the page is scaled.',
      default: 'fit-screen',
      options: [
        { label: 'Fit Screen', value: 'fit-screen' },
        { label: 'Fit Width', value: 'fit-width' },
        { label: 'Fit Height', value: 'fit-height' },
        { label: 'Fit Content', value: 'fit-content' },
      ],
    },
    cropBordersPaged: {
      type: 'switch',
      label: 'Crop Borders',
      description: 'Crop the borders of the pages.',
      default: false,
    },
    pageLayoutPaged: {
      type: 'select',
      label: 'Page Layout',
      description: 'The way the pages are laid out.',
      default: 'single-page',
      options: [
        { label: 'Single Page', value: 'single-page' },
        { label: 'Double Page', value: 'double-page' },
      ],
    },
    zoomStartPosition: {
      type: 'select',
      label: 'Zoom Start Position',
      description: 'The position to start the zoom at.',
      default: 'automatic',
      options: [
        { label: 'Automatic', value: 'automatic' },
        { label: 'Fit Screen', value: 'fit-screen' },
        { label: 'Fit Width', value: 'fit-width' },
        { label: 'Fit Height', value: 'fit-height' },
        { label: 'Fit Content', value: 'fit-content' },
      ],
    },
    navLayoutWebtoon: {
      type: 'select',
      label: 'Page Layout (Webtoon)',
      description:
        'Where you need to tap to navigate to the next/previous page.',
      default: 'right-to-left',
      options: [
        { label: 'Left To Right', value: 'left-to-right' },
        { label: 'Right To Left', value: 'right-to-left' },
        { label: 'Top To Bottom', value: 'top-to-bottom' },
        { label: 'Bottom To Top', value: 'bottom-to-top' },
        { label: 'Kindle', value: 'kindle' },
        { label: 'L-Shaped', value: 'l-shaped' },
        { label: 'Edge', value: 'edge' },
        { label: 'None', value: 'none' },
      ],
    },
    invertTappingWebtoon: {
      type: 'switch',
      label: 'Invert Tapping (Webtoon)',
      description:
        'Invert the way you tap to navigate to the next/previous page.',
      default: false,
    },
    cropBordersWebtoon: {
      type: 'switch',
      label: 'Crop Borders (Webtoon)',
      description: 'Crop the borders of the pages.',
      default: false,
    },
    pageLayoutWebtoon: {
      type: 'select',
      label: 'Page Layout (Webtoon)',
      description: 'The way the pages are laid out.',
      default: 'single-page',
      options: [
        { label: 'Single Page', value: 'single-page' },
        { label: 'Double Page', value: 'double-page' },
      ],
    },
    invertDoublePagesWebtoon: {
      type: 'switch',
      label: 'Invert Double Pages (Webtoon)',
      description:
        'Swap the left and right pages when double-page layout is used.',
      default: false,
    },
    allowZoomOutWebtoon: {
      type: 'switch',
      label: 'Allow Zoom Out (Webtoon)',
      description: 'Allow the user to zoom out past the minimum zoom level.',
      default: false,
    },
    sidePaddingWebtoon: {
      type: 'select',
      label: 'Side Padding (Webtoon)',
      description: 'The amount of padding on the sides of the pages.',
      default: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: '25%', value: '25%' },
        { label: '50%', value: '50%' },
        { label: '75%', value: '75%' },
      ],
    },
  },
  downloads: {
    deleteRemovedChapters: {
      type: 'switch',
      label: 'Delete Removed Chapters',
      description:
        'Automatically delete chapters that have been removed from the website.',
      default: false,
    },
    downloadNewChapters: {
      type: 'switch',
      label: 'Download New Chapters',
      description: 'Automatically download new chapters when a manga updates.',
      default: true,
    },
    location: {
      type: 'managed',
      label: 'Download Location',
      description:
        'Where to save the downloaded chapters. If your path has holes, the folder(s) will be created if it does not exist.',
      default: '%TEMP%',
    },
    removeAfterRead: {
      type: 'switch',
      label: 'Remove After Read',
      description:
        'Remove downloaded chapters after you have finished reading them.',
      default: false,
    },
    removeWhenMarkedRead: {
      type: 'switch',
      label: 'Remove When Marked Read',
      description: 'Remove downloaded chapters when you mark them as read.',
      default: false,
    },
    saveChaptersAsCBZ: {
      type: 'switch',
      label: 'Save Chapters As CBZ',
      description:
        'Save downloaded chapters as a CBZ file instead of a directory of images.',
      default: false,
    },
  },
  browse: {
    checkForUpdates: {
      type: 'switch',
      label: 'Check for Updates',
      description: 'Periodically check for updates to sources.',
      default: true,
    },
    onlySearchPinned: {
      type: 'switch',
      label: 'Only Search Pinned',
      description:
        'Only search for new chapters when the manga is pinned in the library.',
      default: false,
    },
    showNSFWSources: {
      type: 'switch',
      label: 'Show NSFW Sources',
      description: 'Show NSFW sources when browsing sources and manga.',
      default: false,
    },
  },
  tracking: {
    syncChaptersAfterReading: {
      type: 'switch',
      label: 'Sync Chapters After Reading',
      description:
        'Automatically sync the chapter list with the website after you have finished reading a chapter.',
      default: false,
    },
    trackWhenAddingToLibrary: {
      type: 'switch',
      label: 'Track When Adding To Library',
      description:
        'Automatically track new chapters when you add a manga to your library. This usually only works for silent-tracking sites like Komga.',
      default: false,
    },
  },
  advanced: {
    sendCrashReports: {
      type: 'switch',
      label: 'Send Crash Reports',
      description:
        'Send crash reports to the developer. This will help us fix bugs and improve the application.',
      default: true,
    },
  },
  backup: {},
  security: {},
};

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
};

const categoryIcons: {
  [key in keyof typeof defaultTestSettings]: JSX.Element;
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

// TODO: Convert all functions to use memoized functions that only update when the corresponding settings change
// i.e., SettingsGeneral.tsx should only update when the General settings change, and SettingsReader.tsx should
// only update when the Reader settings change
const Settings = () => {
  const [settings, setSettings] = useState(defaultTestSettings);
  const [settingsLocation, setSettingsLocation] =
    useState<keyof typeof defaultTestSettings>('general');
  const Navigate = useNavigate();

  // TODO: Cross-check the settings schema with the actual settings
  // to ensure that the settings are valid and that there are
  // no settings that are not in the schema.

  const settingsKeys = Object.keys(settings);
  const schemaKeys = Object.keys(settingsSchemata);

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
        {(Object.keys(settings) as Array<keyof typeof settings>).map((key) => {
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
        {Object.values(
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
        )}
      </div>
    </div>
  );
};

export default Settings;
