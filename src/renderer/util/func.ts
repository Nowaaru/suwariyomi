/* eslint-disable import/prefer-default-export */
import { Chapter } from '../../main/util/manga';

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

export const filterChaptersToLanguage = (
  chapters: Chapter[],
  targetLanguage = 'en'
) =>
  chapters.filter(
    (x) => x.translatedLanguage.toLowerCase() === targetLanguage.toLowerCase()
  );

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
