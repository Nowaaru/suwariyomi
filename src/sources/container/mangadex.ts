import {
  resolveArray,
  Chapter,
  Manga,
  setGlobalLocale,
} from 'mangadex-full-api';
import SourceBase, {
  SearchFilters,
  SearchFilterFieldTypes,
} from '../static/base';
import {
  Manga as DatabaseManga,
  Chapter as DatabaseChapter,
  FullManga,
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
    this.getManga = this.getManga.bind(this);

    this.Tags.then((tags) => {
      this.searchFilterFieldTypes['Included Tags'] = {
        fieldType: 'checkbox3',
        writeTo: 'includedTags',
        disallowedWriteTo: 'excludedTags',
        accordion: true,
        choices: tags.map((tag) => ({
          display: tag.tagName,
          value: tag.tagID,
        })),
      };
      return true;
    }).catch((err) => {
      console.error(err);
    });
  }

  protected _locale: string = 'en';

  protected _locales: { id: string; name: string }[] = [
    { id: 'en', name: 'English' },
    { id: 'zh', name: 'Chinese' },
    { id: 'ko', name: 'Korean' },
    { id: 'ja', name: 'Japanese' },
    { id: 'fr', name: 'French' },
    { id: 'de', name: 'German' },
    { id: 'es', name: 'Spanish' },
    { id: 'it', name: 'Italian' },
    { id: 'pt', name: 'Portuguese' },
    { id: 'ru', name: 'Russian' },
    { id: 'tr', name: 'Turkish' },
    { id: 'vi', name: 'Vietnamese' },
    { id: 'th', name: 'Thai' },
    { id: 'id', name: 'Indonesian' },
    { id: 'ms', name: 'Malay' },
    { id: 'nl', name: 'Dutch' },
    { id: 'pl', name: 'Polish' },
    { id: 'ar', name: 'Arabic' },
    { id: 'hi', name: 'Hindi' },
    { id: 'fa', name: 'Persian' },
    { id: 'he', name: 'Hebrew' },
    { id: 'ur', name: 'Urdu' },
    { id: 'am', name: 'Amharic' },
    { id: 'bn', name: 'Bengali' },
    { id: 'my', name: 'Burmese' },
    { id: 'tl', name: 'Tagalog' },
    { id: 'ta', name: 'Tamil' },
    { id: 'te', name: 'Telugu' },
    { id: 'ml', name: 'Malayalam' },
    { id: 'kn', name: 'Kannada' },
    { id: 'si', name: 'Sinhala' },
  ];

  public override setLocale(locale: string): void {
    if (this._locales.find((l) => l.id === locale))
      throw new Error(`Locale ${locale} is not supported by ${this.getName()}`);

    setGlobalLocale(locale);
    this._locale = locale;
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

  protected Tags: Promise<{ tagName: string; tagID: string }[]> =
    Manga.getAllTags().then((Tags) =>
      Tags.map((Tag) => ({ tagName: Tag.name, tagID: Tag.id }))
    );

  public getName(): string {
    return this._sourceName;
  }

  public override setFilters(searchFilters: MangaDexFilters) {
    this.searchFilters = searchFilters;
  }

  public override getFilters(): MangaDexFilters {
    return { ...this.searchFilters };
  }

  public async getManga(mangaID: string): Promise<FullManga> {
    return Manga.get(mangaID).then(
      (mangaObject) => this.serialize(mangaObject, true) as unknown as FullManga
    );
  }

  public async serialize(
    mangaItem: Manga,
    doFull?: boolean
  ): Promise<DatabaseManga> {
    return {
      Name: mangaItem.localizedTitle.localString,
      MangaID: mangaItem.id,
      SourceID: this.getName(),
      Authors: doFull ? await this.getAuthors(mangaItem.id) : undefined,
      Synopsis: mangaItem.localizedDescription.localString,
      Tags: mangaItem.tags.map((tag) => tag.localizedName.localString),
      CoverURL: (await mangaItem.getCovers())?.slice(-1)[0]?.image512,
      Added: undefined,
      LastRead: undefined,
      Chapters: doFull
        ? await this.serializeChapters(await mangaItem.getFeed())
        : undefined,
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
          Groups: (await resolveArray(chapter.groups)).map(
            (group) => group.name
          ),
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
