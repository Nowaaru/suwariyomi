// Reader options for individual manga.
import Enmap from 'enmap';

const readerEnmap = new Enmap<
  string,
  { [mangaID: string]: { [overriddenSetting: string]: any } }
>({
  name: 'reader',
});

export default class {
  static getMangaSettings(mangaID: string) {
    return readerEnmap.get(mangaID);
  }

  static set(mangaID: string, overrides: { [setting: string]: any }) {
    readerEnmap.set(mangaID, overrides);
  }
}
