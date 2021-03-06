/* eslint-disable no-constant-condition */
import {
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Select,
  Box,
  MenuItem,
  Checkbox,
} from '@mui/material';

import { StyleSheet, css } from 'aphrodite/no-important';
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  SyntheticEvent,
  useCallback,
} from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { userInfo } from 'os';
import { sample, clamp, isUndefined } from 'lodash';

import LazyLoad, { forceCheck } from 'react-lazyload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DownloadIcon from '@mui/icons-material/Download';
import parseQuery from '../util/search';

import { FullManga, Manga as MangaType } from '../../main/util/manga';
import type { ReadDatabaseValue } from '../../main/util/read';
import { useTranslation } from '../../shared/intl';
import MangaItem from '../components/mangaitem';
import useQuery from '../util/hook/usequery';
import Handler from '../../main/sources/handler';
import useForceUpdate from '../util/hook/useforceupdate';
import MiscEnmap from '../../main/util/misc';
import useEvent from '../util/hook/useevent';
import Theme from '../../main/util/theme';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const themeColors = currentTheme.getColors();
const pageStyle = currentTheme.getPageStyle('library');

const libraryStyleSheet = StyleSheet.create({
  container: {
    display: 'block',
    backgroundColor: themeColors.background,
    position: 'absolute',
    width: '100%',
    height: 'calc(100vh - 42px)',
  },

  searchbarContainer: {
    position: 'fixed',
    bottom: 15,
    left: 10,
    width: 'fit-content',
    height: 'fit-content',
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    justifyContent: 'center',
    border: '1px solid transparent',
    zIndex: 260,
  },

  searchbarContainerInner: {
    backgroundColor: themeColors.backgroundLight,
    color: themeColors.textLight,
    borderRadius: '80%',
    padding: '8px',
    width: '52px',
    height: '52px',
    opacity: 0.2,
    transition:
      'width 0.2s ease-out, opacity 0.2s ease-in-out, border-radius 0s ease-in-out',
    ':focus-within': {
      opacity: 1,
      width: 'fit-content',
      borderRadius: '4px',
    },
  },
  searchbar: {
    width: '64px',
    minWidth: '64px',
    height: '100%',
    transition: 'width 0.2s ease-in-out',
    opacity: 0,
    ':focus-within': {
      width: '600px',
      minWidth: '300px',
      opacity: 1,
    },
  },
  libraryContainer: {
    display: 'block',
    position: 'absolute',
    width: 'calc(100% - 64px)',
    padding: '32px',
    height: 'calc(100% - 48px)',
    overflowY: 'scroll',
    '::-webkit-scrollbar': {
      width: '8px',
    },
    '::-webkit-scrollbar-thumb': {
      background: themeColors.white,
    },
  },

  welcomeContainer: {
    width: '100%',
    maxHeight: '192px',
    minHeight: '128px',
    margin: '0px 0px 8px 0px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  paperObject: {
    backgroundColor: themeColors.backgroundDark,
  },

  heatmapContainer: {
    '@media (max-width: 900px)': {
      display: 'none',
    },
    position: 'relative',
    width: '192px',
    height: '192px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },

  infoPaperBlock: {
    position: 'relative',
    padding: '8px 16px',
    width: '100%',
    maxWidth: 'calc(900px - 192px - 32px)',
    height: 'calc(192px - 16px)',
    backgroundColor: themeColors.textLight,
    marginLeft: '10px',
    '@media (max-width: 900px)': {
      maxWidth: '75%',
    },
  },

  infoPaperHeaderBase: {
    color: themeColors.textLight,
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    margin: '0',
  },
  infoPaperHeaderMain: {
    textAlign: 'left',
    fontSize: '2.4em',
    textShadow: `0 0 10px ${themeColors.black}`,
  },
  infoPaperHeaderSub: {
    fontSize: '1.2em',
  },

  infoHighlight: {
    textDecoration: 'none',
    color: themeColors.accent,
  },

  infoRegular: {
    fontFamily: '"PT Sans Narrow", "Roboto", "Helvetica", "Arial", sans-serif',
    letterSpacing: '0.05em',
  },

  darkHR: {
    // border: '2px solid #0E0C0E',
    // use background image instead of border color so we can use gradients
    border: 'none',
    backgroundImage: 'linear-gradient(to right, #0E0C0E, transparent)',
    width: '100%',
    height: '2px',
  },

  centeredHR: {
    border: 'none',
    margin: '28px 0px 20px 0px',
    backgroundImage:
      'radial-gradient(circle at center, #FFFFFE, transparent 45%)',
    width: '100%',
    height: '2px',
  },

  mangaStatsContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    top: '-8px',
    justifyContent: 'space-between',
    width: 'calc(100%)',
    height: 'calc(50% - 16px)',
    padding: '8px 0',
  },

  mangaStatsItem: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0px 8px',
    height: '100%',
    width: 'calc(100% / 3)',
  },

  mangaStatsSpan: {
    marginTop: '8px',
  },

  noMangaContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '45%',
  },

  globalSearchContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '45%',
  },

  accordionItem: {
    margin: '0px 0px 8px 0px',
    backgroundColor: themeColors.backgroundDark,
  },

  accordionItemIcon: {
    margin: '0px 8px 0px 0px',
  },

  sourceContainer: {
    position: 'relative',
    display: 'flex',
  },

  list: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  accordionText: {
    fontSize: '1.2rem',
    fontFamily: '"PT Sans Narrow", "Roboto", "Helvetica", "Arial", sans-serif',
  },

  settingsButton: {
    position: 'absolute',
    right: '8px',
    top: '8px',
    width: '32px',
    height: '32px',
  },

  settingsIcon: {
    transition: 'transform 0.4s ease-in-out',
    width: '24px',
    height: '24px',
    color: themeColors.accent,
    ':hover': {
      transform: 'scale(1.2) rotate(90deg)',
    },
  },

  sourcesButton: {
    position: 'absolute',
    right: '8px',
    top: '36px',
    marginTop: '2px',
    width: '32px',
    height: '32px',
  },

  sourcesIcon: {
    transition: 'transform 0.4s ease-in-out',
    width: '24px',
    height: '24px',
    color: themeColors.accent,
    ':hover': {
      transform: 'translateY(4px)',
    },
  },

  accordionSearchButton: {
    float: 'right',
    position: 'relative',
    margin: '0px 24px 0px 0px',
  },

  accordionSearchIcon: {
    color: themeColors.accent,
    transition: 'transform 0.4s ease-in-out, color 0.4s ease-in-out',
    ':hover': {
      color: themeColors.textLight,
      transform: 'scale(1.2) rotate(65deg)',
    },
  },

  accordionRefreshButton: {
    float: 'right',
    position: 'relative',
    margin: '0px 24px 0px 0px',
  },

  accordionRefreshIconSpin: {
    transition: 'unset',
    cursor: 'default',
    filter: 'grayscale(100%)',
    animationDuration: '1.5s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
    animationName: [
      {
        '0%': {
          transform: 'rotate(0deg)',
        },
        '100%': {
          transform: 'rotate(360deg)',
        },
      },
    ],
    ':hover': {
      color: themeColors.accent,
      transform: '',
    },
  },

  accordionRefreshIcon: {
    color: themeColors.accent,
    transition: 'transform 0.4s ease-in-out, color 0.4s ease-in-out',
    ':hover': {
      color: themeColors.textLight,
      transform: 'scale(1.2) rotate(180deg)',
    },
  },

  accordionSortMethodContainer: {
    display: 'flex',
    width: '30%',
    flexShrink: 2,
    color: themeColors.textLight,
    '@media (max-width: 750px)': {
      width: '33%',
    },
  },

  accordionSortMethodSelectItem: {
    height: '32px',
    marginLeft: '8px',
    marginRight: '8px',
  },

  accordionItemCount: {
    verticalAlign: 'bottom',
    lineHeight: '32px',
    '@media (max-width: 750px)': {
      display: 'none',
    },
  },

  accordionSortOrderCheckbox: {
    display: 'flex',
    maxHeight: '24px',
    maxWidth: '24px',
    color: themeColors.accent,
    top: '5px',
  },

  ...pageStyle,
}) as any;

