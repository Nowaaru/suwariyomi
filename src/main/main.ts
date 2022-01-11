/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Store from 'electron-store';
import pkceChallenge from 'pkce-challenge';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

const ElectronStore = new Store();
export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('close-application', () => {
  app.quit();
});

ipcMain.on('minimize', () => {
  if (mainWindow?.isMinimized()) return mainWindow.restore();

  mainWindow?.minimize();
  return true;
});

ipcMain.on('electron-store-flush', () => {
  ElectronStore.clear();
});

ipcMain.handle('generate-pkce', async () => {
  const challenge = await pkceChallenge();
  // event.reply('generate-pkce', challenge);

  return challenge;
});

ipcMain.on(
  'authentication-window',
  async (event, identifier, windowData, url) => {
    const newWindow: BrowserWindow = new BrowserWindow(windowData);
    let isAuthorized = false;

    const onClose = () => {
      if (isAuthorized) return;
      event.reply(`oauth-received-${identifier}`, identifier, false);
    };

    const onWebEvent = (_: any, windowUrl: string) => {
      const parsedURL = new URL(windowUrl);
      // combine the hash params and the query params
      const params = Object.fromEntries(
        new URLSearchParams(parsedURL.hash.slice(1)) as any
      );

      parsedURL.searchParams.forEach((value, key) => {
        if (params[key]) return;
        params[key] = value;
      });

      if (
        parsedURL.protocol.substring(0, parsedURL.protocol.length - 1) !==
        'suwariyomi'
      )
        return;

      if (params.code)
        [params.code, params.access_token] = [undefined, params.code]; // this is a hack to make the code work with the access_token

      isAuthorized = true;
      event.reply(`oauth-received-${identifier}`, identifier, params);

      newWindow.removeAllListeners('close');
      newWindow.removeAllListeners('will-redirect');
      newWindow.removeAllListeners('will-navigate');

      newWindow.destroy();
    };

    newWindow.webContents.on('will-redirect', onWebEvent);
    newWindow.loadURL(url);

    newWindow.on('close', onClose);
  }
);
ipcMain.on('electron-store-get', async (event, val) => {
  event.returnValue = ElectronStore.get(val);
});
ipcMain.on('electron-store-set', async (_, key, val) => {
  ElectronStore.set(key, val);
});
ipcMain.on('maximize', () => {
  if (mainWindow?.isMaximized()) return mainWindow.unmaximize();
  mainWindow?.maximize();

  return true;
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    minWidth: 727, // i see it. 727. when you see it. 727. when you see it. the funny number. blue zenith 727pp cookiezi.
    minHeight: 547,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: process.platform === 'win32' ? 'hidden' : 'default',
  });
  console.log(process.platform);
  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
  (process as any).appMenu = menuBuilder; //eslint-disable-line

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
