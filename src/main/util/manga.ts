/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable max-classes-per-file */
import Enmap from 'enmap';
import path from 'path';
import fs from 'fs';
import log from 'electron-log';
import { app } from 'electron';

import type {
  SupportedTrackers,
  TrackingProps,
} from '../../renderer/util/tracker/tracker';

const requireFunc =
  typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;

const LibraryDatabase = new Enmap<
  string,
  {
    Sources: {
      [sourceName: string]: {
        Manga: string[];
        Enabled: boolean;
        LastUpdated: number;
      };
    };
  }
>({
  name: 'library',
  dataDir: app.getPath('userData'),
});

const MangaDatabase = new Enmap<
  string,
  {
    Sources: {
      [sourceName: string]: Record<string, FullManga>;
    };
  }
>({
  name: 'manga',
  dataDir: app.getPath('userData'),
});

// MangaDatabase's purpose is to cache manga data.
// LibraryDatabase's purpose is to cache library data.

// LibraryDatabase will hold no specific information outside of sources and tags.
// LibraryDatbase hierarchy: Library -> Source -> {MangaID: Manga}

// MangaDatabase will hold all information regarding Manga. This is the first stop
// to hit when trying to get a manga. If the result is not found, then you should
// try to get the manga from the source.
export type Chapter = {
  PublishedAt: Date;
  ReadableAt: Date;

  isExternal: boolean;
  externalURL: string;

  translatedLanguage: string;

  ChapterTitle: string;
  ChapterID: string;

  Chapter: number;
  Volume?: number;
  PageCount: number;

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
  Status?: 'ongoing' | 'completed' | 'hiatus' | 'canceled';

  Tags: string[];
  DateFetched: Date;
  CoverURL?: string;
  Added?: Date; // Null if never added to library
  LastRead?: Date; // Null if never read
  Chapters?: Chapter[];
};

export type MangaWithAuthors = Manga & Pick<Required<Manga>, 'Authors'>;

export type FullManga = MangaWithAuthors &
  Pick<Required<MangaWithAuthors>, 'Chapters'>;

export type MangaTrackingData = {
  progress?: number | null;
  progressVolumes?: number | null;
  id?: number | null;
  listId?: number | null;
  publicationStatus?: string | null;
  readingStatus?: Required<TrackingProps>['status'] | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  score?: number | null;
  title?: string | null;
};

export type LibraryManga = FullManga &
  Pick<Required<Manga>, 'Added' | 'LastRead'> & {
    Tracking: Record<SupportedTrackers, MangaTrackingData | null>;
  };

export type LibrarySource = {
  Enabled: boolean;
  LastUpdated: number;
  Manga: string[];
};

export type LibrarySources = {
  [sourceName: string]: LibrarySource;
};

export type CacheSource = Record<string, FullManga[]>;

export type CacheSources = {
  [sourceName: string]: CacheSource;
};

const defaultMangaData: {
  Sources: {
    [sourceName: string]: Record<string, FullManga>;
  };
} = {
  Sources: {
    // MangaDex: {},
  },
};

const defaultLibraryData: {
  Sources: LibrarySources;
} = {
  Sources: {
    // template:
    // MangaDex: {
    // Enabled: true,
    // LastUpdated: 0,
    // Manga: [],
    // },
  },
};

// Sources have two names: SourceName, where that is used to distinguish itself from other sources; and _metadata.Name, for visual purposes.
// Get all currently installed manga sources and introduce them to the defaultLibraryData and defaultMangaData objects.
const sourcesPath = path.normalize(
  path.join(app.getPath('userData'), 'sources')
);

if (!fs.existsSync(sourcesPath)) {
  fs.mkdirSync(sourcesPath);
}

const enforce = async () => {
  MangaDatabase.ensure('CachedManga', defaultMangaData);
  LibraryDatabase.ensure('Library', defaultLibraryData);
};

const reloadSources = async () => {
  try {
    const allSources = fs.readdirSync(sourcesPath);
    allSources.forEach((source) => {
      const mainFilePath = path.join(sourcesPath, source, 'main.js');
      if (fs.existsSync(path.join(sourcesPath, source, 'no-watch')))
        return log.info(`No-watch file present. Skipping source ${source}. `);

      // Check if main.js exists
      if (!fs.existsSync(mainFilePath)) {
        log.error(`${source} does not have a main.js file.`);
        return;
      }

      if (!fs.lstatSync(path.join(sourcesPath, source)).isDirectory()) {
        log.error(
          `${source} is not a directory. Please clean your sources folder.`
        );
        return;
      }

      try {
        delete require.cache[require.resolve(mainFilePath)];
      } catch (e) {
        log.warn(`${source} main.js file is not in require cache; skipping.`);
      }
      const Source = requireFunc(mainFilePath);
      if (!Source) return;

      const sourceObject = new Source();
      const sourceName = sourceObject.getName();

      enforce();

      // These are already present due to the ensure() call above.
      const [currentMangaData, currentLibraryData] = [
        MangaDatabase.get('CachedManga')!,
        LibraryDatabase.get('Library')!,
      ];

      if (!currentLibraryData.Sources[sourceName]) {
        currentLibraryData.Sources[sourceName] = {
          Enabled: true,
          LastUpdated: 0,
          Manga: [],
        };
        LibraryDatabase.set('Library', currentLibraryData);
        log.info(`Added ${sourceName} to the library.`);
      }

      if (!currentMangaData.Sources[sourceName]) {
        log.info('Adding new source to MangaDatabase.');
        currentMangaData.Sources[sourceName] = {};
        MangaDatabase.set('CachedManga', currentMangaData);
      }
    });
  } catch (e) {
    log.error(e);
  }
};

