import { StyleSheet, css } from 'aphrodite';
import { Button, Tooltip } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { stripHtml } from 'string-strip-html';

import Tag from './tag';

// image assets
import nocover from '../../../assets/images/nocover_dark.png';
import Handler from '../../main/sources/handler';

// util fdunc
import type { ReadDatabaseValue } from '../../main/util/read';
import { getReadUrl, sortChapters } from '../util/func';
import type { FullManga } from '../../main/util/manga';

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
  cachedMangaData?: FullManga | undefined;
  cachedChapterData?: ReadDatabaseValue | undefined;
  isLibrary?: boolean;
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
    minHeight: '300px',
    backgroundColor: '#0c0a0c',
    verticalAlign: 'top',
    overflow: 'hidden',
    display: 'flex',
    boxSizing: 'border-box',
  },

  mangaItemCover: {
    margin: '10px 15px 10px 10px',
    verticalAlign: 'top',
    position: 'relative',
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
    position: 'relative',
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

  mangaItemCoverBanner: {
    width: 'fit-content',
    height: 'fit-content',
    display: 'inline-block',
    backgroundColor: '#DF2935',
    color: '#FFFFFF',
    boxSizing: 'border-box',
    borderRadius: '15%',
    position: 'absolute',
    zIndex: 150,
    top: '5px',
    left: '-5px',
    padding: '5px',
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// If manga data isn't provided beforehand, the component will fetch it from the IPC renderer.
const MangaItem = ({
  tags,
  title,
  coverUrl,
  mangaid,
  source,
  synopsis,
  displayType,
  backto,
  cachedMangaData,
  cachedChapterData,
  isLibrary,
}: MangaItemProps) => {
  const Navigation = useNavigate();
  const mangaTags = tags.map((tag) => (
    <Tag
      key={tag}
      name={tag}
      color={Handler.getSource(source)?.tagColours?.[tag]}
    />
  ));

  // Move all tags with a colour to the front of the list.
  const sortedTags = mangaTags.filter((tag) => tag.props.color);
  const nonColourTags = mangaTags.filter((tag) => !tag.props.color).sort();
  const tagsToDisplay = [...sortedTags, ...nonColourTags];

  const mangaData =
    cachedMangaData ?? window.electron.library.getCachedManga(source, mangaid);

  const cachedChapters = mangaData?.Chapters
    ? sortChapters(mangaData?.Chapters, false).map((chapterObject) => {
        const cachedChapter = (cachedChapterData ??
          window.electron.read.get(source))?.[chapterObject.ChapterID];

        return {
          ...cachedChapter,
          ChapterID: chapterObject.ChapterID,
        };
      })
    : [];

  const isCompleted =
    cachedChapters?.filter(
      (chapter) => chapter.currentPage >= chapter.pageCount
    ).length === cachedChapters?.length;

  const firstUnreadChapter = mangaData?.Chapters.find(
    (x) =>
      !cachedChapters?.find((y) => y.ChapterID === x.ChapterID) ||
      (cachedChapters?.find((y) => y.ChapterID === x.ChapterID)?.currentPage ??
        -1) < x.PageCount
  );

  const firstUnreadCachedChapter = cachedChapters?.find(
    (x) => firstUnreadChapter?.ChapterID === x.ChapterID
  );

  const unreadChapterCurrentPage = firstUnreadCachedChapter?.currentPage;

  const allReadChapterCount = cachedChapters.reduce(
    (acc, chapter) =>
      chapter.currentPage >=
        (cachedMangaData?.Chapters?.find(
          (x) => x.ChapterID === chapter.ChapterID
        )?.PageCount ?? NaN) && chapter.currentPage > 0
        ? acc + 1
        : acc,
    0
  );

  const remainingChapters = Math.max(
    0,
    (mangaData?.Chapters?.length ?? 0) - allReadChapterCount
  );
  const viewParams = `/view?source=${source}&title=${title}&id=${mangaid}&backto=${backto}`;
  const elementKey = `${source}-${mangaid}`;
  switch (displayType) {
    case 'list':
      return (
        <div key={elementKey} className={css(styles.mangaItemListContainer)}>
          <div className={css(styles.mangaItemCover, styles.listCover)}>
            {isLibrary && remainingChapters > 0 ? (
              <Tooltip
                title={`${remainingChapters} Remaining Chapters`}
                placement="right"
                arrow
              >
                <span className={css(styles.mangaItemCoverBanner)}>
                  {remainingChapters}
                </span>
              </Tooltip>
            ) : null}
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
              <div className={css(styles.mangaItemTags)}>{tagsToDisplay}</div>
              <div className={css(styles.mangaItemSynopsisContainer)}>
                <p className={css(styles.mangaItemSynopsis)}>
                  {(() => {
                    return stripHtml(synopsis || 'No synopsis available.')
                      .result;
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
                  <Tooltip
                    title={(() => {
                      if (
                        firstUnreadCachedChapter &&
                        (firstUnreadCachedChapter.pageCount ?? -1) !== -1 &&
                        (firstUnreadCachedChapter.currentPage ?? -1) !== -1
                      ) {
                        return `Chapter ${
                          // firstUnreadCachedChapter depends on firstUnreadChapter. If the latter does not exist, the former does not either.
                          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                          firstUnreadChapter!.Chapter
                        } - Page ${unreadChapterCurrentPage} of ${
                          firstUnreadCachedChapter.pageCount
                        }`;
                      }
                      if (firstUnreadChapter) {
                        return `Chapter ${firstUnreadChapter.Chapter} - Unread`;
                      }

                      return '';
                    })()}
                  >
                    <Button
                      className={css(
                        styles.mangaItemStartReadButton,
                        styles.mangaItemButton
                      )}
                      variant="contained"
                      onClick={() => {
                        if (!mangaData) return;
                        if (isCompleted || !firstUnreadChapter) {
                          return Navigation(
                            getReadUrl(
                              mangaid,
                              mangaData.Name,
                              source,
                              mangaData.Chapters[0].ChapterID,
                              1
                            )
                          );
                        }

                        Navigation(
                          getReadUrl(
                            mangaid,
                            mangaData.Name,
                            source,
                            firstUnreadChapter.ChapterID,
                            Math.max(
                              !Number.isNaN(Number(unreadChapterCurrentPage))
                                ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                  unreadChapterCurrentPage!
                                : 1,
                              1
                            ) // Check for <1 in case of setting to unread via `view.tsx`.
                          )
                        );
                      }}
                    >
                      {(() => {
                        if (isCompleted) {
                          return 'Reread';
                        } else if (firstUnreadChapter) {
                          if (
                            firstUnreadChapter.ChapterID ===
                            mangaData?.Chapters[0].ChapterID
                          ) {
                            return 'Start Reading';
                          }
                          return 'Continue Reading';
                        }
                        return 'Start Reading';
                      })()}
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    case 'grid':
      return (
        <div key={elementKey}>
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
      );
      break;
    default:
      return null;
  }
};

MangaItem.defaultProps = {
  isLibrary: false,
  cachedMangaData: null,
  cachedChapterData: null,
};

export default MangaItem;
