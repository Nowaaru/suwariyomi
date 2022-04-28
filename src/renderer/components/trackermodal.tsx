import { Button, DialogProps, TextField } from '@mui/material';
import { css, StyleSheet } from 'aphrodite';
import { clamp } from 'lodash';

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
      background: '#FFFFFF',
      ':hover': {
        background: '#DF2935',
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
});
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
  if (!libraryManga || !searchModalData) return null;
  return (
    <Dialog
      actions={[
        <Button
          key="clear"
          onClick={() => {
            if (!searchModalData?.tracker) return;
            if (libraryManga?.Tracking?.[searchModalData.tracker])
              delete libraryManga.Tracking[searchModalData.tracker];

            window.electron.library.addMangaToCache(
              libraryManga.SourceID,
              libraryManga
            );

            onClose();
          }}
          sx={{
            color: '#DF2935',
            ':hover': { backgroundColor: '#DF293511' },
          }}
          className={css(styles.interactionButton)}
        >
          Clear.
        </Button>,
        <Button
          key="close"
          onClick={() => onClose()}
          className={css(styles.interactionButton)}
          sx={{
            color: '#DF2935',
            ':hover': { backgroundColor: '#DF293511' },
          }}
        >
          Close
        </Button>,
      ]}
      className={css(styles.trackerMangaDialog)}
      title={`${searchModalData?.tracker} Tracking for ${libraryManga.Name}`}
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
              onClick={() => {
                if (!searchModalData?.tracker) return;
                if (!x.userTrackedInfo) return;

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
                } = x.userTrackedInfo;

                const {
                  day: startedDay,
                  month: startedMonth,
                  year: startedYear,
                } = startedAt;

                const {
                  day: finishedDay,
                  month: finishedMonth,
                  year: finishedYear,
                } = completedAt;

                Tracking[searchModalData.tracker] = {
                  progress,
                  progressVolumes,
                  score,
                  readingStatus,
                  publicationStatus: x.publicationStatus,
                  title: x.title,
                  id: x.userTrackedInfo.listId,
                  listId: x.mediaId,
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
                window.electron.library.addMangaToCache(
                  libraryManga.SourceID,
                  libraryManga
                );

                onClose();
              }}
            />
          );
        })}
      </div>
      {(() => {
        if (!searchModalData?.tracker) return null;
        const currentTracker = libraryManga.Tracking[searchModalData.tracker];

        if (!currentTracker) return null;
        if (!currentTracker.id) return null;

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
                  current: 'Reading',
                  completed: 'Completed',
                  paused: 'Paused',
                  dropped: 'Dropped',
                  planning: 'Planning',
                  rereading: 'Rereading',
                }}
                defaultValue={
                  currentTracker.readingStatus?.toLowerCase() ?? 'current'
                }
                onChange={(e) => {
                  const newStatus = e.target.value;
                  currentTracker.readingStatus = newStatus;

                  window.electron.library.addMangaToCache(
                    libraryManga.SourceID,
                    libraryManga
                  );

                  trackerInstance
                    .updateManga(
                      {
                        id: currentTracker.id as number,
                        status:
                          newStatus.toUpperCase() as unknown as Required<TrackingProps>['status'],
                      },
                      ['id', 'status']
                    )
                    .catch(onError);
                }}
              />
              <TextField
                label="Chapter Progress"
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
                        id: currentTracker.id as number,
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
                label="Score"
                defaultValue={currentTracker.score}
                onChange={(e) => {
                  if (e.target.value.match(/[^0-9.]|(\.$)/g)) return;
                  const newScore = clamp(
                    Number(Number(e.target.value).toFixed(1)),
                    0,
                    10
                  );

                  const is100Scale = trackerInstance.is100Scored();
                  let scoreKey;

                  // Special cases where trackers might use a different scoring key.
                  switch (trackerInstance.getName()) {
                    case 'AniList':
                      scoreKey = 'scoreRaw';
                      break;
                    default:
                      scoreKey = 'score';
                  }

                  currentTracker.score = newScore;
                  window.electron.library.addMangaToCache(
                    libraryManga.SourceID,
                    libraryManga
                  );

                  trackerInstance.updateManga(
                    {
                      id: currentTracker.id as number,
                      [scoreKey]: newScore * (is100Scale ? 10 : 1),
                    },
                    ['id']
                  );
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
                label="Started At"
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
                        id: currentTracker.id as number,
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

                        window.electron.library.addMangaToCache(
                          libraryManga.SourceID,
                          libraryManga
                        );
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
                label="Completed At"
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
                        id: currentTracker.id as number,
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

                        window.electron.library.addMangaToCache(
                          libraryManga.SourceID,
                          libraryManga
                        );
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
