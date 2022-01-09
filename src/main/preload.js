const { contextBridge, ipcRenderer } = require('electron');
const { v4 } = require('uuid');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    async generateAuthenticationWindow(windowData, targetLocation) {
      const id = v4();
      return new Promise((resolve, reject) => {
        ipcRenderer.on(
          `oauth-received-${id}`,
          (event, identifier, return_data) => {
            if (identifier === id) {
              ipcRenderer.removeAllListeners(`oauth-received-${id}`);
              if (return_data) resolve(return_data);
              else reject();
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
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    once(channel, func) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
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
  },
});
