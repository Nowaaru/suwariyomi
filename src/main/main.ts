/* eslint-disable no-continue */
/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */

import path from 'path';
import fs from 'fs';
import log from 'electron-log';
import imageType from 'image-type';
import Store from 'electron-store';
import slugify from 'slugify';
import fetch from 'node-fetch';
import AdmZip from 'adm-zip';
import pkceChallenge from 'pkce-challenge';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  Tray,
  Menu,
  Notification,
} from 'electron';
import type { SourceMetadata } from 'renderer';
import { autoUpdater } from 'electron-updater';
import { clearRequireCache } from '../shared/util';
import MenuBuilder from './menu';
import { getSourceDirectory, getSourceFiles, resolveHtmlPath } from './util';
import CacheDB from './util/cache';
import MangaDB from './util/manga';
import ReadDB from './util/read';
import ReaderDB from './util/reader';
import MiscDB from './util/misc';
import Settings from './util/settings';
import { init as initUpdater } from './util/mangaupdate';
import initRPCConnection, {
  RPCClient,
  updateRichPresence,
  toggleRPC,
} from './util/rpc';

log.catchErrors();

const ElectronStore = new Store();
let mainWindow: BrowserWindow | null = null;
export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const setupSourceCatalogue = async (sourceData: boolean | object = false) => {
  ipcMain.on('get-source-catalogue', (event) => {
    return (event.returnValue = sourceData);
  });
};

const downloadSource = async (zipName: string): Promise<boolean | Error> => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://github.com/Nowaaru/suwariyomi-sources/raw/dist/zip/${zipName}.zip`
    )
      .then((x) => {
        if (x.status === 200) {
          return x.body;
        }

        throw new Error(`Failed to download ${zipName}. Status: ${x.status}`);
      })
      .then((y) => {
        const writeDir = fs.mkdtempSync(
          path.join(app.getPath('temp'), `suwariyomi-`)
        );

        const outDir = path.join(getSourceDirectory(), zipName);
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(path.join(getSourceDirectory(), zipName));
        }

        const outTempFile = path.join(writeDir, `${zipName}.zip`);
        const noWatchFile = path.join(outDir, 'no-watch');
        fs.writeFileSync(outTempFile, '');
        fs.writeFileSync(noWatchFile, '');

        const writeStream = fs.createWriteStream(outTempFile);
        y.pipe(writeStream);
        y.on('error', reject);

        writeStream.on('error', reject);
        writeStream.on('finish', () => {
          const zipFile = new AdmZip(outTempFile);
          zipFile.extractAllToAsync(
            path.join(getSourceDirectory(), zipName),
            true,
            true,
            (err) => {
              fs.rm(noWatchFile, { recursive: true, force: true }, (fsErr) => {
                try {
                  fs.rmSync(writeDir, { recursive: true, force: true });
                } catch (e) {
                  reject(e);
                }
                if (err ?? fsErr) reject(err ?? fsErr);
                else {
                  mainWindow?.webContents.send('source-update', zipName);
                  resolve(true);
                }
              });
            }
          );
        });

        return true;
      })
      .catch(reject);
  });
};

fetch(
  'https://raw.githubusercontent.com/Nowaaru/suwariyomi-sources/dist/metadata.json'
)
  .then((res) => res.json())
  .then(setupSourceCatalogue)
  .catch((err) => {
    log.error(err);
    setupSourceCatalogue(false);
  });

ipcMain.on('download-source', (event, sourceName: string) => {
  const onError = (res: any) =>
    event.sender.send('download-source-error', sourceName, res.message);

  downloadSource(sourceName)
    .then((res) => {
      if (res instanceof Error) return onError(res);

      event.sender.send('download-source-success', sourceName);
    })
    .catch(onError);
});

ipcMain.on('remove-source', (event, sourceData: SourceMetadata) => {
  if (!fs.existsSync(sourceData.path ?? ''))
    return log.error(
      'Source directory does not exist for source',
      `${sourceData.name}.`
    );

  try {
    clearRequireCache(sourceData.path!);
  } catch (e) {
    log.error(e);
  }

  fs.writeFileSync(path.join(sourceData.path!, 'no-watch'), '');
  fs.rmSync(sourceData.path!, { recursive: true });
  event.sender.send('source-remove', sourceData.name);
});