reloadSources();
fs.watch(sourcesPath, reloadSources);

/* Class Methods
  getSource(sourceName: string): Source | undefined
  getManga(sourceName: string, mangaID: string): Manga | undefined
  getMangas(sourceName: string): Manga[]
  getMangaByName(sourceName: string, mangaName: string): Manga | undefined
  getMangaByAuthor(sourceName: string, author: string): Manga[]
*/

// this literally should not be a class but i'm too lazy to reverse my horrible mistakes
enforce();

class MangaDB {
  /**
   * @name GetSources
   * @description Gets all the sources.
   * @returns {Sources} All the sources.
   * @example
   * const sources = MangaDB.GetSources();
   * console.log(sources);
   * // => {MangaDex: {Name: 'MangaDex', Enabled: true, Manga: [...]}}
   * console.log(sources.MangaDex.Manga);
   * // => [...]
   */
  static GetSources(): LibrarySources {
    return LibraryDatabase.get('Library')?.Sources ?? {};
  }

  /**
   * @name Flush
   * @description Flushes both the Library database and the Manga cache.
   * @returns {boolean} Whether the flush was successful.
   */
  static Flush() {
    MangaDatabase.deleteAll();
    LibraryDatabase.deleteAll();
    reloadSources();
    return true;
  }

  /**
   * @name AddMangaToLibrary
   * @description Adds a manga to the library.
   * @param {string} sourceName - The source that the manga belongs to.
   * @params {string} mangaID - The ID of the manga.
   * @returns {boolean} Whether the manga was added to the library.
   */
  static AddMangaToLibrary(sourceName: string, mangaID: string): boolean {
    const library = LibraryDatabase.get('Library');
    if (!library) return false;

    const source = library.Sources[sourceName];
    if (source) {
      if (source.Manga.includes(mangaID)) {
        return false;
      }

      // If there is already a cached manga for this, add the `.Added` field to it.
      const cachedManga = MangaDatabase.get('CachedManga');
      if (cachedManga) {
        const manga = cachedManga.Sources[sourceName][mangaID];
        if (manga) {
          manga.Added = new Date();
          MangaDatabase.set('CachedManga', cachedManga);
        }
      }

      source.Manga.push(mangaID);
      LibraryDatabase.set('Library', library);
      return true;
    }
    return false;
  }

  /**
   * @name RemoveMangaFromLibrary
   * @description Removes a manga from the library.
   * @param {string} sourceName - The source that the manga belongs to.
   * @params {string} mangaID - The ID of the manga.
   * @returns {boolean} Whether the manga was removed from the library.
   */
  static RemoveMangaFromLibrary(sourceName: string, mangaID: string): boolean {
    const library = LibraryDatabase.get('Library');
    const source = library?.Sources[sourceName];
    if (source) {
      const index = source.Manga.indexOf(mangaID);
      if (index !== -1) {
        source.Manga.splice(index, 1);
        LibraryDatabase.set('Library', library);

        // If there is already a cached manga for this, remove the `.Added` field from it.
        const cachedManga = MangaDatabase.get('CachedManga');
        if (cachedManga) {
          const manga = cachedManga.Sources[sourceName][mangaID];
          if (manga) {
            manga.Added = undefined;
            MangaDatabase.set('CachedManga', cachedManga);
          }
        }

        return true;
      }
    }
    return false;
  }

  /**
   * @name GetLibraryMangas
   * @description Gets all the manga from the library.
   * @param {string} sourceName - The source that the manga belongs to.
   * @returns {LibraryManga[]} The manga from the library.
   * @example
   * const manga = NewMangaDB.GetLibraryMangas('MangaDex');
   * console.log(manga.length);
   * // => 10
   */
  static GetLibraryMangas(sourceName: string): string[] {
    const library = LibraryDatabase.get('Library');
    const source = library?.Sources[sourceName];
    if (source) {
      return [...source.Manga];
    }
    return [];
  }

