import { resolveArray, Chapter, Manga } from 'mangadex-full-api';
import SourceBase, {
  SearchFilters,
  SearchFilterFieldTypes,
} from '../static/base';
import {
  Manga as DatabaseManga,
  Chapter as DatabaseChapter,
} from '../../main/util/dbUtil';

type TagID = string;

type SortMethod =
  | 'title'
  | 'year'
  | 'createdAt'
  | 'updatedAt'
  | 'latestUploadedChapter'
  | 'followedCount'
  | 'relevance';
type SortOrder = 'asc' | 'desc';

type MangaDexFilters = SearchFilters & {
  sortOrderBy: SortMethod;
  sortOrderDirection: SortOrder;

  includedTags: TagID[];
  tagInclusivity: 'AND' | 'OR';

  excludedTags: TagID[];
  tagExclusivity: 'AND' | 'OR';

  targetDemographic: Array<'shounen' | 'shoujo' | 'seinen' | 'josei' | 'none'>;
  contentRating: Array<'safe' | 'suggestive' | 'erotica' | 'pornographic'>;
  originalLanguage: Array<'ko' | 'zh' | 'en'>;

  createdAfter?: string;
  updatedAfter?: string;
};

// This Shouldn't Be A Class: Part 2
export default class MangaDex extends SourceBase {
  constructor() {
    super();

    this.serialize = this.serialize.bind(this);
    this.serializeChapters = this.serializeChapters.bind(this);
    this.search = this.search.bind(this);
  }

  protected _sourceName: string = 'MangaDex';

  protected searchFilterFieldTypes: SearchFilterFieldTypes = {
    'Content Rating': {
      fieldType: 'checkbox',
      writeTo: 'contentRating',
      choices: [
        {
          display: 'Safe',
          value: 'safe',
        },
        {
          display: 'Suggestive',
          value: 'suggestive',
        },
        {
          display: 'Erotica',
          value: 'erotica',
        },
        {
          display: 'Pornographic',
          value: 'pornographic',
        },
      ],
    },
    'Original Language': {
      fieldType: 'checkbox',
      writeTo: 'originalLanguage',
      choices: [
        {
          display: 'Japanese (Manga)',
          value: 'ja',
        },
        {
          display: 'Chinese (Manhua)',
          value: 'zh',
        },
        {
          display: 'Korean (Manhwa)',
          value: 'ko',
        },
      ],
    },
    'Target Demographic': {
      fieldType: 'checkbox',
      writeTo: 'targetDemographic',
      choices: [
        {
          display: 'None',
          value: 'none',
        },
        {
          display: 'Shounen',
          value: 'shounen',
        },
        {
          display: 'Shoujo',
          value: 'shoujo',
        },
        {
          display: 'Seinen',
          value: 'seinen',
        },
        {
          display: 'Josei',
          value: 'josei',
        },
      ],
    },
    'Sort Order': {
      fieldType: 'select',
      writeTo: 'sortOrderBy',
      choices: [
        {
          label: 'Title',
          value: 'title',
        },
        {
          label: 'Year',
          value: 'year',
        },
        {
          label: 'Created At',
          value: 'createdAt',
        },
        {
          label: 'Updated At',
          value: 'updatedAt',
        },
        {
          label: 'Latest Uploaded Chapter',
          value: 'latestUploadedChapter',
        },
        {
          label: 'Followed Count',
          value: 'followedCount',
        },
        {
          label: 'Relevance',
          value: 'relevance',
        },
      ],
    },
    'Sort Order Direction': {
      fieldType: 'select',
      noDisplay: true,
      writeTo: 'sortOrderDirection',
      choices: [
        {
          label: 'Ascending',
          value: 'asc',
        },
        {
          label: 'Descending',
          value: 'desc',
        },
      ],
    },
  };

  protected searchFilters: MangaDexFilters = {
    query: '',
    results: 24,
    offset: 0,

    includedTags: [],
    tagInclusivity: 'AND',

    excludedTags: [],
    tagExclusivity: 'AND',

    contentRating: ['safe'],
    targetDemographic: [],
    originalLanguage: [],

    sortOrderBy: 'title',
    sortOrderDirection: 'desc',
  };

  public getName(): string {
    return this._sourceName;
  }

  public override setFilters(searchFilters: MangaDexFilters) {
    this.searchFilters = searchFilters;
  }

  public override getFilters(): MangaDexFilters {
    return { ...this.searchFilters };
  }

  public async serialize(mangaItem: Manga): Promise<DatabaseManga> {
    return {
      Name: mangaItem.localizedTitle.localString,
      MangaID: mangaItem.id,
      SourceID: this.getName(),
      Authors: null,
      Synopsis: mangaItem.localizedDescription.localString,
      Tags: mangaItem.tags.map((tag) => tag.localizedName.localString),
      CoverURL: (await mangaItem.getCovers())?.slice(-1)[0]?.image512,
      Added: null,
      LastRead: null,
      Chapters: null,
    };
  }

  public async getAuthors(mangaID: any): Promise<string[]> {
    const manga = await Manga.get(mangaID);
    return (await resolveArray(manga.authors)).map((x) => x.name);
  }

  public async serializeChapters(
    chapters: Chapter[]
  ): Promise<DatabaseChapter[]> {
    return Promise.all(
      chapters.map(async (chapter) => {
        return {
          ChapterID: chapter.id,
          Volume: chapter.volume,
          Chapter: chapter.chapter,
          ChapterTitle: chapter.title,
          PageCount: -1, // PageCount will be available when they attempt to start reading the chapter
          CurrentPage: -1,
        };
      })
    );
  }

  public async search(): Promise<Manga[]> {
    const {
      query: title,
      tagInclusivity: includedTagsMode,
      tagExclusivity: excludedTagsMode,
      includedTags,
      sortOrderBy,
      sortOrderDirection,
      excludedTags,
      contentRating,
      results: limit,
      originalLanguage,
      offset,
    } = this.searchFilters;
    return Manga.search({
      title,
      includedTagsMode,
      excludedTagsMode,
      order: {
        [sortOrderBy]: sortOrderDirection,
      },
      includedTags,
      excludedTags,
      contentRating,
      limit,
      originalLanguage,
      offset: offset * limit,
    });
  }
}
