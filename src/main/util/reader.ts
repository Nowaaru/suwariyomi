// Reader options for individual manga.
import Enmap from 'enmap';
import { app } from 'electron';

const readerEnmap = new Enmap<
  string,
  { [mangaID: string]: { [overriddenSetting: string]: any } }
>({
  name: 'reader',
  dataDir: app.getPath('userData'),
});

export default class {
  static getMangaSettings(sourceID: string, mangaID: string) {
    return readerEnmap.get(sourceID)?.[mangaID];
  }

  static setMangaSettings(
    sourceID: string,
    mangaID: string,
    overrides: { [setting: string]: any }
  ) {
    const mangaSettings = readerEnmap.get(sourceID) || {};
    mangaSettings[mangaID] = overrides;
    readerEnmap.set(sourceID, mangaSettings);
  }

  static flush() {
    readerEnmap.deleteAll();
  }
}
