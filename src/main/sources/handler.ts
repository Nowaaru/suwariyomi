/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable new-cap */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import SourceBase from './static/base';
import path from 'path';

const requireFunc =
  typeof __webpack_require__ === 'function' ? __non_webpack_require__ : require;

// I actually like the export class filled with no class but actual structures; so we'll use that.
// I just came back to this comment and I have absolutely *no* clue what that was supposed to mean.

export default class Handler {
  public static getSource(sourceName: string): SourceBase {
    const fileSources = window.electron.util.getSourceFiles();
    const fileSourceDirectory = window.electron.util.getSourceDirectory();

    const foundSource = fileSources.find(
      (sourcePath) => sourcePath.toLowerCase() === sourceName.toLowerCase()
    );

	const p = path.join(fileSourceDirectory, foundSource, 'main.js');
	 return foundSource
      ? new (requireFunc(p))()
      : null;
  }
}
