import { StyleSheet, css } from 'aphrodite';
import { Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

import LazyLoad from 'react-lazyload';
import PropTypes from 'prop-types';
import Tag from './tag';

// image assets
import nocover from '../../../assets/images/nocover_dark.png';

type MangaItemListProps = {
  displayType: 'list';
  listDisplayType: 'verbose' | 'compact' | 'comfy';
};

type MangaItemGridProps = {
  displayType: 'grid';
  listDisplayType: null;
};

type MangaItemGenericProps = {
  coverUrl: string | undefined;
  title: string;
  tags: string[];
  synopsis: string;
  source: string;
  mangaid: string;
  backto: string;
};

type MangaItemProps = MangaItemGenericProps &
  (MangaItemListProps | MangaItemGridProps);

/*
  Comfy will show the title, cover image, and synopsis.
  Verbose will show the title, tags, author, status, and cover, with a brief synopsis.
  Compact will show the title, cover, and tags.
*/

const styles = StyleSheet.create({
  mangaItemListContainer: {
    marginBottom: '10px',
    width: 'calc(100% - 20px)',
    // maxHeight: '300px',
    backgroundColor: '#0c0a0c',
    verticalAlign: 'top',
    overflow: 'hidden',
    display: 'flex',
    boxSizing: 'border-box',
  },

  mangaItemCover: {
    margin: '10px 15px 10px 10px',
    verticalAlign: 'top',
  },

  gridCover: {
    overflow: 'hidden',
    margin: '5px 0 0px 0',
    width: '95%',
    height: '90%',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },

  listCover: {
    display: 'inline-flex',
  },

  mangaItemGridTitle: {
    textAlign: 'center',
    margin: '0px 6px 3px 6px',
    fontFamily: '"PT Sans Narrow", "Roboto", "Helvetica", "Arial", sans-serif',
    color: '#ffffff',
    fontSize: '1rem',
  },

  mangaItemListCoverImage: {
    height: '256px',
    maxWidth: '180px',
  },

  mangaItemGridContainer: {
    margin: '0px 10px 10px 10px',
    width: '140px',
    height: '200px',
    borderRadius: '10px',
    backgroundColor: '#0c0a0c',
    verticalAlign: 'top',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    boxSizing: 'border-box',
    overflow: 'hidden',
    transition:
      'width 0.2s ease-in-out, height 0.2s ease-in-out, border-radius 0.1s ease-in-out',
    '@media (min-width: 1200px)': {
      width: 'calc(140px * 1.4)',
      height: 'calc(200px * 1.4)',
    },
  },

  coverImage: {
    borderRadius: '10px',
    objectFit: 'contain',
    border: '1px solid transparent',
    transition: 'border 0.3s ease-in-out',
    ':hover': {
      border: '1px solid #ffffff',
    },
  },

  mangaItemGridCoverImage: {
    // height: '150px',
    // maxWidth: '150px',
    // width: '100%',
    // maxHeight: '150px',
    maxWidth: '100%',
    maxHeight: '100%',
    display: 'flex',
  },

  mangaItemTitle: {
    fontSize: '2em',
    fontWeight: 'bold',
    margin: '0',
    marginTop: '20px',
    marginBottom: '10px',
    color: '#fff',
    fontFamily: '"PT Sans Narrow", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  mangaItemSynopsisContainer: {
    width: '65%',
    height: '150px',
    position: 'relative',
    top: 0,
    left: 0,
    display: 'inline-flex',
    overflow: 'hidden',
    '@media (max-width: 999px)': {
      display: 'none',
      visibility: 'hidden',
    },
    '@media (max-width: 1200px)': {
      maxWidth: '50%',
    },
    ':after': {
      content: '""',
      position: 'absolute',
      height: '5em',
      bottom: '0',
      left: '0',
      width: '100%',
      background: `linear-gradient(to bottom,
        rgba(0,0,0,0) 20%,
        #0c0a0c 80%
     );`,
      pointerEvents: 'none', // prevent mouse events from going through to the rest of the page
    },
  },
  mangaItemSynopsis: {
    fontSize: '1em',
    display: 'inline-flex',
    color: '#fff',
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    width: '80%',
    height: '85%',
    maxWidth: '600px',
    maxHeight: '400px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    '@media (max-width: 999px)': {
      display: 'none',
      visibility: 'hidden',
    },
  },

  mangaMetadata: {
    flexShrink: 3,
    verticalAlign: 'top',
    display: 'inline-block',
    width: '80%',
    height: '100%',
  },

  mangaItemInformationMain: {
    display: 'inline-block',
    width: '100%',
    height: 'fit-content',
  },

  // Manga item tags is a horizontal list of tags.
  mangaItemTags: {
    display: 'inline-block',
    width: '100%',
    height: 'fit-content',
    margin: '0px 0px 10px 0px',
    verticalAlign: 'top',
  },

  // Buttons are vertically placed with 100% width and 48px height.
  mangaItemButtonContainer: {
    display: 'inline-block',
    width: '100%',
    height: '155px',
    margin: '0px 0px 10px 0px',
    verticalAlign: 'top',
    float: 'right',
    '@media (min-width: 1000px)': {
      maxWidth: '50%',
    },
    '@media (min-width: 1200px)': {
      maxWidth: '35%',
    },
    // backgroundColor: 'red',
  },

  linkCover: {
    width: 'fit-content',
    height: 'fit-content',
    display: 'inline-block',
    color: 'unset',
    border: 'none',
    outline: 'none',
    textDecoration: 'none',
    textDecorationColor: '#fff',
  },

  mangaItemButtonWrapper: {
    width: '95%',
    padding: '5px',
    paddingTop: '20px',
    height: '48px',
  },

  mangaItemButton: {
    width: '100%',
    height: '100%',
    marginBottom: '12px',
  },

  mangaItemStartReadButton: {
    backgroundColor: '#EE7A3B',
  },

  mangaItemViewButton: {
    backgroundColor: '#00BCD4',
  },

  mangaItemCoverButton: {
    background: 'none',
    outline: 'none',
    border: 'none',
    cursor: 'pointer',
  },
});

