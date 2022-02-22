import { functions } from 'electron-log';
import { render } from 'react-dom';
import { IpcRendererEvent } from 'electron';
import { LibrarySources, FullManga } from '../main/util/manga';
import { ReadDatabaseValue } from '../main/util/read';
import App from './App';

/*
  TODO: When implementing preferences, have an "ignored groups" list.
        When a group is ignored, it will not be displayed in the view list.
        However, if a manga only has chapters translated by that group, it will still be displayed.
*/

/*
  TODO: Implement a preferences page.
*/

declare global {
  interface Window {
    electron: {
      log: typeof functions;
      util: {
        getSourceFiles: () => string[];
        getSourceDirectory: () => string;
        openInBrowser: (url: string) => void;
      };
      library: {
        getSources: () => LibrarySources;
        flush: () => void;
        addMangaToLibrary: (sourceName: string, mangaId: string) => void;
        removeMangaFromLibrary: (sourceName: string, mangaId: string) => void;
        getLibraryMangas: (sourceName: string) => string[];

        addMangaToCache: (sourceName: string, fullManga: FullManga) => void;
        removeMangaFromCache: (sourceName: string, mangaId: string) => void;
        getCachedManga: (
          sourceName: string,
          mangaId: string
        ) => FullManga | undefined;
        getCachedMangas: (sourceName: string) => FullManga[];
        getAllCachedMangas: () => FullManga[];
      };
      read: {
        get: (sourceName: string) => ReadDatabaseValue;
        set: (
          sourceName: string,
          chapterId: string,
          pageCount: number,
          currentPage: number,
          lastRead: number | -1,
          timeElapsed: number,
          isBookmarked: boolean,
          mangaId: string
        ) => void;
        deleteEntry: (sourceName: string, chapterId: string) => void;
        deleteSource: (sourceName: string) => void;
        flush: () => void;
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
        checkAuthenticated: (specificLogin?: string) => boolean;
      };
      ipcRenderer: {
        minimize: () => void;
        maximize: () => void;
        exit: () => void;
        on: (
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
        get: (key: string) => any;
        getAll: () => { [key: string]: any };
        set: (key: string, value: any) => void;
        overwrite: (settings: { [key: string]: any }) => void;
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
