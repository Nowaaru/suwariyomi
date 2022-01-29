import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Box,
  Skeleton,
  CircularProgress,
  Alert,
  AlertTitle,
  // Pagination, - Use when mangadex-full-api exposes the total number of results
} from '@mui/material';

import { StyleSheet, css } from 'aphrodite';
import React, { useEffect, useState, useRef, Fragment } from 'react';
import { Link } from 'react-router-dom';

import LazyLoad, { forceCheck } from 'react-lazyload';
import ArrowCircleLeftRoundedIcon from '@mui/icons-material/ArrowCircleLeftRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import ShortPagination from '../components/shortpagination';

import SourceBase, { SearchFilters } from '../../sources/static/base';
import useQuery from '../util/hook/usequery';
import { Manga } from '../../main/util/dbUtil';

import MangaItem from '../components/mangaitem';
import SearchBar from '../components/search';
import Filter from '../components/filter';
import Handler from '../../sources/handler';

const styles = StyleSheet.create({
  container: {
    display: 'block',
    position: 'relative',
    width: '100%',
    height: '100%',
    overflowY: 'scroll',
    '::-webkit-scrollbar': {
      width: '4px',
    },
    '::-webkit-scrollbar-thumb': {
      background: '#FFFFFF',
    },
  },

  specific: {},

  loadingObject: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 'fit-content',
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
    margin: '2px 5px 10px 5px',
    padding: '5px 5px 8px 5px',
    width: 'fit-content',
    height: 'fit-content',
    left: '10px',
    transition: 'left 0.3s ease-in-out',
    ':hover': {
      left: '0px',
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
    margin: '0 auto',
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

  row: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    margin: '0 auto',
    boxSizing: 'border-box',
    paddingBottom: '96px',
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

const beginSearch = (source: InstanceType<typeof SourceBase>) => {
  console.log(`beginSearch on ${source.getName()}`);
  return source
    .search()
    .then((x) => x.map(source.serialize))
    .then((y) => {
      return Promise.all(y);
    })
    .then((z) => z.filter((a) => a !== false).map((b) => b as Manga));
};

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
  const [isLoadingMoreResults, setLoading] = useState(false);
  const [currentAlert, setAlert] = useState<{
    message: string;
    severity: 'success' | 'error';
  } | null>(null);

  const specificQueryLoadedPages = useRef<{
    [sourceName: string]: {
      [searchQuery: string]: { [searchIndex: number]: boolean };
    };
  }>({});

  // This is a different state than the one below because organization filters
  // can make the presentation of the results become different
  // When a filter is changed, the search results are cleared.

  const [specificQueryLoadedTitles, setLoadedTitles] = useState<Manga[]>([]);
  const pageQueryParams = useQuery();
  const [queryOffset, setQueryOffset] = useState(
    Number(pageQueryParams.get('offset') || 0)
  ); // Used for specified source query
  const [specifiedSource, setSpecifiedSource] = useState(
    pageQueryParams.get('source')
  );

  const [scrollTarget, setScrollTarget] = useState<Node | Window | undefined>(
    undefined
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
    sourceFilters.offset = specifiedSource
      ? queryOffset * sourceFilters.results
      : 0;
    sourceFilters.query = searchData.searchQuery;
    source.setFilters(sourceFilters);
  });

  useEffect(() => {
    if (!specifiedSource) return;
    if (!mappedFileNames[0]) return;
    if (isLoadingMoreResults) return;

    if (!specificQueryLoadedPages.current[specifiedSource]) {
      specificQueryLoadedPages.current[specifiedSource] = {
        [searchData.searchQuery]: {},
      };
    }
    const cco =
      specificQueryLoadedPages.current[specifiedSource][searchData.searchQuery][
        queryOffset
      ];
    console.log(queryOffset);
    console.log(specificQueryLoadedPages.current[specifiedSource]);
    console.log(`${cco ? 'already loaded; skipping...' : 'loading'}`);

    if (
      specificQueryLoadedPages.current[specifiedSource][searchData.searchQuery][
        queryOffset
      ]
    )
      return;
    setLoading(true);
    beginSearch(mappedFileNames[0])
      .then((n) => {
        setLoadedTitles((prevData) => {
          return [...prevData, ...n];
        });

        specificQueryLoadedPages.current[specifiedSource][
          searchData.searchQuery
        ][queryOffset] = true;
        return setLoading(false); // ?????
      })
      .catch(() => {
        setAlert({
          message:
            'An error occurred while searching. You might have been rate limited.\nTry again later.',
          severity: 'error',
        });
      });
  }, [
    searchData.searchQuery,
    mappedFileNames,
    specifiedSource,
    queryOffset,
    isLoadingMoreResults,
  ]);

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

  /* SOURCE SEARCH PLAN:
    using pagination, we can load the next page of results.

    when a new page is loaded, we should:
      - update the specificResults state
      - load the next page of results
        - if the next page is the last page, disable the button

        the reason we need to load the next page is to prevent the user
        from having to wait for the next page to load before they can
        click on the next page button.

        the user however can still click on the previous page button
        if the next page is still loading because of our good old friend memoization.

        * to do this, load the amount per page * 2, and then only display the amount per page.
          this should only be done when a render's useEffect detects when there is no idx+1
          in the specificResults state.
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
                        <LazyLoad
                          key={`${i}-llcontainer`}
                          scrollContainer="#lazyload"
                        >
                          <Skeleton
                            key={i}
                            className={css(styles.skeletonPlaceholder)}
                            animation="wave"
                            variant="rectangular"
                          />
                        </LazyLoad>
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
    // ElementHierarchy will be a list of Skeletons instead of MangaItems for now
    elementHierarchy = specificQueryLoadedTitles.map((MangaObject) => (
      <MangaItem
        displayType="grid"
        listDisplayType={null}
        title={MangaObject.Name}
        coverUrl={MangaObject.CoverURL || undefined}
        tags={MangaObject.Tags?.slice(1, 10) ?? []}
        source={MangaObject.SourceID ?? specifiedSource}
        mangaid={MangaObject.MangaID}
        synopsis={MangaObject.Synopsis}
        key={MangaObject.MangaID}
      />
    ));
  }
  return (
    <>
      <Filter
        onClick={() => {
          console.log('Clicked!');
        }}
        scrollTarget={scrollTarget ?? window}
      />
      <div
        id="lazyload"
        ref={(node) => {
          setScrollTarget(node ?? undefined);
        }}
        className={css(
          styles.container,
          specifiedSource ? styles.specific : false
        )}
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
              newSearchQueryData.queriedSearches[
                newSearchQueryData.searchQuery
              ] = generateQueriedSearchData(mappedFileNames);
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
        {!specifiedSource ? ( // wtf is going on here
          elementHierarchy
        ) : (
          <div
            className={css(
              isLoadingMoreResults ? styles.loadingObject : styles.row
            )}
          >
            {isLoadingMoreResults ? <CircularProgress /> : elementHierarchy}
          </div>
        )}
      </div>
      {specifiedSource ? (
        <ShortPagination
          disabled={isLoadingMoreResults}
          page={1}
          onUpdate={(page) => {
            setQueryOffset(Math.max(0, page - 1));
          }}
        />
      ) : null}
    </>
  );
};

export default SearchPage;
