import { functions } from 'electron-log';
import { render } from 'react-dom';
import { Presence } from 'discord-rpc';
import { IpcRendererEvent } from 'electron';
import { LibrarySources, FullManga, LibraryManga } from '../main/util/manga';
import { ReadDatabaseValue } from '../main/util/read';
import type { DefaultSettings } from '../main/util/settings';
import App from './App';

import '../shared/intl';

type SetSignature = (
  sourceName: string,
  chapterId: string,
  pageCount: number,
  currentPage: number,
  lastRead: Date | undefined,
  timeElapsed: number,
  isBookmarked: boolean,
  mangaId: string
) => void;

export type SourceMetadata = {
  name: string; // The name of the source.
  version: string; // The version of the source.
  icon: string; // The icon for the source.
  nsfw: boolean; // Whether the source can distribute NSFW content.
  zip: string; // The name of the zip file in the dist/zip branch.
  lang: string; // The language of the source.
  path?: string; // The path to the source.
};

export type ThemeType = {
  location: string;
  metadata: {
    name: string;
  };
  colors: Record<'light' | 'dark', Record<string, string>>;
};

declare global {
  interface Window {
    electron: {
      log: typeof functions;
      rpc: {
        updateRPC: (presence: Presence) => void;
        toggleRPC: (rpcEnabled: boolean) => void;
      };
      download: {
        getDownloadsPath: () => string;
        downloadSource: (sourceZip: string) => Promise<boolean>;
        removeSource: (sourceData: SourceMetadata) => Promise<boolean>;
      };
      util: {
        showOpenDialog: (
          options: Electron.OpenDialogOptions
        ) => Promise<string[] | undefined>;
        downloadImage: (
          url: string,
          payload: {
            filename: string;
            mangaid: string;
            manganame: string;
            chapternumber: number;
            sourceid: string;
          }
        ) => Promise<void>;
        getSourceFiles: () => string[];
        getSourceMetadata: (sourceId?: string) => SourceMetadata[];
        getSourceCatalogue: () => SourceMetadata[];
        getUserDataPath: () => string;
        getDownloadsPath: () => string;
        getSourceDirectory: () => string;
        openInBrowser: (url: string) => void;
        get appVersion(): string;
        get themes(): Record<string, ThemeType>;
      };
      reader: {
        getMangaSettings: (
          sourceName: string,
          mangaID: string
        ) => Partial<DefaultSettings['reader']>;
        setMangaSettings: (
          sourceName: string,
          mangaID: string,
          settings: Partial<DefaultSettings['reader']>
        ) => void;
        flush: () => void;
      };
      library: {
        cycle: {
          getUpdateQueue: () => Array<LibraryManga | FullManga>[];
          addToUpdateQueue: (
            ...mangaObjects: (
              | LibraryManga
              | FullManga
              | { MangaID: string; SourceID: string }
            )[]
          ) => void;
          updateSource: (sourceID: string) => boolean;
          forceUpdateCycle: () => void;
          isUpdating: () => boolean;
          flushUpdateQueue: () => void;
          getUpdatingSources: () => string[];
          get processedTotal(): number;
          get isBusy(): boolean;
        };
        getSources: () => LibrarySources;
        flush: () => void;
        addMangaToLibrary: (sourceName: string, mangaId: string) => void;
        removeMangaFromLibrary: (sourceName: string, mangaId: string) => void;
        getLibraryMangas: (sourceName: string) => string[];
        addMangasToCache: (...fullManga: (FullManga | LibraryManga)[]) => void;
        removeMangaFromCache: (
          sourceName: string,
          ...mangaIds: string[]
        ) => void;
        getCachedManga: (
          sourceName: string,
          mangaId: string
        ) => FullManga | LibraryManga | undefined;
        getCachedMangas: (sourceName: string) => FullManga[];
        getAllCachedMangas: () => FullManga[];
      };
      misc: {
        flush: () => void;
      };
      read: {
        get: (sourceName: string) => ReadDatabaseValue;
        set: SetSignature;
        setSync: SetSignature;
        deleteEntry: (sourceName: string, chapterId: string) => void;
        deleteSource: (sourceName: string) => void;
        flush: () => void;
      };
      theme: {
        get: (themeName: string) => Record<string, string | number>;
        getAll: () => Record<string, string>;
      };
      cache: {
        get: (key: string) => any;
        set: (key: string, value: any) => void;
        has: (key: string) => boolean;
        delete: (...keys: string[]) => void;
        flush: () => void;
      };
      auth: {
        generateAuthenticationWindow: (
          windowData: { [key: string]: any },
          targetLocation: string
        ) => Promise<{ access_token: string; expires_in: number }>;
        generatePKCE: () => {
          code_challenge: string;
          code_verifier: string;
        };
        getAuthentication: (specificLogin: string) => string;
        checkAuthenticated: (specificLogin?: string) => boolean;
        setAuthenticated: (
          specificLogin: string,
          access_token: string,
          expires_in: number
        ) => boolean;
        deleteAuthenticated: (specificLogin?: string) => boolean;
      };
      ipcRenderer: {
        minimize: () => void;
        maximize: () => void;
        exit: () => void;
        on: (
          channel: string,
          func: (event: IpcRendererEvent, ...args: any[]) => void
        ) => void;
        off: (
          channel: string,
          func: (event: IpcRendererEvent, ...args: any[]) => void
        ) => void;
        once: (
          channel: string,
          func: (event: IpcRendererEvent, ...args: any[]) => void
        ) => void;
      };
      store: {
        get: (key: string) => any;
        set: (key: string, value: any) => void;
        flush: () => void;
      };
      settings: {
        get: (key: keyof DefaultSettings) => DefaultSettings[typeof key];
        getAll: () => DefaultSettings;
        set: (key: keyof DefaultSettings, value: Record<string, any>) => void;
        overwrite: (settings: Record<keyof DefaultSettings, any>) => void;
        flush: () => void;
      };
    };
  }
}

// Setup authorization defaults
if (!window.electron.store.get('authorization'))
  window.electron.store.set('authorization', {
    myanimelist: {
      access_token: null,
      expires: null,
    },
    anilist: {
      access_token: null,
      expires: null,
    },
  });

render(<App />, document.body);
