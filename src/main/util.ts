/* eslint import/prefer-default-export: off, import/no-mutable-exports: off */
import { URL } from 'url';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

// Create folders for themes, locales, and plugins.
export function createFolders() {
  const folders = ['themes', 'locales', 'plugins', 'sources'].filter(
    (x) => !fs.existsSync(path.normalize(path.join(app.getPath('userData'), x)))
  );
  folders.forEach((x) => {
    fs.mkdirSync(path.normalize(path.join(app.getPath('userData'), x)));
  });
}

export const getSourceDirectory = (): string =>
  path.resolve(path.join(app.getPath('userData'), 'sources'));

export function getSourceFiles(): string[] {
  const sources = fs.readdirSync(getSourceDirectory());
  return sources;
}

export let resolveHtmlPath: (htmlFileName: string) => string;
if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 4123;
  resolveHtmlPath = (htmlFileName: string) => {
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  };
} else {
  resolveHtmlPath = (htmlFileName: string) => {
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  };
}
