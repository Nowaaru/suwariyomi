/* eslint-disable new-cap */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import SourceBase from './static/base';

// I actually like the export class filled with no class but actual structures; so we'll use that.
export default class Handler {
  public static getSource(sourceName: string): SourceBase {
    const fileSources = window.electron.util.getSourceFiles();
    const foundSource = fileSources.find(
      (sourcePath) => sourcePath.toLowerCase() === sourceName.toLowerCase()
    );
    return foundSource
      ? new (require(`./container/${foundSource}`).default)()
      : null;
  }
}