  /**
   * @name addMangasToCache
   * @description Adds a manga to the cache.
   * @param {string} sourceName - The source that the manga belongs to.
   * @param {Manga} manga - The manga to add.
   * @returns {boolean} Whether the manga was added to the cache.
   * @example
   * const manga = {
   * Name: "Manga Name",
   * MangaID: "{XXXXX-XXXXX-XXXXX-XXXXX}",
   * SourceID: "MangaDex",
   * Authors: ["Author 1", "Author 2"],
   * Synopsis: "Manga Synopsis",
   * Tags: ["Tag 1", "Tag 2"],
   * CoverURL: "https://mangadex.org/images/covers/manga_id.jpg",
   * Added: new Date(),
   * LastRead: new Date(),
   * Chapters: [],
   * };
   * NewMangaDB.addMangasToCache('MangaDex', manga);
   * // => true
   */
  static addMangasToCache(...mangas: FullManga[]): boolean {
    const cachedManga = MangaDatabase.get('CachedManga');
    if (!cachedManga) return false;
    mangas.forEach((manga) => {
      const source = cachedManga.Sources[manga.SourceID] || {};
      const cachedVariant = source[manga.MangaID];
      const isInLibrary = this.GetLibraryMangas(manga.SourceID).includes(
        manga.MangaID
      );

      // Set the .Added and .DateFetched properties automatically if they are not set already.
      // Added should only be done if the manga is in the library.

      if (isInLibrary) {
        if (!manga.Added) {
          manga.Added = cachedVariant?.Added ?? new Date();
        }

        if (!manga.LastRead) {
          manga.LastRead = cachedVariant?.LastRead ?? new Date();
        }
      }

      if (!manga.DateFetched) {
        manga.DateFetched = new Date();
      }

      // We do not have to check if the manga is already in the cache because
      // this allows us to overwrite manga - for example, if a manga is updated
      // in the source.
      source[manga.MangaID] = manga;
      cachedManga.Sources[manga.SourceID] = source;
    });

    MangaDatabase.set('CachedManga', cachedManga);
    return true;
  }

  /**
   * @name RemoveMangaFromCache
   * @description Removes a manga from the cache.
   * @param {string} sourceName - The source that the manga belongs to.
   * @param {string} mangaID - The ID of the manga.
   * @returns {boolean} Whether the manga was removed from the cache.
   * @example
   * NewMangaDB.RemoveMangaFromCache('MangaDex', '{XXXXX-XXXXX-XXXXX-XXXXX}');
   * // => true
   * @example
   * NewMangaDB.RemoveMangaFromCache('NonExistantSource', '{XXXXX-XXXXX-XXXXX-XXXXX}');
   * // => false
   * @example
   */
  static RemoveMangaFromCache(
    sourceName: string,
    ...mangaIDs: string[]
  ): boolean {
    const cachedManga = MangaDatabase.get('CachedManga');
    if (!cachedManga) return false;

    const source = cachedManga.Sources[sourceName];
    mangaIDs.forEach((mangaID) => {
      delete source[mangaID];
    });

    MangaDatabase.set('CachedManga', cachedManga);
    return true;
  }

  /**
   * @name GetCachedManga
   * @description Gets a manga from the cache.
   * @param {string} sourceName - The source that the manga belongs to.
   * @param {string} mangaID - The ID of the manga.
   * @returns {FullManga | undefined} The manga from the cache.
   * @example
   * const manga = NewMangaDB.GetCachedManga('MangaDex', '{XXXXX-XXXXX-XXXXX-XXXXX}');
   * if (manga) {
   * console.log(manga.Name);
   * }
   * // => "Manga Name"
   * @example
   * const manga = NewMangaDB.GetCachedManga('NonExistantSource', '{XXXXX-XXXXX-XXXXX-XXXXX}');
   * if (manga) {
   * console.log(manga.Name);
   * }
   * // => undefined
   */
  static GetCachedManga(
    sourceName: string,
    mangaID: string
  ): FullManga | false {
    const cachedManga = MangaDatabase.get('CachedManga');
    if (!cachedManga) return false;

    const source = cachedManga.Sources[sourceName];
    if (source) {
      return source[mangaID];
    }
    return false;
  }

  /**
   * @name GetCachedMangas
   * @description Gets all the manga from the cache.
   * @param {string} sourceName - The source that the manga belongs to.
   * @returns {FullManga[]} The manga from the cache.
   * @example
   * const manga = NewMangaDB.GetCachedMangas('MangaDex');
   * console.log(manga.length);
   * // => 10
   * @example
   * const manga = NewMangaDB.GetCachedMangas('NonExistantSource');
   * console.log(manga.length);
   * // => 0
   */
  static GetCachedMangas(sourceName: string): FullManga[] | false {
    const cachedManga = MangaDatabase.get('CachedManga');
    if (!cachedManga) return false;

    const source = cachedManga.Sources[sourceName];
    if (source) {
      return Object.values(source);
    }
    return [];
  }

  /**
   * @name GetAllCachedMangas
   * @description Gets all the manga from the cache; regardless of source.
   * @returns {FullManga[]} The manga from the cache.
   * @example
   * const manga = NewMangaDB.GetAllCachedMangas();
   * console.log(manga.length);
   * // => 150
   */
  static GetAllCachedMangas(): FullManga[] {
    const cachedManga = MangaDatabase.get('CachedManga');
    if (!cachedManga) return [];

    const sources = cachedManga.Sources;
    return Object.values(sources).flatMap((source) => Object.values(source));
  }
}

export default MangaDB;
