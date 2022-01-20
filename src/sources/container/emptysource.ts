import { Manga, Chapter } from '../../main/util/dbUtil';
import SourceBase, {
  SearchFilterFieldTypes,
  SearchFilters,
} from '../static/base';

export default class EmptySource extends SourceBase {
  constructor() {
    super();

    this.serialize = this.serialize.bind(this);
    this.serializeChapters = this.serializeChapters.bind(this);
    this.search = this.search.bind(this);
  }

  protected _sourceName: string = 'EmptySource';

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
      },
      {
        type: 'checkbox',
        display: 'Pornographic',
        writeTo: 'contentRating',
      },
    ],
  };

  protected searchFilters: SearchFilters = {
    query: '',
    results: 20,
    offset: 0,
  };

  public async serialize(): Promise<Manga | false> {
    return false;
  }

  public async serializeChapters(chapters: any[]): Promise<Chapter[]> {
    return [];
  }

  public async search(): Promise<any[]> {
    return [];
  }
}
