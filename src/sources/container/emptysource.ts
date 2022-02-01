import { Manga, Chapter } from '../../main/util/dbUtil';
import SourceBase, {
  SearchFilterFieldTypes,
  SearchFilters,
} from '../static/base';

type EmptySourceFilters = SearchFilters & {
  contentRating: Array<'safe' | 'suggestive' | 'erotica' | 'pornographic'>;
};

export default class EmptySource extends SourceBase {
  constructor() {
    super();

    this.serialize = this.serialize.bind(this);
    this.serializeChapters = this.serializeChapters.bind(this);
    this.search = this.search.bind(this);
  }

  protected _sourceName: string = 'EmptySource';

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
  };

  protected Tags: Promise<
    {
      tagName: string;
      tagID: string;
    }[]
  > = Promise.resolve([]);

  protected searchFilters: EmptySourceFilters = {
    query: '',
    results: 20,
    offset: 0,
    contentRating: ['safe', 'pornographic'],
  };

  public async serialize(): Promise<Manga | false> {
    return false;
  }

  public async serializeChapters(): Promise<Chapter[]> {
    return [];
  }

  public async getAuthors(): Promise<string[]> {
    return [];
  }

  public async search(): Promise<any[]> {
    return [];
  }
}
