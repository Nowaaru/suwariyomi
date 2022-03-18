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

import dayjs from 'dayjs';
import dayjs_duration from 'dayjs/plugin/duration';

import ArrowForwardIosSharp from '@mui/icons-material/ArrowForwardIosSharp';
import ArrowBackIosNewSharp from '@mui/icons-material/ArrowBackIosNewSharp';
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

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { StyleSheet, css, CSSProperties, StyleDeclarationMap } from 'aphrodite';
import { URLSearchParams } from 'url';
import { useNavigate } from 'react-router-dom';
import { clamp, isEqual, throttle } from 'lodash';

import { filterChaptersToLanguage, sortChapters } from '../util/func';
import { Chapter } from '../../main/util/manga';

import Handler from '../../main/sources/handler';
import Sidebar from '../components/sidebar';
import SettingsModal from '../components/settingsmodal';
import useQuery from '../util/hook/usequery';
import SourceBase from '../../main/sources/static/base';
import LoadingModal from '../components/loading';
import ChapterModal from '../components/chaptermodal';
import ReaderButton from '../components/readerbutton';
import ReaderContext from '../components/context/reader';
import useMountEffect from '../util/hook/usemounteffect';
import { DefaultSettings } from '../../main/util/settings';

type ViewStyles =
  | 'left-to-right'
  | 'right-to-left'
  | 'vertical'
  | 'continuous-vertical'
  | 'webtoon';

type TapStyles =
  | 'default'
  | 'left-and-right'
  | 'top-and-bottom'
  | 'kindle'
  | 'l-shape'
  | 'edge'
  | 'none';

