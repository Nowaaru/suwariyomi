import { useRef, useEffect, useState } from 'react';
import { StyleSheet, css } from 'aphrodite';
import { URLSearchParams } from 'url';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

import FavoriteIcon from '@mui/icons-material/Favorite';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import { Manga } from '../../main/util/dbUtil';

import Tag from '../components/tag';
import Handler from '../../sources/handler';
import useQuery from '../util/hook/usequery';

const styles = StyleSheet.create({
  upperContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'initial',
    justifyContent: 'initial',
    height: '100%',
    width: '100%',
    fontFamily: '"Roboto", sans-serif',
  },
  metadataContainer: {
    marginTop: '24px',
    marginLeft: '48px',
    textShadow: '0px 0px 10px #000000',
  },

  mangaCover: {
    width: 'fit-content',
    height: 'fit-content',
  },

  mangaBannerContainer: {
    position: 'absolute',
    width: '100%',
    height: '384px',
    overflowX: 'hidden',
    overflowY: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
    filter: 'brightness(0.5) saturate(0.5) blur(10px)',
    ':after': {
      content: '""',
      position: 'absolute',
      width: '100%',
      height: '384px',
      background:
        'linear-gradient(to top, #111111FF 0%,rgba(17,17,17,0.35) 75%)',
    },
  },

  mangaBanner: {
    width: '500%',
    height: '500%',
    objectFit: 'contain',
  },

  mangaCoverImage: {
    maxWidth: '256px',
    maxHeight: '256px',
    borderRadius: '4px',
    border: '1px solid #FFFFFF',
  },

  mangaTitle: {},

  mangaAuthors: {
    ':before': {
      content: '"by "',
      fontWeight: 300,
      fontSize: '12px',
    },
    fontWeight: 600,
    fontSize: '24px',
    margin: '0',
    marginTop: '0',
    marginBottom: '0',
    color: '#FFFFFF',
  },

  textData: {
    marginLeft: '24px',
    borderRadius: '8px',
    height: 'fit-content',
    padding: '6px',
  },

  mangaTitleHeader: {
    fontSize: '3vw',
    fontWeight: 200,
    fontFamily: 'Open Sans, sans-serif',
    marginBottom: '8px',
  },

  mangaTags: {
    marginTop: '8px',
  },

  mangaSynopsis: {
    fontSize: '14px',
    fontWeight: 200,
    fontFamily: 'Open Sans, sans-serif',
    marginTop: '8px',
    marginBottom: '8px',
    maxWidth: '500px',
    maxHeight: '100px',
    overflow: 'hidden',
    backgroundColor: '#111111',
    padding: '8px',
    borderRadius: '8px',
    color: '#FFFFFF',
    position: 'relative',
    boxShadow: '0px 0px 10px #000000',
    ':after': {
      top: 0,
      left: 0,
      content: '""',
      position: 'absolute',
      width: '100%',
      height: '100%',
      background:
        'linear-gradient(to top, #111111FF 0%,rgba(17,17,17,0.35) 75%)',
    },
  },

  interactionButtons: {
    width: '100%',
    marginTop: '-12px',
    display: 'block',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },

  interactionButton: {
    padding: '8px 12px',
    borderRadius: '24px',
    fontSize: '1em',
    fontWeight: 'bold',
    transition:
      'letter-spacing 0.5s ease-in-out, background-color 0.3s ease-in-out',
    ':hover': {
      letterSpacing: '2px',
    },
  },
});

const View = () => {
  const Query = useQuery();
  const Navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Convert Query to Object
  const { id, source } = Object.fromEntries(
    Query as unknown as URLSearchParams
  );

  const mappedFileNamesRef = useRef(
    window.electron.util
      .getSourceFiles()
      .map(Handler.getSource)
      .filter((x) => x.getName().toLowerCase() === source.toLowerCase())
  );

  useEffect(() => {
    if (mappedFileNamesRef.current.length === 0) return Navigate('/404');
    if (!id || !source) return Navigate('/404');

    return undefined;
  }, [id, source, Navigate, mappedFileNamesRef]);

  const selectedSource = mappedFileNamesRef.current[0];
  const mangaData = useRef<(Manga & Pick<Required<Manga>, 'Authors'>) | null>(
    null
  );

  useEffect(() => {
    selectedSource
      .getManga(id)
      .then((x) => (mangaData.current = x))
      .then(() => setIsLoaded(true))
      .catch(console.error);
  }, [selectedSource, id]);

  const currentManga = mangaData.current;
  if (!currentManga) {
    console.log(mappedFileNamesRef);
    return null;
  }

  const Authors = currentManga.Authors.slice(0, 4);
  const remainderAuthors = currentManga.Authors.length - Authors.length;
  return (
    <div>
      <div className={css(styles.upperContainer)}>
        <div className={css(styles.mangaBannerContainer)}>
          <img
            src={currentManga.CoverURL}
            alt="Banner"
            className={css(styles.mangaBanner)}
          />
        </div>
        <div className={css(styles.metadataContainer)}>
          <div className={css(styles.mangaCover)}>
            <img
              className={css(styles.mangaCoverImage)}
              src={currentManga.CoverURL}
              alt={currentManga.Name}
            />
          </div>
        </div>
        <div className={css(styles.metadataContainer, styles.textData)}>
          <div className={css(styles.mangaTitle)}>
            <h1 className={css(styles.mangaTitleHeader)}>
              {currentManga.Name}
            </h1>
            <h2 className={css(styles.mangaAuthors)}>{`${Authors.join(', ')}${
              remainderAuthors > 0 ? ` (+${remainderAuthors})` : ''
            }`}</h2>
          </div>
          <div className={css(styles.mangaTags)}>
            {currentManga.Tags.map((x) => (
              <Tag key={x} name={x} type="normal" />
            ))}
          </div>
          <div className={css(styles.mangaSynopsis)}>
            {currentManga.Synopsis ?? 'No synopsis available.'}
          </div>
        </div>
        {/* <h1>{Query.get('id')}</h1>
      <h2>{Query.get('source')}</h2> */}
      </div>
      <div className={css(styles.metadataContainer)}>
        <div className={css(styles.interactionButtons)}>
          <Button
            startIcon={<FavoriteBorderIcon />}
            variant="contained"
            color="primary"
            onClick={() => console.log('Add to list')}
            className={css(styles.interactionButton)}
            sx={{
              backgroundColor: '#DF2935',
              '&:hover': {
                backgroundColor: '#FFFFFF',
                color: '#DF2935',
              },
            }}
          >
            Add to Library
          </Button>
        </div>
      </div>
    </div>
  );
};

export default View;
