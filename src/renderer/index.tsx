import { render } from 'react-dom';
import { IpcRendererEvent } from 'electron';
import Topbar from './components/topbar';
import App from './App';

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        generateAuthenticationWindow: (
          windowData: { [key: string]: any },
          targetLocation: string
        ) => Promise<{ access_token: string; expires_in: number }>;
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
      };
    };
  }
}

render(<Topbar />, document.getElementById('topbar'));
render(<App />, document.getElementById('root'));