type OneOrNegativeOneOrNull = 1 | -1 | null;
type TapStylesPageEffectsValueKeys = 'top' | 'bottom' | 'left' | 'right';
type PageEffect = {
  [key in TapStylesPageEffectsValueKeys]: OneOrNegativeOneOrNull;
};
const TapStylesPageEffects: {
  [style in Exclude<TapStyles, 'default'>]: PageEffect;
} = {
  'left-and-right': {
    top: null,
    left: -1,
    bottom: null,
    right: 1,
  },
  'top-and-bottom': {
    top: -1,
    left: null,
    bottom: 1,
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
  vertical: 'top-and-bottom',
  webtoon: 'left-and-right',
  'right-to-left': 'left-and-right',
  'left-to-right': 'left-and-right',
  'continuous-vertical': 'none',
};

dayjs.extend(dayjs_duration);

// TODO: Implement zooming in at the cursor position.
const stylesObject = {
  container: {
    display: 'block',
    width: '100%',
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0px 32px 48px 32px',
    zIndex: -1024,
    '::-webkit-scrollbar': {
      width: '4px',
    },
    '::-webkit-scrollbar-thumb': {
      background: '#FFFFFF',
      ':hover': {
        background: '#DF2935',
      },
    },
  },

  scrollBased: {
    display: 'flex',
    justifyContent: 'unset',
    alignItems: 'center',
    flexDirection: 'column',
    overflowY: 'auto',
    zIndex: 1024,
  },

  disableScroll: {
    overflow: 'hidden',
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

  continuousScrollLoadingContainer: {
    display: 'flex',
    width: '150px',
    height: '400px',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0px',
  },

  loading: {
    color: 'white',
  },

  // Webtoon / Long-strip view

  continuousScrollHeader: {
    marginBottom: '32px',
  },

  continuousScrollIntermediary: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    width: '35%',
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: '400px',
    backgroundColor: '#000000EE',
    margin: '12px',
    boxSizing: 'border-box',
  },

  continuousScrollPreviousChapterIntermediary: {},

  continuousScrollNextChapterIntermediary: {},

  continuousScrollNoChapterIntermediary: {},

  // All views
  mangaImage: {
    display: 'flex',
    maxHeight: '95%',
    maxWidth: '65%',
    userSelect: 'none',
  },

  loadingImage: {
    display: 'flex',
    height: '65%',
    width: '45%',
    userSelect: 'none',
  },

  button: {
    zIndex: 1025,
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
    zIndex: 2048,
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

  continuousScrollIntermediaryButton: {
    boxSizing: 'border-box',
    padding: '8px',
    color: '#DF2935',
    backgroundColor: 'transparent',
    ':hover': {
      backgroundColor: '#DF293522',
      color: '#CF1925',
    },
  },

  continuousScrollImage: {
    marginBottom: '16px',
  },

  flippedImage: {
    transform: 'scaleX(-1)',
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

type PageItem = {
  isLoaded: boolean;
  didError: boolean;
  chapter: string;
  page: number; // 1-indexed
  src: string;
};

const Reader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [toolbarState, setToolbarState] = useState({
    isButtonHover: false,
    isHovering: false,
    isOpen: false,
  });

  const [scrollY, setScrollYABSOLUTE] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setScrollY = useCallback(
    throttle(
      (y: number) => {
        setScrollYABSOLUTE(y);
      },
      100,
      { leading: false, trailing: true }
    ),
    [setScrollYABSOLUTE]
  );

  const imageContainerRef = useRef<HTMLDivElement>(null);

  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isInIntermediary, setIsInIntermediary] = useState<0 | 1 | -1>(-1); // -1: not in intermediary state, 0: going to previous chapter, 1: going to next chapter
  // Intermediary state is for when the user is between
  // two chapters.

  const [pageState, setPageState] = useState<{
    [chapterId: string]: Array<PageItem>;
  }>({});

  const queryParameters = useQuery();
  const Navigate = useNavigate();

  const {
    source: sourceId = 'MangaDex',
    id: mangaId = '',
    title: mangaTitle = mangaId,
    chapter: chapterId = '',
    page: pageNumber = '1',
  } = Object.fromEntries(queryParameters as unknown as URLSearchParams);

  const [readerSettings, setReaderSettings] = useState<
    DefaultSettings['reader']
  >({
    ...window.electron.settings.get('reader'),
    ...window.electron.reader.getMangaSettings(sourceId, mangaId),
  } as DefaultSettings['reader']); // also no clue what i could do here /shrug

  const webtoonKey = ['continuous-vertical', 'webtoon'].includes(
    readerSettings.readingMode
  )
    ? 'Webtoon'
    : 'Paged';

  let isVertical = false;
  let isScrollBased = false;
  {
    const verticalKeys: Array<ViewStyles> = [
      'vertical',
      'continuous-vertical',
      'webtoon',
    ];

    const scrollBasedKeys: Array<ViewStyles> = [
      'continuous-vertical',
      'webtoon',
    ];

    [isScrollBased, isVertical] = [
      scrollBasedKeys.includes(
        readerSettings.readingMode as unknown as ViewStyles
      ),
      verticalKeys.includes(
        readerSettings.readingMode as unknown as ViewStyles
      ),
    ];
  }

  const [contextMenuData, setContextMenu] = useState<
    | {
        x: number;
        y: number;
        pageSrc: string;
      }
    | undefined
  >();

  const onContextMenu = (e: React.MouseEvent, page: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      pageSrc: page,
    });
  };

  const readerNavLayout = `navLayout${webtoonKey}`;
  const associatedTappingStyle =
    readerNavLayout === 'default'
      ? viewStyleDefaults[
          readerSettings.readingMode as keyof typeof viewStyleDefaults
        ]
      : readerSettings[readerNavLayout as keyof typeof readerSettings];

  const tappingLayoutMemo = useMemo<PageEffect>(
    () => ({
      ...TapStylesPageEffects[
        associatedTappingStyle as Exclude<TapStyles, 'default'> // associatedTappingStyle should never be 'default', for some reason TS is complaining.
      ],
    }),
    [associatedTappingStyle]
  );

  const tappingLayout = { ...tappingLayoutMemo };

  // If invertTapping is true, then iterate through tappingLayout and change -1 to 1 and vice versa.
  if (readerSettings[`invertTapping${webtoonKey}`]) {
    Object.keys(tappingLayout).forEach((key) => {
      if (tappingLayout[key as TapStylesPageEffectsValueKeys]) {
        tappingLayout[key as TapStylesPageEffectsValueKeys]! *= -1;
      }
    });
  }

  const modalIsOpen = settingsModalOpen || chapterModalOpen;
  const isRightToLeft = readerSettings.readingMode === 'right-to-left';
  const isPageCropped = readerSettings.cropBordersPaged;
  const [isDoublePage, setDoublePage] = useState(false);

  const setReaderSetting = (key: keyof typeof readerSettings, value: any) => {
    window.electron.reader.setMangaSettings(sourceId, mangaId, {
      ...readerSettings,
      [key]: value,
    });

    return setReaderSettings({
      ...readerSettings,
      [key]: value,
    });
  };

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

  const currentDatabaseChapter = useMemo(() => {
    if (readerData.currentchapter)
      return window.electron.read.get(sourceId)?.[
        readerData.currentchapter.ChapterID
      ];
    return undefined;
  }, [readerData.currentchapter, sourceId]);

  const timeStartedChapter = useMemo(() => {
    return dayjs();
    // This should be self explanatory; but if it isn't:
    // React warns over "exhaustive-deps"; but the intention of this is to be recalculated every time the chapter changes.
    // It warns because readerData.currentchapter is not used in this code block.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readerData.currentchapter]);

  useEffect(() => {
    // Interval to track time elapsed.
    const interval = setInterval(() => {
      if (!readerData.currentchapter?.ChapterID) return;
      const chapterID = readerData.currentchapter.ChapterID;
      const currentChapter = window.electron.read.get(sourceId)?.[chapterID];
      if (currentChapter) {
        const timeElapsed = dayjs.duration(dayjs().diff(timeStartedChapter));
        const timeElapsedMilliseconds = timeElapsed.asMilliseconds();

        window.electron.read.set(
          sourceId,
          chapterId,
          readerData.currentchapter.PageCount,
          readerData.page ?? 0,
          new Date(),
          timeElapsedMilliseconds,
          currentChapter.isBookmarked,
          mangaId
        );
      }
    }, 5000 * (1 + Math.random()));

    return () => clearInterval(interval);
  }, [
    chapterId,
    mangaId,
    readerData.currentchapter,
    readerData.page,
    sourceId,
    timeStartedChapter,
  ]);

  const currentPageState =
    pageState[readerData.currentchapter?.ChapterID ?? chapterId];

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
        .catch(window.electron.log.info);
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
  const getAbsoluteChapter = useCallback(
    (num: number) => readerData.chapters?.[num],
    [readerData.chapters]
  );

  const getChapterNumber = useCallback(
    (id: string) => readerData.chapters?.findIndex((x) => x.ChapterID === id),
    [readerData.chapters]
  );

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
    if (!mangaId) return;
    const currentManga = window.electron.library.getCachedManga(
      sourceId,
      mangaId
    );

    if (currentManga) currentManga.LastRead = new Date();
    const updateManga = () =>
      currentManga &&
      window.electron.library.addMangaToCache(sourceId, currentManga);

    updateManga();
    return () => updateManga(); // Update the last read on mount and on unmount.
  }, [mangaId, sourceId]);

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
            [currentChapter.ChapterID]: Pages.map((page, number) => ({
              isLoaded: false,
              didError: false,
              chapter: currentChapter.ChapterID,
              page: number + 1, // add 1 because the page number starts at 1 and js is zero-indexed
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
      .catch(window.electron.log.info);
  }, [readerData, chapterId, selectedSource, pageState]);
  const doToolbarShow =
    (toolbarState.isOpen || toolbarState.isHovering) && !modalIsOpen
      ? styles.visible
      : styles.invisibleToolbar;

  const doButtonShow =
    (toolbarState.isButtonHover || toolbarState.isHovering) && !modalIsOpen
      ? styles.visible
      : styles.invisibleButton;

  const doCursorShow =
    toolbarState.isHovering ||
    toolbarState.isButtonHover ||
    toolbarState.isOpen ||
    modalIsOpen
      ? false
      : styles.noCursor;

  const currentPage = readerData.page ?? 1;
  const iconKey = isVertical ? styles.iconVertical : styles.iconHorizontal;

  const currentPageObject = currentPageState?.[currentPage - 1];
  const isCurrentPageLoaded = currentPageObject?.isLoaded ?? false;

  const nextPageObject = currentPageState?.[currentPage];
  const isNextPageLoaded = nextPageObject?.isLoaded ?? false;

  const chapterIsBookmarked = useMemo(() => {
    if (!readerData.currentchapter) return false;
    const currentChapter = window.electron.read.get(selectedSource.getName())?.[
      readerData.currentchapter.ChapterID
    ];
    return currentChapter?.isBookmarked ?? false;
  }, [readerData.currentchapter, selectedSource]);

  const setRead = useCallback(
    (
      currentChapterId = chapterId,
      chapterPageCount: number,
      chapterPageNumber: number,
      isBookmarked = chapterIsBookmarked
    ) => {
      const currentChapterData =
        window.electron.read.get(sourceId)?.[currentChapterId];

      return window.electron.read.set(
        selectedSource.getName(),
        currentChapterId,
        chapterPageCount,
        (currentDatabaseChapter?.currentPage ?? -1) >= chapterPageCount
          ? chapterPageCount
          : chapterPageNumber,
        new Date(),
        currentChapterData?.timeElapsed ?? 0,
        isBookmarked,
        mangaId
      );
    },
    [
      chapterId,
      chapterIsBookmarked,
      currentDatabaseChapter,
      mangaId,
      selectedSource,
      sourceId,
    ]
  );

  const changePage = useCallback(
    (
      newPageNumber: number,
      doScrollBasedChange?: boolean,
      scrollType?: 'auto' | 'smooth'
    ) => {
      if (!readerData.currentchapter) return;
      if (doScrollBasedChange || newPageNumber !== currentPage) {
        setRead(
          readerData.currentchapter.ChapterID,
          readerData.currentchapter.PageCount,
          newPageNumber,
          chapterIsBookmarked
        );

        if (isScrollBased && doScrollBasedChange) {
          // Get respective page object from chapter and id.
          const pageObject = document.getElementById(
            `chapter-:${readerData.currentchapter.ChapterID}:-page-:${newPageNumber}:`
          );

          if (pageObject) {
            // Scroll to the page object.
            pageObject.scrollIntoView({
              behavior: scrollType || 'smooth',
              block: 'center',
              inline: 'center',
            });

            return; // We return here because the reader automatically detects the page change due to the automatic scrolling.
          }
        }

        return setReaderData({
          ...readerData,
          page: newPageNumber,
        });
      }
    },
    [readerData, currentPage, isScrollBased, chapterIsBookmarked, setRead]
  );

  const handleClick = useCallback(
    (goTo: -1 | 1) => {
      if (!currentPageState) return;
      if (!readerData.currentchapter) return;
      if (isScrollBased && !imageContainerRef.current) return;

      const isAtStart = currentPage === 1;
      const isAtEnd =
        // Add 1 to account for the double page clamping the page to 1 before the end on even pages.
        currentPage + (isDoublePage ? 1 : 0) >= currentPageState.length;

      // Left is -1 naturally; so it decreases the page count. However, in RTL it should be changed to 1 to increment.
      const readOrderGoTo = isRightToLeft ? -goTo : goTo;
      const normalizedGoTo = readOrderGoTo === -1 ? 0 : 1;

      if (isInIntermediary === -1 && (isAtStart || isAtEnd)) {
        if (
          (isAtStart && normalizedGoTo === 0) ||
          (isAtEnd && normalizedGoTo === 1)
        ) {
          if (isScrollBased)
            imageContainerRef.current!.scrollTo({
              // If it's scroll-based then that means that imageContainerRef will be present; non-null operator is required.
              top: isAtStart ? 0 : imageContainerRef.current!.scrollHeight,
              behavior: 'smooth',
            });
          return setIsInIntermediary(normalizedGoTo);
        }
      }

      if (isInIntermediary !== -1) {
        if (normalizedGoTo === isInIntermediary) {
          // If the user is in double-page mode, forcefully set the reader database's page to the final page.
          // This is because double-page mode relies on the first page and not the last page, therefore, if a
          // page ends evenly, the reader will think that they're on the second-to-last page rather than the
          // acutal last page.

          if (isDoublePage)
            setRead(
              readerData.currentchapter.ChapterID,
              readerData.currentchapter.PageCount,
              readerData.currentchapter.PageCount
            );

          return changeChapter(normalizedGoTo);
        }

        if (isScrollBased)
          document
            .getElementById(
              `chapter-:${readerData.currentchapter.ChapterID}:-page-:${readerData.page}:`
            )
            ?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'center',
            });
        return setIsInIntermediary(-1);
      }

      const pageToChangeTo = isDoublePage
        ? clamp(currentPage + readOrderGoTo * 2, 1, currentPageState.length)
        : currentPage + readOrderGoTo;

      changePage(pageToChangeTo, true, 'smooth');
    },
    [
      currentPageState,
      readerData.currentchapter,
      readerData.page,
      currentPage,
      isDoublePage,
      isRightToLeft,
      isInIntermediary,
      changePage,
      isScrollBased,
      setRead,
      changeChapter,
    ]
  );

  const getPageFromPoint = useCallback(
    (
      pointToCheckX = window.innerWidth / 2,
      pointToCheckY = window.innerHeight / 2
    ) => {
      const Elements = document.elementsFromPoint(pointToCheckX, pointToCheckY);

      const getDataFromID = (elementID = '') =>
        elementID?.match(/chapter-:(.+?):-page-:(\d+?):/);

      const foundElement = Elements.filter((element) => {
        // Get chapterID and Page from the element.
        const elementID = element.id;
        const Match = getDataFromID(elementID);
        if (!Match) return false;

        const [chapterID, page] = Match.slice(1); // Remove the first element of the array since it is the whole match.
        if (chapterID && page) {
          return true;
        }

        return false;
      })?.map((element) => {
        // Get chapterID and Page from the element.
        const elementID = element.id;
        const Match = elementID?.match(/chapter-:(.+?):-page-:(\d+?):/);
        if (!Match) return undefined;

        const [chapterID, page] = Match.slice(1); // Remove the first element of the array since it is the whole match.
        if (chapterID && page) {
          return { chapterID, page };
        }

        return undefined;
      })[0];

      return foundElement;
    },
    []
  );

  useEffect(() => {
    // Keyboard controls.
    const keyControls: { [key: string]: keyof typeof tappingLayout } = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'top',
      ArrowDown: 'bottom',
      PageUp: 'top',
      PageDown: 'bottom',
      Home: 'top',
      End: 'bottom',
    };

    const nextKeys = [' ', 'Enter']; // These are keys that will send you to the next page regardless of your tapping layout.
    const keyHandler = (e: KeyboardEvent) => {
      if (e.repeat) return; // Ignore repeated key presses.
      if (e.key in keyControls || nextKeys.includes(e.key)) {
        if (tappingLayout[keyControls[e.key]] !== null) {
          const tapDirection =
            tappingLayout[keyControls[e.key]] ?? (isRightToLeft ? -1 : 1);
          handleClick(tapDirection);
        }
      }
    };

    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
    // tappingLayout depends on tappingLayoutMemo - so if tappingLayoutMemo changes, tappingLayout will change as well.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleClick, tappingLayoutMemo]);

  useEffect(() => {
    if (isLoading) return;
    if (!isScrollBased) return;
    if (!readerData.currentchapter?.ChapterID) return;

    const { page: pageAtCenter } =
      getPageFromPoint(undefined, window.innerHeight / 1.25) ?? {}; // Check slightly below the center of the screen.
    if (!pageAtCenter || Number(pageAtCenter) !== readerData.page) {
      setTimeout(() => {
        // give time to the page to load.
        // shouldn't have to do this but oh wel i guess?
        changePage(Number(readerData.page), true, 'smooth');
      }, 100);
    }

    // Disabling the following eslint because this is only supposed to run when the currentChapter changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readerData.currentchapter, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    if (!isScrollBased) return;
    if (!readerData.currentchapter?.ChapterID) return;

    // Get page(s) at the center of the screen.
    const { chapterID, page: foundPage } = getPageFromPoint() ?? {};
    if (chapterID && foundPage && readerData.page !== Number(foundPage)) {
      changePage(Number(foundPage), false);
      setReaderData((previousState) => {
        return {
          ...previousState,
          currentchapter:
            previousState.chapters?.find((x) => x.ChapterID === chapterID) ??
            previousState.currentchapter,
        };
      });
    }
  }, [
    scrollY,
    isLoading,
    changePage,
    isScrollBased,
    readerData.page,
    getPageFromPoint,
    readerData.currentchapter,
  ]);

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
        key={`readerButton${x.toUpperCase()}`}
      />
    ));

  const flipImage =
    readerSettings.readingMode === 'webtoon' && styles.flippedImage;

  // If it's scroll based and there are pages to display, then we can show the pages.
  // So, when loading is true, we can put loading indicators on the top and bottom.
  // Otherwise, show nothing but the loading indicator.

  return isLoading ? (
    <LoadingModal className={css(styles.loadingModal)} />
  ) : (
    <div
      onMouseMove={() => {
        if (toolbarState.isHovering || toolbarState.isOpen) return;
        setToolbarState({ ...toolbarState, isOpen: true });
      }}
      onContextMenu={(e) => {
        onContextMenu(e, currentPageObject.src);
      }}
      className={css(styles.container, doCursorShow)}
    >
      <SettingsModal
        open={settingsModalOpen}
        onChange={(newSettings) => {
          window.electron.reader.setMangaSettings(sourceId, mangaId, {
            ...readerSettings,
            ...newSettings,
          });
          setReaderSettings((oldSettings) => ({
            ...oldSettings,
            ...newSettings,
          }));
        }}
        settings={readerSettings}
        isWebtoon={isScrollBased}
        onClose={() => setSettingsModalOpen(false)}
      />
      <ChapterModal
        chapters={readerData.chapters!}
        current={readerData.currentchapter!.ChapterID}
        source={selectedSource.getName()}
        open={chapterModalOpen}
        manga={mangaId}
        onClose={() => setChapterModalOpen(false)}
        onChange={(newChapterId) => {
          setIsLoading(true);
          if (isScrollBased) setPageState({});
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
      <ReaderContext
        open={!!contextMenuData && !modalIsOpen}
        onClose={() => setContextMenu(undefined)}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenuData
            ? { top: contextMenuData.y, left: contextMenuData.x }
            : undefined
        }
        onItemClick={async (item) => {
          if (!currentPageObject?.src) return;
          switch (item) {
            case 'clipboard': {
              const blobifiedImage = await (
                await fetch(currentPageObject.src)
              ).blob();
              await navigator.clipboard.write([
                new ClipboardItem({
                  [blobifiedImage.type]: blobifiedImage,
                }),
              ]);

              break;
            }
            case 'save': {
              [currentPageObject, isDoublePage && nextPageObject]
                .filter((x) => !!x)
                .forEach((pageObject) => {
                  if (!pageObject) return;
                  window.electron.util.downloadImage(pageObject.src, {
                    filename: `${mangaId}-${
                      readerData.currentchapter!.ChapterID
                    }-${pageObject.page}`,
                    mangaid: mangaId,
                    manganame: mangaTitle,
                    chapternumber: readerData.currentchapter!.Chapter,
                    sourceid: sourceId,
                  });
                });
              break;
            }
            case 'prevchap': {
              changeChapter(0);
              break;
            }
            case 'nextchap': {
              changeChapter(1);
              break;
            }
            case 'prevpage': {
              if (currentPageObject.page === 1) return;
              changePage(currentPageObject.page - 1);
              break;
            }
            case 'nextpage': {
              if (currentPageObject.page === currentPageState.length) return;
              changePage(currentPageObject.page + 1);
              break;
            }

            default:
              break;
          }
          setContextMenu(undefined);
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
                  setDoublePage(!isDoublePage);
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
                  {isDoublePage ? (
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
                  setReaderSetting('cropBordersPaged', !isPageCropped)
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
              onClick={() => setSettingsModalOpen(true)}
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
          key="ImageContainer"
          className={css(
            styles.imageContainer,
            isScrollBased && styles.scrollBased,
            isLoading && styles.disableScroll
          )}
          id="image-container"
          onScrollCapture={() => {
            if (isScrollBased) {
              if (!isLoading) {
                setScrollY(
                  document.getElementById('image-container')!.scrollTop
                );
              }
            }
          }}
          ref={imageContainerRef} // We need this to be able to use HTML DOM to scroll.
        >
          {/* If they're in continuous vertical mode, then show all the images at once. */}
          {(() => {
            if (!isScrollBased) {
              if (isCurrentPageLoaded) {
                if (
                  !isDoublePage || // If it's not in double page, then we can just show the image.
                  (isDoublePage && !nextPageObject) || // If it's in double page, but there's no next page, then we can just show the first image.
                  (isDoublePage && nextPageObject && isNextPageLoaded) // If it's a double page, then we need to make sure the next page is loaded.
                ) {
                  const firstPage = (
                    <img
                      className={css(styles.mangaImage, flipImage)}
                      src={currentPageObject.src}
                      alt={`Page ${currentPage}`}
                    />
                  );

                  const secondPage =
                    nextPageObject && isDoublePage ? (
                      <img
                        className={css(styles.mangaImage, flipImage)}
                        src={nextPageObject.src}
                        alt={`Page ${currentPage + 1}`}
                      />
                    ) : null;

                  const orderToDisplay = [firstPage, secondPage];
                  return isRightToLeft
                    ? orderToDisplay.reverse()
                    : orderToDisplay;
                }
              }
              return (
                <div className={css(styles.loadingContainer)}>
                  <CircularProgress
                    className={css(styles.loading)}
                    color="secondary"
                    size={50}
                  />
                </div>
              );
            }
            return currentPageState.map((page, index) => {
              const previousChapterExists = getAbsoluteChapter(
                (getChapterNumber(page.chapter) || 0) + 1
              );

              const nextChapterExists = getAbsoluteChapter(
                (getChapterNumber(page.chapter) || 0) - 1
              );

              // The addition and subtraction might seem swapped,
              // but they're this way because readerData.chapters is
              // in reverse order.

              const { Volume: nextVolume, Chapter: nextChapter } =
                nextChapterExists || {};

              const { Volume: previousVolume, Chapter: previousChapter } =
                previousChapterExists || {};

              const { Volume: currentVolume, Chapter: currentChapter } =
                readerData.currentchapter || {};

              const generateChapterText = (
                volume?: number,
                chapter?: number
              ) => (
                <span
                  className={css(
                    styles.chapterHeader,
                    styles.continuousScrollHeader
                  )}
                >{`${
                  !Number.isNaN(Number(volume)) ? `Volume ${volume} ` : ``
                }Chapter ${
                  Number.isSafeInteger(chapter)
                    ? chapter
                    : "You shouldn't be seeing this. 👀"
                }`}</span>
              );

              const IntermediaryPreviousChapter = (
                <div
                  className={css(
                    styles.intermediary,
                    styles.continuousScrollIntermediary,
                    styles.continuousScrollPreviousChapterIntermediary
                  )}
                  key={`previous-${page.chapter}`}
                >
                  <span className={css(styles.chapterHeader)}>Previous:</span>
                  {generateChapterText(previousVolume, previousChapter)}

                  <span className={css(styles.chapterHeader)}>Current:</span>
                  {generateChapterText(currentVolume, currentChapter)}

                  <Button
                    className={css(styles.continuousScrollIntermediaryButton)}
                    onClick={() => {
                      changeChapter(0);
                    }}
                  >
                    Previous Chapter
                  </Button>
                </div>
              );

              const IntermediaryNextChapter = (
                <div
                  className={css(
                    styles.intermediary,
                    styles.continuousScrollIntermediary,
                    styles.continuousScrollNextChapterIntermediary
                  )}
                  key={`next-${page.chapter}`}
                >
                  <span className={css(styles.chapterHeader)}>Finished:</span>
                  {generateChapterText(currentVolume, currentChapter)}

                  <span className={css(styles.chapterHeader)}>Next:</span>
                  {generateChapterText(nextVolume, nextChapter)}

                  <Button
                    className={css(styles.continuousScrollIntermediaryButton)}
                    onClick={() => {
                      changeChapter(1);
                    }}
                  >
                    Next Chapter
                  </Button>
                </div>
              );

              const IntermediaryNoChapter = (text: string) => (
                <div
                  className={css(
                    styles.intermediary,
                    styles.continuousScrollIntermediary,
                    styles.continuousScrollNoChapterIntermediary
                  )}
                  key={`no-${text}`}
                >
                  <span className={css(styles.noChapterText)}>{text}</span>
                </div>
              );

              const pageIsAtStartOfChapter = page.page === 1;
              const pageIsAtEndOfChapter =
                (readerData.currentchapter?.PageCount ?? 1) === page.page;

              if (page.isLoaded) {
                return (
                  <>
                    {pageIsAtStartOfChapter &&
                    page.chapter === readerData.currentchapter?.ChapterID // If the page is at the start of the chapter...
                      ? previousChapterExists // If the previous chapter exists
                        ? IntermediaryPreviousChapter // Show the previous chapter intermediary.
                        : IntermediaryNoChapter('There is no previous chapter.') // Otherwise, display that there's no chapter.
                      : null}
                    <img
                      className={css(
                        styles.mangaImage,
                        styles.continuousScrollImage
                      )}
                      id={`chapter-:${page.chapter}:-page-:${page.page}:`}
                      src={page.src}
                      alt={`Page ${index + 1}`}
                      key={`${page.src}-normal-scroll`}
                    />
                    {pageIsAtEndOfChapter &&
                    page.chapter === readerData.currentchapter?.ChapterID // If the page is at the end of the chapter...
                      ? nextChapterExists // If the next chapter exists
                        ? IntermediaryNextChapter // Show the next chapter intermediary.
                        : IntermediaryNoChapter('There is no next chapter.') // Otherwise, display that there's no chapter.
                      : null}
                  </>
                );
              }

              return (
                <div
                  className={css(styles.continuousScrollLoadingContainer)}
                  key={`${page.src}-continuousScroll`}
                >
                  <CircularProgress
                    className={css(styles.loading)}
                    color="secondary"
                    size={50}
                  />
                </div>
              );
            });
          })()}
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
                    !Number.isNaN(roundedNextVolume)
                      ? `Volume ${nextVolume} `
                      : ``
                  }Chapter ${nextChapter}`}</span>
                ); // Using roundedNextVolume because that resolves to NaN if there is no next volume.

                const currentChapterText = (
                  <span>{`${
                    !Number.isNaN(roundedCurrentVolume)
                      ? `Volume ${currentVolume} `
                      : ``
                  }Chapter ${currentChapter}`}</span>
                ); // See above.

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
        disabled={!readerSettings.lightbarEnabled || !!contextMenuData}
        outOf={currentPageState.length}
        Page={currentPage}
        isRightToLeft={isRightToLeft}
        doublePageDisplay={isDoublePage}
        isVertical={readerSettings.lightbarVertical}
        isRight={readerSettings.lightbarRight}
        onItemClick={(newPage: number) => {
          if (isInIntermediary !== -1) setIsInIntermediary(-1);
          changePage(newPage, true);
        }}
      />
    </div>
  );
};

export default Reader;
