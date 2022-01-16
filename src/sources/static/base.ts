import { Manga, Chapter } from '../../main/util/dbUtil';

export default abstract class SourceBase {
  protected abstract _sourceName: string;

  public abstract getName(): typeof SourceBase.prototype._sourceName;

  protected abstract searchFilters: any;

  public abstract setFilters(
    searchFilters: typeof SourceBase.prototype.searchFilters
  ): void;

  public abstract serialize(mangaItem: any): Promise<Manga>;

  public abstract getFilters(): typeof SourceBase.prototype.searchFilters;

  public abstract serializeChapters(chapters: any[]): Promise<Chapter[]>;

  public abstract search(): Promise<any[]>;
}
