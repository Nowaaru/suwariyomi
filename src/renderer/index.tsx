import { render } from 'react-dom';
import { IpcRendererEvent } from 'electron';
import { Source, Sources, Manga } from '../main/util/dbUtil';
import Topbar from './components/topbar';
import App from './App';

declare global {
  interface Window {
    electron: {
      util: {
        getSourceFiles: () => string[];
      };
      library: {
        flush: () => void;
        getSource: (sourceName: string) => Source | undefined;
        getSources: () => Sources;
        getManga: (sourceName: string, mangaID: string) => Manga | undefined;
        getMangas: (sourceName: string) => Manga[];
        getMangaByName: (
          sourceName: string,
          mangaName: string
        ) => Manga | undefined;
        getMangasByAuthor: (sourceName: string, authorName: string) => Manga[];
        addManga: (sourceName: string, manga: Manga) => boolean;
        updateManga: (sourceName: string, mangaID: string) => boolean;
        removeManga: (
          sourceName: string,
          mangaID: string,
          manga: Manga
        ) => boolean;
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
