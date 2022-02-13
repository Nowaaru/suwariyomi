// Most of the non-null assertion lints are incorrect;
// as TypeScript cannot determine whether a value is null or undefined
// based off of another value.
// ..or so I'm told.

/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
} from '@mui/material';

import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
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
import { clamp, isEqual } from 'lodash';

import { filterChaptersToLanguage, sortChapters } from '../util/func';
import { Chapter } from '../../main/util/manga';

import Handler from '../../sources/handler';
import Sidebar from '../components/sidebar';
import useQuery from '../util/hook/usequery';
import SourceBase from '../../sources/static/base';
import LoadingModal from '../components/loading';
import ChapterModal from '../components/chaptermodal';
import useMountEffect from '../util/hook/usemounteffect';
import ReaderButton from '../components/readerbutton';

type ViewStyles = 'horizontal' | 'vertical' | 'continuous-vertical';

type TapStyles =
  | 'default'
  | 'left-to-right'
  | 'right-to-left'
  | 'top-to-bottom'
  | 'bottom-to-top'
  | 'kindle'
  | 'l-shape'
  | 'edge'
  | 'none';

type OneOrNegativeOneOrNull = 1 | -1 | null;
type TapStylesPageEffectsValueKeys = 'top' | 'bottom' | 'left' | 'right';

const TapStylesPageEffects: {
  [style in Exclude<TapStyles, 'default'>]: {
    [key in TapStylesPageEffectsValueKeys]: OneOrNegativeOneOrNull;
  };
} = {
  'left-to-right': {
    top: null,
    left: -1,
    bottom: null,
    right: 1,
  },
  'right-to-left': {
    top: null,
    left: 1,
    bottom: null,
    right: -1,
  },
  'top-to-bottom': {
    top: -1,
    left: null,
    bottom: 1,
    right: null,
  },
  'bottom-to-top': {
    top: 1,
    left: null,
    bottom: -1,
    right: null,
  },
  kindle: {
    top: null,
    left: 1,
    bottom: null,
    right: 1,
  },
  'l-shape': {
    top: -1,
    left: -1,
    bottom: 1,
    right: 1,
  },
  edge: {
    top: null,
    left: 1,
    right: 1,
    bottom: -1,
  },
  none: {
    top: null,
    left: null,
    bottom: null,
    right: null,
  },
};

const viewStyleDefaults: { [key in ViewStyles]: TapStyles } = {
  horizontal: 'left-to-right',
  vertical: 'top-to-bottom',
  'continuous-vertical': 'none',
};

