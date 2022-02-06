/* eslint-disable consistent-return */
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Toolbar,
  IconButton,
  CircularProgress,
} from '@mui/material';

import ArrowForwardIosSharp from '@mui/icons-material/ArrowForwardIosSharp';
import ArrowBackIosNewSharp from '@mui/icons-material/ArrowBackIosNewSharp';
import SettingsIcon from '@mui/icons-material/Settings';
import WarningIcon from '@mui/icons-material/Warning';
import HomeIcon from '@mui/icons-material/Home';

import { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, css, CSSProperties, StyleDeclarationMap } from 'aphrodite';
import { URLSearchParams } from 'url';
import { useNavigate } from 'react-router-dom';
import { isEqual } from 'lodash';

import { sortChapters } from '../util/func';
import { Chapter } from '../../main/util/manga';

import Handler from '../../sources/handler';
import Sidebar from '../components/sidebar';
import useQuery from '../util/hook/usequery';
import SourceBase from '../../sources/static/base';
import useMountEffect from '../util/hook/usemounteffect';

// TOOD: Implement zooming in at the cursor position.

const stylesObject = {
  container: {
    display: 'block',
    position: 'absolute',
    width: '100vw',
    height: 'calc(100vh - 42px)',
  },
  sidebar: {
    display: 'block',
    top: '0px',
    left: '0px',
    width: '200px',
    height: '100%',
    backgroundColor: '#312F2F',
  },

  dialogContainer: {
    backgroundColor: 'transparent',
  },

  dialogContainerInner: {
    backgroundColor: '#312F2F',
  },

  dialog: {
    backgroundColor: 'transparent',
  },

  dialogText: {
    backgroundColor: 'transparent',
    color: 'white',
  },

  dialogActions: {
    backgroundColor: 'transparent',
  },

  dialogButton: {
    backgroundColor: 'transparent',
    fontWeight: 'bold',
    color: '#DF2935',
  },

  dialogTitle: {
    color: 'white',
    backgroundColor: 'transparent',
  },

  toolbarContainer: {
    display: 'flex',
    position: 'fixed',
    width: '100%',
    height: '42px',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    bottom: '52px',
    zIndex: 2e4,
    transition: 'opacity 0.2s ease-in-out 0s',
  },

  toolbar: {
    backgroundColor: '#111111',
    display: 'flex',
    height: '100%',
    width: '300px',
    borderRadius: '10px',
    position: 'relative',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
  },

  sliderContainer: {
    display: 'flex',
    position: 'absolute',
    backgroundColor: '#111111C8',
    top: '-90%',
    left: '50%',
    transform: 'translate(-50%, 0%)',
    width: '125%',
    paddingLeft: '15px',
    paddingRight: '15px',
    borderRadius: '100px',
  },

  sliderContainerInner: {
    display: 'flex',
    backgroundColor: 'transparent',
    position: 'relative',
  },

  toolbarInner: {
    position: 'absolute',
  },

  toolbarIcon: {
    color: 'white',
  },

  pageSlider: { display: 'flex' },

  settingsIconContainer: {},

  settingsIcon: {
    transform: 'rotate(0deg)',
    transition: 'all 0.5s ease-out',
    ':hover': {
      color: '#DF2935',
      transform: 'rotate(90deg)',
    },

    ':active': {
      transform: 'rotate(180deg)',
    },
  },

  invisible: {
    opacity: 0,
  },

  visible: {
    opacity: 1,
  },

  // Pagination-based view
  imageContainer: {
    boxSizing: 'border-box',
    display: 'flex',
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1024,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0px',
  },

  loadingContainer: {
    display: 'flex',
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0px',
  },

  loading: {
    color: 'white',
  },

  // Webtoon / Long-strip view

  // All views
  mangaImage: {
    display: 'flex',
    maxHeight: '95%',
    maxWidth: '65%',
  },

  button: {
    display: 'flex',
    color: 'white',
    position: 'absolute',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftButton: {
    width: '40%',
    height: '100%',
    top: '0px',
    left: '0px',
  },

  leftButtonIcon: {},

  rightButton: {
    width: '40%',
    height: '100%',
    top: '0px',
    right: '0px',
  },

  rightButtonIcon: {},

  buttonIcon: {
    color: 'white',
  },

  arrowL: {
    fontSize: '6em',
    color: '#00000066',
  },

  arrowR: {
    fontSize: '6em',
    color: '#00000066',
  },
};

type StylesObject = Record<
  keyof typeof stylesObject,
  CSSProperties | StyleDeclarationMap
>;

// i don't really care enough to get this to be typed properly. it's been
// three days and my brain is oozing out of my shoes. i can't do this anymore.
// if you're a typescript god and you know how to do it, please submit a PR.
const styles = StyleSheet.create<StylesObject>(stylesObject as any);

const errorDialog = (
  errorTitle = 'Error',
  errorMessage = 'An error occurred. Please try again later.',
  onClose: () => void = () => {},
  errorOptions?: JSX.Element[]
) => (
  <Dialog
    className={css(styles.dialogContainer)}
    sx={{
      '& .MuiDialog-paper': stylesObject.dialogContainerInner,
    }}
    open
    onClose={onClose}
  >
    <DialogTitle className={css(styles.dialogTitle)}>{errorTitle}</DialogTitle>
    <DialogContent className={css(styles.dialog)}>
      <DialogContentText className={css(styles.dialogText)}>
        <span>{errorMessage}</span>
      </DialogContentText>
      {errorOptions ? (
        <DialogActions className={css(styles.dialogActions)}>
          {errorOptions}
        </DialogActions>
      ) : null}
    </DialogContent>
  </Dialog>
);

const Reader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [toolbarState, settoolbarState] = useState({
    isHovering: false,
    isOpen: false,
  });
  const [isInIntermediary, setIsInIntermediary] = useState<0 | 1 | -1>(-1); // -1: not in intermediary state, 0: going to previous chapter, 1: going to next chapter
  // Intermediary state is for when the user is between
  // two chapters.

  const [pageState, setPageState] = useState<{
    [chapterId: string]: Array<{
      isLoaded: boolean;
      didError: boolean;
      src: string;
    }>;
  }>({});
  const queryParameters = useQuery();
  const Navigate = useNavigate();

  const isRightToLeft = true; // Set to true for debug; will be set by settings in production

  const {
    source: sourceId = 'MangaDex',
    id: mangaId = '',
    chapter: chapterId = '',
    page: pageNumber = '1',
  } = Object.fromEntries(queryParameters as unknown as URLSearchParams);

  const [readerData, setReaderData] = useState<{
    chapters: Chapter[] | undefined;
    currentchapter: Chapter | undefined;
    page: number | undefined;
  }>({
    chapters: undefined,
    currentchapter: undefined,
    page: Number.isNaN(Number(pageNumber)) ? 1 : Number(pageNumber),
  });

  let selectedSource: SourceBase;
  {
    const mappedFileNamesRef = useRef<SourceBase[]>(
      window.electron.util
        .getSourceFiles()
        .map(Handler.getSource)
        .filter((x) => x.getName().toLowerCase() === sourceId.toLowerCase())
    );
    // selectedSource = mappedFileNamesRef.current[0];
    ({ 0: selectedSource } = mappedFileNamesRef.current);
  }

  useMountEffect(() => {
    if (selectedSource && !readerData.chapters) {
      console.log(`Loading ${selectedSource.getName()}`);
      selectedSource
        .getChapters(mangaId)
        .then((x) =>
          setReaderData({
            ...readerData,
            chapters: sortChapters(x, false),
          })
        )
        .catch(console.log);
    }
  });

  useEffect(() => {
    if (!toolbarState.isOpen) return undefined;

    const moveTimeout = setTimeout(() => {
      if (toolbarState.isHovering) return undefined;
      console.log('Removing toolbar.');
      settoolbarState({ ...toolbarState, isOpen: false });
      return true;
    }, 1500);

    return () => clearTimeout(moveTimeout);
  }, [toolbarState]);

  // TODO: Clear repitition because this is a mess.
  const getChapter = useCallback(
    (direction: 0 | 1): Chapter | undefined => {
      if (!readerData.chapters) return undefined;
      const currentChapterIndex = readerData.chapters.findIndex(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (x: Chapter) => x.ChapterID === readerData.currentchapter!.ChapterID // disabled because ts cries even though i used an if statement as a guard
      );

      return readerData.chapters[
        currentChapterIndex + (direction === 0 ? -1 : 1)
      ];
    },
    [readerData.chapters, readerData.currentchapter]
  );
  const changeChapter = useCallback(
    (direction: 0 | 1) => {
      const selectedChapter = getChapter(direction);
      if (!selectedChapter) return;

      setIsLoading(true);
      setIsInIntermediary(-1);
      setReaderData({
        ...readerData,
        currentchapter: selectedChapter,
        page: direction === 0 ? selectedChapter.PageCount : 1,
      });
    },
    [readerData, getChapter]
  );

  useEffect(() => {
    if (readerData.currentchapter) return undefined;
    const foundChapter = readerData.chapters?.find(
      (x: Chapter) => x.ChapterID === chapterId
    );

    if (!isEqual(foundChapter, readerData.currentchapter)) {
      // prevents loops >:C
      return setReaderData({
        ...readerData,
        currentchapter: foundChapter,
      });
    }
  }, [readerData, chapterId]);

  useEffect(() => {
    const currentChapter = readerData.currentchapter;
    if (currentChapter) {
      // If the chapter is already loaded, don't load it again.
      const pageStateCurrentChapter = pageState[currentChapter.ChapterID];

      if (
        pageState[currentChapter.ChapterID]?.some(
          (x) => x.isLoaded && !x.didError
        ) &&
        pageStateCurrentChapter.length === currentChapter.PageCount
      ) {
        return setIsLoading(false);
      }
    }
  }, [readerData.currentchapter, pageState]);

  useEffect(() => {
    console.log(readerData);
    console.log('ye');
    if (!readerData.chapters || !readerData.currentchapter) return;
    console.log('called and balled!');
    Promise.resolve(readerData.currentchapter)
      .then(async (currentChapter) => {
        console.log(currentChapter);
        if (!currentChapter) return false;
        if (pageState[currentChapter.ChapterID]) {
          return true;
        }

        console.log('passed');
        // Set empty page state as a placeholder.
        setPageState((prevState) => ({
          ...prevState,
          [currentChapter.ChapterID]: [],
        }));

        const Pages = await selectedSource.getPages(currentChapter.ChapterID);
        setPageState((previousState) => {
          const newPageState = {
            ...previousState,
            [currentChapter.ChapterID]: Pages.map((page) => ({
              isLoaded: false,
              didError: false,
              src: page,
            })),
          };
          return newPageState;
        });

        // Begin loading all pages
        Pages.forEach((page, index) => {
          const image = new Image();
          image.onload = () => {
            setPageState((previousState) => {
              const newPageState = {
                ...previousState,
                [currentChapter.ChapterID]: previousState[
                  currentChapter.ChapterID
                ].map((x, i) =>
                  i === index ? { ...x, isLoaded: true, didError: false } : x
                ),
              };
              return newPageState;
            });
          };
          image.onerror = () => {
            setPageState((previousState) => {
              const newPageState = {
                ...previousState,
                [currentChapter.ChapterID]: previousState[
                  currentChapter.ChapterID
                ].map((x, i) =>
                  i === index ? { ...x, isLoaded: false, didError: true } : x
                ),
              };
              return newPageState;
            });
          };
          image.src = page;
        });

        return true;
      })
      .catch(console.log);
  }, [readerData, chapterId, selectedSource, pageState]);
  // No selected source dialog
  // This is here in case a bug occurs OR a user tries to access a source that doesn't exist.
  // typically via a direct link / protocol.

  const goBack = () => {
    Navigate('/library');
  };

  if (!selectedSource)
    return errorDialog(
      'Error',
      `You do not have any sources that go by the name of ${sourceId}.`,
      goBack,
      [
        <Button onClick={goBack} className={css(styles.dialogButton)}>
          Go Home
        </Button>,
      ]
    );

  const currentPageState =
    pageState[readerData.currentchapter?.ChapterID ?? chapterId];

  const currentPage = readerData.page ?? 1;
  if (!isLoading) {
    if (
      currentPage < 1 ||
      (!isLoading && currentPage > currentPageState.length)
    )
      return errorDialog(
        'Error',
        `The page number you specified (${currentPage}) is out of range.`,
        goBack,
        [
          <Button onClick={goBack} className={css(styles.dialogButton)}>
            Go Home
          </Button>,
        ]
      );
  }
  if (Number.isNaN(currentPage))
    return errorDialog('Error', 'Page number is not a valid number.', goBack, [
      <Button onClick={goBack} className={css(styles.dialogButton)}>
        Go Home
      </Button>,
    ]);

  const onToolbarEnter = () => {
    settoolbarState({ ...toolbarState, isHovering: true });
  };
  const onToolbarLeave = () => {
    settoolbarState({ ...toolbarState, isHovering: false });
  };

  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <div
      className={css(styles.container)}
      onMouseMove={() => {
        if (toolbarState.isHovering || toolbarState.isOpen) return;
        console.log('Setting toolbar to open.');
        settoolbarState({ ...toolbarState, isOpen: true });
      }}
    >
      <div
        className={css(
          styles.leftButton,
          styles.button,
          toolbarState.isOpen ? styles.visible : styles.invisible
        )}
        onMouseEnter={onToolbarEnter}
        onMouseLeave={onToolbarLeave}
      >
        {/* TODO: Remove repitition here - because, believe it or not, this is also a mess. */}
        <IconButton
          onClick={() => {
            if (
              isRightToLeft
                ? currentPage >= currentPageState.length
                : currentPage <= 1
            ) {
              if (isInIntermediary !== -1)
                return changeChapter(isInIntermediary);

              return isRightToLeft
                ? setIsInIntermediary(1)
                : setIsInIntermediary(0);
            }
            setReaderData({
              ...readerData,
              page: isRightToLeft
                ? Math.min(currentPageState.length, currentPage + 1)
                : Math.min(currentPage - 1, 1),
            });
          }}
          className={css(styles.buttonIcon, styles.rightButtonIcon)}
        >
          <ArrowBackIosNewSharp className={css(styles.arrowL)} />
        </IconButton>
      </div>
      <div
        className={css(
          styles.rightButton,
          styles.button,
          toolbarState.isOpen ? styles.visible : styles.invisible
        )}
        onMouseEnter={onToolbarEnter}
        onMouseLeave={onToolbarLeave}
      >
        <IconButton
          className={css(styles.buttonIcon, styles.leftButtonIcon)}
          onClick={() => {
            if (
              isRightToLeft
                ? currentPage <= 1
                : currentPage >= currentPageState.length
            ) {
              if (isInIntermediary !== -1)
                return changeChapter(isInIntermediary);

              return isRightToLeft
                ? setIsInIntermediary(0)
                : setIsInIntermediary(1);
            }
            return setReaderData({
              ...readerData,
              page: isRightToLeft
                ? Math.max(currentPage - 1, 1)
                : Math.min(currentPageState.length, currentPage + 1),
            });
          }}
        >
          <ArrowForwardIosSharp className={css(styles.arrowR)} />
        </IconButton>
      </div>
      <div
        className={css(
          styles.toolbarContainer,
          toolbarState.isOpen ? styles.visible : styles.invisible
        )}
      >
        <div
          className={css(styles.toolbar)}
          onMouseEnter={onToolbarEnter}
          onMouseLeave={onToolbarLeave}
        >
          <Toolbar className={css(styles.toolbarInner)}>
            <IconButton className={css(styles.settingsIconContainer)}>
              <SettingsIcon
                className={css(styles.settingsIcon, styles.toolbarIcon)}
              />
            </IconButton>
          </Toolbar>
        </div>
      </div>
      {isInIntermediary === -1 ? (
        <div className={css(styles.imageContainer)}>
          {currentPageState[currentPage - 1].isLoaded ? (
            <img
              className={css(styles.mangaImage)}
              src={currentPageState[currentPage - 1].src}
              alt={`Page ${currentPage}`}
            />
          ) : (
            <div className={css(styles.loadingContainer)}>
              <CircularProgress
                className={css(styles.loading)}
                color="secondary"
                size={50}
              />
            </div>
          )}
        </div>
      ) : (
        <div className={css(styles.intermediaryContainer)}>
          <div className={css(styles.intermediary)}>
            {/*
              Display:
                - Chapter Name (if present)
                - Chapter Number and Volume Number (if present)
                - If the chapter number is greater than the current chapter number + 1
                  OR the volume number is greater than the current volume number + 1, display a "warning icon"
                  that tells the user that there are N amount of missing chapters/volumes and that they might
                  be spoiled if they continue.
                - If there is no next chapter, display "There's no next chapter" button with a home icon.

                -Next chapter text: Finished / Next
                -Previous chapter text: Previous / Current
            */}
            {(() => {
              const nextMangaChapter = getChapter(isInIntermediary);

              if (!nextMangaChapter) {
                return (
                  <span className={css(styles.noChapterText)}>
                    {isInIntermediary === 1
                      ? 'There is no next chapter.'
                      : 'There is no previous chapter.'}
                  </span>
                );
              }

              const {
                ChapterTitle: nextTitle,
                Chapter: nextChapter,
                Volume: nextVolume,
              } = nextMangaChapter;

              const { Chapter: currentChapter, Volume: currentVolume } =
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                readerData.currentchapter!; // currentChapter will always be defined due to the isLoading check above.

              const isNextChapterMissing =
                nextChapter > Number(currentChapter) + 1 ||
                nextVolume > Number(currentVolume) + 1;

              return (
                <>
                  <span>Next Chapter:</span>
                  <span className={css(styles.chapterTitle)}>{nextTitle}</span>
                  <span>
                    {nextChapter}
                    {nextVolume ? `:${nextVolume}` : ''}
                  </span>
                  {isNextChapterMissing && ( // Due to the nature of the logic, this will not show if the previous chapter has a skip.
                    <div className={css(styles.missingChapterText)}>
                      <WarningIcon className={css(styles.warningIcon)} />
                      <span>
                        {`There are ${
                          +nextChapter - +currentChapter - 1 // Using unary plus operator to convert because consistently typing "Number" is harrowing.
                        } chapters missing. You might be spoiled if you continue.`}
                      </span>
                      <IconButton onClick={() => Navigate('/library')}>
                        <HomeIcon className={css(styles.homeIcon)} />
                      </IconButton>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
      <Sidebar
        outOf={currentPageState.length}
        Page={currentPage}
        isRightToLeft={isRightToLeft}
        onItemClick={(newPage: number) => {
          console.log(`Navigating to page ${newPage}.`);
          setReaderData({ ...readerData, page: newPage });
        }}
      />
    </div>
  );
};

export default Reader;
