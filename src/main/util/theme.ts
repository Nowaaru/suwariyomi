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
    const baseThemePath =
      themeName === 'default'
        ? 'default'
        : path.join(userData, 'themes', themeName);

    const variantPath =
      themeName === 'default' ? 'default' : path.join(baseThemePath, variant);
    const themeMetadata =
      baseThemePath === 'default'
        ? defaultThemeMetadata
        : mainRequire(path.join(baseThemePath, 'metadata.json'));

    this.isDefault = baseThemePath === 'default';
    this.baseThemePath = baseThemePath;
    this.variantPath = variantPath;
    this.metadata = themeMetadata;

    // this can 100% loop forever if the default theme is broken so be wary! :)
    if (
      !existsSync(userData) ||
      (!existsSync(variantPath) && !this.isDefault)
    ) {
      return new Theme('default', variant);
    }
  }

  public metadata: string;

  private baseThemePath: string;

  private isDefault: boolean;

  private variantPath: string;

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

    return mainRequire(componentFile);
  };

  public getPageStyle = (pageName: string) => {
    if (this.isDefault) return {};
    const pageFile = path.join(this.variantPath, 'pages', `${pageName}.json`);
    if (!existsSync(pageFile)) {
      return {};
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
      }
    | Record<string, never> => {
    if (!this.isDefault) {
      const colorsFile = path.join(this.variantPath, 'colors.json');

      if (!existsSync(colorsFile)) {
        return {};
      }

      return mainRequire(colorsFile);
    }

    return { dark: defaultThemeDarkColors, light: defaultThemeLightColors }[
      this.variant
    ];
  };
}

export default Theme;