ipcMain.on('ipc-example', async (event) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
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

ipcMain.handle(
  'show-open-dialog',
  async (event, arg: Electron.OpenDialogOptions) => {
    if (!mainWindow) return;
    const { title, defaultPath, filters, properties, message, buttonLabel } =
      arg;

    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      title,
      defaultPath,
      filters,
      properties,
      message,
      buttonLabel,
    });

    return filePaths;
  }
);

ipcMain.handle('generate-pkce', async () => {
  const challenge = await pkceChallenge();
  // event.reply('generate-pkce', challenge);

  return challenge;
});

ipcMain.handle('flush', () => {
  MangaDB.Flush();
});

ipcMain.on('get-sources-path', (event) => {
  event.returnValue = getSourceDirectory();
});

ipcMain.on('get-fs-sources', async (event) => {
  event.returnValue = getSourceFiles();
});

ipcMain.on('get-sources', (event) => {
  event.returnValue = MangaDB.GetSources();
});

ipcMain.on('get-source-metadata', (event, sourceID: string) => {
  const sourceFiles = getSourceFiles();
  const directoryPath = getSourceDirectory();

  const sourceMetadata: SourceMetadata[] = sourceFiles
    .filter((x) => !sourceID || x.toLowerCase() === sourceID.toLowerCase())
    .map((file) => path.join(directoryPath, file, 'metadata.json'))
    .filter((y) => fs.existsSync(y))
    .map((z) => {
      // eslint-disable-next-line import/no-dynamic-require
      const required = require(z);

      return { ...required, path: z.replace('metadata.json', '') };
    }) as unknown as SourceMetadata[]; // Include the path to make sure that we can recognize the directory despite the name being changed for any reason.

  return (event.returnValue = sourceMetadata);
});

ipcMain.on('flush-db', (event) => {
  MangaDB.Flush();
  event.returnValue = true;
});

ipcMain.on('add-manga-to-library', async (event, sourceName, mangaID) => {
  event.returnValue = await MangaDB.AddMangaToLibrary(sourceName, mangaID);
});

ipcMain.on('remove-manga-from-library', async (event, sourceName, mangaID) => {
  event.returnValue = await MangaDB.RemoveMangaFromLibrary(sourceName, mangaID);
});

ipcMain.on('get-library-mangas', async (event, sourceName) => {
  event.returnValue = await MangaDB.GetLibraryMangas(sourceName);
});

ipcMain.on('add-mangas-to-cache', async (event, ...fullMangas) => {
  event.returnValue = await MangaDB.addMangasToCache(...fullMangas);
});

ipcMain.on(
  'remove-manga-from-cache',
  async (event, sourceName, ...mangaIDs: string[]) => {
    event.returnValue = await MangaDB.RemoveMangaFromCache(
      sourceName,
      ...mangaIDs
    );
  }
);

ipcMain.on('get-cached-manga', async (event, sourceName, mangaId) => {
  event.returnValue = await MangaDB.GetCachedManga(sourceName, mangaId);
});

ipcMain.on('get-cached-mangas', async (event, sourceName) => {
  event.returnValue = await MangaDB.GetCachedMangas(sourceName);
});

ipcMain.on('get-all-cached-mangas', async (event) => {
  event.returnValue = await MangaDB.GetAllCachedMangas();
});

ipcMain.on('get-read', async (event, sourceName) => {
  event.returnValue = await ReadDB.get(sourceName);
});

ipcMain.on(
  'set-read',
  async (
    event,
    sourceName,
    chapterId,
    pageCount,
    currentPage,
    lastRead,
    timeElapsed,
    isBookmarked,
    mangaid
  ) => {
    event.returnValue = await ReadDB.set(
      sourceName,
      chapterId,
      pageCount,
      currentPage,
      lastRead,
      timeElapsed,
      isBookmarked,
      mangaid
    );
  }
);

ipcMain.on('delete-read', async (event, sourceName, chapterId) => {
  event.returnValue = await ReadDB.deleteEntry(sourceName, chapterId);
});

ipcMain.on('delete-source-read', async (event, sourceName) => {
  event.returnValue = await ReadDB.deleteSource(sourceName);
});