// TODO: Implement zooming in at the cursor position.
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

  invisibleButton: {
    opacity: 0,
  },

  invisibleToolbar: {
    display: 'none',
    opacity: 0,
  },

  visible: {
    display: 'flex',
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

  scrollBased: {
    padding: '0px 32px 0px 32px',
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

  topButton: {
    top: '0px',
    width: '100%',
    height: '30%',
  },

  topButtonIcon: {},

  bottomButton: {
    bottom: '0px',
    width: '100%',
    height: '30%',
  },

  bottomButtonIcon: {},

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

  arrow: {
    fontSize: '6em',
    color: '#00000066',
  },

  arrowT: {
    transform: 'rotate(90deg)',
  },

  arrowB: {
    transform: 'rotate(90deg)',
  },

  arrowL: {},

  arrowR: {},

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

  loadingModal: {
    color: 'white',
  },

  chapterHeader: {
    fontFamily: '"Roboto", sans-serif',
  },

  chapterSecondHeader: {},

  chapterFirstHeader: {
    marginBottom: '16px',
  },

  topbarContainer: {
    top: '64px',
    display: 'flex',
    position: 'absolute',
    width: '100%',
    height: '45px',
    transition: 'all 0.5s ease-out',
  },

  topbar: {
    display: 'flex',
    width: 'fit-content',
    height: 'fit-content',
    boxSizing: 'border-box',
    padding: '8px',
    backgroundColor: '#111111EE',
    borderRadius: '10px',
    margin: '0px auto',
  },

  topbarTitle: {
    fontFamily: '"Poppins", sans-serif',
    color: 'white',

    fontSize: '1.2em',
    verticalAlign: 'middle',
    height: 'fit-content',
  },

  topbarIcon: {
    verticalAlign: 'middle',
    maxWidth: '1.2em',
    maxHeight: '1.2em',
    marginRight: '10px',
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

const TapIcons = {
  top: <ArrowBackIosNewSharp className={css(styles.arrow, styles.arrowT)} />,
  bottom: <ArrowForwardIosSharp className={css(styles.arrow, styles.arrowB)} />,
  left: <ArrowBackIosNewSharp className={css(styles.arrow, styles.arrowL)} />,
  right: <ArrowForwardIosSharp className={css(styles.arrow, styles.arrowR)} />,
};

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
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
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
    readingStyle: ViewStyles;
    tappingStyle: TapStyles;
    invertTapping: boolean;
    sidebarStyle: 'bottom' | 'left' | 'right';
  }>({
    cropStyle: 1,
    isDoublePage: false,
    invertTapping: false,
    readingStyle: 'vertical',
    tappingStyle: 'default',
    sidebarStyle: 'bottom',
  });

  const associatedTappingStyle =
    readerSettings.tappingStyle === 'default'
      ? viewStyleDefaults[readerSettings.readingStyle]
      : readerSettings.tappingStyle;

  const tappingLayout = {
    ...TapStylesPageEffects[
      associatedTappingStyle as Exclude<TapStyles, 'default'> // associatedTappingStyle should never be 'default', for some reason TS is complaining.
    ],
  };

  // If invertTapping is true, then iterate through tappingLayout and change -1 to 1 and vice versa.
  if (readerSettings.invertTapping) {
    Object.keys(tappingLayout).forEach((key) => {
      if (tappingLayout[key as TapStylesPageEffectsValueKeys]) {
        tappingLayout[key as TapStylesPageEffectsValueKeys]! *= -1;
      }
    });
  }

  const isRightToLeft = readerSettings.tappingStyle === 'right-to-left';
  const isPageCropped = readerSettings.cropStyle === 1;
  const isDoublePage =
    readerSettings.isDoublePage &&
    !['webtoon', 'vertical', 'continuous-vertical'].includes(
      readerSettings.readingStyle
    ); // Double page is only for horizontal-based reading styles, such as right-to-left and left-to-right.

  const setReaderSetting = (key: keyof typeof readerSettings, value: any) => {
    return setReaderSettings({
      ...readerSettings,
      [key]: value,
    });
  };

  const {
    source: sourceId = 'MangaDex',
    id: mangaId = '',
    title: mangaTitle = mangaId,
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
      setToolbarState({ ...toolbarState, isOpen: false, isButtonHover: false });
      return true;
    }, 1500);

    return () => clearTimeout(moveTimeout);
  }, [toolbarState]);

  // TODO: Clear repitition because this is a mess.
  const getChapter = useCallback(
    (direction: 0 | 1): Chapter | undefined => {
      if (!readerData.chapters) return undefined;
      const currentChapterIndex = readerData.chapters.findIndex(
        (x: Chapter) => x.ChapterID === readerData.currentchapter!.ChapterID // disabled because ts cries even though i used an if statement as a guard
      );

      return readerData.chapters[
        currentChapterIndex + (direction === 0 ? 1 : -1)
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

  const changePage = useCallback(
    (newPageNumber: number) => {
      if (!readerData.currentchapter) return;
      if (newPageNumber !== currentPage) {
        window.electron.read.set(
          selectedSource.getName(),
          readerData.currentchapter.ChapterID, // CurrentChapter will alway
          readerData.currentchapter.PageCount,
          newPageNumber,
          Date.now(),
          0,
          false
        );

        return setReaderData({
          ...readerData,
          page: newPageNumber,
        });
      }
    },
    [readerData, currentPage, selectedSource]
  );

  const handleClick = useCallback(
    (goTo: -1 | 1) => {
      if (!currentPageState) return;

      const isAtStart = currentPage === 1;
      const isAtEnd =
        // Add 1 to account for the double page clamping the page to 1 before the end on even pages.
        currentPage + (isDoublePage ? 1 : 0) >= currentPageState.length;

      console.log(isAtStart, isAtEnd);

      // Left is -1 naturally; so it decreases the page count. However, in RTL it should be changed to 1 to increment.
      const readOrderGoTo = isRightToLeft ? -goTo : goTo;
      const normalizedGoTo = readOrderGoTo === -1 ? 0 : 1;

      if (isInIntermediary === -1 && (isAtStart || isAtEnd)) {
        if (
          (isAtStart && normalizedGoTo === 0) ||
          (isAtEnd && normalizedGoTo === 1)
        ) {
          return setIsInIntermediary(normalizedGoTo);
        }
      }

      if (isInIntermediary !== -1) {
        if (normalizedGoTo === isInIntermediary)
          return changeChapter(normalizedGoTo);

        return setIsInIntermediary(-1);
      }

      changePage(
        isDoublePage
          ? clamp(currentPage + readOrderGoTo * 2, 1, currentPageState.length)
          : currentPage + readOrderGoTo
      );
    },
    [
      isDoublePage,
      currentPageState,
      isRightToLeft,
      currentPage,
      isInIntermediary,
      changeChapter,
      changePage,
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
    (toolbarState.isOpen || toolbarState.isHovering) && !chapterModalOpen
      ? styles.visible
      : styles.invisibleToolbar;

  const doButtonShow =
    (toolbarState.isButtonHover || toolbarState.isHovering) && !chapterModalOpen
      ? styles.visible
      : styles.invisibleButton;

  const doCursorShow =
    toolbarState.isHovering ||
    toolbarState.isButtonHover ||
    toolbarState.isOpen ||
    chapterModalOpen
      ? false
      : styles.noCursor;
  let isVertical = false;
  let isScrollBased = false;
  {
    const verticalKeys: Array<typeof readerSettings.readingStyle> = [
      'vertical',
      'continuous-vertical',
    ];

    const scrollBasedKeys: Array<typeof readerSettings.readingStyle> = [
      'continuous-vertical',
    ];

    [isScrollBased, isVertical] = [
      scrollBasedKeys.includes(readerSettings.readingStyle),
      verticalKeys.includes(readerSettings.readingStyle),
    ];
  }

  const iconKey = isVertical ? styles.iconVertical : styles.iconHorizontal;

  const currentPageObject = currentPageState?.[currentPage - 1];
  const isCurrentPageLoaded = currentPageObject?.isLoaded ?? false;

  const nextPageObject = currentPageState?.[currentPage];
  const isNextPageLoaded = nextPageObject?.isLoaded ?? false;

  // This garbage is only here because TypeScript
  // does not like mapping an array of one type to
  // an array of another type.

  // Even worse, it doesn't let me contentrate a primitive type
  // (string) into a specific type (string which is top | bottom | left | right).
  // So I have to do this nonsense; going against every convention known to man.
  // If there were such thing as war crimes but for code, I would be
  // a dead man walking.

  // This is why we can't have nice things. Because this language never agrees
  // with anything.

  // I hate TypeScript.
  const buttonLayouts = Object.keys(tappingLayout)
    .filter((x) => tappingLayout[x as TapStylesPageEffectsValueKeys]) // Filter out null values
    .map((x) => (
      <ReaderButton
        className={css(
          styles[`${x as TapStylesPageEffectsValueKeys}Button`], // I.
          styles.button,
          doButtonShow,
          doCursorShow
        )}
        disabled={isLoading}
        divClassName={css(
          styles.buttonIcon,
          styles[`${x as TapStylesPageEffectsValueKeys}ButtonIcon`] // hate.
        )}
        onClick={
          () => handleClick(tappingLayout[x as TapStylesPageEffectsValueKeys]!) // this.
        }
        onMouseMove={() => onToolbarEnter(true)}
        onMouseLeave={onToolbarLeave}
        clickIcon={TapIcons[x as TapStylesPageEffectsValueKeys]} // language.
      />
    ));

  console.log(tappingLayout);
  return isLoading ? (
    <LoadingModal className={css(styles.loadingModal)} />
  ) : (
    <div
      onMouseMove={() => {
        if (toolbarState.isHovering || toolbarState.isOpen) return;
        setToolbarState({ ...toolbarState, isOpen: true });
      }}
      className={css(styles.container, doCursorShow)}
    >
      <ChapterModal
        chapters={readerData.chapters!}
        current={readerData.currentchapter!.ChapterID}
        source={selectedSource.getName()}
        open={chapterModalOpen}
        manga={mangaId}
        onClose={() => setChapterModalOpen(false)}
        onChange={(newChapterId) => {
          setIsLoading(true);
          setChapterModalOpen(false);
          setReaderData((previous) => ({
            ...previous,
            currentchapter:
              previous.chapters!.find((x) => x.ChapterID === newChapterId) ??
              previous.chapters![0],
            page: 1,
          }));
        }}
      />

      {/* TODO: Move topbar to their own component */}
      <div className={css(styles.topbarContainer, doToolbarShow)}>
        <div className={css(styles.topbar)}>
          <span className={css(styles.topbarTitle)}>
            <img
              src={selectedSource.getIcon()}
              className={css(styles.topbarIcon)}
              alt={selectedSource.getName()}
            />
            {mangaTitle}
          </span>
        </div>
      </div>
      {buttonLayouts}
      <div className={css(styles.toolbarContainer, doToolbarShow)}>
        <div
          className={css(styles.toolbar)}
          onMouseEnter={() => onToolbarEnter(false)}
          onMouseLeave={onToolbarLeave}
        >
          <Toolbar className={css(styles.toolbarInner)}>
            {/* TODO: Try and remove repetition as much as possible. */}
            {/* TODO: Extract toolbar to its own component. */}
            <IconButton
              className={css(
                styles.chapterIconContainer,
                styles.toolbarButton,
                iconKey
              )}
            >
              <Tooltip title="Library" placement="top">
                <MenuBookIcon
                  className={css(styles.toolbarIcon, styles.chapterIcon)}
                  onClick={() => Navigate(-1)}
                />
              </Tooltip>
            </IconButton>
            <IconButton
              className={css(
                styles.chapterIconContainer,
                styles.toolbarButton,
                iconKey
              )}
              onClick={() => setChapterModalOpen(true)} // This opens the chapter list.
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
                onClick={() => {
                  setReaderSetting(
                    'isDoublePage',
                    !readerSettings.isDoublePage
                  );
                  // If the user is on an even page, then decrease the page number by 1.
                  // Otherwise, since the user has technically seen *both* pages, increase the page number by 1.
                  // This is to make sure that:
                  //  1. The pages don't overflow (and potentially error out).
                  //  2. The lightbar shows the correct page underline.
                  if (currentPage % 2 === 0) {
                    if (isDoublePage)
                      // We can use isDoublePage here because it hasn't updated yet
                      changePage(currentPage + 1);
                    else changePage(currentPage - 1);
                  }
                }}
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
      {isInIntermediary === -1 || isScrollBased ? (
        <div
          className={css(
            styles.imageContainer,
            isScrollBased && styles.scrollBased
          )}
        >
          {/* If the current page is loaded AND they're not in double page / the next page is loaded... */}
          {isCurrentPageLoaded &&
          (!isDoublePage || !nextPageObject || isNextPageLoaded) ? (
            <>
              {isNextPageLoaded && isDoublePage ? (
                <img
                  className={css(styles.mangaImage)}
                  src={nextPageObject.src}
                  alt={`Page ${currentPage + 1}`}
                />
              ) : null}
              <img
                className={css(styles.mangaImage)}
                src={currentPageObject.src}
                alt={`Page ${currentPage}`}
              />
            </>
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
                console.log(isInIntermediary);
                if (!nextMangaChapter) {
                  return (
                    <span className={css(styles.noChapterText)}>
                      {isInIntermediary === 1
                        ? 'There is no next chapter.'
                        : 'There is no previous chapter.'}
                    </span>
                  );
                }

                const { Chapter: nextChapter, Volume: nextVolume } =
                  nextMangaChapter;

                const { Chapter: currentChapter, Volume: currentVolume } =
                  readerData.currentchapter!;

                // The next chapter is declared as "missing" IF (or):
                // - The next chapter is greater than the current chapter + 1
                // - The next volume is greater than the current volume + 1
                // If there is no volume, the assumed volume is 1 minus the next volume (if it is present, otherwise it is 1).

                const [roundedCurrentChapter, roundedCurrentVolume] = [
                  currentChapter,
                  currentVolume,
                ].map((num) => (num ? Math.floor(num) : NaN));

                const [roundedNextChapter, roundedNextVolume] = [
                  nextChapter,
                  nextVolume,
                ].map((num) => (num ? Math.ceil(num) : NaN));

                const isNextChapterMissing =
                  roundedNextChapter > roundedCurrentChapter + 1 ||
                  roundedNextVolume > roundedCurrentVolume + 1;

                const volumesMissing =
                  roundedNextVolume - roundedCurrentVolume - 1;
                const chaptersMissing =
                  roundedNextChapter - roundedCurrentChapter - 1; // Subtract 1 because the current chapter is included.

                const isGoingToNextChapter = isInIntermediary === 1;
                const targetChapterText = (
                  <span>{`${
                    !Number.isNaN(nextVolume) ? `Volume ${nextVolume} ` : ``
                  }Chapter ${nextChapter}`}</span>
                );

                const currentChapterText = (
                  <span>{`${
                    !Number.isNaN(currentVolume)
                      ? `Volume ${currentVolume} `
                      : ``
                  }Chapter ${currentChapter}`}</span>
                );

                return (
                  <>
                    <div className={css(styles.intermediaryItem)}>
                      <div
                        className={css(
                          styles.chapterFirstHeader,
                          styles.chapterHeader
                        )}
                      >
                        <div>
                          {isGoingToNextChapter ? `Finished:` : `Previous:`}
                        </div>
                        <div>
                          {isGoingToNextChapter
                            ? currentChapterText
                            : targetChapterText}
                        </div>
                      </div>
                    </div>
                    <div className={css(styles.intermediaryItem)}>
                      <div
                        className={css(
                          styles.chapterSecondHeader,
                          styles.chapterHeader
                        )}
                      >
                        <div>{isGoingToNextChapter ? `Next:` : `Current:`}</div>
                        <span>
                          {isGoingToNextChapter
                            ? targetChapterText
                            : currentChapterText}
                        </span>
                      </div>
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
                          <Tooltip title="Return to Manga Page">
                            <IconButton onClick={() => Navigate(-1)}>
                              <HomeIcon className={css(styles.homeIcon)} />
                            </IconButton>
                          </Tooltip>
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
        isRightToLeft={isRightToLeft}
        doublePageDisplay={isDoublePage}
        isVertical={readerSettings.sidebarStyle !== 'bottom'}
        isRight={readerSettings.sidebarStyle === 'right'}
        onItemClick={(newPage: number) => {
          if (isInIntermediary !== -1) setIsInIntermediary(-1);
          setReaderData({ ...readerData, page: newPage });
        }}
      />
    </div>
  );
};

export default Reader;
