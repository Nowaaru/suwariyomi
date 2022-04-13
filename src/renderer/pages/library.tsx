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
} from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { userInfo } from 'os';
import { capitalize, clamp, isUndefined } from 'lodash';

import LazyLoad, { forceCheck } from 'react-lazyload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import parseQuery from '../util/search';

import { FullManga, Manga as MangaType } from '../../main/util/manga';
import type { ReadDatabaseValue } from '../../main/util/read';
import MangaItem, { MangaItemProps } from '../components/mangaitem';
import useQuery from '../util/hook/usequery';
import Handler from '../../main/sources/handler';
import useForceUpdate from '../util/hook/useforceupdate';
import MiscEnmap from '../../main/util/misc';
import useEvent from '../util/hook/useevent';

const libraryStyleSheet = StyleSheet.create({
  container: {
    display: 'block',
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
    border: '1px solid #11111100',
    zIndex: 260,
  },

  searchbarContainerInner: {
    backgroundColor: '#FFFFFF',
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
      width: '4px',
    },
    '::-webkit-scrollbar-thumb': {
      background: '#FFFFFF',
    },
  },
  testContainer: {
    width: '100%',
    height: '250px',
    // height: "fit-content",
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
    backgroundColor: '#080708',
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
    backgroundColor: '#FFFFFF',
    marginLeft: '10px',
    '@media (max-width: 900px)': {
      maxWidth: '75%',
    },
  },

  infoPaperHeaderBase: {
    color: '#FFFFFF',
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    margin: '0',
  },
  infoPaperHeaderMain: {
    textAlign: 'left',
    fontSize: '2.4em',
  },
  infoPaperHeaderSub: {
    fontSize: '1.2em',
  },

  infoHighlight: {
    textDecoration: 'none',
    color: '#DF2935',
  },

  infoRegular: {
    fontFamily: '"PT Sans Narrow", "Roboto", "Helvetica", "Arial", sans-serif',
    letterSpacing: '0.05em',
  },

  darkHR: {
    // border: '2px solid #0E0C0E',
    // use background image instead of border color so we can use gradients
    border: 'none',
    backgroundImage: 'linear-gradient(to right, #0E0C0E, #00000000)',
    width: '100%',
    height: '2px',
  },

  centeredHR: {
    border: 'none',
    margin: '28px 0px 20px 0px',
    backgroundImage:
      'radial-gradient(circle at center, #FFFFFE, #00000000 45%)',
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
    backgroundColor: '#080708',
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
    color: '#DF2935',
    ':hover': {
      transform: 'scale(1.2) rotate(90deg)',
    },
  },

  accordionSearchButton: {
    float: 'right',
    position: 'relative',
    margin: '0px 24px 0px 0px',
  },

  accordionSearchIcon: {
    color: '#DF2935',
    transition: 'transform 0.4s ease-in-out, color 0.4s ease-in-out',
    ':hover': {
      color: '#FFFFFF',
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
      color: '#DF2935',
      transform: '',
    },
  },

  accordionRefreshIcon: {
    color: '#DF2935',
    transition: 'transform 0.4s ease-in-out, color 0.4s ease-in-out',
    ':hover': {
      color: '#FFFFFF',
      transform: 'scale(1.2) rotate(180deg)',
    },
  },

  accordionSortMethodContainer: {
    display: 'flex',
    width: '30%',
    flexShrink: 2,
    color: '#FFFFFF',
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
    color: '#DF2935',
    top: '5px',
  },
});

const noResultsFlavorTexts = [
  ["Nobody's reading manga here.", 'How about we look', 'somewhere else?'],
  ["This library's empty.", "Let's go", 'somewhere else.'],
  ['Nothing to see here.', "Let's", 'keep on moving.'],
  ['End of the road.', 'Want to', 'start building?'],
  ['Nobody here but us chickens.', 'Want to', 'search globally?'],
];