ipcMain.on('flush-read', async (event) => {
  event.returnValue = await ReadDB.flush();
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

ipcMain.on('get-manga-settings', (event, sourceName, id) => {
  event.returnValue = ReaderDB.getMangaSettings(sourceName, id);
});

ipcMain.on('set-manga-settings', (event, sourceName, id, settings) => {
  ReaderDB.setMangaSettings(sourceName, id, settings);
  event.returnValue = true;
});

ipcMain.on('flush-manga-settings', (event) => {
  ReaderDB.flush();
  event.returnValue = true;
});

ipcMain.on('electron-store-get', async (event, val) => {
  event.returnValue = ElectronStore.get(val);
});

ipcMain.on('electron-store-set', async (_, key, val) => {
  ElectronStore.set(key, val);
});

ipcMain.on('get-cache', async (event, key) => {
  event.returnValue = await CacheDB.get(key);
});

ipcMain.on('set-cache', async (event, key, value) => {
  await CacheDB.set(key, value);
});

ipcMain.on('open-in-browser', async (e, url: string) => {
  shell.openExternal(url);
});

ipcMain.on('has-cache', async (event, key) => {
  event.returnValue = await CacheDB.has(key);
});

ipcMain.on('delete-cache', async (event, ...keys) => {
  event.returnValue = await CacheDB.delete(...keys);
});

ipcMain.on('flush-cache', async (event) => {
  await CacheDB.flush();
  return (event.returnValue = true);
});

ipcMain.on('settings-get', async (event, key) => {
  event.returnValue = Settings.getSetting(key) ?? false;
});

ipcMain.on('settings-set-all', async (event, newSettings) => {
  Settings.setSettings(newSettings);
  event.returnValue = true;
});

ipcMain.on('settings-set', async (event, key, value) => {
  Settings.setSetting(key, value);
  event.returnValue = true;
});

ipcMain.on('settings-get-all', async (event) => {
  event.returnValue = Settings.getAllSettings() ?? false;
});

ipcMain.on('settings-flush', async (event) => {
  await Settings.flushSettings();
  event.returnValue = true;
});

ipcMain.on('get-app-version', (event) => {
  const version = app.getVersion();
  event.returnValue = version;
});

ipcMain.on('flush-misc', (event) => {
  MiscDB.flush();
  event.returnValue = true;
});

ipcMain.on('get-userdata-path', (event) => {
  event.returnValue = app.getPath('userData');
});

ipcMain.on('get-downloads-path', (event) => {
  event.returnValue = app.getPath('downloads');
});

ipcMain.on(
  'download-image',
  async (
    event,
    url: string,
    payload: {
      filename: string;
      sourceid: string;
      chapternumber: number;
      manganame: string;
      mangaid: string;
    }
  ) => {
    const downloadPath = app.getPath('downloads');
    log.info(downloadPath, payload.sourceid);
    const targetLocation = path.join(
      downloadPath,
      payload.sourceid,
      `${slugify(payload.manganame)} (${payload.mangaid})`,
      `ch${payload.chapternumber.toFixed(0).padStart(2, '0')}`
    );

    if (!fs.existsSync(targetLocation))
      fs.mkdirSync(targetLocation, { recursive: true });

    const downloadedImageBuffer = await fetch(url).then((res) => res.buffer());
    const imageExtension = downloadedImageBuffer
      ? await imageType(downloadedImageBuffer)
      : null;
    if (!downloadedImageBuffer || !imageExtension) {
      event.returnValue = false;
      return;
    }

    log.info(`Downloading image to ${targetLocation}`);

    fs.writeFileSync(
      path.join(targetLocation, `${payload.filename}.${imageExtension.ext}`),
      downloadedImageBuffer
    );

    event.returnValue = true;
  }
);

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
  app.getVersion = () => require('../../release/app/package.json').version;
}

if (process.platform === 'win32') app.setAppUserModelId(app.name);

// if (isDevelopment) {
require('electron-debug')();
// }

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(log.error);
};

let isQuitting = false;
const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

