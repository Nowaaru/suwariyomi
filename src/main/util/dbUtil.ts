import Enmap from 'enmap';
import { app } from 'electron';

const MangaDatabase = new Enmap({
  name: 'library',
  dataDir: app.getPath('userData'),
});

// Hierarchy:
/*
  MangaDatabase {
    Sources {
      SourceName {
        Enabled: boolean - If enabled, it will be shown in library (if manga from the source is in library) and in search results
        Manga [ - Is an array so we can have sorting methods
          {
            Name: string,
            MangaID: string,
            Author: string,

            Added: Date, - When the manga was added to the library
            LastRead: Date,
            Chapters: [
              {
                ChapterID: string,
                ChapterNumber: number,
                VolumeNumber: number,
                ChapterTitle: string,
                PageCount: number,
                CurrentPage: number,
              }
            ]
          }
        ]
      }
    }
  }
*/

export type Chapter = {
  ChapterID: string;
  Chapter: number | string;
  Volume: number | string;
  ChapterTitle: string;
  PageCount: number; // -1 if not available, will be set when the chapter is loaded.
  CurrentPage: number; // -1 if not started
  Groups: string[];
};

/**
 * @typedef {Object} Manga
 * @property {string} Name - The name of the manga.
 * @property {string} MangaID - Manga ID. Format varies depending on the source.
 * @property {string} SourceID - The source name of the manga.
 * @property {string[] | undefined} Authors - Array of authors. By default it's undefined; but the authors can be obtained by calling getAuthors on its source. Depending on the source, it could also be present in the manga object initially.
 * @property {string} Synopsis - Description of the manga.
 * @property {string[]} Tags - Array of tags.
 * @property {string | undefined} CoverURL - URL to the cover image.
 * @property {Date | undefined} Added - When the manga was added to the library. Null if not added.
 * @property {Date | undefined} LastRead - When the manga was last read.
 * @property {Chapter[] | undefined} Chapters - Array of chapters. By default it's undefined; but the chapters can be obtained by calling getChapters() on its source.
 */

/**
 * @type {Manga}
 */
export type Manga = {
  Name: string;
  MangaID: string;
  SourceID: string;
  Authors?: string[]; // Null, can be obtained by calling getAuthors()
  Synopsis: string;

  Tags: string[];
  CoverURL?: string;
  Added?: Date; // Null if never added to library
  LastRead?: Date; // Null if never read
  Chapters?: Chapter[];
};

export type MangaWithAuthors = Manga & Pick<Required<Manga>, 'Authors'>;

export type FullManga = MangaWithAuthors &
  Pick<Required<MangaWithAuthors>, 'Chapters'>;

export type LibraryManga = FullManga & Pick<Required<Manga>, 'Added'>;

export type Source = {
  Name: string;
  Enabled: boolean;
  Manga: Manga[];
};
export type Sources = {
  [sourceName: string]: Source;
};

const defaultData = {
  Sources: {
    MangaDex: {
      Enabled: true,
      Manga: [],
    },
  },
};

const enforce = () => {
  MangaDatabase.ensure('Library', defaultData);
};

/* Class Methods
  getSource(sourceName: string): Source | undefined
  getManga(sourceName: string, mangaID: string): Manga | undefined
  getMangas(sourceName: string): Manga[]
  getMangaByName(sourceName: string, mangaName: string): Manga | undefined
  getMangaByAuthor(sourceName: string, author: string): Manga[]
*/

// this literally should not be a class but i'm too lazy to reverse my horrible mistakes
enforce();
export default class MangaDB {
  static flush = () => {
    MangaDatabase.deleteAll();
    enforce();
  };

  static getSource(sourceName: string): Source | false {
    return MangaDatabase.get(`Library`, `Sources.${sourceName}`) ?? false;
  }

  static getSources(): Sources {
    return MangaDatabase.get('Library', 'Sources') ?? false;
  }

  static getManga(sourceName: string, mangaID: string): Manga | false {
    const source = MangaDB.getSource(sourceName);
    if (!source) return false;

    return source.Manga.find((manga) => manga.MangaID === mangaID) ?? false;
  }

  static getMangas(sourceName: string): Manga[] {
    const source = MangaDB.getSource(sourceName);
    if (!source) return [];

    return source.Manga;
  }

  static getMangaByName(sourceName: string, mangaName: string): Manga | false {
    const source = MangaDB.getSource(sourceName);
    if (!source) return false;

    return (
      source.Manga.find(
        (manga) => manga.Name.toLowerCase() === mangaName.toLowerCase()
      ) ?? false
    );
  }

  static getMangasByAuthor(sourceName: string, author: string): Manga[] {
    const source = MangaDB.getSource(sourceName);
    if (!source) return [];

    return source.Manga.filter((manga) => {
      if (!manga.Authors) return false;
      return manga.Authors.map((x) => x.toLowerCase()).includes(
        author.toLowerCase()
      );
    });
  }

  static addManga(sourceName: string, manga: Manga): boolean {
    const source = MangaDB.getSource(sourceName);
    if (!source) return false;
    if (source.Manga.find((m) => m.MangaID === manga.MangaID)) return false;

    source.Manga.push(manga);
    MangaDatabase.set(`Library`, source, `Sources.${sourceName}`);
    return true;
  }

  static removeManga(sourceName: string, mangaID: string): boolean {
    const source = MangaDB.getSource(sourceName);
    if (!source) return false;

    source.Manga = source.Manga.filter((manga) => manga.MangaID !== mangaID);
    MangaDatabase.set(`Library`, source, `Sources.${sourceName}`);
    return true;
  }

  static updateManga(
    sourceName: string,
    mangaID: string,
    manga: Manga
  ): boolean {
    const source = MangaDB.getSource(sourceName);
    if (!source) return false;

    source.Manga = source.Manga.map((m) => (m.MangaID === mangaID ? manga : m));
    MangaDatabase.set(`Library`, source, `Sources.${sourceName}`);
    return true;
  }
}
