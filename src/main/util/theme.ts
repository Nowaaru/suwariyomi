/* eslint-disable max-classes-per-file */
import path from 'path';
import { existsSync } from 'fs';
import { getMainRequire } from '../../shared/util';

// default theme imports
import defaultThemeMetadata from '../../shared/theme/default/metadata.json';
import defaultThemeDarkColors from '../../shared/theme/default/dark/colors.json';
import defaultThemeLightColors from '../../shared/theme/default/light/colors.json';

const mainRequire = getMainRequire();
const userData = window.electron.util.getUserDataPath();

class Theme {
  constructor(public themeName: string, public variant: 'light' | 'dark') {
    this.isDefault = themeName.toLowerCase() === 'default';

    const allThemes = window.electron.util.themes;
    const theme = allThemes[themeName];

    const variantPath =
      themeName === 'default' ? 'default' : path.join(theme.location, variant);

    if (
      !existsSync(userData) ||
      ((!existsSync(variantPath) || !theme) && !this.isDefault)
    ) {
      // this can 100% loop forever if the default theme is broken so be wary! :)

      return new Theme('default', variant);
    }

    this.isDefault = themeName === 'default';
    this.baseThemePath = themeName;
    this.variantPath = variantPath;
    this.metadata = theme?.metadata ?? defaultThemeMetadata;
  }

  public metadata!: Record<string, string>;

  private baseThemePath!: string;

  private isDefault: boolean;

  private variantPath!: string;

  public getComponentStyle = (componentName: string) => {
    if (this.isDefault) return {};

    const componentFile = path.join(
      this.variantPath,
      'components',
      `${componentName}.json`
    );

    if (!existsSync(componentFile)) {
      return {};
    }

    try {
      delete mainRequire.cache[mainRequire.resolve(componentFile)];
    } catch (e) {
      window.electron.log.warn(e);
    }
    return mainRequire(componentFile);
  };

  public getPageStyle = (pageName: string) => {
    if (this.isDefault) return {};
    const pageFile = path.join(this.variantPath, 'pages', `${pageName}.json`);
    if (!existsSync(pageFile)) {
      return {};
    }

    try {
      delete mainRequire.cache[mainRequire.resolve(pageFile)];
    } catch (e) {
      window.electron.log.warn(e);
    }
    return mainRequire(pageFile);
  };

  public getColors = ():
    | {
        accent: string;
        accent2: string;
        accentSpecial: string;

        background: string;
        backgroundDark: string;
        backgroundLight: string;
        backgroundTransparent: string;

        white: string;
        black: string;

        textLight: string;
        textDark: string;

        tag: string;
        tagText: string;
      }
    | Record<string, never> => {
    const correspondingDefault = {
      dark: defaultThemeDarkColors,
      light: defaultThemeLightColors,
    }[this.variant];
    if (!this.isDefault) {
      const colorsFile = path.join(this.variantPath, 'colors.json');

      if (!existsSync(colorsFile)) {
        return {};
      }

      try {
        delete mainRequire.cache[mainRequire.resolve(colorsFile)];
      } catch (e) {
        window.electron.log.warn(e);
      }
      return { ...correspondingDefault, ...mainRequire(colorsFile) };
    }

    return correspondingDefault;
  };
}

export default Theme;
