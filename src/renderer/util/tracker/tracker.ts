/* eslint-disable promise/always-return */
/* eslint-disable max-classes-per-file */
export interface TrackingProps {
  mediaId: number;
  status?:
    | 'CURRENT'
    | 'PLANNING'
    | 'COMPLETED'
    | 'DROPPED'
    | 'PAUSED'
    | 'REPEATING';
}

interface AniListTrackingProps extends Pick<TrackingProps, 'status'> {
  id: number;
  score?: number;
  progress?: number;
  progressVolumes?: number;
  repeat?: number;
  priority?: number;
  private?: boolean;
  notes?: string;
  hiddenFromStatusLists?: boolean;
  customLists?: string[];
  advancedScores?: number[];
  startedAt?: {
    year: number;
    month: number;
    day: number;
  };
  completedAt?: {
    year: number;
    month: number;
    day: number;
  };
}

export const supportedTrackers = ['AniList', 'MyAnimeList'] as const;
export type SupportedTrackers = typeof supportedTrackers[number];

export type Media = {
  description: string | null;
  chapters: number | null;
  volumes: number | null;
  mediaId: number | null;
  covers: {
    color: string | null;
    extraLarge: string | null;
    large: string | null;
    medium: string | null;
  };
  publicationStatus: string | null;
  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
    userPreferred: string | null;
  } | null;
  userTrackedInfo: {
    listId: number;
    score: number | null;
    readingStatus: string | null;
    progress: number | null;
    progressVolumes: number | null;
    startedAt: {
      year: number;
      month: number;
      day: number;
    };
    completedAt: {
      year: number;
      month: number;
      day: number;
    };
    repeat: number | null;
  } | null;
};

abstract class TrackerBase {
  static getSupportedTrackers(): typeof supportedTrackers {
    return supportedTrackers;
  }

  abstract is100Scored(): boolean;

  abstract getName(): string;

  abstract getIcon(): string;

  abstract getMangaList(): Record<string, string>;

  abstract updateManga(
    opts: AniListTrackingProps,
    toReturn: any
  ): Promise<Record<string, any>>;

  abstract searchMangas(searchQuery: string): Promise<{
    data: {
      Page: {
        media: Media[];
      };
    };
  }>;
}

class AniListTracker extends TrackerBase {
  is100Scored(): boolean {
    return true;
  }

  getIcon(): string {
    return 'https://anilist.co/img/icons/favicon-32x32.png';
  }

  updateManga(
    opts: AniListTrackingProps,
    toReturn: Array<keyof AniListTrackingProps | string>
  ): Promise<Record<string, string | number | object>> {
    const accessToken = window.electron.auth.getAuthentication('anilist');
    const gqlQuery = `
            mutation {
              userTrackedInfo: SaveMediaListEntry(${Object.keys(opts)
                .map(
                  (key) =>
                    `${key}: ${
                      typeof (opts as any)[key] === 'object'
                        ? JSON.stringify((opts as any)[key]).replace(
                            /"([^"]+)":/g,
                            '$1:'
                          )
                        : (opts as any)[key]
                    }`
                )
                .join(', ')}) ${
      toReturn.length > 0
        ? `{
                ${toReturn.join('\n')}
           }`
        : ''
    }

            }
          `;

    return new Promise((resolve, reject) => {
      fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          query: gqlQuery,
          variables: {},
        }),
      })
        .then((res) => res.json())
        .then((json) => {
          if (!json?.data || json.data.errors) {
            return reject(json);
          } else return resolve(json);
        })
        .catch(reject);
    });
  }

  getName(): string {
    return 'AniList';
  }

  getMangaList(): Record<string, string> {
    throw new Error('Method not implemented.');
  }

  searchMangas(searchQuery: string | number): Promise<{
    data: {
      Page: {
        media: Media[];
      };
    };
  }> {
    const isNumber = Number.isInteger(Number(searchQuery));
    const queryString = `
            query($${isNumber ? 'id' : 'search'}: ${
      isNumber ? 'Int' : 'String'
    }) {
              Page {
                media(search: $search, type: MANGA) {
                  mediaId: id
                  title {
                    romaji
                  }
                  description(asHtml: false)
                  publicationStatus: status
                  chapters
                  volumes
                  covers: coverImage  {
                    extraLarge
                    large
                    medium
                  }
                  userTrackedInfo: mediaListEntry {
                    listId: id
                    readingStatus: status
                    progress
                    progressVolumes
                    score: score(format: POINT_10)
                    startedAt {
                      year
                      month
                      day
                    }
                    completedAt {
                      year
                      month
                      day
                    }
                  }
                }
              }
            }
          `;

    return fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${window.electron.auth.getAuthentication(
          'anilist'
        )}`,
      },
      body: JSON.stringify({
        query: queryString,
        variables: {
          search: searchQuery,
        },
      }),
    })
      .then((res) => res.json())
      .catch(console.error);
  }
}

class MyAnimeListTracker extends TrackerBase {
  is100Scored(): boolean {
    return false;
  }

  updateManga(
    opts: AniListTrackingProps,
    toReturn: any
  ): Promise<Record<string, any>> {
    throw new Error('Method not implemented.');
  }

  getIcon(): string {
    throw new Error('Method not implemented.');
  }

  getName(): string {
    throw new Error('Method not implemented.');
  }

  getMangaList(): Record<string, string> {
    throw new Error('Method not implemented.');
  }

  searchMangas(): Promise<{
    data: {
      Page: {
        media: Media[];
      };
    };
  }> {
    throw new Error('Method not implemented.');
  }
}
export const getTracker = (name: typeof supportedTrackers[number]) => {
  switch (name.toLowerCase()) {
    case 'anilist':
      return AniListTracker;
    case 'myanimelist':
      return MyAnimeListTracker;
    default:
      throw new Error(`Unknown tracker: ${name}`);
  }
};
