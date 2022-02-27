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
  static getMangaSettings(mangaID: string) {
    return readerEnmap.get(mangaID);
  }

  static setMangaSettings(
    mangaID: string,
    overrides: { [setting: string]: any }
  ) {
    readerEnmap.set(mangaID, overrides);
  }
}
