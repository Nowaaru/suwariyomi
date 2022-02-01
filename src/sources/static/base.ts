import { Manga, Chapter } from '../../main/util/dbUtil';

export type SearchFilters = {
  query: string;
  results: number;
  offset: number;
};

type SearchFilterFieldBase = {
  noDisplay?: boolean;
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
    | SearchFilterFieldTypeSelect
    | SearchFilterFieldTypeRadio;
};

export default abstract class SourceBase {
  protected abstract _sourceName: string;

  public getName(): typeof SourceBase.prototype._sourceName {
    return this._sourceName;
  }

  protected abstract Tags: Promise<
    {
      tagName: string;
      tagID: string;
    }[]
  >;

  protected abstract searchFilters: any;

  protected abstract searchFilterFieldTypes: SearchFilterFieldTypes;

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

  public abstract serialize(mangaItem: any): Promise<Manga | false>;

  public abstract serializeChapters(chapters: any[]): Promise<Chapter[]>;

  public abstract getAuthors(mangaID: any): Promise<string[]>;

  public abstract search(): Promise<any[]>;
}
