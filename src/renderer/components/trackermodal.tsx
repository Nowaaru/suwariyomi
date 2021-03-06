import { Button, DialogProps } from '@mui/material';
import { css, StyleSheet } from 'aphrodite';
import { clamp } from 'lodash';

import Theme from '../../main/util/theme';
import { useTranslation } from '../../shared/intl';

import {
  Media,
  SupportedTrackers,
  getTracker,
  TrackingProps,
} from '../util/tracker/tracker';
import type { LibraryManga, MangaTrackingData } from '../../main/util/manga';

import TrackerItem from './trackeritem';
import Dialog from './dialog';
import Select from './select';
import TextField from './textfield';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const themeColors = currentTheme.getColors();
const componentStyle = currentTheme.getComponentStyle('trackermodal');

const styles = StyleSheet.create({
  trackerMangaDialog: {},

  trackerMangaDialogContentInner: {
    height: '50vh',
    marginBottom: '16px',
    overflowY: 'auto',
    overflowX: 'hidden',
    '::-webkit-scrollbar': {
      width: '4px',
    },
    '::-webkit-scrollbar-thumb': {
      background: themeColors.white,
      ':hover': {
        background: themeColors.accent,
      },
    },
  },

  trackerMangaDialogContentInnerItem: {},

  viewMangaDialogContentStats: {},

  viewMangaDialogContentStatsItemContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '8px',
  },

  interactionButton: {
    padding: '8px 12px',
    borderRadius: '24px',
    fontSize: '1em',
    width: '100%',
    fontWeight: 'bold',
    transition:
      'letter-spacing 0.5s ease-in-out, background-color 0.3s ease-in-out, width 0.3s ease-in-out',
  },

  ...componentStyle,
}) as any;
const compileDateFromObject = (date: {
  year: number;
  month: number;
  day: number;
}) => new Date(`${date.year}-${date.month}-${date.day}T00:00:00.000`);

