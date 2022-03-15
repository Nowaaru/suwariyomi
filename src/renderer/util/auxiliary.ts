/* eslint-disable import/prefer-default-export */
import type { DefaultSettings } from '../../main/util/settings';

export type Schema = {
  type: 'select' | 'switch' | 'switch' | 'managed'; // where Managed means that the component is provided by the developer and not the app
  label?: string;
  description?: string;
  default?: any;
  options?: {
    label: string;
    value: any;
  }[];
  optionsFunc?: () => any[];
};

export const settingsSchemata: {
  [settingsContainer in keyof DefaultSettings]: {
    [containerKey in keyof DefaultSettings[settingsContainer]]: Schema;
  };
} = {
  general: {
    locale: {
      type: 'select',
      label: 'Language',
      description: 'The language to use for the application',
      default: 'en',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Spanish', value: 'es' },
        { label: 'Japanese', value: 'ja' },
      ],
    },
    dateFormat: {
      type: 'select',
      label: 'Date Format',
      description: 'The format to use for dates',
      default: 'MM/DD/YYYY',
      options: [
        { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
        { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
        { label: 'YYYY/MM/DD', value: 'YYYY/MM/DD' },
      ],
    },
    autoUpdate: {
      label: 'Auto Update',
      description: 'Automatically check for updates to the application',
      type: 'switch',
      default: true,
    },
  },
  library: {
    displayUserName: {
      type: 'switch',
      label: 'Display User Name',
      description:
        'Display your OS name when in the library. Otherwise, simply show "Welcome Back."',
      default: true,
    },
    updateOnKeyPress: {
      type: 'switch',
      label: 'Update on Key Press',
      description:
        'Update search results upon every key press. If this causes performance issues, disable this.',
      default: true,
    },
    refreshCovers: {
      type: 'switch',
      label: 'Refresh Covers',
      description: 'When updating, also fetch the latest covers of the manga.',
      default: false,
    },
    ignoreArticles: {
      type: 'switch',
      label: 'Ignore Articles When Searching',
      description:
        'When searching, ignore articles (the, an, a) when searching for manga.',
      default: false,
    },
    searchSuggestions: {
      type: 'switch',
      label: 'Show Search Suggestions',
      description:
        'Show search suggestions when searching for manga. You can press TAB to fill in the search field.',
      default: false,
    },
    updateOngoingManga: {
      type: 'switch',
      label: 'Only Update Ongoing Manga',
      description: 'Only update ongoing manga when updating the library.',
      default: false,
    },
  },
  appearance: {
    theme: {
      type: 'managed',
      label: 'Theme',
      description: 'The look and feel of the application.',
    },
    themeStyleLight: {
      type: 'managed',
      label: 'Theme Style - Light',
    },
    themeStyleDark: {
      type: 'managed',
      label: 'Theme Style - Dark',
    },
  },
  reader: {
    lightbarVertical: {
      type: 'switch',
      label: 'Vertical Lightbar',
      description: 'Display the lightbar vertically.',
      default: false,
    },
    lightbarEnabled: {
      type: 'switch',
      label: 'Enable Lightbar',
      description: 'Enable the lightbar.',
      default: true,
    },
    lightbarRight: {
      type: 'switch',
      label: 'Right Lightbar',
      description:
        'Display the lightbar on the right side if the vertical lightbar is enabled.',
      default: false,
    },
    skipChaptersOfDifferentGroup: {
      type: 'switch',
      label: 'Skip Chapters of Different Group',
      description:
        'If the next chapter has the same chapter number but a different group/language, skip it.',
      default: false,
    },
    skipChaptersMarkedRead: {
      type: 'switch',
      label: 'Skip Chapters Marked Read',
      description: 'If the next chapter is marked read, skip it.',
      default: false,
    },
    readingMode: {
      type: 'select',
      label: 'Reading Mode',
      description: 'The way the manga is read.',
      default: 'right-to-left',
      options: [
        { label: 'Right to Left', value: 'right-to-left' },
        { label: 'Left to Right', value: 'left-to-right' },
        { label: 'Vertical', value: 'vertical' },
        { label: 'Webtoon', value: 'webtoon' },
        { label: 'Continuous Vertical', value: 'continuous-vertical' },
      ],
    },
    navLayoutPaged: {
      type: 'select',
      label: 'Navigation Layout',
      description:
        'Where you need to tap to navigate to the next/previous page.',
      default: 'top-and-bottom',
      options: [
        { label: 'Left And Right', value: 'left-and-right' },
        { label: 'Top And Bottom', value: 'top-and-bottom' },
        { label: 'Kindle', value: 'kindle' },
        { label: 'L-Shaped', value: 'l-shaped' },
        { label: 'Edge', value: 'edge' },
        { label: 'None', value: 'none' },
      ],
    },
    invertTappingPaged: {
      type: 'switch',
      label: 'Invert Tapping',
      description:
        'Invert the way you tap to navigate to the next/previous page.',
      default: false,
    },
    scaleTypePaged: {
      type: 'select',
      label: 'Scale Type',
      description: 'The way the page is scaled.',
      default: 'fit-screen',
      options: [
        { label: 'Fit Screen', value: 'fit-screen' },
        { label: 'Fit Width', value: 'fit-width' },
        { label: 'Fit Height', value: 'fit-height' },
        { label: 'Fit Content', value: 'fit-content' },
      ],
    },
    cropBordersPaged: {
      type: 'switch',
      label: 'Crop Borders',
      description: 'Crop the borders of the pages.',
      default: false,
    },
    pageLayoutPaged: {
      type: 'select',
      label: 'Page Layout',
      description: 'The way the pages are laid out.',
      default: 'single-page',
      options: [
        { label: 'Single Page', value: 'single-page' },
        { label: 'Double Page', value: 'double-page' },
      ],
    },
    zoomStartPosition: {
      type: 'select',
      label: 'Zoom Start Position',
      description: 'The position to start the zoom at.',
      default: 'automatic',
      options: [{ label: 'Automatic', value: 'automatic' }],
    },
    navLayoutWebtoon: {
      type: 'select',
      label: 'Navigation Layout (Webtoon)',
      description:
        'Where you need to tap to navigate to the next/previous page.',
      default: 'left-and-right',
      options: [
        { label: 'Left and Right', value: 'left-and-right' },
        { label: 'Top and Bottom', value: 'top-and-bottom' },
        { label: 'Kindle', value: 'kindle' },
        { label: 'L-Shaped', value: 'l-shaped' },
        { label: 'Edge', value: 'edge' },
        { label: 'None', value: 'none' },
      ],
    },
    invertTappingWebtoon: {
      type: 'switch',
      label: 'Invert Tapping (Webtoon)',
      description:
        'Invert the way you tap to navigate to the next/previous page.',
      default: false,
    },
    pageLayoutWebtoon: {
      type: 'select',
      label: 'Page Layout (Webtoon)',
      description: 'The way the pages are laid out.',
      default: 'single-page',
      options: [
        { label: 'Single Page', value: 'single-page' },
        { label: 'Double Page', value: 'double-page' },
      ],
    },
    invertDoublePagesWebtoon: {
      type: 'switch',
      label: 'Invert Double Pages (Webtoon)',
      description:
        'Swap the left and right pages when double-page layout is used.',
      default: false,
    },
    allowZoomOutWebtoon: {
      type: 'switch',
      label: 'Allow Zoom Out (Webtoon)',
      description: 'Allow the user to zoom out past the minimum zoom level.',
      default: false,
    },
    sidePaddingWebtoon: {
      type: 'select',
      label: 'Side Padding (Webtoon)',
      description: 'The amount of padding on the sides of the pages.',
      default: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: '25%', value: '25%' },
        { label: '50%', value: '50%' },
        { label: '75%', value: '75%' },
      ],
    },
  },
  downloads: {
    deleteRemovedChapters: {
      type: 'switch',
      label: 'Delete Removed Chapters',
      description:
        'Automatically delete chapters that have been removed from the website.',
      default: false,
    },
    downloadNewChapters: {
      type: 'switch',
      label: 'Download New Chapters',
      description: 'Automatically download new chapters when a manga updates.',
      default: true,
    },
    location: {
      type: 'managed',
      label: 'Download Location',
      description:
        'Where to save the downloaded chapters. If your path has holes, the folder(s) will be created if it does not exist.',
      default: '%TEMP%',
    },
    removeAfterRead: {
      type: 'switch',
      label: 'Remove After Read',
      description:
        'Remove downloaded chapters after you have finished reading them.',
      default: false,
    },
    removeWhenMarkedRead: {
      type: 'switch',
      label: 'Remove When Marked Read',
      description: 'Remove downloaded chapters when you mark them as read.',
      default: false,
    },
    saveChaptersAsCBZ: {
      type: 'switch',
      label: 'Save Chapters As CBZ',
      description:
        'Save downloaded chapters as a CBZ file instead of a directory of images.',
      default: false,
    },
  },
  browse: {
    checkForUpdates: {
      type: 'switch',
      label: 'Check for Updates',
      description: 'Periodically check for updates to sources.',
      default: true,
    },
    onlySearchPinned: {
      type: 'switch',
      label: 'Only Search Pinned',
      description:
        'Only search for new chapters when the manga is pinned in the library.',
      default: false,
    },
    showNSFWSources: {
      type: 'switch',
      label: 'Show NSFW Sources',
      description: 'Show NSFW sources when browsing sources and manga.',
      default: false,
    },
  },
  tracking: {
    syncChaptersAfterReading: {
      type: 'switch',
      label: 'Sync Chapters After Reading',
      description:
        'Automatically sync the chapter list with the website after you have finished reading a chapter.',
      default: false,
    },
    trackWhenAddingToLibrary: {
      type: 'switch',
      label: 'Track When Adding To Library',
      description:
        'Automatically track new chapters when you add a manga to your library. This usually only works for silent-tracking sites like Komga.',
      default: false,
    },
  },
  advanced: {
    sendCrashReports: {
      type: 'switch',
      label: 'Send Crash Reports',
      description:
        'Send crash reports to the developer. This will help us fix bugs and improve the application.',
      default: true,
    },
  },
  backup: {},
  security: {},
};
