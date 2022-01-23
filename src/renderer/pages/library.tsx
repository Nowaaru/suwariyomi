import {
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
} from '@mui/material';

import { StyleSheet, css } from 'aphrodite/no-important';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import LazyLoad, { forceCheck } from 'react-lazyload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import parseQuery from '../util/search';

import { Manga as MangaType } from '../../main/util/dbUtil';
import MangaItem from '../components/mangaitem';
import useQuery from '../util/hook/usequery';

const libraryStyleSheet = StyleSheet.create({
  container: {
    display: 'block',
    position: 'absolute',
    width: '100vw',
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

  profilePaperIcon: {
    '@media (max-width: 900px)': {
      display: 'none',
    },
    position: 'relative',
    width: '192px',
    height: '192px',
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
});

const { library: LibraryUtilities } = window.electron;
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
  const mangaItemDisplayFormat: 'list' | 'grid' = 'grid';
  const pageQueryParams = useQuery();
  const [searchQuery, setSearchQuery] = useState(
    pageQueryParams.get('search') || ''
  );
  const parsedSearch = parseQuery(searchQuery);
  const currentSearchParams = new URLSearchParams();
  currentSearchParams.set('search', searchQuery);

  const mangaListArray: Array<JSX.Element> = [];
  const accordionArray: Array<JSX.Element> = [];
  const librarySources = LibraryUtilities.getSources();
  const librarySourcesKeys = Object.keys(librarySources);
  // Filter out sources that are not enabled AND has no manga
  const sourceList = librarySourcesKeys
    .filter(
      (source) =>
        librarySources[source].Enabled &&
        librarySources[source].Manga.length > 0 &&
        (searchQuery === '' ||
          librarySources[source].Manga.some((manga) =>
            manga.Name.toLowerCase().includes(searchQuery.toLowerCase())
          ))
    )
    .map((source) => librarySources[source]);

  sourceList.forEach((Source) => {
    Source.Manga.forEach((Manga) => {
      if (searchQuery !== '')
        if (!Manga.Name.toLowerCase().includes(searchQuery.toLowerCase()))
          return;

      mangaListArray.push(
        <MangaItem
          displayType={mangaItemDisplayFormat}
          // Disabled because this only exists for testing purposes
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          listDisplayType={mangaItemDisplayFormat === 'list' ? 'verbose' : null}
          title={Manga.Name}
          coverUrl={Manga.CoverURL || undefined}
          tags={Manga.Tags.slice(1, 10) ?? []}
          synopsis={Manga.Synopsis}
          key={Manga.Name}
        />
      );
    });
  });

  sourceList.forEach((sourceObject) => {
    accordionArray.push(
      <LazyLoad
        key={`${sourceObject.Name}-lazyload`}
        scrollContainer="#lazyload"
      >
        <Accordion
          TransitionProps={{
            unmountOnExit: true,
            onExited: forceCheck,
            onEntered: forceCheck,
          }}
          defaultExpanded={
            searchQuery !== '' && sourceObject.Manga.length <= 45
          }
          classes={{
            root: css(libraryStyleSheet.accordionItem),
          }}
          key={sourceObject.Name}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon htmlColor="#FFFFFF" />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <img
              src="https://mangadex.org/favicon.ico"
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
              {sourceObject.Name}
            </Typography>
            <Typography
              sx={{
                color: '#FFFFFF',
              }}
            >
              {mangaListArray.length} Mangas
            </Typography>
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

  const filteredMediaList = sourceList
    .filter((x) => x.Enabled && x.Manga.length > 0)
    .map((x) => x.Manga.filter((y) => y.Name.length <= 45))
    .flat();
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

  return (
    <div className={css(libraryStyleSheet.container)}>
      <div className={css(libraryStyleSheet.searchbarContainer)}>
        <div className={css(libraryStyleSheet.searchbarContainerInner)}>
          <TextField
            label="Search manga..."
            placeholder={`pages>10 "Slice of Life" "Kemonomimi" "Romance" "Fantasy"`}
            className={css(libraryStyleSheet.searchbar)}
            variant="filled"
            defaultValue={searchQuery}
            error={!parsedSearch}
            helperText={parsedSearch ? '' : 'Mismatched quotation marks.'}
            onChange={(e) => {
              forceCheck();
              setSearchQuery(e.target.value.trim());
            }}
          />
        </div>
      </div>
      <div id="lazyload" className={css(libraryStyleSheet.libraryContainer)}>
        <div className={css(libraryStyleSheet.welcomeContainer)}>
          <Paper
            elevation={6}
            className={css(
              libraryStyleSheet.profilePaperIcon,
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
              Welcome back, Noire.
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
                  47
                </span>
              </div>
              <div className={css(libraryStyleSheet.mangaStatsItem)}>
                <h3 className={css(libraryStyleSheet.infoPaperHeaderBase)}>
                  Volumes Read
                </h3>
                <span
                  className={css(
                    libraryStyleSheet.infoPaperHeaderBase,
                    libraryStyleSheet.mangaStatsSpan
                  )}
                >
                  82
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
                  1900
                </span>
              </div>
            </div>
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
              {decidedFlavorText[0]}
            </Typography>
            <Typography
              sx={{
                color: '#FFFFFF',
                fontSize: '16px',
              }}
            >
              {decidedFlavorText[1]}{' '}
              <Link
                to={`/search?${currentSearchParams.toString()}`}
                className={css(
                  libraryStyleSheet.infoPaperHeaderBase,
                  libraryStyleSheet.infoHighlight
                )}
              >
                {decidedFlavorText[decidedFlavorText.length - 1]}
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
