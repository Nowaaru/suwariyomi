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
type SortMethod = {
  // [key in
  //   | 'title'
  //   | 'year'
  //   | 'createdAt'
  //   | 'updatedAt'
  //   | 'latestUploadedChapter'
  //   | 'followedCount'
  //   | 'relevance']: 'asc' | 'desc';
  title?: 'asc' | 'desc';
  year?: 'asc' | 'desc';
  createdAt?: 'asc' | 'desc';
  updatedAt?: 'asc' | 'desc';
  latestUploadedChapter?: 'asc' | 'desc';
  followedCount?: 'asc' | 'desc';
  relevance?: 'asc' | 'desc';
};

type MangaDexFilters = SearchFilters & {
  sortOrder: SortMethod;
  includedTags: TagID[];
  tagInclusivity: 'AND' | 'OR';

  excludedTags: TagID[];
  tagExclusivity: 'AND' | 'OR';

  targetDemographic: Array<'shounen' | 'shoujo' | 'seinen' | 'josei' | 'none'>;
  contentRating: Array<'safe' | 'suggestive' | 'erotica' | 'pornographic'>;

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
    'Content Rating': [
      {
        type: 'checkbox',
        display: 'safe',
        writeTo: 'contentRating',
        checked: true,
      },
      {
        type: 'checkbox',
        display: 'Suggestive',
        writeTo: 'contentRating',
        checked: true,
      },
      {
        type: 'checkbox',
        display: 'Erotica',
        writeTo: 'contentRating',
        checked: false,
      },
      {
        type: 'checkbox',
        display: 'Pornographic',
        writeTo: 'contentRating',
        checked: false,
      },
    ],
  };

  protected searchFilters: MangaDexFilters = {
    query: '',
    results: 24,
    offset: 0,

    includedTags: [],
    tagInclusivity: 'AND',

    excludedTags: [],
    tagExclusivity: 'AND',

    targetDemographic: ['shounen', 'shoujo', 'seinen', 'josei', 'none'],
    contentRating: ['safe'],
    sortOrder: {
      title: 'desc',
    },
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
      sortOrder: order,
      includedTags,
      excludedTags,
      contentRating,
      results: limit,
      offset,
    } = this.searchFilters;
    return Manga.search({
      title,
      includedTagsMode,
      excludedTagsMode,
      order,
      includedTags,
      excludedTags,
      contentRating,
      limit,
      offset: offset * limit,
    });
  }
}
