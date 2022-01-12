import Enmap from 'enmap';
import path from 'path';
import { app } from 'electron';

const MangaDatabase = new Enmap({
  name: 'manga-database',
  dataDir: path.join(app.getPath('userData'), 'manga-database'),
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
  ChapterNumber: number;
  VolumeNumber: number;
  ChapterTitle: string;
  PageCount: number;
  CurrentPage: number;
};
export type Manga = {
  Name: string;
  MangaID: string;
  Author: string;

  Added: Date;
  LastRead: Date | null; // Null if never read
  Chapters: Chapter[];
};

export type Source = {
  Enabled: boolean;
  Manga: Manga[];
};
export type Sources = {
  [sourceName: string]: Source;
};
MangaDatabase.ensure('MangaDatabase', {
  Sources: {
    MangaDex: {
      Enabled: true,
      Manga: [],
    },
  },
});

/* Class Methods
  getSource(sourceName: string): Source | undefined
  getManga(sourceName: string, mangaID: string): Manga | undefined
  getMangas(sourceName: string): Manga[]
  getMangaByName(sourceName: string, mangaName: string): Manga | undefined
  getMangaByAuthor(sourceName: string, author: string): Manga[]
*/

// this literally should not be a class but i'm too lazy to reverse my horrible mistakes
export default class MangaDB {
  static getSource(sourceName: string): Source | undefined {
    return MangaDatabase.get(`MangaDatabase.Sources.${sourceName}`);
  }

  static getSources(): Sources {
    return MangaDatabase.get('MangaDatabase.Sources');
  }

  static getManga(sourceName: string, mangaID: string): Manga | undefined {
    const source = MangaDB.getSource(sourceName);
    if (!source) return undefined;

    return source.Manga.find((manga) => manga.MangaID === mangaID);
  }

  static getMangas(sourceName: string): Manga[] {
    const source = MangaDB.getSource(sourceName);
    if (!source) return [];

    return source.Manga;
  }

  static getMangaByName(
    sourceName: string,
    mangaName: string
  ): Manga | undefined {
    const source = MangaDB.getSource(sourceName);
    if (!source) return undefined;

    return source.Manga.find((manga) => manga.Name === mangaName);
  }

  static getMangasByAuthor(sourceName: string, author: string): Manga[] {
    const source = MangaDB.getSource(sourceName);
    if (!source) return [];

    return source.Manga.filter((manga) => manga.Author === author);
  }

  static addManga(sourceName: string, manga: Manga) {
    const source = MangaDB.getSource(sourceName);
    if (!source) return;

    source.Manga.push(manga);
    MangaDatabase.set(`MangaDatabase.Sources.${sourceName}`, source);
  }

  static removeManga(sourceName: string, mangaID: string) {
    const source = MangaDB.getSource(sourceName);
    if (!source) return;

    source.Manga = source.Manga.filter((manga) => manga.MangaID !== mangaID);
    MangaDatabase.set(`MangaDatabase.Sources.${sourceName}`, source);
  }

  static updateManga(sourceName: string, mangaID: string, manga: Manga) {
    const source = MangaDB.getSource(sourceName);
    if (!source) return;

    source.Manga = source.Manga.map((m) => (m.MangaID === mangaID ? manga : m));
    MangaDatabase.set(`MangaDatabase.Sources.${sourceName}`, source);
  }
}