let pTarget: MangaType | undefined;
const Library = () => {
  useEvent();
  useEffect(() => {
    window.electron.cache.delete(
      'searchdata',
      'source',
      'offset',
      'specifiedQueryLoadedPages',
      'filters'
    );
  }, []);

  const { t, a: arrTrans } = useTranslation();
  const [readingPrefixTarget, setPTargetINT] = useState(pTarget);
  const setPTarget = useCallback(
    (newPTarget: MangaType) => {
      setPTargetINT(newPTarget);
      pTarget = newPTarget;
    },
    [setPTargetINT]
  );

  const userName = useRef(userInfo().username);
  const Navigate = useNavigate();
  const forceUpdate = useForceUpdate();

  const { current: noResultsFlavorTexts } = useRef(
    (() => {
      const NR_PREFIX = `library_nr_flavor`;
      const ALL_FLAVORS = [];
      let i = 0;

      while (true) {
        const headerItem = t(`${NR_PREFIX}_${i}h`);
        const subheaderItem = t(`${NR_PREFIX}_${i}s`);

        if (!headerItem || !subheaderItem || !Array.isArray(subheaderItem))
          break;

        i++;
        ALL_FLAVORS.push(headerItem, ...subheaderItem);
      }

      return ALL_FLAVORS;
    })()
  );

  const libraryFlavorTexts = useMemo(() => {
    if (!readingPrefixTarget) return [t('library_flavor_default')];
    const LIBRARY_PREFIX = `library_flavor_`;
    const ALL_FLAVORS = [];
    let i = 1;

    while (true) {
      const K = `${LIBRARY_PREFIX}${i}`;
      if (!Array.isArray(arrTrans(`${LIBRARY_PREFIX}${i}`, []))) break;

      const translated = arrTrans(
        K,
        [
          undefined,
          <span
            className={css(
              libraryStyleSheet.infoRegular,
              libraryStyleSheet.infoHighlight
            )}
          />,
        ],
        {
          mangaTitle: readingPrefixTarget?.Name,
        }
      );

      ALL_FLAVORS.push(translated);
      i++;
    }

    return ALL_FLAVORS;
  }, [arrTrans, t, readingPrefixTarget]);

  const { library: LibraryUtilities } = window.electron;
  const mangaItemDisplayFormat: 'list' | 'grid' = 'list';
  const pageQueryParams = useQuery();
  const [searchQuery, setSearchQuery] = useState(
    pageQueryParams.get('search') || ''
  );
  const [sourcesFetching, setSourcesFetching] = useState<string[]>(
    window.electron.library.cycle.getUpdatingSources()
  );
  const parsedSearch = parseQuery(searchQuery);
  const currentSearchParams = new URLSearchParams();
  currentSearchParams.set('search', searchQuery);

  const accordionArray: Array<JSX.Element> = [];
  const librarySources = useMemo(() => {
    const Sources = LibraryUtilities.getSources();
    const downloadedSources = window.electron.util.getSourceMetadata();
    Object.keys(Sources).forEach((key) => {
      if (
        !Sources[key].Enabled ||
        !downloadedSources.find((source) => source.name === key)
      ) {
        delete Sources[key];
      }
    });

    return Sources;
  }, [LibraryUtilities]);
  const librarySourcesKeys = Object.keys(librarySources);

  const userSettings = useRef(window.electron.settings.getAll());
  const fetchQueue = useRef<Array<string>>([]);
  const mappedFileNamesRef = useRef(
    window.electron.util.getSourceFiles().map(Handler.getSource)
  );

  useEffect(() => {
    const updateFn = (
      e: Event,
      mangaData: { manga: FullManga; source: string }
    ) => {
      window.electron.log.info(`Manga ${mangaData.manga.Name} updated.`);
    };
    const cycleCompleteFn = () => {
      fetchQueue.current = [];
      window.electron.log.info('Update cycle complete.');
      setSourcesFetching([]);
    };

    const cycleStartFn = () => {
      window.electron.log.info('Update cycle started.');
      const updatingSources =
        window.electron.library.cycle.getUpdatingSources();

      const sourcesToAdd: string[] = [];
      Object.keys(librarySources).forEach((source) => {
        if (
          updatingSources.includes(source) &&
          !sourcesFetching.includes(source)
        ) {
          sourcesToAdd.push(source);
        }
      });

      setSourcesFetching([...sourcesFetching, ...sourcesToAdd]);
    };

    window.electron.ipcRenderer.on('update-cycle-complete', cycleCompleteFn);
    window.electron.ipcRenderer.on('update-cycle-start', cycleStartFn);
    window.electron.ipcRenderer.on('manga-update', updateFn);

    return () => {
      window.electron.ipcRenderer.off('update-cycle-complete', cycleCompleteFn);
      window.electron.ipcRenderer.off('update-cycle-start', cycleStartFn);
      window.electron.ipcRenderer.off('manga-update', updateFn);
    };
  }, [librarySources, sourcesFetching]);

  useEffect(() => {
    const suwaLibrary = MiscEnmap.get('suwariyomi_library') ?? {};
    // Iterate through all sources and then make a `data_source` key for each source.
    mappedFileNamesRef.current.forEach((source) => {
      if (!suwaLibrary[`data_${source.getName()}`]) {
        suwaLibrary[`data_${source.getName()}`] = {};
      }
    });

    MiscEnmap.set('suwariyomi_library', suwaLibrary);
  }, []);

  // If this changes, I expect the library to be reloaded and re-sorted.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const suwariyomiLibrarySettings =
    (MiscEnmap.get('suwariyomi_library') as Record<any, any>) ?? {};

  const hasNoSources = mappedFileNamesRef.current.length <= 0;
  // Filter out sources that are not enabled AND has no manga
  const cachedMangas = useRef<Record<string, Array<FullManga>>>({});
  const libraryMangas = useRef<Record<string, string[]>>({});
  const sourceList: Record<string, FullManga[]> = useMemo(() => {
    const sourceListTemp: Record<string, FullManga[]> = {};
    librarySourcesKeys
      .filter(
        (source) =>
          librarySources[source].Enabled &&
          librarySources[source].Manga.length > 0 &&
          (searchQuery.trim().length === 0 ||
            (cachedMangas.current[source] ??
              (LibraryUtilities.getCachedMangas(source) ||
                []))) /* .some((manga) =>
              manga.Name.toLowerCase().includes(searchQuery.toLowerCase())
            ) */
      )
      .forEach((source) => {
        const libraryMangasOfSource =
          libraryMangas.current[source] ??
          LibraryUtilities.getLibraryMangas(source) ??
          [];

        if (libraryMangasOfSource.length > 0 && !libraryMangas.current[source])
          libraryMangas.current[source] = libraryMangasOfSource;

        sourceListTemp[source] = LibraryUtilities.getLibraryMangas(source)
          .map((x) => {
            const findFN = (y: FullManga) => y.MangaID === x;
            if (cachedMangas.current[source]?.length > 0) {
              return cachedMangas.current[source].find(findFN);
            }

            const cachedManga = LibraryUtilities.getCachedMangas(source);
            cachedMangas.current[source] = cachedManga;
            return cachedManga.find(findFN);
          })
          .filter((x) => x) as FullManga[]; // Remove all undefined values
      });

    return sourceListTemp;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    LibraryUtilities,
    librarySources,
    librarySourcesKeys,
    searchQuery,
    fetchQueue,
    sourcesFetching, // This is to have a re-cache whenever a source starts or finishes fetching
  ]);

  useEffect(() => {
    // Find all sources that have a library size that isn't proportional to their cache size.
    const queuedSources: string[] = [];
    mappedFileNamesRef.current.forEach((source) => {
      const sourceName = source.getName();
      if (
        LibraryUtilities.getCachedMangas(sourceName).length /
          LibraryUtilities.getLibraryMangas(sourceName).length <
        0.8
      ) {
        queuedSources.push(sourceName);
      }
    });

    if (queuedSources.length > 0) {
      fetchQueue.current = queuedSources;
    }
  });

  useEffect(() => {
    if (fetchQueue.current.length <= 0) return;

    const allKeys: Record<string, string[]> = {};
    fetchQueue.current
      .filter((x) => !sourcesFetching.includes(x))
      .forEach((source) => {
        window.electron.library
          .getLibraryMangas(source)
          .filter((x) => librarySources[source]?.Manga.includes(x))
          .forEach((mangaID) => {
            allKeys[source] = allKeys[source] || [];
            allKeys[source].push(mangaID);

            if (sourcesFetching.includes(source)) return;
            fetchQueue.current.splice(fetchQueue.current.indexOf(source), 1);
          });
      });

    // Request all manga that are not in the cache
    const allKeysKeys = Object.keys(allKeys); // AI programming done by a human
    allKeysKeys.forEach((source) => {
      const mangaIDs = allKeys[source];
      if (mangaIDs.length > 0) {
        window.electron.library.cycle.updateSource(source);
      }
    });

    window.electron.library.cycle.forceUpdateCycle();
  }, [sourcesFetching, sourceList, fetchQueue, librarySources]);

  const sourceListValues = Object.values(sourceList);
  const allCachedRead = useRef<Record<string, ReadDatabaseValue>>({});
  const allChapters = mappedFileNamesRef.current
    .map((x) => {
      if (allCachedRead.current[x.getName()]) {
        return allCachedRead.current[x.getName()];
      }

      const alreadyRead = window.electron.read.get(x.getName());
      allCachedRead.current[x.getName()] = alreadyRead;
      return alreadyRead;
    })
    .filter((x) => x !== undefined)
    .flatMap((x) => Object.values(x));

  const allManga = allChapters
    .filter(
      (x) =>
        sourceListValues.flat().findIndex((y) => x.mangaid === y.MangaID) === -1 // Remove mangas that are present in the library already.
    )
    .filter((x, y, z) => z.findIndex((a) => a.mangaid === x.mangaid) === y); // Remove duplicates

  // This hassle is to ensure that manga that might not be in the library
  // but was still read at some point are still displayed in the statistics.
  const allMangaCount =
    allManga.reduce((acc) => acc + 1, 0) + sourceListValues.flat().length;

  useEffect(() => {
    window.electron.rpc.updateRPC({
      state:
        allMangaCount > 0
          ? `Overlooking ${allMangaCount} manga`
          : 'Looking for manga',
      largeImageKey: 'icon_large',
      details: 'Library',
      startTimestamp: Date.now(),
    });
  }, [allMangaCount]);

  const allChapterCount = allChapters.filter(
    (x) => x.currentPage >= x.pageCount
  ).length;

  let allPageCount = 0;
  const allCachedMangas = window.electron.library.getAllCachedMangas();
  allCachedMangas.forEach((manga) => {
    manga.Chapters?.forEach((chapter) => {
      const cachedVariant =
        allCachedRead.current[manga.SourceID]?.[chapter.ChapterID];

      if (cachedVariant)
        allPageCount += Number.isSafeInteger(cachedVariant.currentPage)
          ? cachedVariant.currentPage
          : chapter.PageCount;
    });
  });

  const mangaList = useMemo<Record<string, React.ReactElement[]>>(() => {
    const mangaObjectTemp: Record<string, React.ReactElement[]> = {};
    Object.keys(sourceList).forEach((source) => {
      const { sortOrder = 'desc', sortMethod = 'title' } =
        suwariyomiLibrarySettings[`data_${source}`] ?? {};
      const serializedReadMethod = sortMethod.toLowerCase().split(' ').join('');

      // Special sort methods for unread manga.
      const clonedMangaList = [...sourceList[source]].filter(
        (x) => x.Chapters?.length > 0
      );

      mangaObjectTemp[source] = clonedMangaList
        .filter((x) => !isUndefined(x.Chapters))
        .filter(
          (x) =>
            !!parsedSearch && // Tag search
            parsedSearch.every((y) => {
              const isNegated = y.startsWith('-');
              // eslint-disable-next-line no-param-reassign
              if (isNegated) y = y.slice(1);

              const tagsTest = x.Tags.some((z: string) =>
                z.toLowerCase().includes(y.toLowerCase())
              );

              // i'm not a real programmer
              const nameTest = x.Name.toLowerCase().includes(y.toLowerCase());
              const [chapterQuery, pageQuery] = [
                y.match(/(chapters)(<=|>=|<|>|=)(\d+)/i),
                y.match(/(pages)(<=|>=|<|>|=)(\d+)/i),
              ].map((z) =>
                z !== null && z[1] && z[2] && z[3]
                  ? (
                      {
                        '<': (a: number, b: number) => a < b,
                        '>': (a: number, b: number) => a > b,
                        '<=': (a: number, b: number) => a <= b,
                        '>=': (a: number, b: number) => a >= b,
                        '=': (a: number, b: number) => a === b,
                      } as Record<
                        string,
                        (toCompare: number, compareTo: number) => boolean
                      >
                    )[z[2]]?.(
                      z[1].toLowerCase() === 'chapters'
                        ? x.Chapters.length
                        : Object.values(allCachedRead.current[source] ?? {})
                            .filter((a) => a.mangaid === x.MangaID)
                            .reduce((acc, b) => acc + b.pageCount, 0),
                      Number(z[3])
                    ) ?? false
                  : undefined
              );

              const queryVerification =
                tagsTest || nameTest || chapterQuery || pageQuery;

              return isNegated ? !queryVerification : queryVerification;
            })
        )
        .sort((a, b) => {
          const getUTCHours = (date: Date) =>
            date.getUTCHours() + date.getTimezoneOffset() / 60;
          switch (serializedReadMethod) {
            case 'unread': {
              const convertToReadChapters = (manga: FullManga) =>
                manga.Chapters?.reduce((acc, x) => {
                  const cachedChapter =
                    allCachedRead.current[manga.SourceID]?.[x.ChapterID];

                  if (!cachedChapter || cachedChapter.currentPage === -1)
                    return acc;
                  if (cachedChapter.currentPage < x.PageCount) return acc;

                  return acc + 1;
                }, 0);

              const chapterCountA =
                a.Chapters.length - convertToReadChapters(a);
              const chapterCountB =
                b.Chapters.length - convertToReadChapters(b);

              if (chapterCountA === chapterCountB)
                return a.Name.localeCompare(b.Name);

              return chapterCountB - chapterCountA;
            }
            case 'lastread': {
              const lastReadA: Date = new Date(a.LastRead ?? 0);
              const lastReadB: Date = new Date(b.LastRead ?? 0);

              // Convert to UTC time
              [lastReadA, lastReadB].forEach((x) =>
                x.setUTCHours(getUTCHours(x))
              );

              return lastReadB.getTime() - lastReadA.getTime();
            }
            case 'latestchapter': {
              // use publishedAt - which is a Date object - to reduce
              const reducerFN = (acc: Date, x: FullManga['Chapters'][number]) =>
                acc.getTime() > x.PublishedAt.getTime() ? acc : x.PublishedAt;

              const latestChapterA: Date = a.Chapters?.reduce(
                reducerFN,
                new Date(0)
              );
              const latestChapterB: Date = b.Chapters?.reduce(
                reducerFN,
                new Date(0)
              );

              [latestChapterA, latestChapterB].forEach((x) =>
                x.setUTCHours(getUTCHours(x))
              );

              return latestChapterB.getTime() - latestChapterA.getTime();
            }
            case 'totalchapters': {
              return b.Chapters?.length - a.Chapters?.length;
            }
            case 'dateadded': {
              const dateAddedA: Date = new Date(a.Added ?? 0);
              const dateAddedB: Date = new Date(b.Added ?? 0);

              // Convert to UTC time
              [dateAddedA, dateAddedB].forEach((x) =>
                x.setUTCHours(getUTCHours(x))
              );

              return dateAddedB.getTime() - dateAddedA.getTime();
            }
            case 'datefetched': {
              const dateFetchedA: Date = new Date(a.DateFetched ?? 0);
              const dateFetchedB: Date = new Date(b.DateFetched ?? 0);

              // Convert to UTC time
              [dateFetchedA, dateFetchedB].forEach((x) =>
                x.setUTCHours(getUTCHours(x))
              );

              return dateFetchedB.getTime() - dateFetchedA.getTime();
            }
            case 'category':
            default:
              // 'title':
              return a.Name.localeCompare(b.Name);
          }
        })
        .map((Manga) => (
          <LazyLoad
            height={310}
            throttle={300}
            scrollContainer="#lazyload"
            unmountIfInvisible
            once
          >
            <MangaItem
              backto="library"
              displayType="list"
              // Disabled because this only exists for testing purposes
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              listDisplayType="verbose"
              title={Manga.Name}
              coverUrl={Manga.CoverURL || undefined}
              tags={Manga.Tags ?? []}
              synopsis={Manga.Synopsis}
              key={Manga.Name}
              source={Manga.SourceID}
              mangaid={Manga.MangaID}
              cachedMangaData={Manga}
              cachedChapterData={allCachedRead.current[Manga.SourceID]}
              isLibrary
            />
          </LazyLoad>
        ));

      mangaObjectTemp[source] =
        sortOrder === 'asc'
          ? mangaObjectTemp[source].reverse()
          : mangaObjectTemp[source];
    });

    return mangaObjectTemp;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchQuery,
    sourceList,
    allChapters,
    suwariyomiLibrarySettings,
    fetchQueue, // This is here to force a re-creation of the manga list when the fetch queue changes (when the refresh button is clicked, especially)
  ]);

  librarySourcesKeys.forEach((sourceKey) => {
    const mangaListArray = mangaList[sourceKey] ?? [];
    accordionArray.push(
      <LazyLoad key={`${sourceKey}-lazyload`} scrollContainer="#lazyload">
        <Accordion
          TransitionProps={{
            unmountOnExit: true,
            onEntered: forceCheck,
            onExited: forceCheck,
          }}
          TransitionComponent={undefined}
          defaultExpanded={
            searchQuery !== '' && librarySources[sourceKey].Manga.length <= 45
          }
          classes={{
            root: css(libraryStyleSheet.accordionItem),
          }}
          key={sourceKey}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon htmlColor={themeColors.textLight} />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <img
              src={
                mappedFileNamesRef.current
                  .filter(
                    (x) => x.getName().toLowerCase() === sourceKey.toLowerCase()
                  )
                  .map((x) => x.getIcon())[0]
              }
              className={css(libraryStyleSheet.accordionItemIcon)}
              alt={sourceKey}
            />
            <Typography
              sx={{
                width: '40%',
                flexShrink: 2,
                color: themeColors.textLight,
              }}
              className={css(libraryStyleSheet.accordionText)}
            >
              {sourceKey}
            </Typography>
            <Typography
              sx={{
                color: themeColors.textLight,
                flexShrink: 2,
                verticalAlign: 'center',
                lineHeight: '1.5',
                width: '30%',
              }}
              className={css(libraryStyleSheet.accordionItemCount)}
            >
              {t('library_manga_count', { count: mangaListArray.length })}
            </Typography>
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
            <div
              onClick={(e) => e.stopPropagation()}
              className={css(libraryStyleSheet.accordionSortMethodContainer)}
            >
              <Checkbox
                sx={{
                  color: themeColors.textLight,
                }}
                checked={
                  suwariyomiLibrarySettings[`data_${sourceKey}`]?.sortOrder ===
                  'asc'
                }
                className={css(libraryStyleSheet.accordionSortOrderCheckbox)}
                onChange={(e) => {
                  suwariyomiLibrarySettings[`data_${sourceKey}`] = {
                    ...(suwariyomiLibrarySettings[`data_${sourceKey}`] ?? {}),
                    sortOrder: e.target.checked ? 'asc' : 'desc',
                  };

                  MiscEnmap.set(
                    'suwariyomi_library',
                    suwariyomiLibrarySettings
                  );
                  forceUpdate();
                }}
                icon={<ArrowDownwardIcon style={{}} />}
                checkedIcon={<ArrowUpwardIcon />}
              />
              <Select
                className={css(libraryStyleSheet.accordionSortMethodSelectItem)}
                renderValue={(value) => {
                  return (
                    <Typography
                      sx={{
                        color: themeColors.textLight,
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        verticalAlign: 'center',
                        lineHeight: '32px',
                        letterSpacing: '0.5px',
                        fontFamily:
                          '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
                      }}
                    >
                      {(
                        {
                          Title: 'Title',
                          Unread: 'Unread',
                          Category: 'Category',
                          'Last Read': 'Last Read',
                          'Latest Chapter': 'Latest Chapter',
                          'Total Chapters': 'Total Chapters',
                          'Date Added': 'Date Added',
                          'Date Fetched': 'Date Fetched',
                        } as Record<string, string>
                      )[value] ?? '???'}
                    </Typography>
                  );
                }}
                value={(() => {
                  const sortMethod =
                    suwariyomiLibrarySettings[`data_${sourceKey}`]?.sortMethod;

                  return sortMethod ?? 'Title';
                })()}
                onChange={(e) => {
                  const sortData =
                    suwariyomiLibrarySettings[`data_${sourceKey}`];

                  if (sortData) {
                    sortData.sortMethod = e.target.value;
                  } else {
                    suwariyomiLibrarySettings[`data_${sourceKey}`] = {
                      sortMethod: e.target.value,
                      sortOrder: 'desc',
                    };
                  }
                  MiscEnmap.set(
                    'suwariyomi_library',
                    suwariyomiLibrarySettings
                  );

                  forceUpdate();
                }}
              >
                <MenuItem value="Title">{t('library_sort_title')}</MenuItem>
                <MenuItem value="Unread">{t('library_sort_unread')}</MenuItem>
                <MenuItem value="Last Read">{t('library_sort_last')}</MenuItem>
                <MenuItem value="Latest Chapter">
                  {t('library_sort_latest')}
                </MenuItem>
                <MenuItem value="Total Chapters">
                  {t('library_sort_total')}
                </MenuItem>
                <MenuItem value="Date Added">
                  {t('library_sort_added')}
                </MenuItem>
                <MenuItem value="Date Fetched">
                  {t('library_sort_fetched')}
                </MenuItem>
              </Select>
            </div>
            <Tooltip title={t('library_source_tooltip_search')}>
              <IconButton
                className={css(libraryStyleSheet.accordionSearchButton)}
                onClick={(e) => {
                  e.stopPropagation();
                  Navigate(`/search?source=${sourceKey}`);
                }}
              >
                <SearchIcon
                  className={css(libraryStyleSheet.accordionSearchIcon)}
                />
              </IconButton>
            </Tooltip>
            <Tooltip
              title={`${
                sourcesFetching.includes(sourceKey)
                  ? t('library_fetching_current')
                  : t('library_refresh')
              }`}
            >
              <IconButton
                className={css(libraryStyleSheet.accordionRefreshButton)}
                onClick={(e) => {
                  if (sourcesFetching.includes(sourceKey)) return;
                  e.stopPropagation();

                  cachedMangas.current[sourceKey] = [];
                  if (!fetchQueue.current.includes(sourceKey))
                    fetchQueue.current.push(sourceKey);
                  forceUpdate();
                }}
              >
                <RefreshIcon
                  className={css(
                    libraryStyleSheet.accordionRefreshIcon,
                    sourcesFetching.includes(sourceKey) &&
                      libraryStyleSheet.accordionRefreshIconSpin
                  )}
                />
              </IconButton>
            </Tooltip>
          </AccordionSummary>
          <AccordionDetails>
            <div
              className={css(
                libraryStyleSheet.sourceContainer,
                libraryStyleSheet[mangaItemDisplayFormat]
              )}
            >
              {mangaListArray}
            </div>
          </AccordionDetails>
        </Accordion>
      </LazyLoad>
    );
  });

  const filteredMediaList = sourceListValues
    .flat()
    .filter((x) => x.Name.toLowerCase().length <= 45);
  if (!readingPrefixTarget)
    setPTarget(
      filteredMediaList[Math.floor(Math.random() * filteredMediaList.length)]
    );

  const decidedFlavorText =
    noResultsFlavorTexts[
      Math.floor(Math.random() * noResultsFlavorTexts.length)
    ];

  // From every manga, generate a loose searchable description.
  // This will be used as the placeholder text, in which the user can
  // press Shift + Tab to fill in the search bar if it's empty.
  // The library will choose a random item from the list of loose descriptions
  // and display it as the placeholder text.

  // Start off with the title of the manga.
  let looseDescriptions = sourceListValues.flat().map((x) => x.Name);

  sourceListValues.flat().forEach((x) => {
    // Add a random amount of tags.
    if (x.Tags) {
      const tagsList = x.Tags.slice(
        0,
        Math.floor(Math.random() * x.Tags.length)
      );

      const Map = tagsList
        .map((y) => (y.includes(' ') ? `"${y}"` : y))
        .join(' ');

      looseDescriptions.push(Map);
    }
    // Add random page numbers.
    if (x.Chapters && x.Chapters.length > 0)
      looseDescriptions.push(
        `Chapters${Math.random() > 0.5 ? '>' : '<'}${Math.floor(
          clamp(
            Math.random() * x.Chapters.length,
            1,
            Math.min(0.25 * x.Chapters.length, x.Chapters.length)
          )
        )}`
      );
  });

  looseDescriptions = looseDescriptions.filter((x) => x.length > 0);
  const selectedDescription = useRef(
    looseDescriptions[Math.floor(Math.random() * looseDescriptions.length)]
  );

  return (
    <div className={css(libraryStyleSheet.container)}>
      {!hasNoSources ? (
        <div className={css(libraryStyleSheet.searchbarContainer)}>
          <Box
            component="form"
            className={css(libraryStyleSheet.searchbarContainerInner)}
            onSubmit={(e: SyntheticEvent<HTMLFormElement>) => {
              e.preventDefault();
              setSearchQuery(
                (e.target as unknown as HTMLInputElement[])[0].value
              );
            }}
          >
            <TextField
              label={t('library_search_placeholder')}
              placeholder={selectedDescription.current}
              className={css(libraryStyleSheet.searchbar)}
              variant="filled"
              defaultValue={searchQuery}
              error={!parsedSearch}
              helperText={parsedSearch ? '' : t('library_search_error_quotes')}
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  if (e.shiftKey) {
                    e.preventDefault();
                    e.stopPropagation();

                    if ((e.target as any).value.length === 0) {
                      (e.target as any).value = selectedDescription.current;
                      forceCheck();
                      setSearchQuery(selectedDescription.current);
                    }
                  }
                }
              }}
              sx={{
                '& .MuiInputLabel-root.Mui-focused': {
                  color: themeColors.accent,
                },

                '&.MuiTextField-root .MuiFilledInput-root.Mui-focused::after': {
                  borderBottom: `1px solid ${themeColors.accent}`,
                },
              }}
              onChange={(e) => {
                if (!userSettings.current.library.updateOnKeyPress) return;
                setSearchQuery((e.target as unknown as HTMLInputElement).value);
              }}
            />
          </Box>
        </div>
      ) : null}
      <div id="lazyload" className={css(libraryStyleSheet.libraryContainer)}>
        <div className={css(libraryStyleSheet.welcomeContainer)}>
          <Paper
            elevation={6}
            className={css(
              libraryStyleSheet.heatmapContainer,
              libraryStyleSheet.paperObject
            )}
          />
          <Paper
            elevation={6}
            className={css(
              libraryStyleSheet.infoPaperBlock,
              libraryStyleSheet.paperObject
            )}
          >
            <h1
              className={css(
                libraryStyleSheet.infoPaperHeaderBase,
                libraryStyleSheet.infoPaperHeaderMain
              )}
            >
              {userSettings.current?.library.displayUserName &&
              userName.current?.length <= 10
                ? t('library_welcome_name', { userName: userName.current })
                : t('library_welcome_anon')}
            </h1>
            <h4
              className={css(
                libraryStyleSheet.infoPaperHeaderBase,
                libraryStyleSheet.infoPaperHeaderSub
              )}
            >
              {sample(libraryFlavorTexts)}
            </h4>
            <hr className={css(libraryStyleSheet.darkHR)} />
            <div className={css(libraryStyleSheet.mangaStatsContainer)}>
              <div className={css(libraryStyleSheet.mangaStatsItem)}>
                <h3 className={css(libraryStyleSheet.infoPaperHeaderBase)}>
                  {t('library_info_total')}
                </h3>
                <span
                  className={css(
                    libraryStyleSheet.infoPaperHeaderBase,
                    libraryStyleSheet.mangaStatsSpan
                  )}
                >
                  {allMangaCount}
                </span>
              </div>
              <div className={css(libraryStyleSheet.mangaStatsItem)}>
                <h3 className={css(libraryStyleSheet.infoPaperHeaderBase)}>
                  {t('library_info_chapters')}
                </h3>
                <span
                  className={css(
                    libraryStyleSheet.infoPaperHeaderBase,
                    libraryStyleSheet.mangaStatsSpan
                  )}
                >
                  {allChapterCount}
                </span>
              </div>
              <div className={css(libraryStyleSheet.mangaStatsItem)}>
                <h3 className={css(libraryStyleSheet.infoPaperHeaderBase)}>
                  {t('library_info_pages')}
                </h3>
                <span
                  className={css(
                    libraryStyleSheet.infoPaperHeaderBase,
                    libraryStyleSheet.mangaStatsSpan
                  )}
                >
                  {allPageCount}
                </span>
              </div>
            </div>
            <Tooltip title={t('settings_tooltip')}>
              <IconButton
                className={css(libraryStyleSheet.settingsButton)}
                onClick={() => Navigate('/settings')}
              >
                <SettingsIcon className={css(libraryStyleSheet.settingsIcon)} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('sources_tooltip')}>
              <IconButton
                className={css(libraryStyleSheet.sourcesButton)}
                onClick={() => Navigate('/sources')}
              >
                <DownloadIcon className={css(libraryStyleSheet.sourcesIcon)} />
              </IconButton>
            </Tooltip>
          </Paper>
        </div>
        {accordionArray.length > 0 ? (
          accordionArray
        ) : (
          <div className={css(libraryStyleSheet.noMangaContainer)}>
            <Typography
              sx={{
                color: themeColors.textLight,
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              {hasNoSources
                ? t('library_sources_none_header')
                : decidedFlavorText[0]}
            </Typography>
            <Typography
              sx={{
                color: themeColors.textLight,
                fontSize: '16px',
              }}
            >
              {hasNoSources
                ? t('library_sources_none_subheader')[0]
                : decidedFlavorText[1]}
              <Link
                to={
                  hasNoSources
                    ? '/sources'
                    : `/search?${currentSearchParams.toString()}`
                }
                className={css(
                  libraryStyleSheet.infoPaperHeaderBase,
                  libraryStyleSheet.infoHighlight
                )}
              >
                {hasNoSources
                  ? t('library_sources_none_subheader')[1]
                  : decidedFlavorText[decidedFlavorText.length - 1]}
              </Link>
            </Typography>
          </div>
        )}
        {accordionArray.length > 0 ? (
          <div>
            <hr className={css(libraryStyleSheet.centeredHR)} />
            <div className={css(libraryStyleSheet.globalSearchContainer)}>
              <h3 className={css(libraryStyleSheet.infoPaperHeaderBase)}>
                {t('library_global_more_header')}
              </h3>
              <h4 className={css(libraryStyleSheet.infoPaperHeaderBase)}>
                {arrTrans('library_global_more_subheader', [
                  undefined,
                  <Link
                    className={css(libraryStyleSheet.infoHighlight)}
                    to={`/search?${currentSearchParams.toString()}`}
                  />,
                ])}
              </h4>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Library;
