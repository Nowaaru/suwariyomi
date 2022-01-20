import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Box,
} from '@mui/material';

import { StyleSheet, css } from 'aphrodite/no-important';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import LazyLoad, { forceCheck } from 'react-lazyload';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import ArrowCircleLeftRoundedIcon from '@mui/icons-material/ArrowCircleLeftRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';

import SourceBase, { SearchFilters } from '../../sources/static/base';
import useQuery from '../util/hook/usequery';
import { Manga } from '../../main/util/dbUtil';

import MangaItem from '../components/mangaitem';
import SearchBar from '../components/search';
import Handler from '../../sources/handler';

const styles = StyleSheet.create({
  container: {
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
    marginBottom: '48px',
  },
  returnButtonContainer: {
    position: 'relative', // tl tr bl br
    margin: '5px 5px 10px 5px',
    padding: '5px 5px 8px 5px',
    width: 'fit-content',
    height: 'fit-content',
    left: '0px',
    transition: 'left 0.3s ease-in-out',
    ':hover': {
      left: '-20px',
    },
    marginBottom: '10px',
  },
  returnTo: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    display: 'flex',
    alignItems: 'center',
    fontSize: '2rem',
    height: '25px',
    textDecoration: 'none',
    color: '#ffffff',
    transition: 'all 0.2s ease-in-out',
    ':hover': {
      color: '#DF2935',
    },
  },
  returnSpan: {
    fontSize: '1.5rem',
    marginLeft: '10px',
  },
  accordionItem: {
    margin: '0px 0px 8px 0px',
    backgroundColor: '#080708',
  },

  accordionItemIcon: {
    margin: '0px 8px 0px 0px',
  },

  lazyLoadObject: {
    marginBottom: '8px',
  },

  sourceContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflowX: 'auto',
    overflowY: 'hidden',
    '::-webkit-scrollbar': {
      height: '4px',
    },
    '::-webkit-scrollbar-thumb': {
      backgroundColor: '#FFFFFF',
      borderRadius: '4px',
      transition: 'background-color 0.2s ease-in-out',
      ':hover': {
        backgroundColor: '#DF2935',
      },
    },
  },

  accordionText: {
    fontSize: '1.2rem',
    fontFamily: '"PT Sans Narrow", "Roboto", "Helvetica", "Arial", sans-serif',
  },

  searchButton: {
    color: '#ffffff',
    borderColor: 'white',
    padding: '0px 6px 0px 6px !important',
    position: 'relative',
    zIndex: 256,
  },

  searchResults: {
    display: 'block',
    top: '10%',
    width: '90%',
    height: '80%',
    padding: '48px',
  },
});

/*
  Structure:

  queriedSearches = {
    [sourceName]: {
      [searchQuery]: Manga[]
    }
  }
*/
type QueriedType = {
  [searchQuery: string]: { [sourceName: string]: Manga[] | false };
}; // False means that there are no results
const generateQueriedSearchData = (
  mappedFileNames: Array<InstanceType<typeof SourceBase>>
) =>
  Object.fromEntries(mappedFileNames.map((source) => [source.getName(), []]));

/* Utility Elements */
const returnButton = (
  <div className={css(styles.returnButtonContainer)}>
    <Link className={css(styles.returnTo)} to="/library">
      <ArrowCircleLeftRoundedIcon fontSize="inherit" />
      <span className={css(styles.returnSpan)}> Library</span>
    </Link>
  </div>
);

const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
  console.log(event);
};

