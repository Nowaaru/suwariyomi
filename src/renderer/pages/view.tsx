/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useRef, useEffect, useState, useCallback } from 'react';
import { StyleSheet, css } from 'aphrodite';
import { URLSearchParams } from 'url';
import { useNavigate } from 'react-router-dom';
import { isEqual, has } from 'lodash';

import {
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
  SelectChangeEvent,
  Tooltip,
  Typography,
} from '@mui/material';

import dayjs from 'dayjs';
import dayjs_duration from 'dayjs/plugin/duration';

import FilterListIcon from '@mui/icons-material/FilterList';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CheckIcon from '@mui/icons-material/Check';

import useMountEffect from '../util/hook/usemounteffect';
import useForceUpdate from '../util/hook/useforceupdate';
import useKeyboard from '../util/hook/usekeyboard';

import Dialog from '../components/dialog';
import Select from '../components/select';
import {
  getTracker,
  Media,
  SupportedTrackers,
  supportedTrackers,
} from '../util/tracker/tracker';
import {
  FullManga,
  LibraryManga,
  MangaTrackingData,
} from '../../main/util/manga';
import { ReadDatabaseValue } from '../../main/util/read';
import {
  filterChaptersToLanguage,
  sortChapters,
  getReadUrl,
} from '../util/func';

import Tag from '../components/tag';
import Chapter from '../components/chapter';
import Handler from '../../main/sources/handler';
import useQuery from '../util/hook/usequery';
import Switch from '../components/switch';
import TrackerModal from '../components/trackermodal';
import Theme from '../../main/util/theme';
import { useTranslation } from '../../shared/intl';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const themeColors = currentTheme.getColors();
const pageStyle = currentTheme.getPageStyle('view');

