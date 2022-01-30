import { Manga, Chapter } from '../../main/util/dbUtil';

export type SearchFilters = {
  query: string;
  results: number;
  offset: number;
};

export type OptionWithDefaults = {
  isDefault: boolean;
  label: string;
  value: string;
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

type SearchFilterFieldTypeSelect = {
  type: 'select';
  options: OptionWithDefaults[];
  display: string;
};

type SearchFilterFieldTypeRadio = {
  type: 'radio';
  options: OptionWithDefaults[];
  display: string;
  isHorizontal: boolean;
};

type SearchFilterField = SearchFilterFieldBase &
  (
    | SearchFilterFieldTypeAutoComplete
    | SearchFilterFieldTypeCheckbox
    | SearchFilterFieldTypeSelect
    | SearchFilterFieldTypeRadio
  );

export type SearchFilterFieldTypes = {
  [categoryName: string]: {
    fieldType: SearchFilterField['type'];
    choices: SearchFilterField[]; // an array of objects that have the same type as the fieldType ( i have no clue how to type this )
  };
};

export default abstract class SourceBase {
  protected abstract _sourceName: string;

  public getName(): typeof SourceBase.prototype._sourceName {
    return this._sourceName;
  }

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
