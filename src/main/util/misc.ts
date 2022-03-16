// TODO: this is supposed to be used for general information like sorting methods or whatever goodnight
// will be using enmaps to store data since electron-store can't serialize some datatypes
// this will NOT be exposed through the IPCRenderer because sendSync has to serialize the data,
// and again: some datatypes cannot be serialized.

// This should seldom be used for anything related to the renderer.
// This preferably should be used for plugins and other things.

import Enmap from 'enmap';
import { info } from 'electron-log';
import { app } from 'electron';

const generalEnmap = new Enmap<string, Record<any, any>>({
  name: 'misc',
  dataDir: app?.getPath('userData') ?? window.electron.util.getUserDataPath(),
});

info('misc.ts loaded');
export default class {
  static get(key: string): Record<any, any> | undefined {
    console.log(generalEnmap.fetchEverything());
    return generalEnmap.get(key);
  }

  static set(key: string, value: Record<any, any>): void {
    generalEnmap.set(key, value);
  }

  static has(key: string): boolean {
    return generalEnmap.has(key);
  }

  static delete(key: string): void {
    generalEnmap.delete(key);
  }

  static flush(): void {
    generalEnmap.clear();
  }
}
