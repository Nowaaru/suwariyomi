import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tab,
  Tabs,
  Typography,
  Box,
  Button,
  Slider,
  FormControlLabel,
  Stack,
} from '@mui/material';

import { StyleSheet, css } from 'aphrodite';
import { isNumber, isString } from 'lodash';
import React, { useRef, useState } from 'react';

import { generateSettings } from '../util/func';
import { settingsSchemata } from '../util/auxiliary';
import { generateSliderStyles } from './settings/filterslider';

import Switch from './switch';
import Select from './select';
import type { DefaultSettings } from '../../main/util/settings';

const stylesObject = {
  settingsModalDialogContent: {
    height: 'fit-content',

    backgroundColor: '#111111',
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
  settingsModalDialogTitle: { backgroundColor: '#111111', color: 'white' },
  settingsModalDialogTabContainer: {
    marginBottom: '16px',
  },
  settingsModalDialogContentSettingsContainer: {},
  settingsModalDialogTab: {
    color: '#FFFFFF',
    borderRadius: '4px 4px 0px 0px',
  },
  settingsModalDialogTabBar: {
    backgroundColor: '#DF2935',
  },
  settingsModalFlagSetTitle: {
    color: '#DF2935',
    fontSize: '1rem',
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    marginBottom: '6px',
  },
  settingsModalDialogContentItemContainer: {
    marginLeft: '8px',
  },
  settingsFilterLabel: {
    display: 'flex',
    color: 'white',
    marginRight: '8px',
  },
};

const styles = StyleSheet.create(stylesObject as any) as any;
const SettingsModal = ({
  onChange,
  onClose,
  settings,
  isWebtoon,
  open,
}: {
  onChange: (overriddenSettings: Partial<DefaultSettings['reader']>) => void;
  onClose: () => void;

  settings: DefaultSettings['reader'];
  isWebtoon: boolean;
  open: boolean;
}) => {
  const [tab, setTab] = useState('General');
  const [isPreviewing, setPreviewing] = useState(false);

  const readerCategories = useRef({
    General: {
      Series: ['readingMode'],
      General: ['lightbarEnabled', 'lightbarVertical', 'lightbarRight'],
      Miscellaneous: ['scaleType'],
    },
    Paged: {
      '': [
        'cropBordersPaged',
        'invertTappingPaged',
        'navLayoutPaged',
        'zoomStartPosition',
      ],
    },
    Webtoon: {
      '': [
        'invertTappingWebtoon',
        'invertDoublePagesWebtoon',
        'allowZoomOutWebtoon',
        'navLayoutWebtoon',
        'zoomStartPosition',
        'pageLayoutWebtoon',
      ],
    },
  });

  const customTabs: Record<string, React.ReactFragment> = {
    Filter: (
      <>
        <Box className="">
          <Typography className={css(styles.settingsModalFlagSetTitle)}>
            Coloring
          </Typography>
          <Stack alignItems="flex-start" spacing={2}>
            <Stack direction="row">
              <Button
                sx={{
                  color: '#DF2935',
                  '&:hover': {
                    backgroundColor: '#DF293511',
                  },
                }}
                onClick={() => setPreviewing(!isPreviewing)}
              >
                Preview
              </Button>
              <FormControlLabel
                className={css(styles.settingsFilterLabel)}
                control={<Switch checked={settings.useCustomColorFilter} />}
                label="Use Custom Color Filter"
                onChange={(_, checked) =>
                  onChange({ ...settings, useCustomColorFilter: checked })
                }
                labelPlacement="start"
              />
            </Stack>
            <FormControlLabel
              className={css(styles.settingsFilterLabel)}
              control={
                <Slider
                  sx={{
                    marginLeft: '16px',
                    ...generateSliderStyles('#DF293522', '#DF2910'),
                  }}
                  min={0}
                  max={255}
                  value={settings.filterR}
                  defaultValue={settings.filterR}
                  onChange={(_, v) =>
                    onChange(
                      isNumber(v) ? { ...settings, filterR: v } : settings
                    )
                  }
                />
              }
              sx={{
                width: '85%',
              }}
              label="R"
              labelPlacement="start"
            />
            <FormControlLabel
              className={css(styles.settingsFilterLabel)}
              control={
                <Slider
                  sx={{
                    marginLeft: '16px',
                    ...generateSliderStyles('#DF293522', '#DF2910CC'),
                  }}
                  min={0}
                  max={255}
                  value={settings.filterG}
                  defaultValue={settings.filterG}
                  onChange={(_, v) =>
                    onChange(
                      isNumber(v) ? { ...settings, filterG: v } : settings
                    )
                  }
                />
              }
              sx={{
                width: '85%',
              }}
              label="G"
              labelPlacement="start"
            />
            <FormControlLabel
              className={css(styles.settingsFilterLabel)}
              control={
                <Slider
                  sx={{
                    marginLeft: '16px',
                    ...generateSliderStyles('#DF293522', '#DF2910CC'),
                  }}
                  min={0}
                  max={255}
                  value={settings.filterB}
                  defaultValue={settings.filterB}
                  onChange={(_, v) =>
                    onChange(
                      isNumber(v) ? { ...settings, filterB: v } : settings
                    )
                  }
                />
              }
              sx={{
                width: '85%',
              }}
              label="B"
              labelPlacement="start"
            />
            <FormControlLabel
              className={css(styles.settingsFilterLabel)}
              control={
                <Slider
                  sx={{
                    marginLeft: '16px',
                    ...generateSliderStyles('#DF293522', '#DF2910CC'),
                  }}
                  min={0}
                  max={1}
                  step={0.01}
                  value={settings.filterA}
                  defaultValue={settings.filterA}
                  onChange={(_, v) =>
                    onChange(
                      isNumber(v) ? { ...settings, filterA: v } : settings
                    )
                  }
                />
              }
              sx={{
                width: '85%',
              }}
              label="A"
              labelPlacement="start"
            />
            <FormControlLabel
              className={css(styles.settingsFilterLabel)}
              control={
                <Select
                  sx={{
                    marginLeft: '16px',
                  }}
                  values={{
                    default: 'Default',
                    multiply: 'Multiply',
                    screen: 'Screen',
                    overlay: 'Overlay',
                    dodge: 'Dodge',
                    burn: 'Burn',
                  }}
                  value={settings.blendMode}
                  onChange={(e) =>
                    onChange(
                      isString(e.target.value)
                        ? { ...settings, blendMode: e.target.value }
                        : settings
                    )
                  }
                />
              }
              label="Blend Mode"
              labelPlacement="start"
            />
          </Stack>
        </Box>
      </>
    ),
  };

  return (
    <Dialog
      open={open}
      onClose={isPreviewing ? () => setPreviewing(false) : onClose}
      className={css(styles.settingsModalDialog)}
      sx={{
        // Make the dialog fill a large portion of the screen
        '& .MuiPaper-root': {
          opacity: isPreviewing ? 0.5 : 1,
          transition: 'opacity 0.3s ease-in-out',
          width: '50%',
          maxHeight: '600px',
          maxWidth: 'unset',
        },
      }}
    >
      <DialogTitle className={css(styles.settingsModalDialogTitle)}>
        Reader Settings
      </DialogTitle>
      <DialogContent className={css(styles.settingsModalDialogContent)}>
        <Tabs
          onChange={(_, value) => setTab(value)}
          className={css(styles.settingsModalDialogTabContainer)}
          value={tab}
          centered
          sx={{
            '& .MuiTabs-indicator': stylesObject.settingsModalDialogTabBar,
          }}
        >
          {['General', isWebtoon ? 'Webtoon' : 'Paged', 'Filter'].map(
            (categoryName) => (
              <Tab
                className={css(styles.settingsModalDialogTab)}
                key={categoryName}
                label={categoryName}
                value={categoryName}
              />
            )
          )}
        </Tabs>
        <div
          className={css(styles.settingsModalDialogContentSettingsContainer)} // WAYTOODANK
        >
          {customTabs[tab] ??
            Object.keys(
              readerCategories.current[
                tab as keyof typeof readerCategories.current
              ]
            ).map((readerHeader) => {
              let headerItem = null;
              if (readerHeader !== '')
                headerItem = (
                  <Typography
                    className={css(styles.settingsModalFlagSetTitle)}
                    key={readerHeader}
                  >
                    {readerHeader}
                  </Typography>
                );

              // @ts-ignore This language sucks.
              const categorySchemata = readerCategories.current[tab][
                readerHeader
              ] as string[];
              return (
                <>
                  {headerItem}
                  {categorySchemata.map((x) =>
                    generateSettings(
                      settingsSchemata.reader[
                        x as keyof typeof settingsSchemata.reader
                      ],
                      settings[x as keyof typeof settings],
                      (value) => {
                        onChange({
                          ...settings,
                          [x as keyof typeof settings]: value,
                        });
                      }
                    )
                  )}
                </>
              );
            })}

          {/* <div className={css(styles.settingsModalDialogContentItemContainer)}>
            {Object.values(readerCategories).map((x) => {
              return (<>

              </>);
            })}
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
