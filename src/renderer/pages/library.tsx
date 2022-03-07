import {
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  FormControl,
  Box,
} from '@mui/material';

import { StyleSheet, css } from 'aphrodite/no-important';
import { useState, useRef, useEffect, useMemo, SyntheticEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userInfo } from 'os';
import { capitalize, clamp } from 'lodash';

import LazyLoad, { forceCheck } from 'react-lazyload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import parseQuery from '../util/search';

import { FullManga, Manga as MangaType } from '../../main/util/manga';
import MangaItem from '../components/mangaitem';
import useQuery from '../util/hook/usequery';
import Handler from '../../main/sources/handler';
import useMountEffect from '../util/hook/usemounteffect';
import useForceUpdate from '../util/hook/useforceupdate';
import Defer from '../components/defer';

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
  useEffect(() => {
    window.electron.cache.delete(
      'searchdata',
      'source',
      'offset',
      'specifiedQueryLoadedPages',
      'filters'
    );
  }, []);

  console.log('render test');
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

  const mappedFileNamesRef = useRef(
    window.electron.util.getSourceFiles().map(Handler.getSource)
  );

  const forceUpdate = useForceUpdate();
  const hasNoSources = mappedFileNamesRef.current.length <= 0;
  // Filter out sources that are not enabled AND has no manga
  const sourceList: Record<string, FullManga[]> = useMemo(() => {
    const sourceListTemp: Record<string, FullManga[]> = {};
    librarySourcesKeys
      .filter(
        (source) =>
          librarySources[source].Enabled &&
          librarySources[source].Manga.length > 0 &&
          (searchQuery === '' ||
            (LibraryUtilities.getCachedMangas(source) || []).some((manga) =>
              manga.Name.toLowerCase().includes(searchQuery.toLowerCase())
            ))
      )
      .forEach((source) => {
        sourceListTemp[source] = LibraryUtilities.getLibraryMangas(source)
          .map((x) =>
            LibraryUtilities.getCachedMangas(source).find(
              (y) => y.MangaID === x
            )
          )
          .filter((x) => x) as FullManga[]; // Remove all undefined values
      });

    return sourceListTemp;
  }, [LibraryUtilities, librarySources, librarySourcesKeys, searchQuery]);
  useEffect(() => {
    if (sourcesFetching.length > 0) return;
    const allKeys: Record<string, string[]> = {};
    Object.keys(sourceList).forEach((source) => {
      window.electron.library.getLibraryMangas(source).forEach((mangaID) => {
        // Determine if the manga is already in the cache
        const mangaIsInCache = sourceList[source].some(
          (manga) => manga.MangaID === mangaID
        );
        if (!mangaIsInCache) {
          allKeys[source] = allKeys[source] || [];
          allKeys[source].push(mangaID);

          if (sourcesFetching.includes(source)) return;
          setSourcesFetching([...sourcesFetching, source]);
        }
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
            .then((mangaList) => {
              return mangaList.forEach(async (manga) => {
                window.electron.library.addMangaToCache(
                  foundSource.getName(),
                  await manga
                );
              });
            })
            .then(() => {
              forceUpdate();
              return setSourcesFetching(
                sourcesFetching.filter((x) => x !== source)
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
  }, [sourcesFetching, setSourcesFetching, forceUpdate, sourceList]);

  const sourceListValues = Object.values(sourceList);

  const allChapters = mappedFileNamesRef.current
    .map((x) => window.electron.read.get(x.getName()))
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

  const allChapterCount = allChapters.filter(
    (x) => x.currentPage >= x.pageCount
  ).length;

  const allPageCount = allChapters.reduce(
    (acc, x) =>
      Math.max(
        0,
        acc + (Number.isSafeInteger(x.currentPage) ? x.currentPage : 0)
      ), // pageCount is -1 if the chapter is unread.
    0
  );

  const mangaListArray = useMemo(() => {
    const mangaListArrayTemp: Array<JSX.Element> = [];
    sourceListValues.forEach((MangaList) => {
      MangaList.forEach((Manga) => {
        mangaListArrayTemp.push(
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
              tags={Manga.Tags?.slice(0, 10) ?? []}
              synopsis={Manga.Synopsis}
              key={Manga.Name}
              source={Manga.SourceID}
              mangaid={Manga.MangaID}
            />
          </LazyLoad>
        );
      });
    });
    return mangaListArrayTemp;
  }, [sourceListValues]).filter(
    (x) =>
      searchQuery === '' ||
      x.props.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  librarySourcesKeys.forEach((sourceKey) => {
    accordionArray.push(
      <LazyLoad key={`${sourceKey}-lazyload`} scrollContainer="#lazyload">
        <Accordion
          TransitionProps={{
            unmountOnExit: true,
            onEntered: forceCheck,
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
              alt="MangaDex"
            />
            <Typography
              sx={{
                width: '66%',
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
                width: '33%',
              }}
            >
              {mangaListArray.length} Manga
              {(mangaListArray.length > 1 && 's') || ''}
            </Typography>
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
                  window.electron.library
                    .getCachedMangas(sourceKey)
                    .forEach((y) =>
                      window.electron.library.removeMangaFromCache(
                        y.SourceID,
                        y.MangaID
                      )
                    );

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
    if (x.Chapters.length > 0)
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
              {userName.current?.length <= 10
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
