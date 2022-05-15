import type { Manga, Chapter, FullManga } from '../../util/manga';

export type SearchFilters = {
  query: string;
  results: number;
  offset: number;
};

type SearchFilterFieldBase = {
  noDisplay?: boolean;
  accordion?: boolean;
  writeTo: string;
};

export type Checkable = {
  display: string;
  value: string;
};

export type Selectable = {
  label: string;
  value: string;
};

export type SearchFilterFieldTypeCheckbox = SearchFilterFieldBase & {
  fieldType: 'checkbox';
  choices: Checkable[];
};

export type SearchFilterFieldTypeCheckbox3 = SearchFilterFieldBase & {
  fieldType: 'checkbox3';
  // The field to write to when the "disallowed" state is enabled
  disallowedWriteTo: string;
  choices: Checkable[];
};

export type SearchFilterFieldTypeSelect = SearchFilterFieldBase & {
  fieldType: 'select';
  choices: Selectable[];
};

export type SearchFilterFieldTypeRadio = SearchFilterFieldBase & {
  fieldType: 'radio';
  isHorizontal?: boolean;
  choices: Selectable[];
};

export type SearchFilterFieldTypes = {
  [categoryName: string]:
    | SearchFilterFieldTypeCheckbox
    | SearchFilterFieldTypeCheckbox3
    | SearchFilterFieldTypeSelect
    | SearchFilterFieldTypeRadio;
};

export default abstract class SourceBase {
  protected abstract _sourceName: string;

  public _metadata: {
    isNSFW: boolean;
  } = {
    isNSFW: false,
  };

  public getName(): typeof SourceBase.prototype._sourceName {
    return this._sourceName;
  }

  protected _icon: string = '';

  public getIcon(): string {
    return this._icon;
  }

  protected _canDownload: boolean = true;

  public get canDownload(): boolean {
    return this._canDownload;
  }

  public download: () => Promise<boolean> = async () => {
    return false;
  };

  public async getItemCount(): Promise<number> {
    return 0;
  }

  public abstract IDFromURL(
    url: string,
    search?: 'chapter' | 'manga'
  ): Promise<string>;

  protected abstract Tags: Promise<
    {
      tagName: string;
      tagID: string;
    }[]
  >;

  public abstract tagColours: { [tagName: string]: string };

  public abstract tagColors?: typeof SourceBase.prototype.tagColours; // Just for the people who spell `colour` wrong :)

  protected abstract _locale: string;

  protected abstract _locales: Array<{
    id: string;
    name: string;
  }>;

  protected abstract searchFilters: any;

  protected abstract searchFilterFieldTypes: SearchFilterFieldTypes;

  public setLocale(locale: string): void {
    this._locale = locale;
  }

  public getLocale(): string {
    return this._locale;
  }

  public getLocales(): Array<{
    id: string;
    name: string;
  }> {
    return [...this._locales];
  }

  public setFilters(
    searchFilters: typeof SourceBase.prototype.searchFilters
  ): void {
    this.searchFilters = searchFilters;
  }

  public getFilters(): typeof SourceBase.prototype.searchFilters {
    return { ...this.searchFilters };
  }

  public getFieldTypes(): SearchFilterFieldTypes {
    return { ...this.searchFilterFieldTypes };
  }

  public abstract getManga(
    mangaID: string,
    doFull: boolean
  ): Promise<FullManga>;

  public abstract getMangas(
    mangaIDs: string[],
    doFull: boolean
  ): Promise<Promise<FullManga>[]>;

  public abstract getUrl(mangaID: string): string;

  public abstract getChapters(mangaID: string): Promise<Chapter[]>;

  public abstract serialize(
    mangaItem: any,
    doFull: boolean
  ): Promise<Manga | false> | Promise<FullManga | false>;

  public abstract getPages(chapterId: string): Promise<string[]>;

  public abstract serializeChapters(chapters: any[]): Promise<Chapter[]>;

  public abstract getAuthors(mangaID: any): Promise<string[]>;

  public abstract search(): Promise<any[]>;
}
