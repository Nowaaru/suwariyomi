import type { DefaultSettings } from '../../main/util/settings';

// general themes for the renderer / certain layouts?
export const defaultThemeDark = {
  fontColor1: '#FFFFFF',

  backgroundColor6: '#0c0a0c',
  backgroundColor5: '#080708',
  backgroundColor4: '#1c1b1833',
  backgroundColor3: '#0E0E0E',
  backgroundColor2: '#222222',
  backgroundColor1: '#111111',

  warningYellow: '#FFD600',

  white: '#FFFFFF',
  whiteTransparent: '#FFFFFF66',

  accent2: '#CF2935',
  accent: '#DF2935',
};

export const defaultThemeLight = {
  ...defaultThemeDark,
};

const getTheme = () => {
  // This function requires the `theme.ts`file in /main/util/theme.ts.
  // It will only return the theme's changes. The return value will have to be
  // spread on top of the default theme.

  const appearanceSettings = window.electron.settings.get(
    'appearance'
  ) as DefaultSettings['appearance'];

  if (appearanceSettings.theme === 'dark') {
    return true;
  }
};

export default (themeType: string) => {
  return {
    ...defaultThemeDark,
  };
};

// Theme layout:
/*

  Folder - Theme Name
    Theme Metadata - Theme Name, Author, Description, Version
    Theme CSS - global.json (global styles for theme, like colours, fonts, etc)

    Folder - Theme Type (dark or light)
      Folder - Components
        Theme CSS - chapter.json (styles for chapter.tsx)
        Theme CSS - chaptermodal.json (styles for chaptermodal.tsx)
        ...
      Folder - Pages
        Theme CSS - view.json (styles for view.tsx)
        Theme CSS - reader.json (styles for reader.tsx)
        Theme CSS - search.json (styles for search.tsx)
        Theme CSS - settings.json (styles for settings.tsx)
        Theme CSS - library.json (styles for library.tsx)
        Theme CSS - 404.json (styles for 404.tsx)
*/
