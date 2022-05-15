/* eslint-disable new-cap */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import path from 'path';
import { getSourceFiles, getSourceDirectory } from '../util';
import { getMainRequire } from '../../shared/util';
import SourceBase from './static/base';

const requireFunc = getMainRequire();

// I actually like the export class filled with no class but actual structures; so we'll use that.
// I just came back to this comment and I have absolutely *no* clue what that was supposed to mean.

export default class Handler {
  public static getSource(sourceName: string): SourceBase {
    const isRenderer = typeof window !== 'undefined';
    const fileSources = isRenderer
      ? window.electron.util.getSourceFiles()
      : getSourceFiles();
    const fileSourceDirectory = isRenderer
      ? window.electron.util.getSourceDirectory()
      : getSourceDirectory();

    const foundSource = fileSources.find(
      (sourcePath) => sourcePath.toLowerCase() === sourceName.toLowerCase()
    );

    return foundSource
      ? new (requireFunc(
          path.join(fileSourceDirectory, foundSource, 'main.js')
        ))()
      : null;
  }
}