const appIconLocation = getAssetPath(
  'icons',
  `icon.${
    (
      {
        win32: 'ico',
        darwin: 'icns',
      } as any
    )[process.platform] ?? 'png'
  }`
);

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    minWidth: 727, // i see it. 727. when you see it. 727. when you see it. the funny number. blue zenith 727pp cookiezi.
    minHeight: 825,
    icon: getAssetPath('icons', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      nodeIntegrationInSubFrames: true, // Authentication window is a subframe; enabling this would be a vulnerability
    },
    titleBarStyle: process.platform === 'win32' ? 'hidden' : 'default',
  });

  const toggleFullscreen = (fullStatus: boolean) => {
    log.info(`Fullscreen is now toggled ${fullStatus ? 'on' : 'off'}.`);
    mainWindow?.webContents.send('fullscreen-toggle', fullStatus);
  };

  mainWindow.on('enter-full-screen', () => {
    toggleFullscreen(true);
  });

  mainWindow.on('leave-full-screen', () => {
    toggleFullscreen(false);
  });

  mainWindow.on('enter-html-full-screen', () => {
    toggleFullscreen(true);
  });

  mainWindow.on('leave-html-full-screen', () => {
    toggleFullscreen(false);
  });

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

  // Check if the user has enabled the setting to minimize to tray when minimizing/closing the application.
  let didMinimizeToTray = false;
  const minimizeToTrayNotification = () => {
    if (!didMinimizeToTray) {
      new Notification({
        title: 'Minimized to tray',
        body: 'The application has now been moved to the tray. You can restore it by clicking the tray icon.',
        icon: appIconLocation,
      }).show();
      didMinimizeToTray = true;
    }
  };

  mainWindow.on('minimize', (e: Electron.Event) => {
    if (Settings.getAllSettings().general.minimizeToTray) {
      e.preventDefault();
      minimizeToTrayNotification();
      mainWindow?.hide();
    }
  });

  mainWindow.on('close', (e) => {
    if (Settings.getAllSettings().general.closeToTray) {
      if (!isQuitting) {
        e.preventDefault();
        minimizeToTrayNotification();
        mainWindow?.hide();
        e.returnValue = false;
      }
    }
    e.returnValue = true;
  });

  // Manga Updater
  setTimeout(
    () => initUpdater(mainWindow, appIconLocation),
    isDevelopment ? 5000 : 30000
  );

  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

const appIsLocked = app.requestSingleInstanceLock();
if (!appIsLocked) {
  app.quit();
} else {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.on('second-instance', (_e, argv) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      log.warn(
        'Attempt to open another instance of the app. Focusing the existing window.'
      );
      mainWindow.focus();

      // Check if the second-instance was fired through a protocol link.
      const isProtocol = argv.find((arg) => arg.startsWith('suwariyomi://'));
      if (isProtocol) {
        log.info('protocol link detected');

        const formattedURL: URL = new URL(isProtocol);
        mainWindow.webContents.send('open-protocol', {
          full: isProtocol,
          location: isProtocol.match(/^suwariyomi:\/\/(.+?)\//)?.[1],
          query: Object.fromEntries(
            new URLSearchParams(formattedURL.search) as unknown as Iterable<
              [string, string]
            >
          ),
        });
      }
    }
  });

  app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  // Setup deep links and protocol handler
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      // This part was really obscure from the electron docs.
      // Apparently argv includes the app name as the first
      // element which is why they do it this way. However,
      // why not just do (process.argv[1]) instead?

      app.setAsDefaultProtocolClient('suwariyomi', process.execPath, [
        path.resolve(process.argv[1]),
      ]);
    } else {
      app.setAsDefaultProtocolClient('suwariyomi');
    }
  } else {
    app.setAsDefaultProtocolClient('suwariyomi');
  }

  RPCClient.on('ready', () => {
    log.info('RPCClient is ready.');
  });

  if (!Settings.getAllSettings().general.discordRPCIntegration)
    toggleRPC(false);

  setTimeout(() => {
    initRPCConnection()
      .then(() => {
        ipcMain.on('toggle-rpc', (event, isToggled) => {
          toggleRPC(isToggled);
        });

        ipcMain.on('update-rpc', (e, presence) => {
          updateRichPresence(presence);
        });
      })
      .catch(log.error);
  }, 5000);
  let appIcon = null;
  app
    .whenReady()
    .then(() => {
      createWindow();
      const supportsClick =
        process.platform === 'darwin' || process.platform === 'win32';

      appIcon = new Tray(appIconLocation);
      const contextMenu = Menu.buildFromTemplate(
        [
          !supportsClick
            ? { label: 'Open', click: () => mainWindow?.show() }
            : null,
          {
            label: 'Quit',
            click: () => {
              isQuitting = true;
              app.quit();
            },
          },
        ].filter((item) => item) as any
      );

      appIcon.on('double-click', () => {
        if (mainWindow && supportsClick) {
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
          }
        }
      });

      app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) createWindow();
      });

      appIcon.setToolTip('Suwariyomi');
      appIcon.setContextMenu(contextMenu);
    })
    .catch(log.error);
}
