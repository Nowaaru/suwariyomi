import { StyleSheet, css } from 'aphrodite';
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
    width: '100%',
    height: '150px',
    position: 'relative',
    top: 0,
    left: 0,
    overflow: 'hidden',
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
    color: '#fff',
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    width: '100%',
    height: '85%',
    maxWidth: '600px',
    maxHeight: '400px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  mangaMetadata: {
    verticalAlign: 'top',
    display: 'inline-block',
    width: '65%',
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
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default mangaItem;
