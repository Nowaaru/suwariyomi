/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useRef, useEffect, useState, useCallback } from 'react';
import { StyleSheet, css } from 'aphrodite';
import { URLSearchParams } from 'url';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  CircularProgress,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';

import dayjs from 'dayjs';
import dayjs_duration from 'dayjs/plugin/duration';

import FavoriteIcon from '@mui/icons-material/Favorite';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import useMountEffect from '../util/hook/usemounteffect';
import useKeyboard from '../util/hook/usekeyboard';

import { FullManga } from '../../main/util/manga';
import { ReadDatabaseValue } from '../../main/util/read';
import {
  filterChaptersToLanguage,
  sortChapters,
  getReadUrl,
} from '../util/func';

import Tag from '../components/tag';
import Chapter from '../components/chapter';
import Handler from '../../main/sources/handler';
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

dayjs.extend(dayjs_duration);

const styles = StyleSheet.create({
  circularProgress: {
    width: '64px',
    height: '64px',
  },

  container: {
    width: '100%',
    height: '100%',
    overflowX: 'hidden',
    overflowY: 'auto',
    paddingBottom: '7rem',
    boxSizing: 'border-box',
    position: 'relative',
  },

  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    position: 'absolute',
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
    marginBottom: '12px',
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
    cursor: 'pointer',
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
      top: 1,
      left: 0,
      content: '""',
      position: 'absolute',
      width: '100%',
      height: '100%',
      background:
        'linear-gradient(to top, #111111FF 0%,rgba(17,17,17,0.35) 75%)',
    },
    transition: 'max-width 0.1s ease-in-out 0s',
    '@media (max-width: 760px)': {
      maxWidth: '95%',
    },
  },

  interactionButtons: {
    display: 'block',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },

  interactionButton: {
    padding: '8px 12px',
    borderRadius: '24px',
    fontSize: '1em',
    width: '100%',
    fontWeight: 'bold',
    transition:
      'letter-spacing 0.5s ease-in-out, background-color 0.3s ease-in-out, width 0.3s ease-in-out',
  },

  libraryButton: {
    display: 'flex',
  },

  disabledButton: {
    filter: 'grayscale(100%)',
  },

  notInLibrary: {
    transition:
      'letter-spacing 0s ease-in-out, background-color 0.3s ease-in-out, width 0.3s ease-in-out',
  },

  inLibrary: {
    ':hover': {
      letterSpacing: '2px',
    },
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

  flex: {
    display: 'flex',
  },

  startReadingButton: {
    fontSize: '0.8em',
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
    transition: 'width 0.3s ease-in-out',
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
  const [shiftPressed, setShiftPressed] = useState<boolean>(false);
  const [chaptersRead, setChaptersRead] = useState<number>(0);
  const [chaptersNoDuplicates, setChaptersNoDuplicates] = useState<number>(0);
  const { id, source, backto } = Object.fromEntries(
    Query as unknown as URLSearchParams
  );

  useKeyboard(
    'down',
    (e) => {
      if (e.key === 'Shift') setShiftPressed(true);
    },
    [setShiftPressed]
  );

  useKeyboard(
    'up',
    (e) => {
      if (e.key === 'Shift') setShiftPressed(false);
    },
    [setShiftPressed]
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

  useEffect(() => {
    if (mappedFileNamesRef.current.length === 0) return Navigate('/404');
    if (!id || !source) return Navigate('/404');

    return undefined;
  }, [id, source, Navigate, mappedFileNamesRef]);

  const selectedSource = mappedFileNamesRef.current[0];
  const mangaData = useRef<FullManga | null>(null);

  useMountEffect(() => {
    const cachedManga = window.electron.library.getCachedManga(source, id);
    if (cachedManga) {
      cachedManga.Chapters = filterChaptersToLanguage(
        cachedManga.Chapters,
        'en' //
      );

      mangaData.current = cachedManga;
      setIsLoaded(true);
      return;
    }

    selectedSource
      .getManga(id, true)
      .then((x) => {
        window.electron.library.addMangaToCache(source, x);

        const newData = { ...x };
        newData.Chapters = filterChaptersToLanguage(
          newData.Chapters,
          'en' //
        );
        return (mangaData.current = newData);
      })
      .then(() => setIsLoaded(true))
      .catch(console.error);

    // Disabling this because this should only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  const calculateReadChaptersNoDuplicates = useCallback(
    () =>
      mangaData?.current?.Chapters?.filter(
        (value, index, self) =>
          self.findIndex(
            (secondValue) => secondValue.Chapter === value.Chapter
          ) === index
      ),
    [mangaData]
  );

  const calculateReadChapters = useCallback(() => {
    const alreadyIndexedChapters = new Set<number>();
    mangaData.current?.Chapters?.forEach((x) => {
      const foundChapter =
        chapterData.current[
          Object.keys(chapterData.current).find((y) => y === x.ChapterID) ?? '0'
        ];
      if (!alreadyIndexedChapters.has(x.Chapter) && foundChapter) {
        if (
          foundChapter.currentPage > -1 &&
          x.PageCount > -1 &&
          foundChapter.currentPage >= x.PageCount
        )
          alreadyIndexedChapters.add(x.Chapter);
      }
    });

    return alreadyIndexedChapters.size;
  }, [chapterData]);

  useEffect(() => {
    const sourceChapters = window.electron.read.get(selectedSource.getName());
    if (!sourceChapters) return console.log('bruh 1');
    if (!mangaData.current) return console.log('bruh 2');

    chapterData.current = sourceChapters;
    const ChaptersNoDuplicates = calculateReadChaptersNoDuplicates();
    const readChapters = calculateReadChapters();

    console.log(ChaptersNoDuplicates?.length, readChapters);
    setChaptersRead(readChapters ?? 0);
    setChaptersNoDuplicates(ChaptersNoDuplicates?.length ?? 0);
  }, [
    mangaData,
    selectedSource,
    calculateReadChapters,
    calculateReadChaptersNoDuplicates,
  ]);

  const currentManga: FullManga | null = mangaData.current;
  if (currentManga) {
    sortChapters(currentManga.Chapters);
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
          foundChapter.currentPage < x.PageCount) ||
        foundChapter.currentPage <= -1
      );
    }); // We don't need a second find function here because .find() is a linear search; so it will find an in-progess chapter before it finds an unread chapter.
    const allChaptersRead =
      currentManga.Chapters.every((x) => {
        const correspondingChapter = chapterData.current[x.ChapterID];
        if (!correspondingChapter) return false;

        const { currentPage, pageCount } = correspondingChapter;
        return currentPage > -1 && pageCount > -1 && currentPage >= pageCount;
      }) || currentManga.Chapters.length === 0;

    let ReadingButtonInnerText = 'Start Reading';
    let mangaProgressBar = allChaptersRead ? 100 : 0;
    if (allChaptersRead) {
      ReadingButtonInnerText = 'All Chapters Read';
    } else if (chapterToDisplay) {
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

      let { Chapter: mangaProgressCurrent } = chapterToDisplay;
      let { Chapter: mangaProgressEnd } = currentManga.Chapters[0]; // This is [0] because the chapters are sorted in descending order.

      [mangaProgressCurrent, mangaProgressEnd] = [
        mangaProgressCurrent,
        mangaProgressEnd,
      ].map((x) => (!Number.isNaN(Number(x)) ? Number(x) : 0));
      // If a source author provided a bad value, then just set it to 0.

      mangaProgressBar =
        (Math.max(0, mangaProgressCurrent - 1) /
          Math.max(0, mangaProgressEnd - 1)) *
        100; // Subtract one because the chapters are 1-indexed.
    }

    // TODO: Implement Select Group button to filter chapters by group. For now, just show all chapters.
    // TODO: Implement Sort Order button.
    // TODO: Fix chapters sometimes not being counted properly in the progress bar.

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
              Navigate(`/${backto ?? 'library'}`);
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
              <Tooltip title={selectedSource.getName()} placement="right">
                <img
                  onClick={() =>
                    window.electron.util.openInBrowser(
                      selectedSource.getUrl(currentManga.MangaID)
                    )
                  }
                  className={css(styles.sourceIcon)}
                  src={selectedSource.getIcon()}
                  alt="Source Icon"
                />
              </Tooltip>
              <img
                className={css(styles.mangaCoverImage)}
                src={currentManga.CoverURL}
                alt={currentManga.Name}
              />
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
                  isInLibrary ? styles.inLibrary : styles.notInLibrary
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
                <Tag
                  key={`${x}-manga-tag`}
                  color={selectedSource?.tagColours?.[x]}
                  name={x}
                />
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
        <hr className={css(styles.dataRule)} />
        <div className={css(styles.metadataContainer)}>
          <h2 className={css(styles.chaptersHeader)}>Chapters</h2>
          <div className={css(styles.dataContainer)}>
            <div className={css(styles.chaptersContainer)}>
              <div className={css(styles.chapters, styles.scrollBar)}>
                {currentManga.Chapters.map((x) => {
                  const foundChapter = chapterData.current[x.ChapterID] || {};

                  return (
                    <Chapter
                      onMarkRead={() => {
                        chapterData.current =
                          window.electron.read.get(selectedSource.getName()) ??
                          chapterData.current;
                        setChaptersRead(calculateReadChapters());
                      }}
                      onReadClick={() => {
                        Navigate(
                          getReadUrl(
                            currentManga.MangaID,
                            currentManga.Name,
                            source,
                            x.ChapterID,
                            foundChapter.currentPage >= x.PageCount
                              ? 1
                              : Math.max(1, foundChapter.currentPage)
                          )
                        );
                      }}
                      modifierShift={shiftPressed}
                      key={`${x.ChapterID}-chapter`}
                      downloadable={selectedSource.canDownload}
                      dbchapter={foundChapter}
                      chapter={x}
                      source={selectedSource.getName()}
                      manga={currentManga}
                    />
                  );
                })}
              </div>
            </div>
            <Paper elevation={3} className={css(styles.utilityContainer)}>
              {/* If this manga is not in the cache then only show the start reading button */}
              {/* First component: Reading button */}
              <div className={css(styles.utilityButtonContainer)}>
                <Button
                  className={css(
                    styles.startReadingButton,
                    allChaptersRead && styles.disabledButton
                  )}
                  disabled={
                    (!!chapterToDisplay && !currentManga.Chapters[0]) ||
                    allChaptersRead
                  }
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    const mangaPage = (() => {
                      const foundChapter =
                        chapterData.current[
                          (chapterToDisplay ?? currentManga.Chapters[0])
                            .ChapterID
                        ];

                      if (foundChapter) {
                        const { currentPage } = foundChapter;
                        return currentPage !== -1 ? currentPage : 1;
                      }

                      return 1;
                    })();

                    if (chapterToDisplay) {
                      Navigate(
                        getReadUrl(
                          currentManga.MangaID,
                          currentManga.Name,
                          source,
                          chapterToDisplay?.ChapterID,
                          mangaPage
                        )
                      );
                    }
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
                        {`${calculateReadChapters()} / ${
                          calculateReadChaptersNoDuplicates()?.length
                        }`}
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
                          const timeElapsedDuration = dayjs.duration(
                            totalElapsedTime,
                            'milliseconds'
                          );

                          // Get the hours, minutes, and seconds
                          const [hours, minutes, seconds] = [
                            timeElapsedDuration.hours(),
                            timeElapsedDuration.minutes(),
                            timeElapsedDuration.seconds(),
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
  }

  return (
    <div className={css(styles.container, styles.loadingContainer)}>
      <div className={css(styles.circularProgress)}>
        <CircularProgress />
      </div>
    </div>
  );
};

export default View;