const MangaItem = ({
  tags,
  title,
  coverUrl,
  mangaid,
  source,
  synopsis,
  displayType,
  listDisplayType,
  backto,
}: MangaItemProps) => {
  const Navigation = useNavigate();
  const mangaTags = tags.map((tag) => (
    <Tag key={tag} name={tag} type="normal" />
  ));

  const viewParams = `/view?source=${source}&title=${title}&id=${mangaid}&backto=${backto}`;
  switch (displayType) {
    case 'list':
      return (
        <LazyLoad key={title} scrollContainer="#lazyload">
          <div className={css(styles.mangaItemListContainer)}>
            <div className={css(styles.mangaItemCover, styles.listCover)}>
              <button
                type="button"
                className={css(styles.mangaItemCoverButton)}
                onClick={() => Navigation(viewParams)}
              >
                <img
                  src={coverUrl ?? nocover}
                  className={css(
                    styles.mangaItemListCoverImage,
                    styles.coverImage
                  )}
                  alt={title}
                />
              </button>
            </div>
            <div className={css(styles.mangaMetadata)}>
              <div className={css(styles.mangaItemInformationMain)}>
                <h3 className={css(styles.mangaItemTitle)}>{title}</h3>
                <div className={css(styles.mangaItemTags)}>{mangaTags}</div>
                <div className={css(styles.mangaItemSynopsisContainer)}>
                  <p className={css(styles.mangaItemSynopsis)}>
                    {(() => {
                      return (
                        new DOMParser().parseFromString(
                          synopsis || 'No synopsis available.', // Use OR instead of null check to implicitly cast empty strings to boolean.
                          'text/html'
                        ).body.textContent || 'No synopsis available.'
                      );
                    })()}
                  </p>
                </div>
                <div className={css(styles.mangaItemButtonContainer)}>
                  <div className={css(styles.mangaItemButtonWrapper)}>
                    <Button
                      className={css(
                        styles.mangaItemViewButton,
                        styles.mangaItemButton
                      )}
                      variant="contained"
                      onClick={() => {
                        Navigation(viewParams);
                      }}
                    >
                      View Chapters
                    </Button>
                    <Button
                      className={css(
                        styles.mangaItemStartReadButton,
                        styles.mangaItemButton
                      )}
                      variant="contained"
                      onClick={() => {
                        window.electron.log.info('read');
                      }}
                    >
                      Start Reading
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </LazyLoad>
      );
    case 'grid':
      return (
        <LazyLoad key={title} scrollContainer="#lazyload">
          <div>
            <Link
              className={css(styles.linkCover, styles.mangaItemGridContainer)}
              to={viewParams}
            >
              <div className={css(styles.mangaItemCover, styles.gridCover)}>
                <img
                  src={coverUrl ?? nocover}
                  className={css(
                    styles.mangaItemGridCoverImage,
                    styles.coverImage
                  )}
                  alt={title}
                />
              </div>
              <span className={css(styles.mangaItemGridTitle)}>
                {title.length < 27 ? title : `${title.slice(0, 27)}...`}
              </span>
            </Link>
          </div>
        </LazyLoad>
      );
      break;
    default:
      return null;
  }
};

export default MangaItem;
