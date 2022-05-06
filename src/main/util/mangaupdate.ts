import log from 'electron-log';
import { BrowserWindow, ipcMain, Notification } from 'electron';
import MangaDB, { FullManga, LibraryManga } from './manga';

import MiscDB from './misc';
import SettingsDB from './settings';

import SourceHandler from '../sources/handler';
import SourceBase from '../sources/static/base';

export class MangaQueue {
  private queue: LibraryManga[];

  private notificationIcon?: string;

  private window: BrowserWindow | null;

  constructor(browserWindow: BrowserWindow | null, icon?: string) {
    this.queue = [];
    this.notificationIcon = icon;
    this.window = browserWindow;
  }

  public getQueue(): LibraryManga[] {
    return this.queue;
  }

  public get processed(): number {
    return this._processed;
  }

  public get queued(): number {
    return this._queuedManga;
  }

  public get processing(): boolean {
    return this._isProcessing;
  }

  private _isProcessing: boolean = false;

  private _processed: number = 0;

  // TODO: come up with a better name? should be the amount of manga in the queue prior to the last process
  private _queuedManga: number = 0;

  public async processQueue(): Promise<void> {
    // Pre-make bases for all sources
    log.info(`Beginning update cycle... (${this.queue.length} manga)`);
    this.window?.webContents.send('update-cycle-start', this.queue.length);

    const allUpdatedManga: FullManga[] = [];
    const queueSources: { [sourceID: string]: SourceBase } = {};
    this.queue.forEach((manga) => {
      if (!queueSources[manga.SourceID]) {
        queueSources[manga.SourceID] = SourceHandler.getSource(manga.SourceID);
      }
    });

    this._isProcessing = true;
    this._queuedManga = this.queue.length;
    this._processed = 0;

    const tn = Date.now();
    if (this._queuedManga >= 200)
      new Notification({
        title: 'Warning',
        body: 'Large amount of manga in queue could cause decreased application performance and increased battery usage.',
        icon: this.notificationIcon,
      }).show();

    log.warn(`tn to now: ${Date.now() - tn}ms`);
    // Process queue
    const allNewChapters: { [mangaID: string]: LibraryManga } = {};
    const allPreviousManga = await MangaDB.GetAllCachedMangas();
    const arrayOfPromises = Object.keys(queueSources).map((sourceID) => {
      const source = queueSources[sourceID];
      const mangaIDs = this.queue
        .filter((m) => m.SourceID === sourceID)
        .map((m) => m);

      return source
        .getMangas(
          mangaIDs.map((m) => m.MangaID),
          true
        )
        .then((mangas) => {
          return Promise.allSettled(
            mangas.flatMap(async (promisifiedManga) => {
              const manga = await promisifiedManga;
              this._processed++;
              this.window?.setProgressBar(this._processed / this._queuedManga);
              {
                // Any extra keys that the old manga has that the new manga doesn't have should be added.
                const oldManga = allPreviousManga.find(
                  (m) => m.MangaID === manga.MangaID
                );

                if (oldManga) {
                  (Object.keys(oldManga) as any[]).forEach((key) => {
                    // @ts-ignore - self explanatory maybe?
                    if (!manga[key]) manga[key] = oldManga[key];
                  });

                  // Last Read and Added should be updated.
                  manga.LastRead = oldManga.LastRead ?? manga.LastRead;
                  manga.Added = oldManga.Added ?? manga.Added;
                  manga.DateFetched = new Date();

                  log.info(
                    `Fetched ${manga.Name} from source ${source.getName()}.`
                  );
                  // Any new chapters should be added to the Object above.
                  if (manga.Chapters) {
                    if (oldManga.Chapters.length < manga.Chapters.length)
                      allNewChapters[manga.MangaID] = manga as LibraryManga;
                  }
                }
              }

              allUpdatedManga.push(manga);
              this.window?.webContents.send('manga-update', {
                manga,
                source: sourceID,
              });
            })
          );
        })
        .catch((err) => {
          log.error(err);
        });
    });

    const setArray = await Promise.allSettled(arrayOfPromises);
    setArray.forEach((e) => {
      if (e.status === 'rejected') log.error(e.reason);
    });

    const chapterKeys = Object.keys(allNewChapters);
    if (chapterKeys.length > 0) {
      const sortedMangas = Object.values(allNewChapters).sort(
        (a, b) => (a.LastRead?.getTime() ?? 0) - (b.LastRead?.getTime() ?? 0)
      );

      log.info(`Sorted Manga Length: ${sortedMangas.length}`);
      const manga = sortedMangas[0];
      const chapterNotif = new Notification({
        title: `New Chapter${sortedMangas.length > 1 ? 's' : ''}`,
        body:
          sortedMangas.length > 1
            ? `${manga.Name} and ${
                sortedMangas.length - 1
              } other manga have new chapters.`
            : `${manga.Name} has new chapters.`,
        actions: [
          {
            type: 'button',
            text: 'Open',
          },
        ],
        icon: this.notificationIcon,
      });

      chapterNotif.on('action', async (event, action) => {
        if (action === 0) {
          this.window?.webContents.send('manga-open', {
            source: manga.SourceID,
            manga: manga.MangaID,
          });
        }
      });
      chapterNotif.show();
    }

    log.warn('Adding to cache.');
    MangaDB.addMangasToCache(...allUpdatedManga);
    log.warn('Done adding to cache.');

    if (this.window) {
      this.window.setProgressBar(-1);
      this.window.flashFrame(true);
      setTimeout(() => {
        if (this.window) this.window.flashFrame(false);
      }, 1000);
    }

    this.queue.length = 0;
    this._isProcessing = false;
    this.window?.webContents.send('update-cycle-complete');
    log.info('Update cycle completed.');
  }

