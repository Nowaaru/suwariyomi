import { Manga, Chapter } from '../../main/util/dbUtil';

export type SearchFilters = {
  query: string;
  results?: number;
  offset?: number;
};

type SearchFilterFieldBase = {
  writeTo: string;
};

type SearchFilterFieldTypeAutoComplete = {
  type: 'autocomplete';
  options: string[];
};

type SearchFilterFieldTypeCheckbox = {
  type: 'checkbox';
  checked?: boolean;
  display: string;
};

export type SearchFilterFieldTypes = {
  [categoryName: string]: (SearchFilterFieldBase &
    (SearchFilterFieldTypeAutoComplete | SearchFilterFieldTypeCheckbox))[];
};

export default abstract class SourceBase {
  protected abstract _sourceName: string;

  public abstract getName(): typeof SourceBase.prototype._sourceName;

  protected abstract searchFilters: any;

  protected abstract searchFilterFieldTypes: SearchFilterFieldTypes;

  public abstract setFilters(
    searchFilters: typeof SourceBase.prototype.searchFilters
  ): void;

  public abstract serialize(mangaItem: any): Promise<Manga>;

  public abstract getFilters(): typeof SourceBase.prototype.searchFilters;

  public abstract serializeChapters(chapters: any[]): Promise<Chapter[]>;

  public abstract search(): Promise<any[]>;
}