const SearchPage = () => {
  const pageQueryParams = useQuery();
  const [queryOffset, setQueryOffset] = useState(
    Number(pageQueryParams.get('offset') || 0)
  ); // Used for source query
  const [specifiedSource, setSpecifiedSource] = useState(
    pageQueryParams.get('source')
  );
  const mappedFileNames = window.electron.util
    .getSourceFiles()
    .map(Handler.getSource)
    .filter(
      (x) =>
        !specifiedSource ||
        x.getName().toLowerCase() === specifiedSource.toLowerCase()
    );

  const [searchData, setSearchData] = useState<{
    searchQuery: string;
    queriedSearches: QueriedType;
  }>({
    searchQuery: (pageQueryParams.get('search') || '').toLowerCase().trim(),
    queriedSearches: {
      // I seriously have no way to make this cleaner.
      [(pageQueryParams.get('search') || '').toLowerCase().trim()]:
        generateQueriedSearchData(mappedFileNames),
    },
  });

  // Apply search query to all sources
  mappedFileNames.forEach((source) => {
    const sourceFilters: SearchFilters = { ...source.getFilters() };
    sourceFilters.offset = queryOffset * sourceFilters.results;
    sourceFilters.query = searchData.searchQuery;
    source.setFilters(sourceFilters);
  });

  useEffect(() => {
    // This only runs when the user is specifying a source.
    // Depends on an offset. Initially, the offset is 0.
    // When the user scrolls and reaches the bottom of the page,
    // the offset is increased by 1.

    // The offset is handled internally by the sources.

    if (specifiedSource) {
      console.log('source or something');
    }
  }, [specifiedSource]);

  useEffect(() => {
    // This is used for maintaining the last iteration of an infinite scroll.
    // Is also used to determine if the user has scrolled to the bottom of the page.
    // When the user scrolls to the bottom of the page, the offset is increased by 1.
  });

  useEffect(() => {
    // This only runs when the user is not specifying a source.

    const filteredFileNames = mappedFileNames.filter((x) => {
      const searchQueryIndex =
        searchData.queriedSearches[searchData.searchQuery][
          x.getName() as string
        ];
      return searchQueryIndex !== false && searchQueryIndex.length === 0;
    });

    filteredFileNames.forEach(async (source) => {
      source
        .search()
        .then((x) => x.map(source.serialize))
        .then((y) => {
          return Promise.all(y);
        })
        .then((z) => z.filter((a) => a !== false).map((b) => b as Manga))
        .then((MangaData: Array<Manga>) => {
          const newQueriedSearchesLog = { ...searchData.queriedSearches };
          newQueriedSearchesLog[searchData.searchQuery] =
            newQueriedSearchesLog[searchData.searchQuery] || {}; // Check if it exists beforehand because there might be other sources still loading after this one.

          newQueriedSearchesLog[searchData.searchQuery][source.getName()] =
            MangaData.length > 0 ? MangaData : false;

          return setSearchData({
            ...searchData,
            queriedSearches: newQueriedSearchesLog,
          });
        })
        .catch(console.error);
    });
  });

  /* TODO:
    - Implement grid MangaItem (DONE)
    - Implement lazyload (DONE)
    - Loading placeholder for loading sources
    - When a manga is clicked, go to the /view route
    - If `queriedSearchesLog` is empty, show a loading placeholder for each enabled source
    - If a source returns {}, return a "No results" placeholder.
    - If the *source name* is clicked, go to the /search route with the source name as a query param.
    - If there is a query param `source`, show an entirely different display; similar to the library.
  */
  const currentSearches = searchData.queriedSearches[searchData.searchQuery];
  const elementHierarchy = Object.keys(currentSearches).map((sourceString) => {
    if (
      specifiedSource &&
      sourceString.toLowerCase() !== specifiedSource.toLowerCase()
    ) {
      return null;
    }

    if (specifiedSource) {
      return (
        <LazyLoad key={sourceString} height="100%" offset={[-100, 0]}>
          {/* <MangaItem></MangaItem> */}
        </LazyLoad>
      );
    }
    const searchIndex = currentSearches[sourceString];
    return (
      <LazyLoad
        key={sourceString}
        className={css(styles.lazyLoadObject)}
        scrollContainer="#lazyload"
      >
        <Accordion
          TransitionProps={{
            unmountOnExit: true,
            onExited: forceCheck,
            onEntered: forceCheck,
          }}
          classes={{
            root: css(styles.accordionItem),
          }}
          defaultExpanded
        >
          <AccordionSummary
            expandIcon={
              <ExpandMoreIcon
                sx={{
                  color: '#ffffff',
                }}
              />
            }
          >
            <img
              src="https://mangadex.org/favicon.ico"
              className={css(styles.accordionItemIcon)}
              alt="MangaDex"
            />
            <Typography
              sx={{
                width: '66%',
                flexShrink: 2,
                color: '#FFFFFF',
              }}
              className={css(styles.accordionText)}
            >
              {sourceString}
            </Typography>
            {searchIndex === false || searchIndex.length > 0 ? (
              <Button
                variant="outlined"
                className={css(styles.searchButton)}
                startIcon={<SearchIcon />}
                onClick={(e) => {
                  setSpecifiedSource(sourceString);

                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                Search
              </Button>
            ) : null}
          </AccordionSummary>
          <AccordionDetails className={css(styles.sourceContainer)}>
            {searchIndex !== false ? (
              searchIndex.map((MangaObject) => (
                <MangaItem
                  displayType="grid"
                  listDisplayType={null}
                  title={MangaObject.Name}
                  coverUrl={MangaObject.CoverURL || undefined}
                  tags={MangaObject.Tags.slice(1, 10) ?? []}
                  source={MangaObject.SourceID ?? sourceString}
                  mangaid={MangaObject.MangaID}
                  synopsis={(() => {
                    return (
                      new DOMParser().parseFromString(
                        MangaObject.Synopsis || 'No synopsis available.', // Use OR instead of null check to implicitly cast empty strings to boolean.
                        'text/html'
                      ).body.textContent || 'No synopsis available.'
                    );
                  })()}
                  key={MangaObject.Name}
                />
              ))
            ) : (
              <span>No results.</span>
            )}
          </AccordionDetails>
        </Accordion>
      </LazyLoad>
    );
  });
  return (
    <div
      id="lazyload"
      className={css(styles.container)}
      onScroll={handleScroll}
    >
      {returnButton}
      <Box
        component="form"
        onSubmit={(e: any) => {
          // the type of this should *NOT* be any but I don't know why it refuses to be typed properly ugh
          e.preventDefault();
          e.stopPropagation();

          const newSearchQueryData = {
            ...searchData,
            searchQuery: e.target[0].value,
          };

          if (!searchData.queriedSearches[newSearchQueryData.searchQuery]) {
            newSearchQueryData.queriedSearches[newSearchQueryData.searchQuery] =
              generateQueriedSearchData(mappedFileNames);
          }
          return setSearchData(newSearchQueryData);
        }}
      >
        <SearchBar
          label="Search globally..."
          defaultValue={searchData.searchQuery}
          placeholder="Hana ni Arashi"
        />
      </Box>
      {elementHierarchy}
    </div>
  );
};

export default SearchPage;
