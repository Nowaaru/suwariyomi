import Enmap from 'enmap';

const CACHE = new Enmap();
export default class Cache {
  public static async flush(): Promise<void> {
    CACHE.deleteAll();
  }

  public static async get(key: string): Promise<any | undefined> {
    return CACHE.get(key);
  }

  public static async set(key: string, value: any): Promise<void> {
    CACHE.set(key, value);
  }

  public static async has(key: string): Promise<boolean> {
    return CACHE.has(key);
  }

  public static async delete(...keys: string[]): Promise<void> {
    CACHE.evict(keys);
  }
}
