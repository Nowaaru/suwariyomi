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
  Tooltip,
  ButtonGroup,
} from '@mui/material';

import ArrowForwardIosSharp from '@mui/icons-material/ArrowForwardIosSharp';
import ArrowBackIosNewSharp from '@mui/icons-material/ArrowBackIosNewSharp';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import LooksOneIcon from '@mui/icons-material/LooksOne'; // Used for the double-
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CropFreeIcon from '@mui/icons-material/CropFree';
import SettingsIcon from '@mui/icons-material/Settings';
import WarningIcon from '@mui/icons-material/Warning';
import PublicIcon from '@mui/icons-material/Public';
import CropIcon from '@mui/icons-material/Crop';
import HomeIcon from '@mui/icons-material/Home';

import { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, css, CSSProperties, StyleDeclarationMap } from 'aphrodite';
import { URLSearchParams } from 'url';
import { useNavigate } from 'react-router-dom';
import { isEqual } from 'lodash';

import { filterChaptersToLanguage, sortChapters } from '../util/func';
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
    width: '100vw',
    height: '100%',
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

  noCursor: {
    cursor: 'none',
  },

  dialogTitle: {
    color: 'white',
    backgroundColor: 'transparent',
  },

  toolbarContainer: {
    display: 'flex',
    position: 'fixed',
    width: '100%',
    height: '48px',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    bottom: '52px',
    zIndex: 2e4,
    // padding: '12px 0px',
    padding: '-6px',
    boxSizing: 'border-box',
    transition: 'opacity 0.2s ease-in-out 0s',
  },

  toolbar: {
    backgroundColor: '#111111EE',
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
    position: 'absolute',
    color: 'white',
    margin: '0px 4px',
    width: '100%',
    height: '100%',
    top: '0px',
    transition: 'all 0.5s ease-out, top 0.2s ease-out',
    ':hover': {
      color: '#DF2935',
      top: '-2px',
    },
  },

  toolbarButton: {
    position: 'relative',
    width: '36px',
    height: '36px',
    marginRight: '6px',
  },

  iconHorizontal: {
    ':after': {
      margin: '0px -3px',
      position: 'absolute',
      content: '""',
      top: '0px',
      right: '0px',
      height: '100%',
      pointerEvents: 'none',
      backgroundColor: 'white',
      width: '1px',
      boxSize: 'border-box',
    },
  },

  noLine: {
    ':after': {
      display: 'none',
    },
  },

  pageSlider: { display: 'flex' },

  doublePageToggleIcon: {},

  doublePage: {},

  singlePage: {},

  settingsIconContainer: {},

  doublePageIconContainer: {},

  chapterIconContainer: {},

  cropIconContainer: {},

  globeIconContainer: {},

  globeIcon: {},

  cropToggleIcon: {},

  uncropped: {},

  cropped: {},

  iconVertical: {},

  chapterIcon: {},

  settingsIcon: {
    transform: 'rotate(0deg)',
    ':hover': {
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
    padding: '0px 32px 48px 32px',
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
    userSelect: 'none',
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
    userSelect: 'none',
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

  intermediaryContainer: {
    display: 'flex',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  intermediary: {
    display: 'flex',
    color: 'white',
  },

  intermediaryInner: {
    display: 'block',
  },

  intermediaryItem: {
    display: 'flex',
    width: '100%',
    height: 'fit-content',
  },

  noChapterText: { fontFamily: '"Roboto", sans-serif' },

  chapterTitle: {},

  missingChapterTextContainer: {
    marginTop: '25px',
  },

  missingChapterText: {
    fontFamily: '"Roboto", sans-serif',
  },

  warningIcon: {
    position: 'relative',
    verticalAlign: 'middle',
    marginRight: '10px',
    color: '#FFD600',
  },

  homeIcon: {
    position: 'relative',
    verticalAlign: 'middle',
    width: '48px',
    height: '48px',
    color: '#CF1925',
    transition: 'all 0.5s ease-out',
    ':hover': {
      color: '#DF2935',
    },
  },

  homeIconContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '10px',
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
  const [toolbarState, setToolbarState] = useState({
    isButtonHover: false,
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

  const [readerSettings, setReaderSettings] = useState<{
    isDoublePage: boolean;
    /*
      Reading style explanation:
        Vertical is for long-strips, but it's still "page-based.",
        Continuous vertical is the same as above, but instead of it being "page-based," you now have to scroll to see the next page.
        Webtoon is for webtoons, however, the image is flipped.
        Right-to-left and left-to-right is self-explanatory.
  */
    cropStyle: 1 | 2; // 1 is free-form, 2 is crop to first and last vertical and horizontal pixel. (not implemented yet)
    readingStyle:
      | 'right-to-left'
      | 'vertical'
      | 'webtoon'
      | 'left-to-right'
      | 'continuous-vertical';
  }>({
    cropStyle: 1,
    isDoublePage: false,
    readingStyle: 'left-to-right',
  });

  const isRightToLeft = readerSettings.readingStyle === 'right-to-left';
  const isPageCropped = readerSettings.cropStyle === 1;
  const { isDoublePage } = readerSettings;

  const setReaderSetting = (key: keyof typeof readerSettings, value: any) => {
    return setReaderSettings({
      ...readerSettings,
      [key]: value,
    });
  };

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
    chapters: (() => {
      // todo: im tired. fix this. cant do it now. brain pain.
      const cachedChapters = window.electron.library.getCachedManga(
        sourceId,
        mangaId
      )?.Chapters;
      if (cachedChapters)
        return sortChapters(
          filterChaptersToLanguage(cachedChapters, 'en'),
          false
        );

      return undefined;
    })(),
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
      selectedSource
        .getChapters(mangaId)
        .then((x) =>
          setReaderData({
            ...readerData,
            chapters: sortChapters(filterChaptersToLanguage(x), false),
          })
        )
        .catch(console.log);
    }
  });

  useEffect(() => {
    if (!toolbarState.isOpen) return undefined;

    const moveTimeout = setTimeout(() => {
      if (toolbarState.isHovering) return undefined;
      setToolbarState({ ...toolbarState, isOpen: false });
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
    [getChapter, readerData]
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
    if (!readerData.chapters || !readerData.currentchapter) return;
    Promise.resolve(readerData.currentchapter)
      .then(async (currentChapter) => {
        if (!currentChapter) return false;
        if (pageState[currentChapter.ChapterID]) {
          return true;
        }

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

  const currentPage = readerData.page ?? 1;
  const currentPageState =
    pageState[readerData.currentchapter?.ChapterID ?? chapterId];

  const handleClick = useCallback(
    (goTo: -1 | 1) => {
      if (!currentPageState) return;
      const readOrderDirection = (isRightToLeft ? -goTo : goTo) as -1 | 1;
      const normalizedDirection = readOrderDirection === -1 ? 0 : 1;

      const isAtStart = currentPage === 1;
      const isAtEnd = currentPage === currentPageState.length;

      if (
        (isAtStart && readOrderDirection === -1) ||
        (isAtEnd && readOrderDirection === 1)
      ) {
        if (isInIntermediary !== -1) {
          // if they're in an intermediary state...
          if (
            // TODO: Optimize if statement
            normalizedDirection !== isInIntermediary // if the direction they picked is different than the intermediary state direction...
          ) {
            setIsInIntermediary(-1); // reset intermediary state!
          } else return changeChapter(normalizedDirection); // otherwise, just change the chapter.
        } else return setIsInIntermediary(normalizedDirection); // otherwise, set the intermediary state!
      } else if (isInIntermediary !== -1) {
        return setIsInIntermediary(-1);
      }

      setReaderData({
        ...readerData,
        page: currentPage + readOrderDirection,
      });
    },
    [
      currentPageState,
      isRightToLeft,
      currentPage,
      readerData,
      isInIntermediary,
      changeChapter,
    ]
  );

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

  const onToolbarEnter = (buttonHover = false) => {
    setToolbarState({
      ...toolbarState,
      isHovering: !buttonHover,
      isButtonHover: buttonHover,
    });
  };
  const onToolbarLeave = () => {
    setToolbarState({
      ...toolbarState,
      isHovering: false,
      isButtonHover: false,
    });
  };

  const doToolbarShow =
    toolbarState.isOpen || toolbarState.isHovering
      ? styles.visible
      : styles.invisible;

  const doButtonShow =
    toolbarState.isButtonHover || toolbarState.isHovering
      ? styles.visible
      : styles.invisible;

  const doCursorShow =
    toolbarState.isHovering || toolbarState.isButtonHover || toolbarState.isOpen
      ? false
      : styles.noCursor;
  let isVertical = false;
  let isScrollBased = false;
  {
    const verticalKeys: Array<typeof readerSettings.readingStyle> = [
      'vertical',
      'continuous-vertical',
      'webtoon',
    ];

    const scrollBasedKeys: Array<typeof readerSettings.readingStyle> = [
      'continuous-vertical',
      'webtoon',
    ];

    [isScrollBased, isVertical] = [
      scrollBasedKeys.includes(readerSettings.readingStyle),
      verticalKeys.includes(readerSettings.readingStyle),
    ];
  }

  const iconKey = isVertical ? styles.iconVertical : styles.iconHorizontal;
  return isLoading ? (
    <div>Loading...</div>
  ) : (
    <div
      onMouseMove={() => {
        if (toolbarState.isHovering || toolbarState.isOpen) return;
        setToolbarState({ ...toolbarState, isOpen: true });
      }}
      className={css(styles.container, doCursorShow)}
    >
      <div
        className={css(
          styles.leftButton,
          styles.button,
          doButtonShow,
          doCursorShow
        )}
        onClick={() => handleClick(-1)}
        onKeyPress={() => {}}
        onMouseEnter={() => onToolbarEnter(true)}
        onMouseLeave={onToolbarLeave}
        role="button"
        tabIndex={isRightToLeft ? 0 : -1}
      >
        {/* TODO: Remove repitition here - because, believe it or not, this is also a mess. */}
        <div className={css(styles.buttonIcon, styles.leftButtonIcon)}>
          <ArrowBackIosNewSharp className={css(styles.arrowL)} />
        </div>
      </div>
      <div
        className={css(
          styles.rightButton,
          styles.button,
          doButtonShow,
          doCursorShow
        )}
        onClick={() => handleClick(1)}
        onKeyPress={() => {}}
        onMouseEnter={() => onToolbarEnter(true)}
        onMouseLeave={onToolbarLeave}
        role="button"
        tabIndex={isRightToLeft ? -1 : 0}
      >
        {/* TODO: Remove repitition here - because, believe it or not, this is also a mess. */}
        <div className={css(styles.buttonIcon, styles.rightButtonIcon)}>
          <ArrowForwardIosSharp className={css(styles.arrowR)} />
        </div>
      </div>
      <div className={css(styles.toolbarContainer, doToolbarShow)}>
        <div
          className={css(styles.toolbar)}
          onMouseEnter={() => onToolbarEnter(false)}
          onMouseLeave={onToolbarLeave}
        >
          <Toolbar className={css(styles.toolbarInner)}>
            {/* TODO: Try and remove repetition as much as possible. */}
            <IconButton
              className={css(
                styles.chapterIconContainer,
                styles.toolbarButton,
                iconKey
              )}
              onClick={() => {}} // This opens the chapter list.
            >
              <Tooltip title="Chapters" placement="top">
                <FormatListBulletedIcon
                  className={css(styles.toolbarIcon, styles.chapterIcon)}
                />
              </Tooltip>
            </IconButton>
            <IconButton
              className={css(
                styles.globeIconContainer,
                styles.toolbarButton,
                iconKey
              )}
              onClick={() => {
                window.electron.util.openInBrowser(
                  selectedSource.getUrl(mangaId)
                );
              }} // This opens the manga page in a browser.
            >
              <Tooltip title="Open in Browser" placement="top">
                <PublicIcon
                  className={css(styles.toolbarIcon, styles.globeIcon)}
                />
              </Tooltip>
            </IconButton>
            {!isScrollBased ? (
              <IconButton
                onClick={() =>
                  setReaderSetting('isDoublePage', !readerSettings.isDoublePage)
                }
                className={css(
                  styles.doublePageIconContainer,
                  styles.toolbarButton,
                  iconKey
                )}
              >
                <Tooltip
                  title={isDoublePage ? 'Double Page' : 'Single Page'}
                  placement="top"
                >
                  {readerSettings.isDoublePage ? (
                    <LooksTwoIcon
                      className={css(
                        styles.doublePageToggleIcon,
                        styles.doublePage,
                        styles.toolbarIcon
                      )}
                    />
                  ) : (
                    <LooksOneIcon
                      className={css(
                        styles.doublePageToggleIcon,
                        styles.singlePage,
                        styles.toolbarIcon
                      )}
                    />
                  )}
                </Tooltip>
              </IconButton>
            ) : (
              <IconButton
                onClick={() =>
                  setReaderSetting('cropStyle', isPageCropped ? 2 : 1)
                }
                className={css(
                  styles.cropIconContainer,
                  styles.toolbarButton,
                  iconKey
                )}
              >
                <Tooltip
                  title={isPageCropped ? 'Cropped' : 'Uncropped'}
                  placement="top"
                >
                  {isPageCropped ? (
                    <CropIcon
                      className={css(
                        styles.cropToggleIcon,
                        styles.cropped,
                        styles.toolbarIcon
                      )}
                    />
                  ) : (
                    <CropFreeIcon
                      className={css(
                        styles.cropToggleIcon,
                        styles.uncropped,
                        styles.toolbarIcon
                      )}
                    />
                  )}
                </Tooltip>
              </IconButton>
            )}
            <IconButton
              className={css(
                styles.settingsIconContainer,
                styles.noLine,
                styles.toolbarButton,
                iconKey
              )}
            >
              <Tooltip title="Settings" placement="top">
                <SettingsIcon
                  className={css(styles.settingsIcon, styles.toolbarIcon)}
                />
              </Tooltip>
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
            <div className={css(styles.intermediaryInner)}>
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
                  Volume: nextVolume = 1,
                } = nextMangaChapter;

                const { Chapter: currentChapter, Volume: currentVolume = 1 } =
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  readerData.currentchapter!; // currentChapter will always be defined due to the isLoading check above.

                // The next chapter is declared as "missing" IF (or):
                // - The next chapter is greater than the current chapter + 1
                // - The next volume is greater than the current volume + 1
                // If there is no volume, the assumed volume is 1 minus the next volume (if it is present, otherwise it is 1).

                const [
                  roundedCurrentChapter,
                  roundedCurrentVolume,
                  roundedNextChapter,
                  roundedNextVolume,
                ] = [
                  currentChapter,
                  currentVolume,
                  nextChapter,
                  nextVolume,
                ].map((num) => Math.round(num));

                const isNextChapterMissing =
                  roundedNextChapter > roundedCurrentChapter + 1 ||
                  roundedNextVolume > roundedCurrentVolume + 1;

                const volumesMissing =
                  roundedNextVolume - roundedCurrentVolume - 1;
                const chaptersMissing =
                  roundedNextChapter - roundedCurrentChapter - 1; // Subtract 1 because the current chapter is included.

                return (
                  <>
                    <div className={css(styles.intermediaryItem)}>
                      <div className={css(styles.chapterTitle)}>
                        {nextTitle}
                      </div>
                    </div>
                    <div className={css(styles.intermediaryItem)}>
                      {nextChapter}
                      {nextVolume ? `:${nextVolume}` : ''}
                    </div>
                    {isNextChapterMissing && ( // Due to the nature of the logic, this will not show if the previous chapter has a skip.
                      <div className={css(styles.missingChapterTextContainer)}>
                        <WarningIcon className={css(styles.warningIcon)} />
                        <span className={css(styles.missingChapterText)}>
                          {/* Grammar... :( */}
                          {/* TODO: When locales are implemented, extract and generalize this. */}
                          {(() => {
                            // Determine what the singular/plural form of the word is.
                            const displayVolume =
                              volumesMissing > 1 ? 'volumes' : 'volume';
                            const displayChapter =
                              chaptersMissing > 1 ? 'chapters' : 'chapter';

                            const isAre = (num: number) =>
                              num > 1 ? 'are' : 'is';
                            const baseDisplayText =
                              volumesMissing <= 0
                                ? `There ${isAre(
                                    chaptersMissing
                                  )} ${chaptersMissing} ${displayChapter}`
                                : `There ${isAre(
                                    volumesMissing
                                  )} ${volumesMissing} ${displayVolume}`;

                            return `${baseDisplayText} missing. You might be spoiled if you continue.`;
                          })()}
                        </span>
                        <div className={css(styles.homeIconContainer)}>
                          <IconButton onClick={() => Navigate('/library')}>
                            <HomeIcon className={css(styles.homeIcon)} />
                          </IconButton>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      <Sidebar
        outOf={currentPageState.length}
        Page={currentPage}
        isRightToLeft={readerSettings.readingStyle === 'right-to-left'}
        onItemClick={(newPage: number) => {
          console.log(`Navigating to page ${newPage}.`);
          if (isInIntermediary !== -1) setIsInIntermediary(-1);
          setReaderData({ ...readerData, page: newPage });
        }}
      />
    </div>
  );
};

export default Reader;