let readingPrefixTarget: MangaType | undefined;
let statusPrefix: string;
let statusSuffix: string;
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

  const userName = useRef(userInfo().username);
  const Navigate = useNavigate();

  const { library: LibraryUtilities } = window.electron;
  const mangaItemDisplayFormat: 'list' | 'grid' = 'list';
  const pageQueryParams = useQuery();
  const [searchQuery, setSearchQuery] = useState(
    pageQueryParams.get('search') || ''
  );
  const [sourcesFetching, setSourcesFetching] = useState<string[]>([]);
  const parsedSearch = parseQuery(searchQuery);
  const currentSearchParams = new URLSearchParams();
  currentSearchParams.set('search', searchQuery);

  const accordionArray: Array<JSX.Element> = [];
  const librarySources = LibraryUtilities.getSources();
  const librarySourcesKeys = Object.keys(librarySources);

  const userSettings = useRef(window.electron.settings.getAll());
  const fetchQueue = useRef<Array<string>>([]);
  const mappedFileNamesRef = useRef(
    window.electron.util.getSourceFiles().map(Handler.getSource)
  );

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
  const forceUpdate = useForceUpdate();

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
      if (
        LibraryUtilities.getCachedMangas(source.getName()).length <
        LibraryUtilities.getLibraryMangas(source.getName()).length
      ) {
        queuedSources.push(source.getName());
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
        window.electron.library.getLibraryMangas(source).forEach((mangaID) => {
          allKeys[source] = allKeys[source] || [];
          allKeys[source].push(mangaID);

          if (sourcesFetching.includes(source)) return;
          fetchQueue.current.splice(fetchQueue.current.indexOf(source), 1);
          setSourcesFetching([...sourcesFetching, source]);
        });
      });

    // Request all manga that are not in the cache
    const allKeysKeys = Object.keys(allKeys); // AI programming done by a human
    allKeysKeys.forEach((source) => {
      const mangaIDs = allKeys[source];
      if (mangaIDs.length > 0) {
        const foundSource = mappedFileNamesRef.current.find(
          (sourceObject) => sourceObject.getName() === source
        );

        if (foundSource) {
          foundSource
            .getMangas(mangaIDs, true)
            .then(async (mangaList) => {
              return Promise.allSettled(
                mangaList.flatMap(async (manga) => {
                  const awaitedManga = await manga;
                  window.electron.log.info(
                    `Fetched ${awaitedManga.Name} from source ${source}.`
                  );
                  return window.electron.library.addMangaToCache(
                    foundSource.getName(),
                    awaitedManga
                  );
                })
              );
            })
            .then(() => {
              return setSourcesFetching(
                sourcesFetching.filter(
                  (fetchingSource) => fetchingSource !== foundSource.getName()
                )
              );
            })
            .catch((error) => {
              window.electron.log.error(
                `Failed to get manga from ${source}:`,
                error
              );
            });
        }
      }
    });
  }, [sourcesFetching, setSourcesFetching, sourceList, fetchQueue]);

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
      const { sortOrder = 'asc', sortMethod = 'title' } =
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
              const tagsTest = x.Tags.some((z: string) =>
                z.toLowerCase().includes(y.toLowerCase())
              );

              const nameTest = x.Name.toLowerCase().includes(y.toLowerCase());
              const [chapterQuery, pageQuery] = [
                y.match(/(chapters)(<=|>=|<|>|=)(\d+)/i),
                y.match(/(pages)(<=|>=|<|>|=)(\d+)/i),
              ].map((z) =>
                z !== null && z[1] && z[2] && z[3]
                  ? (
                      {
                        '<': (a: number) => a < Number(z[3]),
                        '>': (a: number) => a > Number(z[3]),
                        '<=': (a: number) => a <= Number(z[3]),
                        '>=': (a: number) => a >= Number(z[3]),
                        '=': (a: number) => a === Number(z[3]),
                      } as Record<string, (toCompare: number) => boolean>
                    )[z[2]]?.(
                      z[1].toLowerCase() === 'chapters'
                        ? x.Chapters.length
                        : Object.values(allCachedRead.current[source] ?? {})
                            .filter((a) => a.mangaid === x.MangaID)
                            .reduce((acc, b) => acc + b.pageCount, 0)
                    ) ?? false
                  : undefined
              );

              return tagsTest || nameTest || chapterQuery || pageQuery;
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
            expandIcon={<ExpandMoreIcon htmlColor="#FFFFFF" />}
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
                color: '#FFFFFF',
              }}
              className={css(libraryStyleSheet.accordionText)}
            >
              {sourceKey}
            </Typography>
            <Typography
              sx={{
                color: '#FFFFFF',
                flexShrink: 2,
                verticalAlign: 'center',
                lineHeight: '1.5',
                width: '30%',
              }}
              className={css(libraryStyleSheet.accordionItemCount)}
            >
              {mangaListArray.length} Manga
              {(mangaListArray.length > 1 && 's') || ''}
            </Typography>
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
            <div
              onClick={(e) => e.stopPropagation()}
              className={css(libraryStyleSheet.accordionSortMethodContainer)}
            >
              <Checkbox
                sx={{
                  color: '#FFFFFF',
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
                icon={<ArrowDownwardIcon />}
                checkedIcon={<ArrowUpwardIcon />}
              />
              <Select
                className={css(libraryStyleSheet.accordionSortMethodSelectItem)}
                renderValue={(value) => {
                  return (
                    <Typography
                      sx={{
                        color: '#FFFFFF',
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
                      sortOrder: 'asc',
                    };
                  }
                  MiscEnmap.set(
                    'suwariyomi_library',
                    suwariyomiLibrarySettings
                  );

                  forceUpdate();
                }}
              >
                <MenuItem value="Title">Title</MenuItem>
                <MenuItem value="Unread">Unread</MenuItem>
                <MenuItem value="Last Read">Last Read</MenuItem>
                <MenuItem value="Latest Chapter">Latest Chapter</MenuItem>
                <MenuItem value="Total Chapters">Total Chapters</MenuItem>
                <MenuItem value="Date Added">Date Added</MenuItem>
                <MenuItem value="Date Fetched">Date Fetched</MenuItem>
                <MenuItem value="Title">Category</MenuItem>
              </Select>
            </div>
            <Tooltip title="Search Using This Source">
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
                  ? 'Currently fetching!'
                  : 'Refresh'
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
    readingPrefixTarget =
      filteredMediaList[Math.floor(Math.random() * filteredMediaList.length)];

  if (readingPrefixTarget && (!statusPrefix || !statusSuffix)) {
    // TODO: Integrate with AniList / MyAnimeList. If not logged in to either, get flavor texts from here.
    // CURRENT: Create a list of flavor texts.
    const flavorTexts = [
      ['How about reading', '?'],
      ["Let's read", '!'],
      ['Feel like reading', '?'],
      ['Want to read', '?'],
      ['Feeling like reading', 'today?'],
      ['Want to read', 'today?'],
      ['Is it time for the', 'binge-read marathon?'],
    ];

    const chosenText =
      flavorTexts[Math.floor(Math.random() * flavorTexts.length)];

    [statusPrefix, statusSuffix] = chosenText;

    // switch (readingPrefixTarget.readingstatus) {
    //   case 'COMPLETED':
    //     [statusPrefix, statusSuffix] = ['Want to reread', '?'];
    //     break;
    //   case 'PLANNING':
    //     [statusPrefix, statusSuffix] = ['Want to try reading', '?'];
    //     break;
    //   case 'DROPPED':
    //     [statusPrefix, statusSuffix] = ['Maybe try reconsidering', '..?'];
    //     break;
    //   case 'PAUSED':
    //     [statusPrefix, statusSuffix] = [
    //       'Want to pick up',
    //       ' where you left off?',
    //     ];
    //     break;
    //   case 'REPEATING':
    //   // eslint-disable-next-line no-fallthrough
    //   case 'CURRENT':
    //     [statusPrefix, statusSuffix] = ['Want to continue reading', '?'];
    //     break;
    //   default:
    //     break;
    // }
  } else [statusPrefix, statusSuffix] = ["Let's start reading", '!'];

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
              label="Search manga..."
              placeholder={selectedDescription.current}
              className={css(libraryStyleSheet.searchbar)}
              variant="filled"
              defaultValue={searchQuery}
              error={!parsedSearch}
              helperText={parsedSearch ? '' : 'Mismatched quotation marks.'}
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  if (e.shiftKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    if ((e.target as any).value.length === 0) {
                      (e.target as any).value = selectedDescription.current;
                      forceCheck();
                      setSearchQuery(selectedDescription.current);
                    }
                  }
                }
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
                ? `Welcome back, ${capitalize(userName.current)}.`
                : 'Welcome back.'}
            </h1>
            <h4
              className={css(
                libraryStyleSheet.infoPaperHeaderBase,
                libraryStyleSheet.infoPaperHeaderSub
              )}
            >
              <span className={css(libraryStyleSheet.infoRegular)}>
                {statusPrefix}
              </span>{' '}
              <span
                className={css(
                  libraryStyleSheet.infoRegular,
                  libraryStyleSheet.infoHighlight
                )}
              >
                {!readingPrefixTarget ? 'some manga' : readingPrefixTarget.Name}
              </span>
              <span className={css(libraryStyleSheet.infoRegular)}>
                {statusSuffix.match(/^[.!?]$/)
                  ? statusSuffix
                  : ` ${statusSuffix}`}
              </span>
            </h4>
            <hr className={css(libraryStyleSheet.darkHR)} />
            <div className={css(libraryStyleSheet.mangaStatsContainer)}>
              <div className={css(libraryStyleSheet.mangaStatsItem)}>
                <h3 className={css(libraryStyleSheet.infoPaperHeaderBase)}>
                  Total Manga
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
                  Chapters Read
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
                  Pages Read
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
            <Tooltip title="Settings">
              <IconButton
                className={css(libraryStyleSheet.settingsButton)}
                onClick={() => Navigate('/settings')}
              >
                <SettingsIcon className={css(libraryStyleSheet.settingsIcon)} />
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
                color: '#FFFFFF',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              {hasNoSources ? 'You have no sources.' : decidedFlavorText[0]}
            </Typography>
            <Typography
              sx={{
                color: '#FFFFFF',
                fontSize: '16px',
              }}
            >
              {hasNoSources ? "Let's get" : decidedFlavorText[1]}{' '}
              <Link
                to={
                  hasNoSources
                    ? '/'
                    : `/search?${currentSearchParams.toString()}`
                }
                onClick={() => {
                  if (hasNoSources)
                    window.electron.util.openInBrowser(
                      'https://github.com/Nowaaru/suwariyomi-sources'
                    );
                }}
                className={css(
                  libraryStyleSheet.infoPaperHeaderBase,
                  libraryStyleSheet.infoHighlight
                )}
              >
                {hasNoSources
                  ? 'some more.'
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
                Can&apos;t find what you&apos;re looking for?
              </h3>
              <h4 className={css(libraryStyleSheet.infoPaperHeaderBase)}>
                How about we{' '}
                <Link
                  className={css(libraryStyleSheet.infoHighlight)}
                  to={`/search?${currentSearchParams.toString()}`}
                >
                  search globally?
                </Link>
              </h4>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Library;
