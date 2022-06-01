/* eslint-disable import/prefer-default-export */
import { Box, Typography } from '@mui/material';
import { StyleSheet, css } from 'aphrodite';
import dayjs from 'dayjs';

import Select from '../components/select';
import Switch from '../components/switch';
import Theme from '../../main/util/theme';

import type { Schema } from './auxiliary';
import { useTranslation } from '../../shared/intl';
import { Chapter } from '../../main/util/manga';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const themeColors = currentTheme.getColors();
const pageStyle = currentTheme.getPageStyle('func');

export const settingsStylesObject = {
  optionLabel: {
    fontFamily: '"Roboto", "Poppins", "Helvetica", "Arial", sans-serif',
    fontSize: '1.25rem',
    fontWeight: 'normal',
    lineHeight: '1.5',
    color: themeColors.textLight,
    verticalAlign: 'middle',
    minWidth: '80%',
    maxWidth: '80%',
    display: 'inline-flex',
    flexDirection: 'column',
  },
  optionLabelDescription: {
    display: 'inline-block',
    fontFamily: '"Roboto", "Poppins", "Helvetica", "Arial", sans-serif',
    fontSize: '0.7rem',
    fontWeight: '200',
    marginTop: '4px',
  },
  optionContainer: {
    '::after': {
      content: '""',
      display: 'block',
      height: '1px',
      // left to right white gradient
      background:
        'linear-gradient(to left, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1))',
      width: '80%',
      marginTop: '8px',
      marginBottom: '16px',
    },
    position: 'relative',
    width: '100%',
    height: 'fit-content',
    overflowY: 'auto',
  },
  ...pageStyle,
};

export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// @ts-ignore Aphrodite sucks, part eight undecillion.
const styles = StyleSheet.create(settingsStylesObject) as any;

export const sortChapters = (chapters: Chapter[], isDescending = true) =>
  chapters.sort((a, b) => {
    // TODO: Remove repitition
    if (a.Chapter === b.Chapter)
      // Sort by date instead
      return (
        (isDescending ? -1 : 1) *
        (new Date(a.PublishedAt).getTime() - new Date(b.PublishedAt).getTime())
      );

    return (isDescending ? -1 : 1) * (a.Chapter - b.Chapter);
  });

export const getReadUrl = (
  mangaId: string,
  mangaName: string,
  sourceId: string,
  chapterId: string,
  page: number
) =>
  `/read?id=${mangaId}&title=${mangaName}&source=${sourceId}&chapter=${chapterId}&page=${page}`;

export const convertDateToFormatted = (
  date: dayjs.Dayjs,
  format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY/MM/DD'
) =>
  ({
    'MM/DD/YYYY': date.format('MMMM Do YYYY'),
    'DD/MM/YYYY': date.format('Do MMMM YYYY'),
    'YYYY/MM/DD': date.format('YYYY MMMM Do'),
  }[format]);

/**
 *
 * @param schemeItem {Schema}
 * @param currentValue {string}
 * @param onChange {(value: string) => void}
 * @param translationKey {string} A prefix-key for the label and description. The value will be appended to this - as in `${translationKey}_${value}_label`.
 * @returns {JSX.Element}
 */
export const generateSettings = (
  schemeItem: Schema,
  currentValue: any,
  onChange: (value: any) => void,
  settingCategory?: string,
  settingKey?: string
): JSX.Element => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation(); // technically speaking its a react component. nerd!

  const {
    type,
    label,
    description,
    options,
    component: Component,
    default: defaultValue,
  } = schemeItem;

  const serializedOptions: {
    [optionValue: string]: string;
  } = {};

  if (options) {
    (options as { label: string; value: string }[]).forEach((option) => {
      serializedOptions[option.value] =
        settingKey && settingCategory
          ? t(`settings_${settingCategory}_${settingKey}_${option.value}_label`)
          : option.label;
    });
  }

  // @ts-ignore Typescript is a godawful language.
  let elementToDisplay: JSX.Element | null = null;
  switch (type) {
    case 'select':
      elementToDisplay = (
        <Select
          value={String(currentValue ?? defaultValue)}
          values={serializedOptions}
          onChange={(event) => onChange(event?.target.value ?? defaultValue)}
        />
      );
      break;
    case 'switch':
      elementToDisplay = (
        <Switch
          checked={currentValue ?? defaultValue}
          onChange={(event, isChecked) => onChange(isChecked ?? defaultValue)}
        />
      );
      break;
    case 'managed':
      if (Component) {
        // throw new Error('No component provided');
        elementToDisplay = <Component onChange={onChange} />;
      } else elementToDisplay = null;
      break;
    default:
      elementToDisplay = null;
      break;
  }

  return (
    <Box key={label} className={css(styles.optionContainer)}>
      <Typography className={css(styles.optionLabel)}>
        {label}
        <Typography className={css(styles.optionLabelDescription)}>
          {settingCategory && settingKey
            ? t(`settings_${settingCategory}_${settingKey}_description`)
            : description}
        </Typography>
      </Typography>
      {elementToDisplay}
    </Box>
  );
};

// https://stackoverflow.com/a/10344560
export const processLargeArrayAsync = <T,>(
  array: T[],
  fn: (item: T, index: number, array: T[]) => Promise<void>,
  maxTimePerChunk = 200,
  context = window
) => {
  let index = 0;

  const { now } = Date;
  function doChunk() {
    const startTime = now();
    while (index < array.length && now() - startTime <= maxTimePerChunk) {
      // callback called with args (value, index, array)
      fn.call(context, array[index], index, array);
      ++index;
    }
    if (index < array.length) {
      // set Timeout for async iteration
      setTimeout(() => window.requestAnimationFrame(doChunk), 1250);
    }
  }

  doChunk();
};

export const filterChaptersToLanguage = (
  chapters: Chapter[],
  targetLanguage = 'en'
) =>
  chapters.filter(
    (x) => x.translatedLanguage.toLowerCase() === targetLanguage.toLowerCase()
  );

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
