import {
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
} from '@mui/material';

import { StyleSheet, css } from 'aphrodite/no-important';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import LazyLoad, { forceCheck } from 'react-lazyload';
import ArrowCircleLeftRoundedIcon from '@mui/icons-material/ArrowCircleLeftRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import parseQuery from '../util/search';
import useQuery from '../util/hook/usequery';
import { Manga } from '../../main/util/dbUtil';

import MangaItem from '../components/mangaitem';
import SearchBar from '../components/search';

import Handler from '../../sources/handler';
import SourceBase from '../../sources/static/base';

const styles = StyleSheet.create({
  container: {
    display: 'block',
    position: 'absolute',
    width: '100vw',
    height: 'calc(100vh - 42px)',
  },
  returnButtonContainer: {
    position: 'sticky',
    width: 'fit-content',
    height: 'fit-content',
    top: '60px',
    left: '25px',
    transition: 'left 0.3s ease-in-out',
    ':hover': {
      left: '15px',
    },
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
});

/*
  Structure:

  queriedSearches = {
    [sourceName]: {
      [searchQuery]: Manga[]
    }
  }
*/
type QueriedType = { [searchQuery: string]: { [sourceName: string]: Manga[] } };

const SearchPage = () => {
  const pageQueryParams = useQuery();
  const [searchQuery, setSearchQuery] = useState(
    (pageQueryParams.get('search') || '').toLowerCase().trim()
  );
  const [queriedSearchesLog, setQueriedSearchesLog] = useState<QueriedType>({});

  useEffect(() => {
    if (queriedSearchesLog[searchQuery]) return;

    const mappedFileNames = window.electron.util
      .getSourceFiles()
      .map(Handler.getSource)
      .filter(
        (x) =>
          !queriedSearchesLog[searchQuery] ||
          queriedSearchesLog[searchQuery][x.getName()] === undefined
      );

    mappedFileNames.forEach(async (source) => {
      source
        .search()
        .then((x) => x.map(source.serialize))
        .then((y) => {
          console.log(y);
          return Promise.all(y);
        })
        .then((MangaData: any) => {
          console.log('pog v2!!');

          return setQueriedSearchesLog({
            ...queriedSearchesLog,
            [searchQuery]: {
              [source.getName()]: MangaData,
            },
          });
        })
        .catch(console.error);
    });
  });

  /* TODO:
    - Implement grid MangaItem
    - Implement lazyload
    - Loading placeholder for loading sources
    - When a manga is clicked, go to the /view route
    - If `queriedSearchesLog` is empty, show a loading placeholder for each enabled source
    - If a source returns {}, return a "No results" placeholder.
    - If the *source name* is clicked, go to the /search route with the source name as a query param.
    - If there is a query param `source`, show an entirely different display; similar to the library.
  */

  console.log(queriedSearchesLog);
  return (
    <div className={css(styles.container)}>
      <div className={css(styles.returnButtonContainer)}>
        <Link className={css(styles.returnTo)} to="/library">
          <ArrowCircleLeftRoundedIcon fontSize="inherit" />
          <span className={css(styles.returnSpan)}> Library</span>
        </Link>
      </div>
      <SearchBar
        label="Search globally..."
        defaultValue={searchQuery}
        onSubmit={(e) => {
          // console.log(e.currentTarget);
          // setSearchQuery(e.currentTarget.nodeValue || '');
          // e.preventDefault();
          console.log('dread');
          e.preventDefault();
        }}
        placeholder="Hana ni Arashi"
      />
    </div>
  );
};

export default SearchPage;
