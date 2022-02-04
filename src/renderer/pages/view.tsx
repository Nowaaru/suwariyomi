import { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  css,
  StyleDeclarationMap,
  StyleDeclaration,
  CSSProperties,
} from 'aphrodite';
import { URLSearchParams } from 'url';
import { useNavigate } from 'react-router-dom';
import { Button, Checkbox, IconButton, Paper, Typography } from '@mui/material';

import moment from 'moment';
import DownloadIcon from '@mui/icons-material/Download';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

import { FullManga } from '../../main/util/dbUtil';
import { ReadDatabaseValue } from '../../main/util/read';

import Tag from '../components/tag';
import Handler from '../../sources/handler';
import useQuery from '../util/hook/usequery';
/*
TODO: Use this implementation to implement themeing
const abcdefg: StyleDeclaration<
  Record<string, StyleDeclaration | CSSProperties>
> = {
  balls: {
    margin: '10px',
  },
};
*/

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    overflowX: 'hidden',
    overflowY: 'auto',
    paddingBottom: '7rem',
    boxSizing: 'border-box',
    position: 'relative',
  },

  upperContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'initial',
    justifyContent: 'initial',
    width: '100%',
    fontFamily: '"Roboto", sans-serif',
  },
  metadataContainer: {
    marginTop: '24px',
    marginLeft: '48px',
    textShadow: '0px 0px 10px #000000',
  },

  dataContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  utilityContainer: {
    display: 'block',
    width: '45%',
    marginRight: '24px',
    padding: '8px',
    textShadow: '0px 0px 10px #000000',
    boxSizing: 'border-box',
    backgroundColor: '#222222',
  },

  utilityButtonContainer: {
    display: 'flex',
  },

  mangaCover: {
    position: 'relative',
    width: 'fit-content',
    height: 'fit-content',
    marginBottom: '24px',
  },

  sourceIcon: {
    padding: '4px',
    position: 'absolute',
    top: '-16px',
    left: '-16px',
    maxHeight: '32px',
    backgroundColor: '#222222',
    borderRadius: '16px',
    objectFit: 'contain',
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
    height: '300vmax',
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
    textAlign: 'left',
  },

  mangaTags: {
    marginTop: '8px',
  },

  mangaSynopsis: {
    fontSize: '14px',
    fontWeight: 200,
    fontFamily: 'Open Sans, sans-serif',
    marginTop: '8px',
    maxWidth: '500px',
    maxHeight: '120px',
    overflow: 'hidden',
    backgroundColor: '#111111',
    padding: '8px',
    borderRadius: '8px',
    color: '#FFFFFF',
    position: 'relative',
    boxShadow: '0px 0px 10px #000000',
    boxSizing: 'border-box',
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
    display: 'inline-flex',
    width: 'fit-content',
    marginTop: '-12px',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },

  interactionButton: {
    padding: '8px 12px',
    borderRadius: '24px',
    fontSize: '1em',
    width: 'fit-content',
    fontWeight: 'bold',
    transition:
      'letter-spacing 0.5s ease-in-out, background-color 0.3s ease-in-out, width 0.3s ease-in-out',
    ':hover': {
      letterSpacing: '2px',
    },
  },

  libraryButton: {
    marginLeft: '68px',
    display: 'flex',
  },

  notInLibrary: {
    marginLeft: '44px',
  },

  dataRule: {
    position: 'relative',
    top: '35px',
    border: 'none',
    height: '2px',
    backgroundImage:
      'radial-gradient(circle at center,rgb(255,255,255,1), rgba(255,255,255,0))',
    marginBottom: '48px',
  },

  chaptersContainer: {
    display: 'flex',
    width: '50%',
  },

  chaptersHeader: {
    width: '50%',
    fontSize: '1.5em',
    fontFamily: 'Poppins, Open Sans,sans-serif',
    fontWeight: 400,
    textShadow: 'none',
    marginBottom: '8px',
    textAlign: 'center',
    color: '#FFFFFF',
  },

  chapters: {
    maxHeight: '300px',
    overflowY: 'auto',
    overflowX: 'visible',
    borderRadius: '8px',
    boxShadow: '0px 0px 10px #000000',
    width: '100%',
  },

  scrollBar: {
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

  chapter: {
    display: 'flex',
    position: 'relative',
    flexDirection: 'row',
    marginBottom: '8px',
    height: 'fit-content',
    boxSizing: 'border-box',
    padding: '8px',
    font: '14px Roboto, sans-serif',
    backgroundColor: '#222222',
    boxShadow: '0px 0px 5px #000000',
  },

  chapterNumberData: {
    // This only shows when there is a chapter title.
    // This is because if there is no chapter title, then the chapter number is
    // the chapter title.
    fontSize: '0.8em',
    fontWeight: 200,
    fontVariant: 'small-caps',
    marginRight: '8px',
    display: 'inline',
    fontFamily: 'Open Sans, sans-serif',
    color: 'white',
  },

  chapterTitle: {
    width: '95%',
    height: '100%',
  },

  chapterTitleHeader: {
    display: 'inline',
    marginRight: '8px',
    color: '#FFFFFF',
    textShadow: 'none',
  },

  chapterGroups: {},

  chapterGroupsText: {
    color: 'rgb(127,127,127)',
  },

  flex: {
    display: 'flex',
  },

  chapterDateData: {
    fontSize: '0.7em',
    fontWeight: 200,
    fontVariant: 'small-caps',
    marginTop: '36px',
    display: 'inline',
    fontFamily: 'Open Sans, sans-serif',
    color: 'white',
  },

  downloadButton: {
    float: 'right',
  },

  downloadButtonIcon: {
    color: 'white',
    ':hover': {
      color: '#DF2935',
    },
  },

  disabledDownloadButton: {
    color: 'white',
    filter: 'brightness(0.4)',
    ':hover': {
      color: 'white',
    },
  },

  bookmarksButton: {
    color: 'white',
  },

  bookmarksButtonFilled: {
    color: '#DF2935',
  },

  chapterContainerReadButton: {
    padding: '8px',
    fontWeight: 'bold',
    color: '#DF2935',
    boxSizing: 'border-box',
    width: '135px',
  },

  chapterContainerBookmarkButton: {},

  startReadingButton: {
    padding: '8px',
    fontWeight: 'bold',
    backgroundColor: '#DF2935',
    color: 'white',
    boxSizing: 'border-box',
    borderRadius: '24px',
    width: '100%',
    height: '32px',
    ':hover': {
      color: '#DF2935',
      backgroundColor: '#FFFFFF',
    },
  },

  mangaProgressContainer: {
    marginLeft: '4px',
    marginTop: '8px',
    fontSize: '1.5em',
    fontFamily: 'Poppins, Open Sans,sans-serif',
    color: '#FFFFFF',
  },

  mangaProgress: {},

  mangaProgressBar: {
    width: '100%',
    maxWidth: '400px',
    height: '8px',
    overflow: 'hidden',
    backgroundColor: '#DF2935',
    borderRadius: '4px',
  },

  mangaProgressBarFiller: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: '4px',
  },

  mangaProgressText: {
    ':after': {
      marginLeft: '6px',
      content: '"CHAPTERS"',
      fontVariant: 'small-caps',
      fontSize: '0.6em',
      fontWeight: 200,
      color: '#FFFFFF',
      fontFamily: 'Open Sans, sans-serif',
    },
  },

  extendedDataRule: {
    width: '100%',
    opacity: 0.5,
    border: 'none',
    height: '2px',
    backgroundImage:
      'radial-gradient(circle at center,rgb(127,127,127,1) 84%, rgba(127,127,127,0) 85%)',
  },

  timeElapsedContainer: {
    marginTop: '8px',
  },

  timeElapsed: {},

  timeElapsedText: {},

  timeElapsedTextItem: {
    marginLeft: '6px',
    fontSize: '1.5rem',
    fontFamily: 'Poppins, sans-serif',
    color: 'white',
  },

  hours: {
    ':after': {
      content: '"HOURS"',
      marginLeft: '6px',
      marginRight: '6px',
      fontVariant: 'small-caps',
      fontSize: '0.6em',
      fontWeight: 200,
      color: '#FFFFFF',
      fontFamily: 'Open Sans, sans-serif',
    },
  },

  minutes: {
    ':after': {
      content: '"MINUTES"',
      marginLeft: '6px',
      fontVariant: 'small-caps',
      fontSize: '0.6em',
      fontWeight: 200,
      color: '#FFFFFF',
      fontFamily: 'Open Sans, sans-serif',
    },
  },

  seconds: {
    ':after': {
      content: '"SECONDS"',
      marginLeft: '6px',
      fontVariant: 'small-caps',
      fontSize: '0.6em',
      fontWeight: 200,
      color: '#FFFFFF',
      fontFamily: 'Open Sans, sans-serif',
    },
  },

  backAppBar: {
    position: 'relative',
    left: '24px',
    width: 'fit-content',
    maxHeight: '32px',
    zIndex: 1000,
  },

  backButton: {
    backgroundColor: '#DF2935',
    // darker backgroundcolor
    borderColor: '#B11B25',
    borderStyle: 'solid',
    borderWidth: '2px',
    borderRadius: '4px',
    width: '100px',
    height: '100%',
    color: '#FFFFFF',

    transition:
      'color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
    ':hover': {
      backgroundColor: '#FFFFFF',
      color: '#DF2935',
      borderColor: '#D6D6D6',
    },
  },

  backTypography: {},
});

