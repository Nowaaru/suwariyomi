/* eslint-disable import/prefer-default-export */
import { resolve } from 'path';
import { readdir } from 'fs/promises';
import type { Dirent } from 'fs';

export async function getFiles(dir: string): Promise<Dirent[]> {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent: Dirent) => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFiles(res) : res;
    })
  );

  return Array.prototype.concat(...files);
}
