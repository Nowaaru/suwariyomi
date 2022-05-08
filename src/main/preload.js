const { ipcRenderer } = require('electron');
const { v4 } = require('uuid');
const log = require('electron-log');

log.catchErrors();
log.info('preload.js: started');

const ipcValidChannels = [
  'fullscreen-toggle',
  'open-protocol',
  'manga-open',
  'manga-update',
  'update-cycle-complete',
  'update-cycle-start',
];

window.electron = {
  log: log.functions,
  rpc: {
    updateRPC: (presence) => {
      ipcRenderer.send('update-rpc', presence);
    },
    toggleRPC: (enabled) => {
      ipcRenderer.send('toggle-rpc', enabled);
    },
  },
  util: {
    showOpenDialog: (options) => {
      return ipcRenderer.invoke('show-open-dialog', options);
    },
    downloadImage: (url, payload) => {
      return ipcRenderer.send('download-image', url, payload);
    },
    getSourceFiles: () => {
      return ipcRenderer.sendSync('get-fs-sources');
    },
    getSourceDirectory: () => {
      return ipcRenderer.sendSync('get-sources-path');
    },
    openInBrowser: (url) => {
      ipcRenderer.send('open-in-browser', url);
    },
    getUserDataPath: () => {
      return ipcRenderer.sendSync('get-userdata-path');
    },
    getDownloadsPath: () => {
      return ipcRenderer.sendSync('get-downloads-path');
    },
    get appVersion() {
      return ipcRenderer.sendSync('get-app-version');
    },
  },
  reader: {
    getMangaSettings: (sourceID, mangaID) => {
      return ipcRenderer.sendSync('get-manga-settings', sourceID, mangaID);
    },
    setMangaSettings: (sourceID, mangaID, settings) => {
      return ipcRenderer.sendSync(
        'set-manga-settings',
        sourceID,
        mangaID,
        settings
      );
    },
    flush: () => {
      return ipcRenderer.sendSync('flush-manga-settings');
    },
  },
  library: {
    cycle: {
      getUpdateQueue: () => {
        return ipcRenderer.sendSync('get-update-queue');
      },
      addToUpdateQueue: (...mangaObjects) => {
        return ipcRenderer.send('add-to-update-queue', ...mangaObjects);
      },
      updateSource: (sourceID) => {
        return ipcRenderer.send('add-source-to-queue', sourceID);
      },
      forceUpdateCycle: () => {
        return ipcRenderer.send('force-update-cycle');
      },
      isUpdating(manga) {
        return ipcRenderer.sendSync('is-updating', manga);
      },
      flushUpdateQueue: () => {
        return ipcRenderer.send('flush-update-queue');
      },
      getUpdatingSources: () => {
        return ipcRenderer.sendSync('get-updating-sources');
      },
      get processedTotal() {
        return ipcRenderer.sendSync('get-processed-total');
      },
      get isBusy() {
        return ipcRenderer.sendSync('is-busy');
      },
    },
    flush: () => {
      ipcRenderer.send('flush-db');
    },
    getSources: () => {
      return ipcRenderer.sendSync('get-sources');
    },
    addMangaToLibrary: (sourceName, mangaId) => {
      ipcRenderer.send('add-manga-to-library', sourceName, mangaId);
    },
    removeMangaFromLibrary: (sourceName, mangaId) => {
      ipcRenderer.send('remove-manga-from-library', sourceName, mangaId);
    },
    getLibraryMangas: (sourceName) => {
      return ipcRenderer.sendSync('get-library-mangas', sourceName);
    },
    addMangasToCache: (...fullManga) => {
      ipcRenderer.send('add-mangas-to-cache', ...fullManga);
    },
    removeMangaFromCache: (sourceName, ...mangaIds) => {
      ipcRenderer.send('remove-manga-from-cache', sourceName, ...mangaIds);
    },
    getCachedManga: (sourceName, mangaId) => {
      return ipcRenderer.sendSync('get-cached-manga', sourceName, mangaId);
    },
    getCachedMangas: (sourceName) => {
      return ipcRenderer.sendSync('get-cached-mangas', sourceName);
    },
    getAllCachedMangas: () => {
      return ipcRenderer.sendSync('get-all-cached-mangas');
    },
  },
  misc: {
    flush: () => {
      ipcRenderer.send('flush-misc');
    },
  },
  read: {
    get: (sourceName) => {
      return ipcRenderer.sendSync('get-read', sourceName);
    },
    set: (
      sourceName,
      chapterId,
      pageCount,
      currentPage,
      lastRead,
      timeElapsed,
      isBookmarked,
      mangaid
    ) => {
      ipcRenderer.send(
        'set-read',
        sourceName,
        chapterId,
        pageCount,
        currentPage,
        lastRead,
        timeElapsed,
        isBookmarked,
        mangaid
      );
    },
    setSync: (
      sourceName,
      chapterId,
      pageCount,
      currentPage,
      lastRead,
      timeElapsed,
      isBookmarked,
      mangaid
    ) => {
      ipcRenderer.sendSync(
        'set-read',
        sourceName,
        chapterId,
        pageCount,
        currentPage,
        lastRead,
        timeElapsed,
        isBookmarked,
        mangaid
      );
    },
    deleteEntry: (sourceName, chapterId) => {
      ipcRenderer.send('delete-read', sourceName, chapterId);
    },
    deleteSource: (sourceName) => {
      ipcRenderer.send('delete-source-read', sourceName);
    },
    flush: () => {
      ipcRenderer.send('flush-read');
    },
  },
  cache: {
    get: (key) => {
      return ipcRenderer.sendSync('get-cache', key);
    },
    set: (key, value) => {
      ipcRenderer.send('set-cache', key, value);
    },
    has: (key) => {
      return ipcRenderer.sendSync('has-cache', key);
    },
    delete: (...keys) => {
      ipcRenderer.sendSync('delete-cache', ...keys);
    },
    flush: () => {
      ipcRenderer.sendSync('flush-cache');
    },
  },
  auth: {
    async generateAuthenticationWindow(windowData, targetLocation) {
      const id = v4();
      return new Promise((resolve) => {
        ipcRenderer.on(
          `oauth-received-${id}`,
          (event, identifier, return_data) => {
            if (identifier === id) {
              ipcRenderer.removeAllListeners(`oauth-received-${id}`);
              if (return_data) resolve(return_data);
              else resolve(false);
            }
          }
        );
        ipcRenderer.send(
          'authentication-window',
          id,
          windowData,
          targetLocation
        );
      });
    },
    async generatePKCE() {
      return ipcRenderer.invoke('generate-pkce');
    },
    checkAuthenticated(specificLogin) {
      const authorizationStore = ipcRenderer.sendSync(
        'electron-store-get',
        'authorization'
      );

      // Iterate through authorizationStore; if any of the values' have both an access_token and an expires_in, return true
      const lowercasedSpecificLogin = specificLogin?.toLowerCase();
      if (specificLogin)
        return (
          authorizationStore[lowercasedSpecificLogin]?.access_token &&
          authorizationStore[lowercasedSpecificLogin]?.expires_in
        );

      const isAuthenticated = Object.keys(authorizationStore).some(
        (key) =>
          authorizationStore[key].access_token &&
          (authorizationStore[key].expires_in
            ? authorizationStore[key].expires_in > Date.now()
            : true) // if there is no expires_in, assume it's valid
      );
      return isAuthenticated;
    },
    getAuthentication(specificLogin) {
      return ipcRenderer.sendSync('electron-store-get', 'authorization')?.[
        specificLogin?.toLowerCase()
      ]?.access_token;
    },
    setAuthenticated(specificLogin, access_token, expires_in) {
      const authorizationStore = ipcRenderer.sendSync(
        'electron-store-get',
        'authorization'
      );

      if (authorizationStore) {
        authorizationStore[specificLogin] = {
          access_token,
          expires_in,
        };
        ipcRenderer.send(
          'electron-store-set',
          'authorization',
          authorizationStore
        );
        return true;
      }
      return false;
    },
    deleteAuthenticated(specificLogin) {
      const authorizationStore = ipcRenderer.sendSync(
        'electron-store-get',
        'authorization'
      );

      if (authorizationStore) {
        delete authorizationStore[specificLogin.toLowerCase()];
        ipcRenderer.send(
          'electron-store-set',
          'authorization',
          authorizationStore
        );

        return true;
      }
      return false;
    },
  },
  ipcRenderer: {
    minimize() {
      ipcRenderer.send('minimize');
    },
    maximize() {
      ipcRenderer.send('maximize');
    },
    exit() {
      ipcRenderer.send('close-application');
    },
    on(channel, func) {
      if (ipcValidChannels.includes(channel)) {
        ipcRenderer.on(channel, func);
      }
    },
    off(channel, func) {
      if (ipcValidChannels.includes(channel)) {
        ipcRenderer.off(channel, func);
      }
    },
    once(channel, func) {
      if (ipcValidChannels.includes(channel)) {
        ipcRenderer.once(channel, func);
      }
    },
  },
  store: {
    get(val) {
      return ipcRenderer.sendSync('electron-store-get', val);
    },
    set(property, val) {
      ipcRenderer.send('electron-store-set', property, val);
    },
    flush() {
      ipcRenderer.send('electron-store-flush');
    },
  },
  settings: {
    get(val) {
      return ipcRenderer.sendSync('settings-get', val);
    },
    getAll() {
      return ipcRenderer.sendSync('settings-get-all');
    },
    set(property, val) {
      ipcRenderer.send('settings-set', property, val);
    },
    overwrite(settings) {
      ipcRenderer.send('settings-set-all', settings);
    },
    flush() {
      ipcRenderer.send('settings-flush');
    },
  },
};