const View = () => {
  const Query = useQuery();
  const Navigate = useNavigate();
  const chapterData = useRef<ReadDatabaseValue>({});
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [scrollTarget, setScrollTarget] = useState<Node | undefined>();

  const { id, source } = Object.fromEntries(
    Query as unknown as URLSearchParams
  );
  const [isInLibrary, setInLibrary] = useState<boolean>(
    !!window.electron.library.getLibraryMangas(source).find((x) => x === id)
  );
  const mappedFileNamesRef = useRef(
    window.electron.util
      .getSourceFiles()
      .map(Handler.getSource)
      .filter((x) => x.getName().toLowerCase() === source.toLowerCase())
  );

  console.log(Query);
  useEffect(() => {
    if (mappedFileNamesRef.current.length === 0) return Navigate('/404');
    if (!id || !source) return Navigate('/404');

    return undefined;
  }, [id, source, Navigate, mappedFileNamesRef]);

  const selectedSource = mappedFileNamesRef.current[0];
  useEffect(() => {
    const sourceChapters = window.electron.read.get(selectedSource.getName());
    if (!sourceChapters) return;

    chapterData.current = sourceChapters;
  }, [selectedSource, isLoaded]);

  const mangaData = useRef<FullManga | null>(null);
  useEffect(() => {
    const cachedManga = window.electron.library.getCachedManga(source, id);
    if (cachedManga) {
      mangaData.current = cachedManga;
      setIsLoaded(true);

      return;
    }

    selectedSource
      .getManga(id)
      .then((x) => {
        window.electron.library.addMangaToCache(source, x);
        return (mangaData.current = x);
      })
      .then(() => setIsLoaded(true))
      .catch(console.error);
  }, [selectedSource, id, mangaData, source]);

  const currentManga: FullManga | null = mangaData.current;
  if (!currentManga) {
    console.log(mappedFileNamesRef);
    return null;
  }

  currentManga.Chapters.sort((a, b) => {
    const numberifiedA = Number(a.Chapter);
    const numberifiedB = Number(b.Chapter);

    const numberifiedAVolume = Number(a.Volume);
    const numberifiedBVolume = Number(b.Volume);

    const isANumber = !Number.isNaN(numberifiedA);
    const isBNumber = !Number.isNaN(numberifiedB);

    const isAVolumeNumber = !Number.isNaN(numberifiedAVolume);
    const isBVolumeNumber = !Number.isNaN(numberifiedBVolume);

    const calculatedA =
      numberifiedA * (isAVolumeNumber ? Math.max(numberifiedAVolume, 1) : 1);
    const calculatedB =
      numberifiedB * (isBVolumeNumber ? Math.max(numberifiedBVolume, 1) : 1);
    if (isANumber && isBNumber) {
      return -(calculatedA - calculatedB);
    }

    return -1;
  });

  const Authors = currentManga.Authors.slice(0, 4);
  const remainderAuthors = currentManga.Authors.length - Authors.length;

  // Get the chapter to display on the Start Reading button.
  // If there is a chapter in progress, then display that chapter.
  // Otherwise, display the first unread chapter.

  const chapterToDisplay = [...currentManga.Chapters].reverse().find((x) => {
    // Reverse the chapters so that the first chapter is the first index.
    const foundChapter = chapterData.current[x.ChapterID];
    if (!foundChapter) return true; // If the chapter is not in the database, then it is unread.

    return (
      (foundChapter.pageCount > -1 &&
        foundChapter.currentPage < foundChapter.pageCount) ||
      foundChapter.currentPage <= -1
    );
  }); // We don't need a second find function here because .find() is a linear search; so it will find an in-progess chapter before it finds an unread chapter.
  const allChaptersRead = currentManga.Chapters.every((x) => {
    const correspondingChapter = chapterData.current[x.ChapterID];
    if (!correspondingChapter) return false;

    const { currentPage, pageCount } = correspondingChapter;
    return currentPage > -1 && pageCount > -1 && currentPage >= pageCount;
  });

  let ReadingButtonInnerText = 'Start Reading';
  let mangaProgressBar = allChaptersRead ? 100 : 0;
  if (chapterToDisplay) {
    if (allChaptersRead) {
      ReadingButtonInnerText = 'All Chapters Read';
    } else {
      const foundChapter = chapterData.current[chapterToDisplay.ChapterID];
      const readChapterData = `${
        chapterToDisplay.Volume ? `Volume ${chapterToDisplay.Volume} ` : ''
      }Chapter ${chapterToDisplay.Chapter}`;
      ReadingButtonInnerText = foundChapter
        ? `${
            foundChapter.currentPage > -1 &&
            foundChapter.currentPage < foundChapter.pageCount
              ? 'Continue'
              : 'Start'
          } Reading ${readChapterData}`
        : `Start Reading ${readChapterData}`;

      let { Chapter: mangaProgressCurrent, Volume: mangaProgressScalar = 1 } =
        chapterToDisplay;
      let { Chapter: mangaProgressEnd, Volume: mangaProgressEndScalar = 1 } =
        currentManga.Chapters[0]; // This is [0] because the chapters are sorted in descending order.

      [
        mangaProgressCurrent,
        mangaProgressEnd,
        mangaProgressScalar,
        mangaProgressEndScalar,
      ] = [
        mangaProgressCurrent,
        mangaProgressEnd,
        mangaProgressScalar,
        mangaProgressEndScalar,
      ].map((x) => (!Number.isNaN(Number(x)) ? Number(x) : 0));
      // If a source author provided a bad value, then just set it to 0.

      mangaProgressBar =
        ((mangaProgressCurrent * mangaProgressScalar) /
          (mangaProgressEnd * mangaProgressEndScalar)) *
        100;
    }
  }

  const ChaptersNoDuplicates = currentManga.Chapters.filter(
    (value, index, self) =>
      self.findIndex((secondValue) => secondValue.Chapter === value.Chapter) ===
      index
  );

  const readChapters = ChaptersNoDuplicates.filter((x) => {
    const foundChapter = chapterData.current[x.ChapterID];
    // if (!foundChapter) return false;

    return true;
    // return (
    //   foundChapter.currentPage > -1 &&
    //   foundChapter.pageCount > -1 &&
    //   foundChapter.currentPage >= foundChapter.pageCount
    // );
  }); // We use filter instead of some because of a chapter's (soon-to-be-implemented) elapsedTime field.

  // TODO: Implement Select Group button to filter chapters by group. For now, just show all chapters.
  // TODO: Implement Sort Order button.
  return (
    <div
      className={css(styles.container, styles.scrollBar)}
      ref={(Node) => {
        if (Node) setScrollTarget(Node);
      }}
    >
      <div className={css(styles.backAppBar)}>
        <Button
          className={css(styles.backButton)}
          onClick={() => {
            console.log('go back');
          }}
          startIcon={<ArrowBackIcon />}
        >
          <Typography variant="h6" className={css(styles.backTypography)}>
            Back
          </Typography>
        </Button>
      </div>
      <div className={css(styles.upperContainer)}>
        <div className={css(styles.mangaBannerContainer)}>
          {/* TODO: Add IconURL fields to sources and have a small pin on the top of the cover image that indicates the source */}
          <img
            src={currentManga.CoverURL}
            alt="Banner"
            className={css(styles.mangaBanner)}
          />
        </div>
        <div className={css(styles.metadataContainer)}>
          <div className={css(styles.mangaCover)}>
            <img
              className={css(styles.sourceIcon)}
              src={selectedSource.getIcon()}
              alt="Source Icon"
            />
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
            {currentManga.Synopsis && currentManga.Synopsis.length > 0
              ? currentManga.Synopsis
              : 'No synopsis available.'}
          </div>
        </div>
        {/* <h1>{Query.get('id')}</h1>
      <h2>{Query.get('source')}</h2> */}
      </div>
      <div className={css(styles.interactionButtons)}>
        <Button
          startIcon={
            isInLibrary ? (
              isHovering ? (
                <HeartBrokenIcon />
              ) : (
                <FavoriteIcon />
              )
            ) : isHovering ? (
              <FavoriteIcon />
            ) : (
              <FavoriteBorderIcon />
            )
          }
          variant="contained"
          color="primary"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={() => {
            if (isInLibrary) {
              window.electron.library.removeMangaFromLibrary(source, id);
              setInLibrary(false);
            } else {
              window.electron.library.addMangaToLibrary(
                selectedSource.getName(),
                currentManga.MangaID
              );

              setInLibrary(true);
            }
          }}
          className={css(
            styles.interactionButton,
            styles.libraryButton,
            !isInLibrary && styles.notInLibrary
          )}
          sx={
            isInLibrary
              ? {
                  backgroundColor: '#FFFFFF',
                  color: '#DF2935',
                  '&:hover': {
                    backgroundColor: '#DF2935',
                    color: '#FFFFFF',
                  },
                }
              : {
                  backgroundColor: '#DF2935',
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: '#FFFFFF',
                    color: '#DF2935',
                  },
                }
          }
        >
          {isInLibrary ? 'In Library' : 'Add To Library'}
        </Button>
      </div>
      <hr className={css(styles.dataRule)} />
      <div className={css(styles.metadataContainer)}>
        <h2 className={css(styles.chaptersHeader)}>Chapters</h2>
        <div className={css(styles.dataContainer)}>
          <div className={css(styles.chaptersContainer)}>
            <div className={css(styles.chapters, styles.scrollBar)}>
              {currentManga.Chapters.map((x) => {
                const foundChapter = chapterData.current[x.ChapterID] || {};

                const {
                  pageCount = -1,
                  currentPage = -1,
                  lastRead,
                  timeElapsed = 0,
                } = foundChapter;
                const isRead =
                  foundChapter &&
                  currentPage !== -1 &&
                  pageCount !== -1 &&
                  currentPage === pageCount;
                const isBookmarked = foundChapter && foundChapter.isBookmarked;

                // TODO: Add a way to mark a chapter as read (probably by using react-contextify)
                return (
                  <Paper
                    elevation={3}
                    key={x.ChapterID}
                    className={css(styles.chapter)}
                  >
                    <div className={css(styles.chapterTitle)}>
                      <h3 className={css(styles.chapterTitleHeader)}>
                        {x.ChapterTitle ||
                          `${
                            x.Volume
                              ? `Volume ${x.Volume} Chapter ${x.Chapter}`
                              : `Chapter ${x.Chapter}`
                          }`}
                      </h3>
                      {x.ChapterTitle && (
                        <h4 className={css(styles.chapterNumberData)}>
                          {x.Volume
                            ? `VOL. ${x.Volume} CH. ${x.Chapter}`
                            : `CH. ${x.Chapter}`}
                        </h4>
                      )}
                      {x.Groups && x.Groups.length > 0 ? (
                        <div className={css(styles.chapterGroups)}>
                          <span className={css(styles.chapterGroupsText)}>
                            {x.Groups.join(' & ').slice(0, 45)}
                          </span>
                        </div>
                      ) : null}
                      {x.PublishedAt ? (
                        <h4 className={css(styles.chapterDateData)}>
                          {moment(x.PublishedAt).format('MMMM Do YYYY')}
                        </h4>
                      ) : null}
                    </div>
                    <Button className={css(styles.chapterContainerReadButton)}>
                      {foundChapter && currentPage !== -1
                        ? isRead
                          ? 'Re-read'
                          : 'Continue'
                        : 'Read'}
                    </Button>
                    <Checkbox
                      className={css(styles.chapterContainerBookmarkButton)}
                      checkedIcon={
                        <BookmarkIcon
                          className={css(styles.bookmarksButtonFilled)}
                        />
                      }
                      icon={
                        <BookmarkBorderIcon
                          className={css(styles.bookmarksButton)}
                        />
                      }
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        const { checked } = event.target;
                        if (checked)
                          // TODO: try using array + deconstruction here?
                          window.electron.read.set(
                            selectedSource.getName(),
                            x.ChapterID,
                            pageCount,
                            currentPage,
                            lastRead,
                            timeElapsed,
                            true
                          );
                        else
                          window.electron.read.set(
                            selectedSource.getName(),
                            x.ChapterID,
                            pageCount,
                            currentPage,
                            lastRead,
                            timeElapsed,
                            false
                          );
                      }}
                      defaultChecked={isBookmarked}
                    />
                    {selectedSource.canDownload ? (
                      <IconButton className={css(styles.downloadButton)}>
                        <DownloadIcon
                          className={css(
                            styles.downloadButtonIcon,
                            styles.disabledDownloadButton
                          )}
                        />
                      </IconButton>
                    ) : null}
                  </Paper>
                );
              })}
            </div>
          </div>
          <Paper elevation={3} className={css(styles.utilityContainer)}>
            {/* If this manga is not in the cache then only show the start reading button */}
            {/* First component: Reading button */}
            <div className={css(styles.utilityButtonContainer)}>
              <Button
                className={css(styles.startReadingButton)}
                variant="contained"
                color="primary"
                onClick={() => {
                  console.log('Start reading');
                }}
              >
                {ReadingButtonInnerText}
              </Button>
            </div>
            {isInLibrary ? (
              <>
                <hr className={css(styles.extendedDataRule)} />
                {/* Second component: Manga Progress */}
                <div className={css(styles.mangaProgressContainer)}>
                  <div className={css(styles.mangaProgress)}>
                    <div className={css(styles.mangaProgressText)}>
                      {readChapters.length} / {ChaptersNoDuplicates.length}
                    </div>
                    <div className={css(styles.mangaProgressBar)}>
                      <div
                        className={css(styles.mangaProgressBarFiller)}
                        style={{
                          width: `${mangaProgressBar}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                {/* Third component: Time Elapsed */}
                <div className={css(styles.timeElapsedContainer)}>
                  <div className={css(styles.timeElapsed)}>
                    <div className={css(styles.timeElapsedText)}>
                      {(() => {
                        let totalElapsedTime = 0;
                        currentManga.Chapters.forEach((x) => {
                          const foundChapter = chapterData.current[
                            x.ChapterID
                          ] || { timeElapsed: 0 };
                          totalElapsedTime += foundChapter.timeElapsed;
                        });
                        const momentTimeElapsedDuration = moment.duration(
                          totalElapsedTime,
                          'seconds'
                        );

                        // Get the hours, minutes, and seconds
                        const [hours, minutes, seconds] = [
                          momentTimeElapsedDuration.hours(),
                          momentTimeElapsedDuration.minutes(),
                          momentTimeElapsedDuration.seconds(),
                        ];

                        // Convert to elements
                        return (
                          <>
                            <span
                              className={css(
                                styles.timeElapsedTextItem,
                                styles.hours
                              )}
                            >
                              {hours}
                            </span>
                            <span
                              className={css(
                                styles.timeElapsedTextItem,
                                styles.minutes
                              )}
                            >
                              {minutes}
                            </span>
                            <span
                              className={css(
                                styles.timeElapsedTextItem,
                                styles.seconds
                              )}
                            >
                              {seconds}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </Paper>
        </div>
      </div>
    </div>
  );
};

export default View;
