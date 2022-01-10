import { StyleSheet, css } from 'aphrodite';

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
    display: 'inline-flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: '10px',
    width: '100%',
    maxHeight: '300px',
  },

  mangaItemListCover: {
    width: 'fit-content',
    height: 'fit-content',
    maxWidth: '25%',
    maxHeight: '100%',
  },

  mangaItemListCoverImage: {
    width: '256px',
    height: '256px',
    objectFit: 'contain',
  },

  mangaItemTitle: {
    fontSize: '1.5em',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#fff',
  },
});

const mangaItem = (props: MangaItemProps) => {
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
          <div>
            <h3>{props.title}</h3>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default mangaItem;
