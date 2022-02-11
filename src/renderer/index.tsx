import { render } from 'react-dom';
import { IpcRendererEvent } from 'electron';
import { LibrarySources, FullManga } from '../main/util/manga';
import { ReadDatabaseValue } from '../main/util/read';
import Topbar from './components/topbar';
import App from './App';

/*
  TODO: When implementing preferences, have an "ignored groups" list.
        When a group is ignored, it will not be displayed in the view list.
        However, if a manga only has chapters translated by that group, it will still be displayed.
*/

/*
  TODO: Implement settings Enmap.
*/

/*
  TODO: Fix useQuery hook to actually use the `url` library's `URLSearchParams` class instead of casting in other modules.
  Points of interest: `useQuery` is used in `src/renderer/pages/reader.tsx` and `src/renderer/pages/view.tsx`.
*/

/*
  TODO: Implement a preferences page.
*/

/*
  TODO: Integrate `handler.ts` functionality into the main process so external sources can be added.
  This needs to be added because sometimes a source might be dependent on another source in order to function;
  for example, MangaDex can support BiliBili only if the BiliBili source is installed.

  See: https://github.com/tachiyomiorg/tachiyomi-extensions/issues/10243#issuecomment-1001257213
  So this a valid issue. Bilibili is the only external source that uploads to dex after a date.

  The filter should check if the external url is not null, then if it's bilibili
  and the publish at date is current or older then allow the chapter because it
  can be read on dex.
*/

/*
  TODO: Import specific components from Material UI instead of using object destructuring.
  The Material UI library's size is huge (upwards of 117KB!!), and importing that large of
  a library every page is a waste of resources.
*/

/*
  TODO: Hide chapters that aren't in the specified locale language.
*/

/*
  TODO: Make all sources singletons.
*/

/*
  TODO: Make sourceBase.search(x, _) have _ be the "exclude" parameter.
  The exclude parameter is a list of strings that should be excluded from the search.
  More-intensive requests should check the exclude parameter to see if the request should be made.
  Otherwise, the function should call delete on the field.
*/

declare global {
  interface Window {
    electron: {
      util: {
        getSourceFiles: () => string[];
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
          isBookmarked: boolean
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

render(<Topbar />, document.getElementById('topbar'));
render(<App />, document.getElementById('root'));