dayjs.extend(dayjs_duration);
const styles = StyleSheet.create({
  circularProgress: {
    width: '64px',
    height: '64px',
  },

  container: {
    width: '100%',
    marginTop: '16px',
    height: '100%',
    overflowX: 'hidden',
    overflowY: 'auto',
    paddingBottom: '7rem',
    boxSizing: 'border-box',
    position: 'relative',
  },

  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    position: 'absolute',
  },

  upperContainer: {
    position: 'relative',
    top: '4px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'initial',
    justifyContent: 'initial',
    width: '100%',
    fontFamily: '"Roboto", sans-serif',
  },
  metadataContainer: {
    marginTop: '24px',
    marginLeft: '48px',
    textShadow: `0px 0px 10px ${themeColors.black}`,
  },

  dataContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  utilityContainer: {
    display: 'block',
    width: '45%',
    marginRight: '24px',
    padding: '8px',
    textShadow: `0px 0px 10px ${themeColors.black}`,
    boxSizing: 'border-box',
    backgroundColor: themeColors.backgroundLight,
  },

  utilityButtonContainer: {
    display: 'flex',
  },

  mangaCover: {
    position: 'relative',
    width: 'fit-content',
    height: 'fit-content',
    marginBottom: '12px',
  },

  sourceIcon: {
    padding: '4px',
    position: 'absolute',
    top: '-16px',
    left: '-16px',
    maxHeight: '32px',
    backgroundColor: themeColors.backgroundLight,
    borderRadius: '16px',
    objectFit: 'contain',
    cursor: 'pointer',
  },

  mangaBannerContainer: {
    position: 'absolute',
    width: '100%',
    height: '384px',
    overflowX: 'hidden',
    overflowY: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
    filter: 'brightness(0.5) saturate(0.5) blur(10px)',
    ':after': {
      content: '""',
      position: 'absolute',
      width: '100%',
      height: '384px',
      background: `linear-gradient(to top, ${themeColors.background} 0%,rgba(17,17,17,0.35) 75%)`,
    },
  },

  mangaBanner: {
    height: '300vmax',
    objectFit: 'contain',
  },

  mangaCoverImage: {
    maxWidth: '256px',
    maxHeight: '256px',
    borderRadius: '4px',
    border: `1px solid ${themeColors.white}`,
  },

  mangaTitle: {},

  mangaAuthors: {
    ':before': {
      content: '"by "',
      fontWeight: 300,
      fontSize: '12px',
    },
    fontWeight: 600,
    fontSize: '24px',
    margin: '0',
    marginTop: '0',
    marginBottom: '0',
    color: themeColors.textLight,
  },

  textData: {
    marginLeft: '24px',
    borderRadius: '8px',
    height: 'fit-content',
    padding: '6px',
  },

  mangaTitleHeader: {
    fontSize: '3vw',
    fontWeight: 200,
    fontFamily: 'Open Sans, sans-serif',
    marginBottom: '8px',
    textAlign: 'left',
    textShadow: `0 0 10px ${themeColors.black}`,
  },

  mangaTags: {
    marginTop: '8px',
  },

  mangaSynopsis: {
    fontSize: '14px',
    fontWeight: 200,
    fontFamily: 'Open Sans, sans-serif',
    marginTop: '8px',
    maxWidth: '500px',
    maxHeight: '120px',
    overflow: 'hidden',
    backgroundColor: themeColors.background,
    padding: '8px',
    borderRadius: '8px',
    color: themeColors.textLight,
    position: 'relative',
    boxShadow: `0px 0px 10px ${themeColors.black}`,
    boxSizing: 'border-box',
    ':after': {
      top: 1,
      left: 0,
      content: '""',
      position: 'absolute',
      width: '100%',
      height: '100%',
      background: `linear-gradient(to top, ${themeColors.background} 0%,rgba(17,17,17,0.35) 75%)`,
    },
    transition: 'max-width 0.1s ease-in-out 0s',
    '@media (max-width: 760px)': {
      maxWidth: '95%',
    },
  },

  interactionButtons: {
    display: 'block',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },

  interactionButton: {
    padding: '8px 12px',
    borderRadius: '24px',
    fontSize: '1em',
    width: '100%',
    fontWeight: 'bold',
    transition:
      'letter-spacing 0.5s ease-in-out, background-color 0.3s ease-in-out, width 0.3s ease-in-out',
  },

  libraryButton: {
    display: 'flex',
    maxWidth: '181px',
  },

  disabledButton: {
    filter: 'grayscale(100%)',
  },

  notInLibrary: {
    transition:
      'letter-spacing 0s ease-in-out, background-color 0.3s ease-in-out, width 0.3s ease-in-out',
    letterSpacing: '-1px',
  },

  inLibrary: {
    ':hover': {
      letterSpacing: '2px',
    },
  },

  dataRule: {
    position: 'relative',
    top: '35px',
    border: 'none',
    height: '2px',
    backgroundImage:
      'radial-gradient(circle at center,rgb(255,255,255,1), rgba(255,255,255,0))',
    marginBottom: '48px',
  },

  chaptersContainer: {
    display: 'flex',
    width: '50%',
  },

  chaptersHeader: {
    width: '50%',
    fontSize: '1.5em',
    fontFamily: 'Poppins, Open Sans,sans-serif',
    fontWeight: 400,
    textShadow: 'none',
    marginBottom: '8px',
    textAlign: 'center',
    color: themeColors.textLight,
  },

  chapters: {
    maxHeight: '300px',
    overflowY: 'auto',
    overflowX: 'visible',
    borderRadius: '8px',
    boxShadow: `0px 0px 10px ${themeColors.black}`,
    width: '100%',
  },

  scrollBar: {
    '::-webkit-scrollbar': {
      width: '8px',
    },
    '::-webkit-scrollbar-thumb': {
      backgroundColor: themeColors.textLight,
      borderRadius: '4px',
      transition: 'background-color 0.2s ease-in-out',
      ':hover': {
        backgroundColor: themeColors.accent,
      },
    },
  },

  flex: {
    display: 'flex',
  },

  startReadingButton: {
    fontSize: '0.8em',
    padding: '8px',
    fontWeight: 'bold',
    backgroundColor: themeColors.accent,
    color: themeColors.textLight,
    boxSizing: 'border-box',
    borderRadius: '24px',
    width: '100%',
    height: '32px',
    ':hover': {
      color: themeColors.backgroundDark,
      backgroundColor: themeColors.accent,
    },
  },

  mangaProgressContainer: {
    marginLeft: '4px',
    marginTop: '8px',
    fontSize: '1.5em',
    fontFamily: 'Poppins, Open Sans,sans-serif',
    color: themeColors.textLight,
  },

  mangaProgress: {},

  mangaProgressBar: {
    width: '100%',
    maxWidth: '400px',
    height: '8px',
    overflow: 'hidden',
    backgroundColor: themeColors.accent,
    borderRadius: '4px',
  },

  mangaProgressBarFiller: {
    transition: 'width 0.3s ease-in-out',
    height: '100%',
    backgroundColor: themeColors.textLight,
    borderRadius: '4px',
  },

  mangaProgressText: {
    ':after': {
      marginLeft: '6px',
      content: '"CHAPTERS"',
      fontVariant: 'small-caps',
      fontSize: '0.6em',
      fontWeight: 200,
      color: themeColors.textLight,
      fontFamily: 'Open Sans, sans-serif',
    },
  },

  extendedDataRule: {
    width: '100%',
    opacity: 0.5,
    border: 'none',
    height: '2px',
    backgroundImage:
      'radial-gradient(circle at center,rgb(127,127,127,1) 84%, rgba(127,127,127,0) 85%)',
  },

  shortDataRule: {
    width: '75%',
  },

  timeElapsedContainer: {
    marginTop: '8px',
  },

  timeElapsed: {},

  timeElapsedText: {},

  timeElapsedTextItem: {
    marginLeft: '6px',
    fontSize: '1.5rem',
    fontFamily: 'Poppins, sans-serif',
    color: themeColors.textLight,
  },

  hours: {
    ':after': {
      content: '"HOURS"',
      marginLeft: '6px',
      marginRight: '6px',
      fontVariant: 'small-caps',
      fontSize: '0.6em',
      fontWeight: 200,
      color: themeColors.textLight,
      fontFamily: 'Open Sans, sans-serif',
    },
  },

  minutes: {
    ':after': {
      content: '"MINUTES"',
      marginLeft: '6px',
      fontVariant: 'small-caps',
      fontSize: '0.6em',
      fontWeight: 200,
      color: themeColors.textLight,
      fontFamily: 'Open Sans, sans-serif',
    },
  },

  seconds: {
    ':after': {
      content: '"SECONDS"',
      marginLeft: '6px',
      fontVariant: 'small-caps',
      fontSize: '0.6em',
      fontWeight: 200,
      color: themeColors.textLight,
      fontFamily: 'Open Sans, sans-serif',
    },
  },

  backAppBar: {
    position: 'relative',
    left: '24px',
    width: 'fit-content',
    maxHeight: '32px',
    zIndex: 1000,
  },

  backButton: {
    backgroundColor: themeColors.accent,
    // darker backgroundColor
    borderColor: themeColors.accent,
    borderStyle: 'solid',
    borderWidth: '2px',
    borderRadius: '4px',
    width: '100px',
    height: '100%',
    color: themeColors.textLight,

    transition:
      'color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
    ':hover': {
      backgroundColor: themeColors.textLight,
      color: themeColors.accent,
      borderColor: '#D6D6D6',
    },
  },

  backTypography: {},

  chapterFilterIcon: {
    color: themeColors.accent,
    marginLeft: '8px',
  },

  chapterFilterUsed: {
    color: '#2990DF',
  },

  viewMangaDialog: {},

  viewMangaDialogTitle: {},

  viewMangaDialogContent: {},

  viewMangaDialogContentInner: {
    width: '50vh',
    height: '50vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  viewMangaLabel: {
    display: 'flex',
    color: themeColors.textLight,
    marginLeft: '8px',
    marginBottom: '8px',
  },

  filterSelect: {
    marginLeft: '12px',
  },

  trackingContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: '8px',
  },

  trackingContainerItem: {
    display: 'flex',
    width: '32px',
    height: '32px',
    padding: '0px',
    background: 'none',
    marginLeft: '16px',
    outline: 'none',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
  },

  trackingContainerItemOverlay: {
    position: 'absolute',
    top: '0px',
    left: '0px',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: '4px',
    transition: 'opacity 0.2s ease-in-out',
    ':hover': {
      opacity: 0,
    },
  },

  trackingContainerItemOverlayIcon: {
    color: 'lime',
  },

  ...pageStyle,
}) as any;

