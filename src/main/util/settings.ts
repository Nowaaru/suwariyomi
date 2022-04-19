/* eslint-disable prefer-object-spread */
// Settings for the application itself.
// Others typically use Enmap, but this time we'll
// be using Electron-Store; since it's very light-weight
// and enmap is meant to be used with a lot of data.
import { app } from 'electron';
import SettingsDatabase, { Schema } from 'electron-store';

export const defaultSettings = {
  // The default settings for the application
  general: {
    locale: 'en',
    dateFormat: 'MM/DD/YYYY',
    autoUpdate: true,
    discordRPCIntegration: true,
  },
  library: {
    displayUserName: true,
    updateOnKeyPress: true,
    refreshCovers: false,
    ignoreArticles: false,
    searchSuggestions: false,
    updateOngoingManga: false,
  },
  appearance: {
    theme: 'dark',
    themeStyleDark: 'default',
    themeStyleLight: 'default',
  },
  reader: {
    lightbarVertical: false,
    lightbarRight: false,
    lightbarEnabled: true,
    skipChaptersOfDifferentGroup: false,
    skipChaptersMarkedRead: false,
    readingMode: 'right-to-left',
    navLayoutPaged: 'left-and-right',
    invertTappingPaged: false,
    scaleType: 'comfortable',
    cropBordersPaged: false,
    pageLayoutPaged: 'single-page',
    zoomStartPosition: 'automatic',
    navLayoutWebtoon: 'top-and-bottom',
    invertTappingWebtoon: false,
    sidePaddingWebtoon: 'none',
    pageLayoutWebtoon: 'single-page',
    invertDoublePagesWebtoon: false,
    allowZoomOutWebtoon: false,
    // If the next chapter has the same chapter number but a different group, skip it.
    // This usually just means that the chapter was translated by two different translators.

    useCustomColorFilter: false,
    filterR: 0,
    filterG: 0,
    filterB: 0,
    filterA: 0,
    blendMode: 'default',
  },
  downloads: {
    location: app.getPath('downloads'),
    saveChaptersAsCBZ: false,
    removeWhenMarkedRead: false,
    removeAfterRead: false,
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

export type DefaultSettings = typeof defaultSettings;

export const settingsSchema: Schema<typeof defaultSettings> = {
  general: {
    type: 'object',
    properties: {
      locale: {
        type: 'string',
        default: 'en',
      },
      dateFormat: {
        type: 'string',
        enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD'],
      },
      autoUpdate: {
        type: 'boolean',
        default: true,
      },
      discordRPCIntegration: {
        type: 'boolean',
        default: true,
      },
    },
  },
  library: {
    type: 'object',
    properties: {
      displayUserName: {
        type: 'boolean',
        default: true,
      },
      updateOnKeyPress: {
        type: 'boolean',
        default: true,
      },
      refreshCovers: {
        type: 'boolean',
        default: false,
      },
      ignoreArticles: {
        type: 'boolean',
        default: false,
      },
      searchSuggestions: {
        type: 'boolean',
        default: false,
      },
      updateOngoingManga: {
        type: 'boolean',
        default: false,
      },
    },
  },
  appearance: {
    type: 'object',
    properties: {
      theme: {
        type: 'string',
        enum: ['light', 'dark'],
      },
      themeStyleLight: {
        type: 'string',
        default: 'default',
      },
      themeStyleDark: {
        type: 'string',
        default: 'default',
      },
    },
  },
  reader: {
    type: 'object',
    properties: {
      lightbarVertical: {
        type: 'boolean',
        default: false,
      },
      lightbarRight: {
        type: 'boolean',
        default: false,
      },
      lightbarEnabled: {
        type: 'boolean',
        default: true,
      },
      skipChaptersOfDifferentGroup: {
        type: 'boolean',
        default: false,
      },
      skipChaptersMarkedRead: {
        type: 'boolean',
        default: false,
      },
      readingMode: {
        type: 'string',
        enum: [
          'right-to-left',
          'left-to-right',
          'vertical',
          'webtoon',
          'continuous-vertical',
        ],
      },
      navLayoutPaged: {
        type: 'string',
        enum: [
          'top-and-bottom',
          'left-and-right',
          'kindle',
          'l-shaped',
          'edge',
          'none',
        ],
      },
      invertTappingPaged: {
        type: 'boolean',
        default: false,
      },
      scaleType: {
        type: 'string',
        enum: ['comfortable', 'fit-width', 'fit-height', 'fit-content'],
      },
      cropBordersPaged: {
        type: 'boolean',
        default: false,
      },
      pageLayoutPaged: {
        type: 'string',
        enum: ['single-page', 'double-page'],
      },
      zoomStartPosition: {
        type: 'string',
        enum: ['automatic'],
      },
      navLayoutWebtoon: {
        type: 'string',
        enum: [
          'top-and-bottom',
          'left-and-right',
          'kindle',
          'l-shaped',
          'edge',
          'none',
        ],
      },
      invertTappingWebtoon: {
        type: 'boolean',
        default: false,
      },
      sidePaddingWebtoon: {
        type: 'string',
        enum: ['none', '25%', '50%', '75%'],
      },
      pageLayoutWebtoon: {
        type: 'string',
        enum: ['single-page', 'double-page'],
      },
      useCustomColorFilter: {
        type: 'boolean',
        default: false,
      },
      filterR: {
        type: 'number',
        default: 0,
        minimum: 0,
        maximum: 255,
      },
      filterG: {
        type: 'number',
        default: 0,
        minimum: 0,
        maximum: 255,
      },
      filterB: {
        type: 'number',
        default: 0,
        minimum: 0,
        maximum: 255,
      },
      filterA: {
        type: 'number',
        default: 0,
        minimum: 0,
        maximum: 255,
      },
      blendMode: {
        type: 'string',
        default: 'default',
        enum: ['default', 'multiply', 'screen', 'overlay', 'dodge', 'burn'],
      },
    },
  },
  downloads: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        default: '/downloads',
      },
      saveChaptersAsCBZ: {
        type: 'boolean',
        default: false,
      },
      removeWhenMarkedRead: {
        type: 'boolean',
        default: false,
      },
      removeAfterRead: {
        type: 'boolean',
        default: false,
      },
      downloadNewChapters: {
        type: 'boolean',
        default: false,
      },
      deleteRemovedChapters: {
        type: 'boolean',
        default: false,
      },
    },
  },
  browse: {
    type: 'object',
    properties: {
      checkForUpdates: {
        type: 'boolean',
        default: true,
      },
      onlySearchPinned: {
        type: 'boolean',
        default: false,
      },
      showNSFWSources: {
        type: 'boolean',
        default: true,
      },
    },
  },
  tracking: {
    type: 'object',
    properties: {
      syncChaptersAfterReading: {
        type: 'boolean',
        default: true,
      },
      trackWhenAddingToLibrary: {
        type: 'boolean',
        default: false,
      },
    },
  },
  backup: {
    type: 'object',
    properties: {},
  },
  security: {
    type: 'object',
    properties: {},
  },
  advanced: {
    type: 'object',
    properties: {
      sendCrashReports: {
        type: 'boolean',
        default: true,
      },
    },
  },
};

