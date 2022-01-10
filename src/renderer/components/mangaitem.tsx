import { StyleSheet, css } from 'aphrodite';
import { Button } from '@mui/material';
import Tag from './tag';

type MangaItemListProps = {
  displayType: 'list';
  listDisplayType: 'verbose' | 'compact' | 'comfy';
};

type MangaItemGridProps = {
  displayType: 'grid';
};

type MangaItemGenericProps = {
  coverUrl: string;
  title: string;
  tags: string[];
  synopsis: string;
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
    maxHeight: '300px',
    backgroundColor: '#0c0a0c',
    verticalAlign: 'top',
    overflow: 'hidden',
    display: 'flex',
  },

  mangaItemListCover: {
    margin: '10px 15px 10px 10px',
    verticalAlign: 'top',
    display: 'inline-flex',
    width: 'fit-content',
    height: 'fit-content',
  },

  mangaItemListCoverImage: {
    height: '256px',
    borderRadius: '10px',
    objectFit: 'contain',
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
});

const mangaItem = (props: MangaItemProps) => {
  const mangaTags = props.tags.map((tag) => (
    <Tag key={tag} name={tag} type="normal" />
  ));

  switch (props.displayType) {
    case 'list':
      return (
        <div className={css(styles.mangaItemListContainer)}>
          <div className={css(styles.mangaItemListCover)}>
            <img
              src={props.coverUrl}
              className={css(styles.mangaItemListCoverImage)}
              alt={props.title}
            />
          </div>
          <div className={css(styles.mangaMetadata)}>
            <div className={css(styles.mangaItemInformationMain)}>
              <h3 className={css(styles.mangaItemTitle)}>{props.title}</h3>
              <div className={css(styles.mangaItemTags)}>{mangaTags}</div>
              <div className={css(styles.mangaItemSynopsisContainer)}>
                <p className={css(styles.mangaItemSynopsis)}>
                  {props.synopsis}
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
                  >
                    View Chapters
                  </Button>
                  <Button
                    className={css(
                      styles.mangaItemStartReadButton,
                      styles.mangaItemButton
                    )}
                    variant="contained"
                  >
                    Start Reading
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default mangaItem;