const defaultFilters = {
  group: null,
  showRead: false,
  showUnread: false,
  showBookmarked: false,
  showInProgress: false,
};

const View = () => {
  const Query = useQuery();
  const Navigate = useNavigate();
  const forceUpdate = useForceUpdate();
  const chapterData = useRef<ReadDatabaseValue>({});
  const dateFormat = useRef<string>(
    window.electron.settings.getAll().general.dateFormat
  );
  const authenticatedTrackers = useRef<SupportedTrackers[]>(
    supportedTrackers.filter(window.electron.auth.checkAuthenticated)
  );
  const [searchModalData, setSearchModalData] = useState<{
    media: Media[];
    tracker: SupportedTrackers;
  } | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [scrollTarget, setScrollTarget] = useState<Node | undefined>();
  const [shiftPressed, setShiftPressed] = useState<boolean>(false);
  const [chaptersRead, setChaptersRead] = useState<number>(0);
  const [chaptersNoDuplicates, setChaptersNoDuplicates] = useState<number>(0);
  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false);
  const [viewFilters, setFilter] = useState<{
    group: string | null;
    showRead: boolean;
    showUnread: boolean;
    showBookmarked: boolean;
    showInProgress: boolean;
  }>(defaultFilters);

  const filtersInUse = !isEqual(viewFilters, defaultFilters);
  const { id, source, backto } = Object.fromEntries(
    Query as unknown as URLSearchParams
  );

  useKeyboard(
    'down',
    (e) => {
      if (e.key === 'Shift') setShiftPressed(true);
    },
    [setShiftPressed]
  );

  useKeyboard(
    'up',
    (e) => {
      if (e.key === 'Shift') setShiftPressed(false);
    },
    [setShiftPressed]
  );

  const { t } = useTranslation();

  const [isInLibrary, setInLibrary] = useState<boolean>(
    !!window.electron.library.getLibraryMangas(source).find((x) => x === id)
  );

  const mappedFileNamesRef = useRef(
    window.electron.util
      .getSourceFiles()
      .map(Handler.getSource)
      .filter((x) => x.getName().toLowerCase() === source.toLowerCase())
  );

  useEffect(() => {
    if (mappedFileNamesRef.current.length === 0) return Navigate('/404');
    if (!id || !source) return Navigate('/404');

    return undefined;
  }, [id, source, Navigate, mappedFileNamesRef]);

  const selectedSource = mappedFileNamesRef.current[0];
  const mangaData = useRef<FullManga | null>(null);

  useMountEffect(() => {
    const cachedManga = window.electron.library.getCachedManga(source, id);
    if (cachedManga) {
      cachedManga.Chapters = filterChaptersToLanguage(
        cachedManga.Chapters,
        'en' //
      );

      mangaData.current = cachedManga;
      setIsLoaded(true);
      return;
    }

    selectedSource
      .getManga(id, true)
      .then((x) => {
        window.electron.library.addMangasToCache(x);

        const newData = { ...x };
        newData.Chapters = filterChaptersToLanguage(
          newData.Chapters,
          'en' //
        );
        return (mangaData.current = newData);
      })
      .then(() => setIsLoaded(true))
      .catch(console.error);

    // Disabling this because this should only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  // This should only be used for aesthetic purposes. This does not take into consideration whether
  // the user has read the chapter or not - so if a user reads a chapter that has multiple scanlators,
  // but not the first chapter the filter pass-through finds, it won't be counted as read.

  const calculateChaptersNoDuplicates = useCallback(
    () =>
      mangaData?.current?.Chapters?.filter((value, index, self) => {
        const didFindSelf =
          self.findIndex(
            (secondValue) => secondValue.Chapter === value.Chapter
          ) === index;

        return didFindSelf;
      }),
    [mangaData]
  );

  const calculateReadChapters = useCallback(
    (ignoreSubchapters?: boolean) => {
      const alreadyIndexedChapters = new Set<number>();
      mangaData.current?.Chapters?.filter(
        (x) => !ignoreSubchapters || Number.isInteger(x.Chapter)
      ).forEach((x) => {
        const foundChapter =
          chapterData.current[
            Object.keys(chapterData.current).find((y) => y === x.ChapterID) ??
              '0'
          ];

        if (!alreadyIndexedChapters.has(x.Chapter) && foundChapter) {
          if (
            foundChapter.currentPage > -1 &&
            x.PageCount > -1 &&
            foundChapter.currentPage >= x.PageCount
          ) {
            alreadyIndexedChapters.add(x.Chapter);
          }
        }
      });

      return alreadyIndexedChapters.size;
    },
    [chapterData]
  );

  useEffect(() => {
    const sourceChapters = window.electron.read.get(selectedSource.getName());
    if (!sourceChapters) return;
    if (!mangaData.current) return;

    chapterData.current = sourceChapters;
    const ChaptersNoDuplicates = calculateChaptersNoDuplicates();
    const readChapters = calculateReadChapters();

    setChaptersRead(readChapters ?? 0);
    setChaptersNoDuplicates(ChaptersNoDuplicates?.length ?? 0);
  }, [
    mangaData,
    selectedSource,
    calculateReadChapters,
    calculateChaptersNoDuplicates,
  ]);

  useEffect(() => {
    if (!mangaData.current || !mangaData.current.Name) return;
    window.electron.rpc.updateRPC({
      // Using mangaData as a dependency doesn't re-run the useEffect. Unsure as to why that is the case.
      details: t('rpc_view_details', { mangaTitle: mangaData.current?.Name }),
      largeImageText:
        calculateReadChapters() > 0
          ? t('rpc_view_largeimg_details', {
              ch: calculateReadChapters(),
              chs:
                calculateChaptersNoDuplicates()?.length ??
                mangaData.current.Chapters.length,
            })
          : undefined,
      largeImageKey: 'icon_large',
      startTimestamp: Date.now(),
    });
  });

  const currentManga: FullManga | null = mangaData.current;
  if (currentManga) {
    sortChapters(currentManga.Chapters);
    const Authors = currentManga.Authors.slice(0, 4);
    const remainderAuthors = currentManga.Authors.length - Authors.length;

    // Get the chapter to display on the Start Reading button.
    // If there is a chapter in progress, then display that chapter.
    // Otherwise, display the first unread chapter.

    const chapterToDisplay = [...currentManga.Chapters].reverse().find((x) => {
      // Reverse the chapters so that the first chapter is the first index.
      const foundChapter = chapterData.current[x.ChapterID];
      if (!foundChapter) return true; // If the chapter is not in the database, then it is unread.

      return (
        (foundChapter.pageCount > -1 &&
          foundChapter.currentPage < x.PageCount) ||
        foundChapter.currentPage <= -1
      );
    }); // We don't need a second find function here because .find() is a linear search; so it will find an in-progess chapter before it finds an unread chapter.
    const allChaptersRead =
      currentManga.Chapters.every((x) => {
        const correspondingChapter = chapterData.current[x.ChapterID];
        if (!correspondingChapter) return false;

        const { currentPage, pageCount } = {
          ...correspondingChapter,
          pageCount:
            correspondingChapter.pageCount > -1
              ? correspondingChapter.pageCount
              : x.PageCount,
        };
        return currentPage > -1 && pageCount > -1 && currentPage >= pageCount;
      }) || currentManga.Chapters.length === 0;

    let ReadingButtonInnerText = t('startreading');
    let mangaProgressBar = allChaptersRead ? 100 : 0;
    if (allChaptersRead) {
      ReadingButtonInnerText = t('allchaptersread');
    } else if (chapterToDisplay) {
      const foundChapter = chapterData.current[chapterToDisplay.ChapterID];
      const readChapterData = chapterToDisplay.Volume
        ? t('volumechapter', {
            volume: chapterToDisplay.Volume,
            chapter: chapterToDisplay.Chapter,
          })
        : t('chapter', { chapter: chapterToDisplay.Chapter });

      ReadingButtonInnerText = foundChapter
        ? foundChapter.currentPage > -1 &&
          foundChapter.currentPage < foundChapter.pageCount
          ? t('mangaitem_continue', { title: readChapterData })
          : t('mangaitem_start', { title: readChapterData })
        : t('mangaitem_start', { title: readChapterData });

      let { Chapter: mangaProgressEnd } = currentManga.Chapters[0]; // This is [0] because the chapters are sorted in descending order.

      [mangaProgressEnd] = [mangaProgressEnd].map((x) =>
        !Number.isNaN(Number(x)) ? Number(x) : 0
      );

      // If a source author provided a bad value, then just set it to 0.
      mangaProgressBar =
        (Math.max(0, calculateReadChapters() - 1) /
          Math.max(0, mangaProgressEnd - 1)) *
        100; // Subtract one because the chapters are 1-indexed.
    }

    // TODO: Implement Select Group button to filter chapters by group. For now, just show all chapters.
    // TODO: Implement Sort Order button.
    // TODO: Fix chapters sometimes not being counted properly in the progress bar.

    return (
      <div
        className={css(styles.container, styles.scrollBar)}
        ref={(Node) => {
          if (Node) setScrollTarget(Node);
        }}
      >
        <Dialog
          className={css(styles.viewMangaDialog)}
          open={filterModalOpen && !!mangaData.current}
          onClose={() => setFilterModalOpen(false)}
          title="Filter"
        >
          <div className={css(styles.viewMangaDialogContentInner)}>
            <FormControlLabel
              className={css(styles.viewMangaLabel)}
              control={
                <Select
                  className={css(styles.filterSelect)}
                  values={(() => {
                    const selectValues: Record<string, string> = {
                      none: 'None',
                    };
                    currentManga.Chapters.forEach((x) => {
                      if (x.Groups) {
                        x.Groups.forEach((y) => {
                          selectValues[y] = y;
                        });
                      }
                    });

                    return selectValues;
                  })()}
                  value={viewFilters?.group ?? 'none'}
                  onChange={(e: SelectChangeEvent<string>) => {
                    return setFilter({
                      ...viewFilters,
                      group:
                        e.target.value !== 'none'
                          ? (e.target.value as string)
                          : null,
                    });
                  }}
                />
              }
              label="Filter By Group"
              labelPlacement="start"
            />
            <FormControlLabel
              className={css(styles.viewMangaLabel)}
              control={
                <Switch
                  checked={viewFilters.showRead}
                  onChange={(e) => {
                    return setFilter({
                      ...viewFilters,
                      showRead: e.target.checked,
                      showInProgress: false,
                      showUnread: false,
                    });
                  }}
                />
              }
              label="Only Show Read Chapters"
              labelPlacement="start"
            />
            <FormControlLabel
              className={css(styles.viewMangaLabel)}
              control={
                <Switch
                  checked={viewFilters.showUnread}
                  onChange={(e) => {
                    return setFilter({
                      ...viewFilters,
                      showRead: false,
                      showInProgress: false,
                      showUnread: e.target.checked,
                    });
                  }}
                />
              }
              label="Only Show Unread Chapters"
              labelPlacement="start"
            />
            <FormControlLabel
              className={css(styles.viewMangaLabel)}
              control={
                <Switch
                  checked={viewFilters.showBookmarked}
                  onChange={(e) => {
                    return setFilter({
                      ...viewFilters,
                      showBookmarked: e.target.checked,
                    });
                  }}
                />
              }
              label="Only Show Bookmarked Chapters"
              labelPlacement="start"
            />
            <FormControlLabel
              className={css(styles.viewMangaLabel)}
              control={
                <Switch
                  checked={viewFilters.showInProgress}
                  onChange={(e) => {
                    return setFilter({
                      ...viewFilters,
                      showRead: false,
                      showUnread: false,
                      showInProgress: e.target.checked,
                    });
                  }}
                />
              }
              label="Only Show In-Progress Chapters"
              labelPlacement="start"
            />
          </div>
        </Dialog>
        <div className={css(styles.backAppBar)}>
          <Button
            className={css(styles.backButton)}
            onClick={() => {
              Navigate(`/${backto ?? 'library'}`);
            }}
            startIcon={<ArrowBackIcon />}
          >
            <Typography variant="h6" className={css(styles.backTypography)}>
              Back
            </Typography>
          </Button>
        </div>
        <div className={css(styles.upperContainer)}>
          <div className={css(styles.mangaBannerContainer)}>
            {/* TODO: Add IconURL fields to sources and have a small pin on the top of the cover image that indicates the source */}
            <img
              src={currentManga.CoverURL}
              alt={t('banner')}
              className={css(styles.mangaBanner)}
            />
          </div>
          <div className={css(styles.metadataContainer)}>
            <div className={css(styles.mangaCover)}>
              <Tooltip title={selectedSource.getName()} placement="right">
                <img
                  onClick={() =>
                    window.electron.util.openInBrowser(
                      selectedSource.getUrl(currentManga.MangaID)
                    )
                  }
                  className={css(styles.sourceIcon)}
                  src={selectedSource.getIcon()}
                  alt={t('sicon')}
                />
              </Tooltip>
              <img
                className={css(styles.mangaCoverImage)}
                src={currentManga.CoverURL}
                alt={currentManga.Name}
              />
            </div>
            <div className={css(styles.interactionButtons)}>
              <Button
                startIcon={
                  isInLibrary ? (
                    isHovering ? (
                      <HeartBrokenIcon />
                    ) : (
                      <FavoriteIcon />
                    )
                  ) : isHovering ? (
                    <FavoriteIcon />
                  ) : (
                    <FavoriteBorderIcon />
                  )
                }
                variant="contained"
                color="primary"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => {
                  if (isInLibrary) {
                    window.electron.library.removeMangaFromLibrary(source, id);
                    setInLibrary(false);
                  } else {
                    window.electron.library.addMangaToLibrary(
                      selectedSource.getName(),
                      currentManga.MangaID
                    );

                    setInLibrary(true);
                  }
                }}
                className={css(
                  styles.interactionButton,
                  styles.libraryButton,
                  isInLibrary ? styles.inLibrary : styles.notInLibrary
                )}
                sx={
                  isInLibrary
                    ? {
                        backgroundColor: themeColors.backgroundDark,
                        color: themeColors.accent,
                        '&:hover': {
                          backgroundColor: themeColors.accent,
                          color: themeColors.textLight,
                        },
                      }
                    : {
                        backgroundColor: themeColors.accent,
                        color: themeColors.textLight,
                        '&:hover': {
                          backgroundColor: themeColors.textLight,
                          color: themeColors.accent,
                        },
                      }
                }
              >
                {isInLibrary ? t('in_library') : t('add_library')}
              </Button>
            </div>
          </div>
          <div className={css(styles.metadataContainer, styles.textData)}>
            <div className={css(styles.mangaTitle)}>
              <h1 className={css(styles.mangaTitleHeader)}>
                {currentManga.Name}
              </h1>
              <h2 className={css(styles.mangaAuthors)}>{`${Authors.join(', ')}${
                remainderAuthors > 0 ? ` (+${remainderAuthors})` : ''
              }`}</h2>
            </div>
            <div className={css(styles.mangaTags)}>
              {currentManga.Tags.sort((a, b) => {
                const tagColours = selectedSource?.tagColors;
                const aColour = tagColours?.[a];
                const bColour = tagColours?.[b];

                if (!aColour && bColour) return 1;
                if (aColour && !bColour) return -1;

                // If aColour and bColour are both defined OR both are undefined, then sort by
                return a.localeCompare(b);
              }).map((x) => (
                <Tag
                  key={`${x}-manga-tag`}
                  color={selectedSource?.tagColours?.[x]}
                  name={x}
                />
              ))}
            </div>
            <div className={css(styles.mangaSynopsis)}>
              {currentManga.Synopsis && currentManga.Synopsis.length > 0
                ? currentManga.Synopsis
                : t('mangaitem_no_synopsis')}
            </div>
          </div>
          {/* <h1>{Query.get('id')}</h1>
      <h2>{Query.get('source')}</h2> */}
        </div>
        <hr className={css(styles.dataRule)} />
        <div className={css(styles.metadataContainer)}>
          <h2 className={css(styles.chaptersHeader)}>
            Chapters
            <Tooltip
              title={`${t('filter')}${filtersInUse ? ` ${t('in_use')}` : ''}`}
              placement="right"
            >
              <IconButton
                className={css(
                  styles.chapterFilterIcon,
                  filtersInUse && styles.chapterFilterUsed
                )}
                onClick={() => setFilterModalOpen(true)}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </h2>

          <div className={css(styles.dataContainer)}>
            <div className={css(styles.chaptersContainer)}>
              <div className={css(styles.chapters, styles.scrollBar)}>
                {currentManga.Chapters.filter(
                  // Filter for group
                  (chapter) =>
                    !viewFilters.group ||
                    chapter.Groups.find((group) => group === viewFilters.group)
                )
                  .filter((chapter) => {
                    // Filter for read
                    const currentChapterData =
                      chapterData.current[chapter.ChapterID];

                    const didReadChapter =
                      !!currentChapterData &&
                      currentChapterData?.pageCount > 0 &&
                      currentChapterData?.currentPage >=
                        currentChapterData?.pageCount &&
                      currentChapterData?.currentPage > 0;

                    if (
                      !viewFilters.showRead &&
                      !viewFilters.showUnread &&
                      !viewFilters.showInProgress
                    )
                      return true;

                    if (
                      viewFilters.showInProgress &&
                      !didReadChapter &&
                      currentChapterData?.currentPage > 0
                    )
                      return true;
                    if (viewFilters.showRead) return didReadChapter;
                    if (viewFilters.showUnread) return !didReadChapter;

                    return false;
                  })
                  .filter((chapter) => {
                    // Filter for bookmark
                    const currentChapterData =
                      chapterData.current[chapter.ChapterID];

                    return (
                      !viewFilters.showBookmarked ||
                      currentChapterData?.isBookmarked
                    );
                  })
                  .map((x) => {
                    const foundChapter = chapterData.current[x.ChapterID] || {};
                    return (
                      <Chapter
                        dateformat={dateFormat.current}
                        onMarkRead={() => {
                          const { updateWhenMarkedAsRead } =
                            window.electron.settings.getAll().tracking;

                          if (
                            has(mangaData.current ?? {}, 'Tracking') &&
                            updateWhenMarkedAsRead
                          ) {
                            chapterData.current = window.electron.read.get(
                              mangaData.current!.SourceID
                            );
                            const libraryManga =
                              mangaData.current as LibraryManga;
                            const tracking = libraryManga.Tracking;
                            const trackingKeys = Object.keys(
                              tracking
                            ) as (keyof typeof tracking)[];
                            trackingKeys.forEach((key) => {
                              if (!tracking[key]) return;

                              const ActualTracker = getTracker(key);
                              const trackerInstance = new ActualTracker();
                              const { listId, progress } = tracking[
                                key
                              ] as MangaTrackingData;

                              if (listId && progress) {
                                trackerInstance
                                  .updateManga(
                                    {
                                      id: listId,
                                      progress: calculateReadChapters(true),
                                    },
                                    ['progress']
                                  )
                                  .then((res) => {
                                    const newProgress = res?.data?.progress;
                                    if (newProgress) {
                                      tracking[key]!.progress = newProgress;
                                      window.electron.library.addMangasToCache(
                                        libraryManga
                                      );
                                    }
                                  })
                                  .catch(console.error);
                              }
                            });
                          }

                          setChaptersRead(calculateReadChapters());
                          chapterData.current =
                            window.electron.read.get(
                              selectedSource.getName()
                            ) ?? chapterData.current;
                        }}
                        onBookmark={() => {
                          chapterData.current =
                            window.electron.read.get(
                              selectedSource.getName()
                            ) ?? chapterData.current;
                        }}
                        onReadClick={() => {
                          Navigate(
                            getReadUrl(
                              currentManga.MangaID,
                              currentManga.Name,
                              source,
                              x.ChapterID,
                              foundChapter.currentPage >= x.PageCount
                                ? 1
                                : Math.max(1, foundChapter.currentPage)
                            )
                          );
                        }}
                        modifierShift={shiftPressed}
                        key={`${x.ChapterID}-chapter`}
                        downloadable={selectedSource.canDownload}
                        dbchapter={foundChapter}
                        chapter={x}
                        source={selectedSource.getName()}
                        manga={currentManga}
                      />
                    );
                  })}
              </div>
            </div>
            <TrackerModal
              open={
                Object.values(searchModalData?.tracker ?? {}).filter((x) => x)
                  .length !== 0
              }
              libraryManga={currentManga as LibraryManga}
              onError={window.electron.log.error}
              onClose={() => setSearchModalData(null)}
              searchModalData={searchModalData}
            />
            <Paper elevation={3} className={css(styles.utilityContainer)}>
              {/* If this manga is not in the cache then only show the start reading button */}
              {/* First component: Reading button */}
              <div className={css(styles.utilityButtonContainer)}>
                <Button
                  className={css(
                    styles.startReadingButton,
                    allChaptersRead && styles.disabledButton
                  )}
                  disabled={
                    (!!chapterToDisplay && !currentManga.Chapters[0]) ||
                    allChaptersRead
                  }
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    const mangaPage = (() => {
                      const foundChapter =
                        chapterData.current[
                          (chapterToDisplay ?? currentManga.Chapters[0])
                            .ChapterID
                        ];

                      if (foundChapter) {
                        const { currentPage } = foundChapter;
                        return currentPage !== -1 ? currentPage : 1;
                      }

                      return 1;
                    })();

                    if (chapterToDisplay) {
                      Navigate(
                        getReadUrl(
                          currentManga.MangaID,
                          currentManga.Name,
                          source,
                          chapterToDisplay?.ChapterID,
                          mangaPage
                        )
                      );
                    }
                  }}
                >
                  {ReadingButtonInnerText}
                </Button>
              </div>
              {isInLibrary ? (
                <>
                  <hr className={css(styles.extendedDataRule)} />
                  {/* Second component: Manga Progress */}
                  <div className={css(styles.mangaProgressContainer)}>
                    <div className={css(styles.mangaProgress)}>
                      <div className={css(styles.mangaProgressText)}>
                        {`${calculateReadChapters()} / ${
                          calculateChaptersNoDuplicates()?.length
                        }`}
                      </div>
                      <div className={css(styles.mangaProgressBar)}>
                        <div
                          className={css(styles.mangaProgressBarFiller)}
                          style={{
                            width: `${mangaProgressBar}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Third component: Time Elapsed */}
                  <div className={css(styles.timeElapsedContainer)}>
                    <div className={css(styles.timeElapsed)}>
                      <div className={css(styles.timeElapsedText)}>
                        {(() => {
                          let totalElapsedTime = 0;
                          currentManga.Chapters.forEach((x) => {
                            const foundChapter = chapterData.current[
                              x.ChapterID
                            ] || { timeElapsed: 0 };
                            totalElapsedTime += foundChapter.timeElapsed;
                          });
                          const timeElapsedDuration = dayjs.duration(
                            totalElapsedTime,
                            'milliseconds'
                          );

                          // Get the hours, minutes, and seconds
                          const [hours, minutes, seconds] = [
                            timeElapsedDuration.hours(),
                            timeElapsedDuration.minutes(),
                            timeElapsedDuration.seconds(),
                          ];

                          // Convert to elements
                          return (
                            <>
                              <span
                                className={css(
                                  styles.timeElapsedTextItem,
                                  styles.hours
                                )}
                              >
                                {hours}
                              </span>
                              <span
                                className={css(
                                  styles.timeElapsedTextItem,
                                  styles.minutes
                                )}
                              >
                                {minutes}
                              </span>
                              <span
                                className={css(
                                  styles.timeElapsedTextItem,
                                  styles.seconds
                                )}
                              >
                                {seconds}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    {/* Fourth component: Tracking */}
                    {authenticatedTrackers.current?.length > 0 ? (
                      <div className={css(styles.trackingContainer)}>
                        {(() => {
                          return authenticatedTrackers.current.map(
                            (trackingName) => {
                              const TrackerClass = getTracker(trackingName);

                              const tracker = new TrackerClass();
                              return (
                                <Tooltip
                                  key={`${trackingName}_tooltip`}
                                  title={`${tracker.getName()}`}
                                >
                                  <button
                                    type="button"
                                    className={css(
                                      styles.trackingContainerItem
                                    )}
                                    key={trackingName}
                                    onClick={() => {
                                      tracker
                                        .searchMangas(currentManga.Name)
                                        .then((data) => {
                                          const mediaData = data?.data?.Page;
                                          const currentTracking = (
                                            currentManga as LibraryManga
                                          ).Tracking;

                                          if (mediaData) {
                                            const foundMedia =
                                              mediaData.media.find(
                                                (x: Media) =>
                                                  currentTracking?.[
                                                    trackingName
                                                  ]?.id === x.mediaId
                                              );

                                            if (
                                              foundMedia &&
                                              foundMedia.userTrackedInfo &&
                                              currentTracking
                                            ) {
                                              const UTI =
                                                foundMedia.userTrackedInfo; // heh.

                                              let startedAtDate:
                                                | Date
                                                | undefined;
                                              let completedAtDate:
                                                | Date
                                                | undefined;

                                              if (UTI.startedAt)
                                                startedAtDate = new Date(
                                                  `${UTI.startedAt.year}-${UTI.startedAt.month}-${UTI.startedAt.day}`
                                                );

                                              if (UTI.completedAt)
                                                completedAtDate = new Date(
                                                  `${UTI.completedAt.year}-${UTI.completedAt.month}-${UTI.completedAt.day}`
                                                );

                                              currentTracking[trackingName] = {
                                                ...currentTracking[
                                                  trackingName
                                                ],
                                                ...UTI,
                                                startedAt: Number.isNaN(
                                                  Number(
                                                    startedAtDate?.getTime()
                                                  )
                                                )
                                                  ? currentTracking[
                                                      trackingName
                                                    ]?.startedAt
                                                  : startedAtDate,
                                                completedAt: Number.isNaN(
                                                  Number(
                                                    completedAtDate?.getTime()
                                                  )
                                                )
                                                  ? currentTracking[
                                                      trackingName
                                                    ]?.completedAt
                                                  : completedAtDate,
                                              };

                                              window.electron.library.addMangasToCache(
                                                currentManga
                                              );
                                            }

                                            return setSearchModalData(
                                              Object.assign(mediaData, {
                                                tracker: trackingName,
                                              })
                                            );
                                          }
                                        })
                                        .catch(console.error);
                                    }}
                                  >
                                    <img
                                      src={tracker.getIcon()}
                                      alt={trackingName}
                                    />
                                    {(currentManga as LibraryManga).Tracking?.[
                                      trackingName
                                    ] ? (
                                      <div
                                        className={css(
                                          styles.trackingContainerItemOverlay
                                        )}
                                      >
                                        <CheckIcon
                                          className={css(
                                            styles.trackingContainerItemOverlayIcon
                                          )}
                                        />
                                      </div>
                                    ) : null}
                                  </button>
                                </Tooltip>
                              );
                            }
                          );
                        })()}
                      </div>
                    ) : null}
                  </div>
                </>
              ) : null}
            </Paper>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={css(styles.container, styles.loadingContainer)}>
      <div className={css(styles.circularProgress)}>
        <CircularProgress />
      </div>
    </div>
  );
};

export default View;