const Settings = new SettingsDatabase({
  name: 'settings_app',
  defaults: defaultSettings,
  schema: settingsSchema,
  clearInvalidConfig: true,
  encryptionKey: String(Date.now()),
  migrations: {
    '>=0.11.0': (settings) => {
      const newSettings = {
        ...settings.store,
        reader: Object.assign(
          {
            lightbarVertical: false,
            lightbarRight: false,
            lightbarEnabled: true,
            navLayoutPaged: 'left-and-right',
            navLayoutWebtoon: 'top-and-bottom',
          },
          settings.store.reader
        ),
      };

      return (settings.store = newSettings);
    },
    '>=0.12.0': (settings) => {
      const newSettings = {
        ...settings.store,
        reader: Object.assign(
          {
            zoomStartPosition: 'automatic',
          },
          settings.store.reader
        ),

        appearance: Object.assign(
          {
            themeStyleLight: 'default',
            themeStyleDark: 'default',
          },
          settings.store.appearance
        ),

        library: Object.assign(
          {
            displayUserName: true,
            updateOnKeyPress: true,
          },
          settings.store.library
        ),
      };

      return (settings.store = newSettings);
    },
    '>=0.13.0': (settings) => {
      const newSettings = {
        ...settings.store,
        library: Object.assign(
          {
            discordRPCIntegration: true,
          },
          settings.store.library
        ),
        reader: Object.assign(
          {
            scaleTypePaged: undefined,
            // @ts-ignore
            scaleType: settings.store.reader.scaleTypePaged ?? 'comfortable',
            useCustomColorFilter: false,
            filterR: 0,
            filterG: 0,
            filterB: 0,
            filterA: 0,
            blendMode: 'default',
          },
          settings.store.reader
        ),
        downloads: Object.assign(
          {
            location: defaultSettings.downloads.location,
          },
          settings.store.downloads
        ),
      };

      return (settings.store = newSettings);
    },
  },
});

export default class {
  // Get the setting bound to 'key'.
  public static getSetting(key: string): unknown {
    return Settings.get(key);
  }

  // Set the setting bound to 'key' to 'value'.
  public static setSetting(key: string, value: unknown): void {
    Settings.set(key, value);
  }

  // Get all settings.
  public static getAllSettings(): typeof defaultSettings {
    return { ...Settings.store };
  }

  // Set (and overwrite) the current settings.
  public static setSettings(settings: typeof defaultSettings): void {
    Settings.store = settings;
  }

  public static flushSettings(): void {
    Settings.clear();
  }
}
