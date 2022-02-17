// Settings for the application itself.
// Others typically use Enmap, but this time we'll
// be using Electron-Store; since it's very light-weight
// and enmap is meant to be used with a lot of data.
import SettingsDatabase from 'electron-store';

const defaultSettings = {
  // The default settings for the application
  general: {
    locale: 'en',
    dateFormat: 'MM/DD/YYYY',
    autoUpdate: true,
  },
  library: {
    refreshCovers: false,
    ignoreArticles: false,
    searchSuggestions: false,
    updateOngoingManga: false,
  },
  appearance: {
    theme: 'dark',
  },
  reader: {
    skipChaptersOfDifferentGroup: false,
    skipChaptersMarkedRead: false,
    readingMode: 'right-to-left',
    navLayoutPaged: 'right-to-left',
    invertTappingPaged: false,
    scaleTypePaged: 'fit-screen',
    cropBordersPaged: false,
    pageLayoutPaged: 'single-page',
    // zoomStartPosition: 'automatic'
    navLayoutWebtoon: 'top-to-bottom',
    invertTappingWebtoon: false,
    cropBordersWebtoon: false,
    sidePaddingWebtoon: 'none',
    pageLayoutWebtoon: 'single-page',
    invertDoublePagesWebtoon: false,
    allowZoomOutWebtoon: false,
    // If the next chapter has the same chapter number but a different group, skip it.
    // This usually just means that the chapter was translated by two different translators.
  },
  downloads: {
    location: '/downloads',
    saveChaptersAsCBZ: false,
    removeWhenMarkedRead: false,
    removeAfterRead: 'never', // 0 = never; 1 = last read chapter; 2 = second to last read chapter; 3 = third to last read chapter, so on...
    downloadNewChapters: false,
    deleteRemovedChapters: false, // Delete downloaded chapters if the source has removed the chapter from the website
  },
  browse: {
    checkForUpdates: true,
    onlySearchPinned: false,
    showNSFWSources: true,
  },
  tracking: {
    syncChaptersAfterReading: true,
    trackWhenAddingToLibrary: false,
  },
  backup: {},
  security: {},
  advanced: {
    sendCrashReports: true,
  },
};

const Settings = new SettingsDatabase({ name: 'settings_app' });
if (!Settings.get('app')) Settings.set('app', defaultSettings);

export default class {
  // Get the current settings.
  public getSettings(key = 'app') {
    return Settings.get(key);
  }

  // Set (and overwrite) the current settings.
  public setSettings(key = 'app', settings: typeof defaultSettings): void {
    Settings.set(key, settings);
  }

  public flushSettings(): void {
    Settings.clear();
  }
}
