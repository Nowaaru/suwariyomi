import Enmap from 'enmap';
import { app } from 'electron';

export type ReadDatabaseValue = {
  [chapterID: string]: {
    isBookmarked: boolean;
    pageCount: number;
    currentPage: number;
    lastRead: Date | undefined;
    timeElapsed: number;
    mangaid?: string;
  };
};
const ReadDatabase = new Enmap<
  string, // Source ID
  ReadDatabaseValue
>({
  name: 'read',
  dataDir: app.getPath('userData'),
});

export default class ReadDB {
  public static async flush(): Promise<void> {
    ReadDatabase.deleteAll();
  }

  public static async get(
    sourceID: string
  ): Promise<ReadDatabaseValue | undefined> {
    return ReadDatabase.get(sourceID);
  }

  public static async set(
    sourceID: string,
    chapterID: string,
    pageCount: number,
    currentPage: number,
    lastRead: Date | undefined,
    timeElapsed: number,
    isBookmarked: boolean,
    mangaid?: string
  ): Promise<void> {
    const read = await ReadDB.get(sourceID);
    if (!read) {
      ReadDatabase.set(sourceID, {
        [chapterID]: {
          isBookmarked,
          pageCount,
          currentPage,
          lastRead,
          timeElapsed,
          mangaid,
        },
      });
    } else {
      read[chapterID] = {
        pageCount,
        currentPage,
        lastRead,
        isBookmarked,
        timeElapsed,
        mangaid,
      };
      ReadDatabase.set(sourceID, read);
    }
  }

  public static async deleteEntry(
    sourceID: string,
    chapterID: string
  ): Promise<void> {
    const read = await ReadDB.get(sourceID);
    if (read) {
      delete read[chapterID];
      ReadDatabase.set(sourceID, read);
    }
  }

  public static async deleteSource(sourceID: string): Promise<void> {
    ReadDatabase.delete(sourceID);
  }
}
