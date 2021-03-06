/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable promise/no-nesting */
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  MouseEventHandler,
} from 'react';
import { StyleSheet, css } from 'aphrodite';
import { load } from 'protobufjs';
import { readFileSync } from 'fs';
import { ungzip } from 'node-gzip';
import { normalize } from 'path';
import {
  Tab,
  Tabs,
  Box,
  IconButton,
  Tooltip,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Backdrop,
  CircularProgress,
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
import { omit, mapValues } from 'lodash';

import Handler from '../../main/sources/handler';
import SourceBase from '../../main/sources/static/base';
import LoginItem from '../components/loginitem';
import ThemeButton from '../components/settings/themebutton';
import Theme from '../../main/util/theme';

import type { DefaultSettings } from '../../main/util/settings';
import { mainTranslator, useTranslation } from '../../shared/intl';
import { Schema, settingsSchemata } from '../util/auxiliary';
import {
  generateSettings,
  processLargeArrayAsync,
  settingsStylesObject,
} from '../util/func';

export type BackupChapter = {
  chapterNumber: number;
  dateFetch: string;
  dateUpload: string;
  name: string;
  scanlator: string;
  url: string;
  lastPageRead?: string;
  bookmark?: boolean;
  read?: boolean;
};

export type BackupHistory = {
  lastRead: string;
  url: string;
};

export type BackupManga = {
  artist: string;
  author: string;
  categories: string[];
  chapters: BackupChapter[];
  description: string;
  genre: string[];
  history: BackupHistory[];
  source: string;
  status: number;
  thumbnailUrl: string;
  title: string;
  tracking: [];
  url: string;
  viewer: number;
  viewerFlags: number;
};

export type BackupSource = {
  name: string;
  sourceId: string;
};

export type Backup = {
  backupManga: BackupManga[];
  backupSources: BackupSource[];
  backupCategories: unknown[];
};

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const themeColors = currentTheme.getColors();
const pageStyle = currentTheme.getPageStyle('settings');

const stylesObject = {
  ...settingsStylesObject,

  container: {
    width: '96%',
    height: '100%',
    position: 'relative',
    padding: '0px 12px 12px 12px',
  },

  tabs: {
    width: '165px',
    display: 'inline-flex',
    marginBottom: '12px',
  },

  tab: {
    color: themeColors.textLight,
    marginRight: '12px',
    padding: '6px',
    boxSizing: 'border-box',
    width: '165px',
    height: '36px',
    borderRight: 1,
    borderColor: themeColors.accent,
  },

  tabSelected: {
    color: themeColors.accent,
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
      width: '8px',
    },
    '::-webkit-scrollbar-thumb': {
      background: themeColors.white,
      ':hover': {
        background: themeColors.accent,
      },
    },
  },

  backButton: {
    position: 'absolute',
    marginLeft: '12px',
    color: themeColors.textLight,
    zIndex: 1600,
    top: '12px',
    left: 0,
  },

  selectComponentSelected: {
    color: themeColors.accent,
    // backgroundColor: themeColors.textLight,
  },

  settingsButton: {
    border: `1px solid ${themeColors.accent}`,
    color: themeColors.accent,
    minWidth: '150px',
    width: 'fit-content',
    height: '42px',
    ':hover': {
      backgroundColor: themeColors.accent,
      color: themeColors.textLight,
      fontWeight: 'bold',
    },
  },

  progressBackup: {
    pointerEvents: 'none',
    zIndex: 2400,
  },

  circularProgressContainer: {
    width: '85vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  circularProgress: {
    borderRadius: '16px',
  },

  appVersion: {
    position: 'absolute',
    fontFamily: 'Poppins',
    right: '12px',
    bottom: '12px',
    color: '#FFFFFF33',
    zIndex: 4000,
  },

  themeSelector: {
    marginTop: '8px',
    display: 'flex',
    flexDirection: 'row',
  },

  ...pageStyle,
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

// Modal for importing settings from a tachiyomi .proto.gz file or a .proto file (if they un-gzipped it)
type ImportSettings = Record<'manga' | 'chapters' | 'sources', boolean>;
const ImportSettingsModal = ({
  onImport = () => {},
  onClose,
  isOpen,
}: {
  onImport?: (settings: ImportSettings) => void;
  onClose?: () => void;
  isOpen: boolean;
}) => {
  const [importSettings, setImportSettings] = useState<ImportSettings>({
    manga: true,
    chapters: false,
    sources: false,
  });

  const itemDisplays: Record<keyof ImportSettings, string> = {
    manga: 'Manga',
    chapters: 'Chapters',
    sources: 'Sources',
  };

  const onCloseNative = useCallback(() => {
    setImportSettings({
      ...importSettings,
      manga: true,
    });
  }, [importSettings]);

  return (
    <Dialog
      open={isOpen}
      sx={{
        '& .MuiPaper-root': {
          width: '50%',
          maxWidth: 'unset',
        },

        '& .MuiDialog-paper': {
          backgroundColor: themeColors.background,
        },
      }}
      onClose={() => {
        if (onClose) onClose();
        onCloseNative();
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: themeColors.background,
          color: themeColors.textLight,
        }}
      >
        Import Settings
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: themeColors.background,
        }}
      >
        <List>
          {Object.entries(importSettings).map(([key, value]) => (
            <ListItem key={key}>
              <ListItemText
                sx={{
                  color: themeColors.textLight,
                }}
                primary={itemDisplays[key as keyof ImportSettings]}
              />
              <ListItemSecondaryAction>
                <Tooltip title={key === 'sources' ? 'Coming eventually!' : ''}>
                  <span>
                    <Checkbox
                      checked={value}
                      sx={{
                        color: themeColors.textLight,
                        '&.Mui-checked svg': {
                          color: themeColors.accent,
                        },
                        '&.Mui-checked:hover': {
                          backgroundColor: `${themeColors.accent.substring(
                            0,
                            7
                          )}09`,
                        },
                        '&:not(Mui-checked):hover': {
                          backgroundColor: `${themeColors.white.substring(
                            0,
                            7
                          )}09`,
                        },
                        '&:not(.Mui-checked) .MuiTouchRipple-root': {
                          color: themeColors.textLight,
                        },
                        '&.Mui-checked .MuiTouchRipple-root': {
                          color: themeColors.accent,
                        },
                      }}
                      disabled={key === 'sources'} // Source importing won't be supported until we get a hefty amount of sources
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setImportSettings((prev) => ({
                          ...prev,
                          [key]: e.target.checked,
                        }))
                      }
                    />
                  </span>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            if (onClose) onClose();
            onCloseNative();

            onImport(importSettings);
          }}
          sx={{
            color: themeColors.accent,
          }}
        >
          Import
        </Button>
        <Button
          onClick={() => {
            if (onClose) onClose();
            onCloseNative();
          }}
          sx={{
            color: themeColors.accent,
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ImportSettingsModal.defaultProps = {
  onImport: () => {},
  onClose: () => {},
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

// @ts-ignore Aphrodite sucks.
const styles = StyleSheet.create(stylesObject) as any;
const Settings = () => {
  const [settings, setSettings] = useState(window.electron.settings.getAll());
  const [settingsLocation, setSettingsLocation] =
    useState<keyof DefaultSettings>('general');
  const [timesClicked, setTimesClicked] = useState(0);
  const [fileSelectedData, setFileSelectedData] = useState<File>();
  const Navigate = useNavigate();

  const backupRef = useRef<HTMLInputElement>(null);
  const [isInLoadingContext, setLoadingContext] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    window.electron.settings.overwrite(settings);
  }, [settings]);

  useEffect(() => {
    window.electron.rpc.updateRPC({
      details: t('settings_tooltip'),
      state: t('rpc_settings_state'),
      largeImageKey: 'icon_large',
      startTimestamp: Date.now(),
    });
  }, [t]);

  useEffect(() => {
    setTimesClicked(0);
  }, [settingsLocation]);

  // TODO: Cross-check the settings schema with the actual settings
  // to ensure that the settings are valid and that there are
  // no settings that are not in the schema.

  const importSettingsModalOnCloseFunction = useCallback(() => {
    if (backupRef.current) backupRef.current.value = '';
    setFileSelectedData(undefined);
  }, [setFileSelectedData]);

  const timesClickedDescending = settingsResetText.length - timesClicked;
  return (
    <>
      <ImportSettingsModal
        isOpen={!!fileSelectedData}
        onClose={importSettingsModalOnCloseFunction}
        onImport={async (importSettings) => {
          if (!fileSelectedData) return;
          let fileBuffer: Buffer;
          // If the file is gzipped, we need to unzip it first
          if (fileSelectedData.name.endsWith('.proto.gz')) {
            const fileBufferZipped = readFileSync(fileSelectedData.path);
            try {
              fileBuffer = await ungzip(fileBufferZipped);
            } catch (e) {
              window.electron.log.error(e);
            }
          } else {
            fileBuffer = readFileSync(fileSelectedData.path);
          }

          // @ts-ignore - fileBuffer can be undefined; this if statement checks for that. No clue why TS is complaining.
          if (!fileBuffer) return;
          load(normalize('assets/data/tachiyomi-model.proto'))
            .then((root) => {
              return root.lookupType('Backup');
            })
            .then((backupType) => backupType.decode(fileBuffer))
            .then((backupDecoded) => backupDecoded.toJSON() as Backup)
            .then((backup: Backup) => {
              // Read through all current sources and then only get manga that has the same source id
              const availableSourceIDs: {
                handler: SourceBase;
                id: string;
              }[] = backup.backupSources
                ?.map((x) => {
                  const Source = Handler.getSource(x.name);
                  return {
                    handler: Source,
                    id: x.sourceId,
                  };
                })
                .filter((y) => y.handler);

              // Only retrieve manga that the user has a source for
              const availableMangaIDs = backup.backupManga.filter((x) => {
                return availableSourceIDs.some((y) => {
                  // for some reason /dist/ functionality is different from /src/ functionality so we'll just make accomodations
                  return (
                    y.id === x.source || y.id.toString() === x.source.toString()
                  );
                });
              });

              return availableSourceIDs.forEach(async (x) => {
                // Filter out all manga ids that dont have the same source id as the current source iteration
                // Also filter out mangas that do not have a chapter array
                // Then, plug in manga id into all indices of the chapter array
                const filteredAvailableManga = await Promise.all(
                  availableMangaIDs
                    .filter((y: any) => {
                      return (
                        y.source === x.id ||
                        y.source.toString() === x.id.toString()
                      );
                    })
                    .filter((y) => y.chapters)
                    .flatMap(async (z) => ({
                      ...z,
                      chapters: await Promise.all(
                        z.chapters.map(async (w: BackupChapter) => {
                          return {
                            ...w,
                            manga: await x.handler.IDFromURL(z.url, 'manga'),
                          };
                        })
                      ),
                    }))
                );

                const sourceMangas = await Promise.allSettled<string>(
                  filteredAvailableManga.map((z: any) =>
                    x.handler.IDFromURL(z.url, 'manga')
                  )
                );

                // Remove all manga from sourceMangas that are present in libraryMangas
                const libraryMangas = window.electron.library.getLibraryMangas(
                  x.handler.getName()
                );

                const filteredMangas = (
                  sourceMangas.filter(
                    (y) => y.status === 'fulfilled'
                  ) as PromiseFulfilledResult<string>[]
                )
                  .map((y) => y.value)
                  .filter((z) => !libraryMangas.includes(z));

                let mangaImported = !importSettings.manga;
                let chaptersImported = !importSettings.chapters;
                if (importSettings.manga) {
                  // Add everything from filteredMangas into the library
                  setLoadingContext(true);
                  filteredMangas.forEach((mangaID: string) => {
                    window.electron.log.info(
                      t('settings_log_processedm', {
                        mangaID,
                        source: x.handler.getName(),
                      })
                    );
                    window.electron.library.addMangaToLibrary(
                      x.handler.getName(),
                      mangaID
                    );
                  });

                  mangaImported = true;
                  if (mangaImported && chaptersImported)
                    setLoadingContext(false);
                }

                if (importSettings.chapters) {
                  const allChapters = filteredAvailableManga
                    .filter((y) =>
                      y.chapters?.some((b) => !!b.lastPageRead || !!b.read)
                    ) // Filter out all manga that have no read chapters
                    .map(
                      (z) =>
                        z.chapters?.filter((b) => !!b.lastPageRead || !!b.read) // Then, filter out all chapters that have no read pages
                    )
                    .flat();

                  setLoadingContext(true);
                  processLargeArrayAsync(
                    allChapters,
                    async (chapterItem, idx) => {
                      // after every n amount of iterations (probably 15) yield

                      let pageNumber: number;
                      if (chapterItem.read) pageNumber = Infinity;
                      else
                        pageNumber = Number.isSafeInteger(
                          chapterItem.lastPageRead
                        )
                          ? Number(chapterItem.lastPageRead) + 1
                          : -1;

                      await x.handler
                        .IDFromURL(chapterItem?.url, 'chapter')
                        .then(async (chapterID) => {
                          window.electron.log.info(
                            t('settings_log_processedc', {
                              chapterID,
                              source: x.handler.getName(),
                              count: idx + 1,
                              total: allChapters.length,
                            })
                          );
                          window.electron.read.set(
                            x.handler.getName(),
                            chapterID,
                            -1,
                            pageNumber,
                            chapterItem.dateFetch
                              ? new Date(
                                  Number(chapterItem.dateFetch.toString())
                                )
                              : new Date(),
                            -1,
                            !!chapterItem.bookmark,
                            chapterItem.manga
                          );

                          return true;
                        })
                        .finally(() => {
                          chaptersImported = true;
                          if (
                            idx === allChapters.length - 1 &&
                            mangaImported &&
                            chaptersImported
                          )
                            setLoadingContext(false);
                        })
                        .catch(window.electron.log.error);
                    },
                    10
                  );
                }
                return true;
              });
            })
            .catch(console.error);
        }}
      />
      <span
        className={css(styles.appVersion)}
        onClick={() =>
          window.electron.util.openInBrowser(
            'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          )
        }
      >
        v{window.electron.util.appVersion}
      </span>
      <div className={css(styles.container)}>
        <>
          <Backdrop
            open={isInLoadingContext}
            onClickCapture={((e: Event) => e.stopPropagation()) as any}
            className={css(styles.progressBackup)}
          >
            <div className={css(styles.circularProgressContainer)}>
              <CircularProgress
                className={css(styles.circularProgress)}
                variant="indeterminate"
              />
            </div>
          </Backdrop>
        </>
        <Tooltip title="Back">
          <IconButton
            disabled={isInLoadingContext}
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
              backgroundColor: themeColors.accent,
            },
          }}
        >
          {Object.keys(omit(settings, '__internal__')).map((key) => {
            return (
              <Tab
                key={key}
                value={key}
                label={key}
                sx={{
                  // On selected
                  '&.Mui-selected': stylesObject.tabSelected,
                }}
                icon={categoryIcons[key as keyof DefaultSettings] ?? undefined}
                iconPosition="start"
                className={css(styles.tab)}
              />
            );
          })}
        </Tabs>
        <div className={css(styles.settingContainer)}>
          {[
            ...Object.values(
              mapValues(
                settingsSchemata[settingsLocation] as Record<string, Schema>,
                (
                  value: Schema,
                  key: keyof DefaultSettings[typeof settingsLocation]
                ) =>
                  value.type === 'managed' && value.component ? (
                    <value.component
                      key={key}
                      schema={value}
                      settings={settings}
                      setting={settings[settingsLocation][key]}
                      onChange={(settingsValue: any) =>
                        setSettings({
                          ...settings,
                          [settingsLocation]: {
                            ...settings[settingsLocation],
                            [key]: settingsValue,
                          },
                        })
                      }
                    />
                  ) : (
                    generateSettings(
                      {
                        ...value,
                        ...{
                          label: t(`settings_${settingsLocation}_${key}_label`),
                          description: t(
                            `settings_${settingsLocation}_${key}_description`
                          ),
                        },
                      },
                      settings[settingsLocation][key],
                      (settingsValue: any) => {
                        const newSettings = { ...settings };
                        // @ts-ignore - nothing i can do here
                        newSettings[settingsLocation][key] = settingsValue;

                        if (
                          settingsLocation === 'general' &&
                          key === 'discordRPCIntegration'
                        ) {
                          switch (key) {
                            case 'discordRPCIntegration':
                              window.electron.rpc.toggleRPC(settingsValue);
                              break;
                            case 'locale':
                              mainTranslator.lang = settingsValue;
                              break;
                            default:
                              throw new Error(
                                `Default case unexpected for ${key}`
                              );
                          }
                        }
                        setSettings(newSettings);
                      }
                    )
                  )
              )
            ),
            (
              {
                advanced: (
                  <Box className={css(styles.optionContainer)}>
                    <Typography className={css(styles.optionLabel)}>
                      {t('settings_reset_label')}
                      <Typography
                        className={css(styles.optionLabelDescription)}
                      >
                        {t(
                          `settings_clear_warning${
                            timesClickedDescending > 1 ? 's' : ''
                          }`,
                          { count: timesClickedDescending }
                        )}
                      </Typography>
                    </Typography>
                    <Button
                      variant="outlined"
                      className={css(styles.settingsButton)}
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
                appearance: (
                  <Box className={css(styles.optionContainer)}>
                    <Typography className={css(styles.optionLabel)}>
                      {t(`settings_theme_${settings.appearance.theme}`)}
                      <Typography
                        className={css(styles.optionLabelDescription)}
                      >
                        {t('settings_theme_description')}
                      </Typography>
                    </Typography>
                    <div className={css(styles.themeSelector)}>
                      {[
                        (() => {
                          const appearance = settings.appearance.theme as
                            | 'light'
                            | 'dark';

                          const themeData = new Theme('default', appearance);

                          const colorSet = themeData.getColors();

                          return {
                            metadata: themeData.metadata,
                            colors: {
                              [appearance]: colorSet,
                            },
                          };
                        })(),
                        ...Object.values(window.electron.util.themes),
                      ]
                        .filter(
                          (x) =>
                            x.colors[
                              settings.appearance.theme as 'light' | 'dark'
                            ]
                        )
                        .map((themeIteration) => (
                          <ThemeButton
                            theme={themeIteration.metadata as any}
                            onClick={() => {
                              const newSettings = {
                                ...settings,
                                appearance: {
                                  ...settings.appearance,
                                  [settings.appearance.theme === 'light'
                                    ? 'themeStyleLight'
                                    : 'themeStyleDark']:
                                    themeIteration.metadata.name,
                                },
                              };

                              window.electron.settings.overwrite(newSettings);
                              setSettings(newSettings);
                            }}
                            selected={
                              settings.appearance[
                                settings.appearance.theme === 'light'
                                  ? 'themeStyleLight'
                                  : 'themeStyleDark'
                              ].toLowerCase() ===
                              themeIteration.metadata.name.toLowerCase()
                            }
                            variant={
                              settings.appearance.theme as 'light' | 'dark'
                            }
                          />
                        ))}
                    </div>
                  </Box>
                ),
                backup: (
                  <Box className={css(styles.optionContainer)}>
                    <Typography className={css(styles.optionLabel)}>
                      {t('settings_backup_restore')}
                      <Typography
                        className={css(styles.optionLabelDescription)}
                      >
                        {t('settings_backup_restore_description')}
                      </Typography>
                    </Typography>
                    <Button
                      className={css(styles.settingsButton)}
                      component="label"
                    >
                      Upload File
                      <input
                        type="file"
                        accept=".proto.gz,.proto"
                        ref={backupRef}
                        hidden
                        onChange={(event) => {
                          if (!event.target.files) {
                            setFileSelectedData(undefined);
                            return;
                          }

                          setFileSelectedData(event.target.files[0]);
                        }}
                      />
                    </Button>
                  </Box>
                ),
                tracking: (
                  <Box className={css(styles.optionContainer)}>
                    <Typography className={css(styles.optionLabel)}>
                      {t('settings_tracking_tracking')}
                      <Typography
                        className={css(styles.optionLabelDescription)}
                      >
                        {t('settings_tracking_tracking_description')}
                      </Typography>
                    </Typography>
                    <div>
                      <LoginItem
                        authenticator="AniList"
                        onDeauth={() => {
                          window.electron.log.info('AniList deauthenticated.');
                        }}
                        trackedtitle={t('deauthorize')}
                        title={t('anilist_track')}
                      />
                    </div>
                  </Box>
                ),
              } as { [key: string]: JSX.Element }
            )[settingsLocation],
          ]}
        </div>
      </div>
    </>
  );
};

export default Settings;
