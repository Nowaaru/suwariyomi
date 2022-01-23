import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Box,
  Skeleton,
} from '@mui/material';

import { StyleSheet, css } from 'aphrodite/no-important';
import React, { useEffect, useRef, useState } from 'react';
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
  noResultsSpan: {
    color: '#FFFFFF',
    fontSize: '1.5em',
    fontWeight: 'bold',
    margin: '0px',
    padding: '0px',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
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

  skeletonPlaceholder: {
    width: '150px',
    height: '180px',
    marginRight: '8px',
    marginBottom: '8px',
    flexShrink: 0,
    flexGrow: 0,
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

  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    alignContent: 'flex-start',
  },

  noResultsSourceContainer: {
    justifyContent: 'center',
  },

  unloadedSourceContainer: {
    justifyContent: 'unset',
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

const beginSearch = (source: InstanceType<typeof SourceBase>) =>
  source
    .search()
    .then((x) => x.map(source.serialize))
    .then((y) => {
      return Promise.all(y);
    })
    .then((z) => z.filter((a) => a !== false).map((b) => b as Manga));

/* Utility Elements */
const returnButton = (
  <div className={css(styles.returnButtonContainer)}>
    <Link className={css(styles.returnTo)} to="/library">
      <ArrowCircleLeftRoundedIcon fontSize="inherit" />
      <span className={css(styles.returnSpan)}> Library</span>
    </Link>
  </div>
);

const SearchPage = () => {
  const oldScrollPosition = useRef(0);
  const isLoadingMoreResults = useRef(false);

  const pageQueryParams = useQuery();
  const [specificResults, setSpecificResults] = useState<Manga[]>([]); // Only used when a source is specified
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
    initiatedSearches: { [sourceName: string]: boolean };

    // if a search is initiated, it is added to this array.
    // this is good because it allows us to keep track of which searches are in progress
    // so we don't have to re-query the same sources
  }>({
    searchQuery: (pageQueryParams.get('search') || '').toLowerCase().trim(),
    initiatedSearches: {},
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
    if (specifiedSource) return undefined;
    // This only runs when the user is not specifying a source.
    const filteredFileNames = mappedFileNames.filter((x) => {
      const searchQueryIndex =
        searchData.queriedSearches[searchData.searchQuery][
          x.getName() as string
        ];
      return (
        searchQueryIndex !== false &&
        searchQueryIndex.length === 0 &&
        !searchData.initiatedSearches[x.getName()]
      );
    });

    filteredFileNames.forEach(async (source) => {
      searchData.initiatedSearches[source.getName()] = true;
      beginSearch(source)
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

    return undefined;
  });

  /* TODO:
    - Implement grid MangaItem (DONE)
    - Implement lazyload (DONE)
    - Loading placeholder for loading sources (DONE)
    - When a manga is clicked, go to the /view route (DONE)
    - If `queriedSearchesLog` is empty, show a loading placeholder for each enabled source (DEFERRED)
    - If a source returns {}, return a "No results" placeholder. (DONE)
    - If the *source name* is clicked, go to the /search route with the source name as a query param. (DONE)
    - If there is a query param `source`, show an entirely different display; similar to the library. (DONE)
  */
  const currentSearches = searchData.queriedSearches[searchData.searchQuery];
  let elementHierarchy;
  if (!specifiedSource) {
    elementHierarchy = Object.keys(currentSearches).map((sourceString) => {
      const searchIndex = currentSearches[sourceString];
      return (
        <LazyLoad
          key={sourceString}
          // Disabled because className isn't typed correctly.
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
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
            <AccordionDetails
              className={css(
                styles.sourceContainer,
                searchIndex === false && styles.noResultsSourceContainer,
                searchIndex !== false && searchIndex.length === 0
                  ? styles.unloadedSourceContainer
                  : false
              )}
            >
              {searchIndex !== false ? (
                searchIndex.length > 0 ? (
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
                  (() => {
                    const skeletonPlaceholders = [];
                    for (
                      let i = 0;
                      i <
                      (Math.min(
                        8,
                        mappedFileNames
                          .find((x) => x.getName() === sourceString)
                          ?.getFilters().results
                      ) || 8);
                      i++
                    ) {
                      skeletonPlaceholders.push(
                        <Skeleton
                          key={i}
                          className={css(styles.skeletonPlaceholder)}
                          animation="wave"
                          variant="rectangular"
                        />
                      );
                    }
                    return skeletonPlaceholders;
                  })()
                )
              ) : (
                <span className={css(styles.noResultsSpan)}>No results.</span>
              )}
            </AccordionDetails>
          </Accordion>
        </LazyLoad>
      );
    });
  } else {
    elementHierarchy = [];
    for (let i = 0; i < 35; i++) {
      elementHierarchy.push(
        <Skeleton
          key={i}
          className={css(styles.skeletonPlaceholder)}
          variant="rectangular"
        />
      );
    }
    // elementHierarchy = specificResults.map((MangaObject) => (
    //   <MangaItem
    //     key={MangaObject.MangaID}
    //     mangaid={MangaObject.MangaID}
    //     source={MangaObject.SourceID}
    //     displayType="list"
    //     listDisplayType="verbose"
    //     title={MangaObject.Name}
    //     synopsis={MangaObject.Synopsis}
    //     coverUrl={MangaObject.CoverURL || undefined}
    //     tags={MangaObject.Tags.slice(1, 10) ?? []}
    //   />
    // ));
  }
  return (
    <div
      id="lazyload"
      className={css(styles.container)}
      onScroll={async (event: React.UIEvent<HTMLDivElement>) => {
        if (!mappedFileNames[0]) return;
        // We check for this because if:
        //  1. The specified source does not exist
        //  2. There is no source with the specified name
        // then nothing will be shown, as the first source should always be the source with the specified name.

        const { scrollTop, scrollHeight, clientHeight } =
          event.target as HTMLDivElement;
        const isScrolledFully = scrollHeight - scrollTop >= clientHeight;
        const { current: lastScrollTop } = oldScrollPosition;
        const { current: isLoadingResults } = isLoadingMoreResults;

        if (isScrolledFully && lastScrollTop < scrollTop) {
          oldScrollPosition.current = scrollTop;
          isLoadingMoreResults.current = true;
          if (isLoadingResults) return;

          // Set specific source offset to offset + results.
          const selectedSource: InstanceType<typeof SourceBase> =
            mappedFileNames[0];
          const currentFilters = selectedSource.getFilters();
          currentFilters.offset += currentFilters.results;
          selectedSource.setFilters(currentFilters);

          // Begin loading more results. Also known as: Push into the skeleton array.
          console.log('resuuults');
        }
      }}
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
      {!specifiedSource ? (
        elementHierarchy
      ) : (
        <div className={css(styles.grid)}>{elementHierarchy}</div>
      )}
    </div>
  );
};

export default SearchPage;
