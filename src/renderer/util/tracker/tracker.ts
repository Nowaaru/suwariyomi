/* eslint-disable promise/always-return */
/* eslint-disable max-classes-per-file */
interface TrackingProps {
  mediaId: number;
  status?:
    | 'CURRENT'
    | 'PLANNING'
    | 'COMPLETED'
    | 'DROPPED'
    | 'PAUSED'
    | 'REPEATING';
}

interface AniListTrackingStatusProps extends TrackingProps {
  id: number;
  score?: number;
  scoreRaw?: number;
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
  mediaId: number;
  coverImage: {
    color: string | null;
    extraLarge: string | null;
    large: string | null;
    medium: string | null;
  };
  status: string | null;
  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
    userPreferred: string | null;
  };
  mediaListEntry: {
    id: number;
    status: string | null;
    score: number | null;
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
  };
};

abstract class TrackerBase {
  static getSupportedTrackers(): typeof supportedTrackers {
    return supportedTrackers;
  }

  abstract getName(): string;

  abstract getIcon(): string;

  abstract changeTrackingStatus(
    mangaID: string,
    trackingInfo: TrackingProps
  ): Promise<void>;

  abstract getMangaList(): Record<string, string>;

  abstract updateManga(
    opts: Required<AniListTrackingStatusProps>,
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
  getIcon(): string {
    return 'https://anilist.co/img/icons/favicon-32x32.png';
  }

  updateManga(
    opts: AniListTrackingStatusProps,
    toReturn: Array<keyof AniListTrackingStatusProps>
  ): Promise<Record<string, string | number | object>> {
    const accessToken = window.electron.auth.getAuthentication('anilist');
    const gqlQuery = `
            mutation {
              SaveMediaListEntry(${Object.keys(opts)
                .map((key) => `${key}: ${(opts as any)[key]}`)
                .join(', ')}) {
                ${toReturn.join('\n')}
              }
            }
          `;

    return fetch('https://graphql.anilist.co', {
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
        console.log(json);
        return json;
      })
      .catch(console.error);
  }

  getName(): string {
    return 'AniList';
  }

  async changeTrackingStatus(
    mangaID: string,
    trackingInfo: AniListTrackingStatusProps
  ): Promise<void> {
    if (!window.electron.auth.checkAuthenticated('anilist'))
      return Promise.reject(new Error('Not authenticated'));

    trackingInfo.mediaId = Number(mangaID);
    const typeDefinitions: Record<string, string> = {
      id: 'Int',
      mediaId: 'Int',
      status: 'MediaListStatus',
      score: 'Float',
      scoreRaw: 'Int',
      progress: 'Int',
      progressVolumes: 'Int',
      repeat: 'Int',
      priority: 'Int',
      private: 'Boolean',
      notes: 'String',
      hiddenFromStatusLists: 'Boolean',
      customLists: '[String]',
      advancedScores: '[Int]',
      startedAt: 'FuzzyDateInput',
      completedAt: 'FuzzyDateInput',
    };
    // Create argument strings
    const allMutationArguments = Object.keys(trackingInfo)
      .map((key) => {
        if (typeDefinitions[key]) return `${key}: ${typeDefinitions[key]}`;

        return undefined;
      })
      .filter(Boolean)
      .join(', ');

    const allEntryArguments = Object.keys(trackingInfo).map(
      (key) => `${key}: $${key}`
    );
    const graphqlRequest = `
            mutation (${allMutationArguments}) {
              SaveMediaListEntry(${allEntryArguments}) {
                id
              }
            }
          `;

    return fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: graphqlRequest,
        variables: trackingInfo,
      }),
    })
      .then((response) =>
        // eslint-disable-next-line promise/no-nesting
        response
          .json()
          .then((data) => (response.ok ? data : Promise.reject(data)))
      )
      .then((json) => {
        console.log(json);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  getMangaList(): Record<string, string> {
    throw new Error('Method not implemented.');
  }

  searchMangas(searchQuery: string): Promise<{
    data: {
      Page: {
        media: Media[];
      };
    };
  }> {
    const queryString = `
            query($search: String) {
              Page {
                media(search: $search, type: MANGA) {
                  mediaId: id
                  title {
                    romaji
                  }
                  description(asHtml: false)
                  status
                  chapters
                  volumes
                  coverImage {
                    extraLarge
                    large
                    medium
                    color
                  }
                  mediaListEntry {
                    id
                    progress
                    progressVolumes
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
  getIcon(): string {
    throw new Error('Method not implemented.');
  }

  updateManga(opts: TrackingProps): Promise<Record<string, any>> {
    throw new Error('Method not implemented.');
  }

  getName(): string {
    throw new Error('Method not implemented.');
  }

  changeTrackingStatus(
    mangaID: string,
    trackingInfo: Required<TrackingProps>
  ): Promise<void> {
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
