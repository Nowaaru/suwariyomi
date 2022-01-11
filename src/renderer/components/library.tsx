import {
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
} from '@mui/material';

import { StyleSheet, css } from 'aphrodite/no-important';
import { useNavigate } from 'react-router-dom';

import LazyLoad, { forceCheck } from 'react-lazyload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MangaItem from './mangaitem';
import templateFull from '../../../assets/data/full.json';

const { checkAuthenticated } = window.electron.auth;
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
      // backgroundColor: '#FFFFFF',
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
  accordionItem: {
    margin: '0px 0px 8px 0px',
    backgroundColor: '#080708',
  },

  accordionItemIcon: {
    margin: '0px 8px 0px 0px',
  },

  accordionText: {
    fontSize: '1.2rem',
    fontFamily: '"PT Sans Narrow", "Roboto", "Helvetica", "Arial", sans-serif',
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
    fontSize: '2.4em',
  },
  infoPaperHeaderSub: {
    fontSize: '1.2em',
  },

  infoHighlight: {
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

  sourceContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
});

const Library = () => {
  const mangaListArray: Array<JSX.Element> = [];
  const accordionArray: Array<JSX.Element> = [];
  const potentialSources = [
    'MangaDex',
    'MangaFox',
    'Bato.to',
    'Comick.fun',
    'Dynasty-Series',
    'Lolicon',
    'ReaperScans',
    'KissManga',
  ];

  const { mediaList } = templateFull.data.Page;
  mediaList.splice(0, 400).forEach((manga) => {
    mangaListArray.push(
      <MangaItem
        displayType="list"
        listDisplayType="verbose"
        title={manga.media.title.userPreferred}
        coverUrl={manga.media.coverImage.extraLarge}
        tags={manga.media.tags
          .sort((a, b) => Math.sign(a.rank - b.rank) + Math.random())
          .slice(0, 3)
          .map((tag) => tag.name)}
        synopsis={(() => {
          return (
            new DOMParser().parseFromString(
              manga.media.description || 'No synopsis available.', // Use OR instead of null check to implicitly cast empty strings to boolean.
              'text/html'
            ).body.textContent || 'No synopsis available.'
          );
        })()}
        key={manga.media.coverImage.medium}
      />
    );
  });

  for (let i = 0; i < potentialSources.length; i++) {
    accordionArray.push(
      <LazyLoad scrollContainer="#lazyload">
        <Accordion
          TransitionProps={{
            unmountOnExit: true,
            onExited: forceCheck,
            onEntered: forceCheck,
          }}
          classes={{
            root: css(libraryStyleSheet.accordionItem),
          }}
          key={i}
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
              {potentialSources[i]}
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
            <div className={css(libraryStyleSheet.sourceContainer)}>
              {mangaListArray}
            </div>
          </AccordionDetails>
        </Accordion>
      </LazyLoad>
    );
  }

  const filteredMediaList = mediaList.filter(
    (manga) => manga.media.title.userPreferred.length < 50
  );
  const readingPrefixTarget =
    filteredMediaList[Math.floor(Math.random() * filteredMediaList.length)];

  let statusPrefix = "Let's start reading";
  let statusSuffix = '!';

  if (readingPrefixTarget) {
    switch (readingPrefixTarget.readingstatus) {
      case 'COMPLETED':
        [statusPrefix, statusSuffix] = ['Want to reread', '?'];
        break;
      case 'PLANNING':
        [statusPrefix, statusSuffix] = ['Want to try reading', '?'];
        break;
      case 'DROPPED':
        [statusPrefix, statusSuffix] = ['Maybe try reconsidering', '..?'];
        break;
      case 'PAUSED':
        [statusPrefix, statusSuffix] = [
          'Want to pick up',
          ' where you left off?',
        ];
        break;
      case 'REPEATING':
      // eslint-disable-next-line no-fallthrough
      case 'CURRENT':
        [statusPrefix, statusSuffix] = ['Want to continue reading', '?'];
        break;
      default:
        break;
    }
  }
  return (
    <div className={css(libraryStyleSheet.container)}>
      <div className={css(libraryStyleSheet.searchbarContainer)}>
        <div className={css(libraryStyleSheet.searchbarContainerInner)}>
          <TextField
            label="Search manga..."
            placeholder={`pages>10 "Slice of Life" "Kemonomimi" "Romance" "Fantasy"`}
            className={css(libraryStyleSheet.searchbar)}
            variant="filled"
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
                {!readingPrefixTarget
                  ? 'some manga'
                  : readingPrefixTarget.media.title.userPreferred}
              </span>
              <span className={css(libraryStyleSheet.infoRegular)}>
                {statusSuffix}
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
        {accordionArray}
      </div>
    </div>
  );
};

export default Library;
