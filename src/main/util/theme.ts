/* eslint-disable import/prefer-default-export */
import { readdirSync, readFileSync, existsSync } from 'fs';
import { app } from 'electron';

const userData = app.getPath('userData');
export const getTheme = (themeName: string, variant: 'light' | 'dark') => {
  if (!existsSync(userData)) {
    return {};
  } else if (!existsSync(`${userData}/themes`)) {
    return {};
  } else if (!existsSync(`${userData}/themes/${themeName}`)) {
    return {};
  }

  const themeFiles = readdirSync(`${userData}/themes/${themeName}`);
  const themeMetadata = readFileSync(
    `${userData}/themes/${themeName}/meta.json`
  );

  return {
    meta: themeMetadata.toJSON(),
  };
};