const TrackerModal = (
  props: DialogProps & {
    onClose?: () => void;
    onError?: (error: Error) => void;
    libraryManga?: LibraryManga;
    searchModalData: {
      media: Media[];
      tracker: SupportedTrackers;
    } | null;
  }
) => {
  const { libraryManga, searchModalData, onError, onClose = () => {} } = props;
  const { t } = useTranslation();
  if (!libraryManga || !searchModalData) return null;

  const lA1 = `${themeColors.accent.substring(0, 7)}11`;
  return (
    <Dialog
      actions={[
        <Button
          key="clear"
          onClick={() => {
            if (!searchModalData?.tracker) return;
            if (libraryManga?.Tracking?.[searchModalData.tracker])
              delete libraryManga.Tracking[searchModalData.tracker];

            window.electron.library.addMangasToCache(libraryManga);
            onClose();
          }}
          sx={{
            color: themeColors.accent,
            ':hover': { backgroundColor: lA1 },
          }}
          className={css(styles.interactionButton)}
        >
          {t('clear')}
        </Button>,
        <Button
          key="close"
          onClick={() => onClose()}
          className={css(styles.interactionButton)}
          sx={{
            color: themeColors.accent,
            ':hover': { backgroundColor: lA1 },
          }}
        >
          {t('close')}
        </Button>,
      ]}
      className={css(styles.trackerMangaDialog)}
      title={t('trackermodal_title', {
        tracker: getTracker(searchModalData.tracker).name,
        mangaTitle: libraryManga.Name,
      })}
      open={!!searchModalData}
      onClose={() => onClose}
    >
      <div className={css(styles.trackerMangaDialogContentInner)}>
        {searchModalData?.media?.map((x) => {
          if (!x.mediaId) return null;
          return (
            <TrackerItem
              chosen={
                libraryManga.Tracking?.[searchModalData.tracker]?.listId ===
                x.mediaId
              }
              media={x}
              key={x.mediaId}
              id={x.mediaId}
              onClick={async () => {
                if (!searchModalData?.tracker)
                  return window.electron.log.info(t('trackermodal_error_tf'));
                if (!x.mediaId)
                  return window.electron.log.info(t('trackermodal_error_mid'));
                // If there's no userTrackedInfo, that means that the user does not have this on their list.

                const readChapters = window.electron.read.get(
                  libraryManga.SourceID
                );
                const highestChapter = libraryManga.Chapters.reduce(
                  (acc, curr) => {
                    const readVar = readChapters[curr.ChapterID];
                    if (readVar && readVar.currentPage >= readVar.pageCount) {
                      return curr.Chapter;
                    }

                    return acc;
                  },
                  0
                );

                const TrackerClass = getTracker(searchModalData.tracker);
                if (!TrackerClass) return;

                const tracker = new TrackerClass();
                await tracker
                  .updateManga(
                    {
                      mediaId: x.mediaId,
                      status:
                        !x.userTrackedInfo || !x.userTrackedInfo.readingStatus
                          ? 'CURRENT'
                          : (x.userTrackedInfo.readingStatus as Exclude<
                              Required<MangaTrackingData['readingStatus']>,
                              null
                            >),
                    },
                    ['id', 'status', 'progress']
                  )
                  .then(async (res) => {
                    const { data } = res ?? {};
                    if (!data) return;
                    if (!data?.userTrackedInfo?.id) return;

                    if (
                      (data.userTrackedInfo.progress ?? 0) <= highestChapter
                    ) {
                      try {
                        const mainData = await tracker.updateManga(
                          {
                            progress: highestChapter,
                            mediaId: x.mediaId as number,
                          },
                          ['progress']
                        );

                        if (mainData?.res?.progress) {
                          data.progress = mainData.progress;
                        }
                      } catch (e) {
                        window.electron.log.error(e);
                      }
                    }

                    Object.assign(x.userTrackedInfo ?? {}, {
                      listId: data.userTrackedInfo.id,
                      progress: data.userTrackedInfo.progress,
                      readingStatus: data.userTrackedInfo.status,
                    });
                  })
                  .catch((error) => {
                    onError?.(error);
                  });

                const {
                  Tracking = {
                    AniList: null,
                    MyAnimeList: null,
                  },
                }: {
                  Tracking: Record<SupportedTrackers, MangaTrackingData | null>;
                } = libraryManga;

                const {
                  startedAt,
                  completedAt,
                  progress,
                  progressVolumes,
                  readingStatus,
                  score,
                } = x.userTrackedInfo ?? {};

                const {
                  day: startedDay,
                  month: startedMonth,
                  year: startedYear,
                } = startedAt ?? {};

                const {
                  day: finishedDay,
                  month: finishedMonth,
                  year: finishedYear,
                } = completedAt ?? {};

                Tracking[searchModalData.tracker] = {
                  progress,
                  progressVolumes,
                  score,
                  readingStatus,
                  publicationStatus: x.publicationStatus,
                  title: x.title,
                  id: x.mediaId,
                  listId: x.userTrackedInfo?.listId,
                  startedAt:
                    startedAt && startedDay && startedMonth && startedYear
                      ? new Date(startedYear, startedMonth - 1, startedDay)
                      : null,
                  completedAt:
                    completedAt && finishedDay && finishedMonth && finishedYear
                      ? new Date(finishedYear, finishedMonth - 1, finishedDay)
                      : null,
                } as MangaTrackingData;

                libraryManga.Tracking = Tracking;
                window.electron.library.addMangasToCache(libraryManga);
                onClose();
              }}
            />
          );
        })}
      </div>
      {(() => {
        if (!searchModalData?.tracker) return null;
        const currentTracker = libraryManga.Tracking?.[searchModalData.tracker];

        if (!currentTracker) return null;
        if (!currentTracker.listId) return null;

        const currentDateStartedAt = currentTracker?.startedAt;
        const currentDateFinishedAt = currentTracker?.completedAt;
        const TrackerClass = getTracker(searchModalData.tracker);
        const trackerInstance = new TrackerClass();

        return (
          <div className={css(styles.viewMangaDialogContentStats)}>
            <div
              className={css(styles.viewMangaDialogContentStatsItemContainer)}
            >
              <Select
                values={{
                  current: t('reading'),
                  completed: t('completed'),
                  paused: t('paused'),
                  dropped: t('dropped'),
                  planning: t('planning'),
                  rereading: t('rereading'),
                }}
                defaultValue={
                  currentTracker.readingStatus?.toLowerCase() ?? 'current'
                }
                onChange={(e) => {
                  const newStatus = e.target.value;
                  currentTracker.readingStatus =
                    newStatus as Required<TrackingProps>['status'];

                  window.electron.library.addMangasToCache(libraryManga);
                  trackerInstance
                    .updateManga(
                      {
                        id: currentTracker.listId as number,
                        status:
                          newStatus.toUpperCase() as unknown as Required<TrackingProps>['status'],
                      },
                      ['status']
                    )
                    .then((res) => {
                      if (!res?.data?.userTrackedInfo?.status) return;
                      currentTracker.readingStatus =
                        res.data.userTrackedInfo.status;
                    })
                    .catch(onError);
                }}
              />
              <TextField
                label={t('chapterprogress')}
                defaultValue={currentTracker.progress}
                InputLabelProps={{
                  shrink: true,
                }}
                onBlur={(e) => {
                  const newProgress = Number(e.target.value.replace(/\D/g, ''));

                  // We instead set currentTracker.progress to the return value of updateManga in case the user enters a non-number.
                  // The server (should) return the correct progress value.
                  trackerInstance
                    .updateManga(
                      {
                        id: currentTracker.listId as number,
                        progress: newProgress,
                      },
                      ['progress']
                    )
                    .then((res) => {
                      currentTracker.progress = res.data.progress;
                      return true;
                    })
                    .catch(onError);
                }}
              />
              <TextField
                label={t('score')}
                defaultValue={currentTracker.score}
                onChange={(e) => {
                  if (e.target.value.match(/[^0-9.]|(\.$)/g)) return;
                  const newScore = clamp(
                    Number(Number(e.target.value).toFixed(1)),
                    0,
                    10
                  );

                  const is100Scale = trackerInstance.is100Scored();
                  let scoreKey: string;

                  // Special cases where trackers might use a different scoring key.
                  switch (trackerInstance.getName()) {
                    case 'AniList':
                      scoreKey = 'scoreRaw';
                      break;
                    default:
                      scoreKey = 'score';
                  }

                  currentTracker.score = newScore;
                  window.electron.library.addMangasToCache(libraryManga);
                  trackerInstance
                    .updateManga(
                      {
                        id: currentTracker.listId as number,
                        [scoreKey]: newScore * (is100Scale ? 10 : 1),
                      },
                      ['id', 'score']
                    )
                    .then((res) => {
                      if (!res.data[scoreKey]) return;
                      currentTracker.score = res.data[scoreKey];
                    })
                    .catch(onError);
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </div>
            <div
              className={css(styles.viewMangaDialogContentStatsItemContainer)}
            >
              <TextField
                type="date"
                label={t('startedat')}
                defaultValue={
                  currentDateStartedAt
                    ? currentDateStartedAt.toISOString().split('T')[0]
                    : undefined
                }
                onBlur={(e) => {
                  const newDate = new Date(`${e.target.value}T00:00:00.000`);
                  trackerInstance
                    .updateManga(
                      {
                        id: currentTracker.listId as number,
                        status:
                          currentTracker.readingStatus?.toUpperCase() as unknown as Required<TrackingProps>['status'],
                        startedAt: {
                          day: newDate.getDate(),
                          month: newDate.getMonth() + 1,
                          year: newDate.getFullYear(),
                        },
                      },
                      [
                        trackerInstance.getName() === 'AniList' // Special case for AniList because GraphQL is agonizing dreadful pain
                          ? `startedAt { year month day }`
                          : `startedAt`,
                      ]
                    )
                    .then((res: Record<string, any>) => {
                      if (res.data?.userTrackedInfo) {
                        currentTracker.startedAt = compileDateFromObject(
                          res.data.userTrackedInfo.startedAt
                        );

                        window.electron.library.addMangasToCache(libraryManga);
                      }
                      return true;
                    })
                    .catch(onError);
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                type="date"
                label={t('completedat')}
                defaultValue={
                  currentDateFinishedAt
                    ? currentDateFinishedAt.toISOString().split('T')[0]
                    : undefined
                }
                onBlur={(e) => {
                  const newDate = new Date(`${e.target.value}T00:00:00.000`);
                  trackerInstance
                    .updateManga(
                      {
                        id: currentTracker.listId as number,
                        status:
                          currentTracker.readingStatus?.toUpperCase() as unknown as Required<TrackingProps>['status'],
                        completedAt: {
                          day: newDate.getDate(),
                          month: newDate.getMonth() + 1,
                          year: newDate.getFullYear(),
                        },
                      },
                      [`startedAt { year month day }`]
                    )
                    .then((res: Record<string, any>) => {
                      if (res.data?.userTrackedInfo) {
                        currentTracker.completedAt = compileDateFromObject(
                          res.data.userTrackedInfo.startedAt
                        );

                        window.electron.library.addMangasToCache(libraryManga);
                      }
                      return true;
                    })
                    .catch(onError);
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </div>
          </div>
        );
      })()}
    </Dialog>
  );
};

TrackerModal.defaultProps = {
  onClose: () => {},
  onError: () => {},
  libraryManga: null,
};

export default TrackerModal;