  public hasManga(manga: LibraryManga): boolean {
    if (!manga) return false;
    return !!this.queue.find(
      (foundManga) =>
        manga.MangaID === foundManga.MangaID &&
        manga.SourceID === foundManga.SourceID
    );
  }

  public addManga(manga: LibraryManga): void {
    if (!manga) return;
    if (!this.getQueue().find((m) => m.MangaID === manga.MangaID)) {
      this.queue.push(manga);
      return;
    }

    log.warn(`Manga ${manga.MangaID} already in queue.`);
    if (!manga.MangaID) return log.info(manga);
  }

  public removeManga(manga: LibraryManga): void {
    this.queue = this.queue.filter((m) => m !== manga);
  }

  public clearQueue(): void {
    this.queue = [];
  }

  public toArray(): LibraryManga[] {
    return this.queue;
  }
}

const mainAppMiscDBKey = 'suwariyomi_main';
export const init = (win: BrowserWindow | null, icon?: string) => {
  if (!MiscDB.get(mainAppMiscDBKey)) {
    MiscDB.set(mainAppMiscDBKey, {});
  }

  {
    const mainVariables = MiscDB.get(mainAppMiscDBKey) as Record<any, any>;
    if (!mainVariables.lastUpdated) {
      mainVariables.lastUpdated = new Date();
      MiscDB.set(mainAppMiscDBKey, mainVariables);
    }
  }

  const internalQueue = new MangaQueue(win, icon);
  const updateCheckInterval: NodeJS.Timer = setInterval(() => {
    const { updateFrequency, updateOngoingManga } =
      SettingsDB.getAllSettings().library ?? {};
    if (updateFrequency !== 'manual') {
      if (internalQueue.processing) return;
      const mainVariables = MiscDB.get(mainAppMiscDBKey) as Record<any, any>;
      const { lastUpdated } = mainVariables;
      const now = new Date();

      if (
        now.getTime() - lastUpdated.getTime() >
        Number(updateFrequency) * 1000 // Multiply by 1000 because it's in seconds.
      ) {
        mainVariables.lastUpdated = now;

        const mangasToUpdate = MangaDB.GetAllCachedMangas()
          .filter((x) =>
            MangaDB.GetLibraryMangas(x.SourceID).find((y) => y === x.MangaID)
          )
          .filter(
            (x) =>
              x.DateFetched === null ||
              (x.DateFetched?.getTime() ?? 0) + Number(updateFrequency) * 1000 <
                now.getTime()
          )
          .filter(
            (x) => !updateOngoingManga || x.Status === 'ongoing'
          ) as LibraryManga[];

        if (mangasToUpdate.length > 0 && !internalQueue.processing) {
          mangasToUpdate.forEach((manga) => {
            internalQueue.addManga(manga);
          });

          internalQueue.processQueue();
          MiscDB.set(mainAppMiscDBKey, mainVariables);
        }
      }
    } else if (updateFrequency === 'manual')
      return clearInterval(updateCheckInterval); // If settings are not loadede quite yet, wait until they are before clearing the interval.
  }, 1000);

  ipcMain.on('get-update-queue', (event) => {
    event.returnValue = internalQueue.toArray();
  });

  ipcMain.on('is-updating', (event, manga: LibraryManga) => {
    event.returnValue = internalQueue.hasManga(manga);
  });

  ipcMain.on('get-processed-total', (event) => {
    event.returnValue = internalQueue.processed;
  });

  ipcMain.on('is-busy', (event) => {
    event.returnValue = internalQueue.processing;
  });

  ipcMain.on('get-updating-sources', (e) => {
    return (e.returnValue = internalQueue
      .getQueue()
      .map((m) => m.SourceID)
      .filter((x, i, a) => a.indexOf(x) === i));
  });

  ipcMain.on('flush-update-queue', () => {
    internalQueue.clearQueue();
  });

  ipcMain.on('add-to-update-queue', (event, ...mangas: LibraryManga[]) => {
    mangas.flat(0).forEach((manga) => {
      internalQueue.addManga(manga);
    });
  });

  ipcMain.on('add-source-to-queue', (event, sourceID: string) => {
    const libraryMangas = MangaDB.GetLibraryMangas(sourceID);
    const mangas = MangaDB.GetAllCachedMangas().filter(
      (x) => x.SourceID === sourceID && libraryMangas.includes(x.MangaID)
    ) as LibraryManga[];

    mangas.forEach((manga) => {
      internalQueue.addManga(manga);
    });

    return (event.returnValue = true);
  });

  ipcMain.on('force-update-cycle', (event) => {
    event.returnValue = internalQueue.processing;
    if (!internalQueue.processing)
      internalQueue.processQueue().catch(log.error);
  });
};
