import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Box,
  Skeleton,
  CircularProgress,
  Modal,
  IconButton,
  Alert,
  AlertTitle,
  Paper,
  // Pagination, - Use when mangadex-full-api exposes the total number of results
} from '@mui/material';

import { StyleSheet, css } from 'aphrodite';
import { isEqual } from 'lodash';
import React, { useEffect, useState, useRef, Fragment } from 'react';
import { Link } from 'react-router-dom';

import LazyLoad, { forceCheck } from 'react-lazyload';
import ArrowCircleLeftRoundedIcon from '@mui/icons-material/ArrowCircleLeftRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

import SourceBase, { SearchFilters } from '../../sources/static/base';
import useQuery from '../util/hook/usequery';
import { Manga } from '../../main/util/dbUtil';

import ShortPagination from '../components/shortpagination';
import MangaItem from '../components/mangaitem';
import SearchBar from '../components/search';
import Filter from '../components/filter';
import Handler from '../../sources/handler';
import FilterSettings from '../components/filtersettings';

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
    width: '95%',
    margin: '0px 0px 8px 0px',
    backgroundColor: '#080708',
  },

  accordionItemIcon: {
    margin: '0px 8px 0px 0px',
  },

  lazyLoadObject: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
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
    margin: '0 auto',
    boxSizing: 'border-box',
    paddingBottom: '96px',
  },

  modalObject: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    backgroundColor: '#080708',
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '50%',
    minHeight: '65%',
    maxHeight: '85%',
    overflowX: 'hidden',
    overflowY: 'auto',
    boxSizing: 'border-box',
    padding: '10px 28px',
    '::-webkit-scrollbar': {
      width: '4px',
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
  modalContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  modalCloseButton: {
    position: 'absolute',
    top: '10px',
    right: '14px',
    width: '32px',
    height: '32px',
  },
  modalCloseIcon: {
    color: '#ffffff',
    ':hover': {
      color: '#DF2935',
    },
  },
  rule: {
    width: '85%',
    float: 'left', // border with gradient
    border: 'none',
    outline: 'none',
    height: '1px',
    background: 'linear-gradient(to left, #FFFFFF00, #DF2935FF)',
  },
  modalBody: {},
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

const mappedFileNamesBase = window.electron.util
  .getSourceFiles()
  .map(Handler.getSource);

const beginSearch = (source: InstanceType<typeof SourceBase>) => {
  console.log(`beginSearch on ${source.getName()}`);
  return source
    .search()
    .then((x) => x.map((y) => source.serialize(y, false)))
    .then((z) => {
      return Promise.all(z);
    })
    .then((a) => a.filter((b) => b !== false).map((c) => c as Manga));
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

  const [modalIsOpen, setIsOpen] = useState(false);
  const specificQueryLoadedPages = useRef<{
    [sourceName: string]: {
      [searchQuery: string]: {
        filters: SearchFilters;
        itemCount: number | null;
        pageData: { [page: number]: Manga[] };
      };
    };
  }>(window.electron.cache.get('specificQueryLoadedPages') ?? {});

  const pageQueryParams = useQuery();
  const [queryOffset, setQueryOffset] = useState(
    Number(
      pageQueryParams.get('offset') || window.electron.cache.get('offset') || 0
    )
  ); // Used for specified source query
  const [specifiedSource, setSpecifiedSource] = useState(
    pageQueryParams.get('source') || window.electron.cache.get('source') || ''
  );

  const mappedFileNames = mappedFileNamesBase.filter(
    (x) =>
      !specifiedSource ||
      x.getName().toLowerCase() === specifiedSource.toLowerCase()
  );

  const [scrollTarget, setScrollTarget] = useState<Node | Window | undefined>(
    undefined
  );

  const [searchData, setSearchData] = useState<{
    searchQuery: string;
    queriedSearches: QueriedType;
    initiatedSearches: { [sourceName: string]: boolean };

    // if a search is initiated, it is added to this array.
    // this is good because it allows us to keep track of which searches are in progress
    // so we don't have to re-query the same sources
  }>(
    window.electron.cache.get('searchdata') ?? {
      searchQuery: (pageQueryParams.get('search') || '').toLowerCase().trim(),
      initiatedSearches: {},
      queriedSearches: {
        // I seriously have no way to make this cleaner.
        [(pageQueryParams.get('search') || '').toLowerCase().trim()]:
          generateQueriedSearchData(mappedFileNames),
      },
    }
  );

  // This is a hack to make sure that the search query is updated when the user navigates to this page
  useEffect(() => {
    window.electron.cache.set(
      'specificQueryLoadedPages',
      specificQueryLoadedPages.current
    );
    window.electron.cache.set('offset', queryOffset);
    window.electron.cache.set('source', specifiedSource);
    window.electron.cache.set('searchdata', searchData);
  }, [queryOffset, specifiedSource, searchData, specificQueryLoadedPages]);

  // Apply search query to all sources
  mappedFileNames.forEach((source) => {
    const sourceFilters: SearchFilters = { ...source.getFilters() };
    sourceFilters.offset = specifiedSource ? queryOffset : 0; // Handled by the source module itself
    sourceFilters.query = searchData.searchQuery;
    source.setFilters(sourceFilters);
  });

  useEffect(() => {
    if (!specifiedSource) return;
    if (!mappedFileNames[0]) return;
    if (isLoadingMoreResults) return;

    const generateBaseSearchData = () => ({
      [searchData.searchQuery]: {
        filters: mappedFileNames[0].getFilters(),
        itemCount: null,
        pageData: {},
      },
    });
    const Current = specificQueryLoadedPages.current;
    if (!Current[specifiedSource]) {
      specificQueryLoadedPages.current[specifiedSource] =
        generateBaseSearchData();
    } else if (!Current[specifiedSource][searchData.searchQuery]) {
      specificQueryLoadedPages.current[specifiedSource][
        searchData.searchQuery
      ] = generateBaseSearchData()[searchData.searchQuery];
    } else {
      const currentSpecifiedSource = Current[specifiedSource];
      // Check if the previous search has the same filters.
      // If it doesn't, clear out the previous search data
      // and replace it with new data.
      if (
        !isEqual(
          currentSpecifiedSource[searchData.searchQuery].filters,
          mappedFileNames[0].getFilters()
        )
      ) {
        specificQueryLoadedPages.current[specifiedSource] =
          generateBaseSearchData();
      } else {
        return;
      }
    }

    const specifiedSourceCurrentValue =
      specificQueryLoadedPages.current[specifiedSource];
    if (!specifiedSourceCurrentValue[searchData.searchQuery])
      specifiedSourceCurrentValue[searchData.searchQuery] =
        generateBaseSearchData()[searchData.searchQuery]; /* {
        filters: mappedFileNames[0].getFilters(),
        itemCount: -1,
        pageData: {},
      }; */

    const specifiedSourceCurrentValueSearchQuery =
      specifiedSourceCurrentValue[searchData.searchQuery];
    if (specifiedSourceCurrentValueSearchQuery.pageData[queryOffset]) return;
    setLoading(true);
    (async () => {
      if (!specifiedSourceCurrentValueSearchQuery.itemCount)
        specifiedSourceCurrentValueSearchQuery.itemCount =
          await mappedFileNames[0].getItemCount();

      console.log('bruhmoment');
      console.log(specifiedSourceCurrentValueSearchQuery);
    })()
      .then(() => beginSearch(mappedFileNames[0]))
      .then((n) => {
        specifiedSourceCurrentValue[searchData.searchQuery].pageData[
          queryOffset
        ] = n;

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
    searchData,
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
          console.log(`mangadata frog: ${source.getName()}`);
          const newQueriedSearchesLog = { ...searchData.queriedSearches };
          newQueriedSearchesLog[searchData.searchQuery] =
            newQueriedSearchesLog[searchData.searchQuery] || {}; // Check if it exists beforehand because there might be other sources still loading after this one.

          newQueriedSearchesLog[searchData.searchQuery][source.getName()] =
            MangaData.length > 0 ? MangaData : false;

          const newSearchData = {
            ...searchData,
            queriedSearches: newQueriedSearchesLog,
          };

          return setSearchData(newSearchData);
        })
        .catch(console.error);
    });

    return undefined;
  });

  // TODO: Outline the image itself instead of the cover container + give the coverimage border radius
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
                      backto="search"
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
                      (mappedFileNames
                        .find((x) => x.getName() === sourceString)
                        ?.getFilters().results || 20);
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
    const queryFilters = mappedFileNames[0]?.getFilters();
    const queryData =
      specificQueryLoadedPages.current[mappedFileNames[0].getName()]?.[
        searchData.searchQuery
      ]?.pageData?.[queryOffset] ?? [];

    elementHierarchy = queryData.map((MangaObject: Manga) => (
      <MangaItem
        backto="search"
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
      <Modal
        open={modalIsOpen && !isLoadingMoreResults}
        className={css(styles.modalObject)}
        onClose={() => setIsOpen(false)}
      >
        <Paper className={css(styles.modalContainer)}>
          <div className={css(styles.modalContent)}>
            <div className={css(styles.modalHeader)}>
              <Typography variant="h5">Filters</Typography>
              <hr className={css(styles.rule)} />
              <IconButton
                onClick={() => setIsOpen(false)}
                className={css(styles.modalCloseButton)}
              >
                <CloseIcon
                  sx={{
                    float: 'right',
                  }}
                  className={css(styles.modalCloseIcon)}
                />
              </IconButton>
            </div>
            <div className={css(styles.modalBody)}>
              <FilterSettings
                sourceFilters={mappedFileNames[0].getFilters()}
                filterSettings={mappedFileNames[0].getFieldTypes()}
                onSubmit={(newFilters) => {
                  mappedFileNames[0].setFilters(newFilters);
                  setIsOpen(false);
                }}
              />
            </div>
          </div>
        </Paper>
      </Modal>
      <Filter
        onClick={() => {
          setIsOpen(!modalIsOpen);
        }}
        disabled={isLoadingMoreResults}
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
              initiatedSearches: {}, // This becomes empty because we're starting a new search
              searchQuery: e.target[0].value.toLowerCase(),
            };

            if (!searchData.queriedSearches[newSearchQueryData.searchQuery]) {
              newSearchQueryData.queriedSearches[
                newSearchQueryData.searchQuery
              ] = generateQueriedSearchData(mappedFileNames);
            }

            console.log(newSearchQueryData);
            // Having this function before is O.K. because if the query offset is already initially loaded (which it always is for the first page)
            // then the .search function will not be called.
            setQueryOffset(0);
            return setSearchData(() => {
              return newSearchQueryData;
            });
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
          maxpages={Math.ceil(
            (specificQueryLoadedPages.current[specifiedSource]?.[
              searchData.searchQuery
            ]?.itemCount ?? Infinity) /
              mappedFileNames[0].getFilters()?.results ?? 24
          )}
          page={queryOffset + 1}
          onUpdate={(page) => {
            setQueryOffset(Math.max(0, page - 1));
          }}
        />
      ) : null}
    </>
  );
};

export default SearchPage;
