import { render } from 'react-dom';
import { IpcRendererEvent } from 'electron';
import Topbar from './components/topbar';
import App from './App';

declare global {
  interface Window {
    electron: {
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
