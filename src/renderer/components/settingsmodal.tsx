import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { StyleSheet, css } from 'aphrodite';
import { useRef, useState } from 'react';

import { generateSettings } from '../util/func';
import { settingsSchemata } from '../util/auxiliary';
import type { DefaultSettings } from '../../main/util/settings';

const stylesObject = {
  settingsModalDialog: {},
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
  },
  settingsModalDialogContentItemContainer: {
    marginLeft: '8px',
  },
};

const styles = StyleSheet.create(stylesObject);
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

  const readerCategories = useRef({
    General: {
      Series: ['readingMode'],
      General: ['lightbarEnabled', 'lightbarVertical', 'lightbarRight'],
    },
    Paged: {
      '': [
        'cropBordersPaged',
        'invertTappingPaged',
        'navLayoutPaged',
        'scaleTypePaged',
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
    Filter: {},
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={css(styles.settingsModalDialog)}
      sx={{
        // Make the dialog fill a large portion of the screen
        '& .MuiPaper-root': {
          width: '50%',
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
          {Object.keys(
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
generateSettings(
  {
    type: 'switch',
    default: false,
    description: 'Test value, lorem ipsum so on.',
    label: 'Test',
  },
  false,
  () => {}
);
export default SettingsModal;
