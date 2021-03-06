/* eslint-disable import/prefer-default-export */
import ThemeSwitch from '../components/settings/themeswitch';
import FilterSlider from '../components/settings/filterslider';
import DownloadLocation from '../components/settings/downloadlocation';
import { mainTranslator } from '../../shared/intl';
import type { DefaultSettings } from '../../main/util/settings';

export type Schema = {
  type: 'select' | 'switch' | 'switch' | 'managed'; // where Managed means that the component is provided by the developer and not the app
  label?: string;
  component?: (...props: any[]) => JSX.Element;
  description?: string;
  default?: any;
  options?: Array<{
    label: string;
    value: any;
  }>;
  optionsFunc?: () => any[];
};

export const determineChapterStringType = ({
  volume,
  chapter,
  short,
}: {
  volume: number | undefined;
  chapter: number | undefined;
  short: boolean | undefined;
}): string => {
  const [isNaNC, isNaNV] = [chapter, volume].map(Number.isNaN);

  if (isNaNV && isNaNC) throw new Error('Cannot determine chapter string type');
  if (isNaNV && !isNaNC) return short ? 'chap' : 'chapter';
  if (isNaNC && !isNaNV) return short ? 'vol' : 'volume';

  return short ? 'volchapter' : 'volumechapter';
};

// settings_${translationKey}_${option.value}_label
// @ts-ignore - this keeps whining about readonly type even though readonly has never been mentioned once in this project
export const settingsSchemata: {
  [settingsContainer in keyof DefaultSettings]: {
    [containerKey in keyof DefaultSettings[settingsContainer]]: Schema;
  };
} = {
  general: {
    locale: {
      type: 'select',
      label: 'Language',
      description: 'The language to use for the application.',
      default: 'en',
      options: mainTranslator.languages.map((lang) => ({
        label: (
          mainTranslator.langdata.get(lang)?.$meta as unknown as Record<
            string,
            string
          >
        )?.name,
        value: lang,
      })),
    },
    dateFormat: {
      type: 'select',
      label: 'Date Format',
      description: 'The format to use for dates.',
      default: 'MM/DD/YYYY',
      options: [
        { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
        { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
        { label: 'YYYY/MM/DD', value: 'YYYY/MM/DD' },
      ],
    },
    discordRPCIntegration: {
      type: 'switch',
      label: 'Discord Rich Presence Integration',
      description:
        'Enable full Discord Rich Presence integration. Disabling this will remove the presence from your status.',
      default: true,
    },
    autoUpdate: {
      label: 'Auto Update',
      description: 'Automatically check for updates to the application',
      type: 'switch',
      default: true,
    },
    minimizeToTray: {
      label: 'Minimize to Tray',
      description:
        'Send the window to the system tray instead of minimizing it.',
      type: 'switch',
      default: false,
    },
    closeToTray: {
      label: 'Minimize on Close',
      description: 'Minimize the window instead of directly closing it.',
      type: 'switch',
      default: false,
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
        'Show search suggestions when searching for manga. You can press SHIFT + TAB to fill in the search field.',
      default: false,
    },
    updateFrequency: {
      type: 'select',
      label: 'Update Frequency',
      description: 'How often to update the library.',
      default: '86400',
      options: [
        { label: 'Manual', value: 'manual' },
        { label: 'Every 12 hours', value: '43200' },
        { label: 'Daily', value: '86400' },
        { label: 'Every 2 days', value: '172800' },
        { label: 'Every 3 days', value: '259200' },
        { label: 'Weekly', value: '604800' },
      ],
    },
    updateNotifications: {
      type: 'switch',
      label: 'Update Notifications',
      description:
        'Show notifications whenever the update cycle starts and ends, and when a new chapter is added.',
      default: true,
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
      component: ThemeSwitch,
      label: 'Theme',
      description: 'The look and feel of the application.',
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
    scaleType: {
      type: 'select',
      label: 'Scale Type',
      description: 'The size of the page when reading.',
      default: 'comfortable',
      options: [
        { label: 'Comfortable', value: 'comfortable' },
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
    useCustomColorFilter: {
      type: 'switch',
      label: 'Use Custom Color Filter',
      description:
        'Use a custom color filter when reading manga. Good for if the page has a hue shift.',
      default: false,
    },
    filterR: {
      type: 'managed',
      component: FilterSlider,
      description: 'The red hue of the page.',
      label: 'R',
    },
    filterG: {
      type: 'managed',
      component: FilterSlider,
      description: 'The green hue of the page.',
      label: 'G',
    },
    filterB: {
      type: 'managed',
      component: FilterSlider,
      description: 'The blue hue of the page.',
      label: 'B',
    },
    filterA: {
      type: 'managed',
      component: FilterSlider,
      description: 'The opacity of the page.',
      label: 'A',
    },
    blendMode: {
      type: 'select',
      label: 'Blend Mode',
      description: 'The blend mode to use when reading manga.',
      default: 'default',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Multiply', value: 'multiply' },
        { label: 'Screen', value: 'screen' },
        { label: 'Overlay', value: 'overlay' },
        { label: 'Dodge', value: 'dodge' },
        { label: 'Burn', value: 'burn' },
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
      component: DownloadLocation,
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
      label: 'Update Tracking After Reading',
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
    updateWhenMarkedAsRead: {
      type: 'switch',
      label: 'Update When Marked As Read',
      description: 'Update trackers when you mark a chapter as read/unread.',
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
} as const;
