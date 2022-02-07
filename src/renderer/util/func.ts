/* eslint-disable import/prefer-default-export */
import { Chapter } from '../../main/util/manga';

export const getChapterValue = (chapter: Chapter): number => {
  const numberifiedChapter = Number(chapter.Chapter);
  const numberifiedChapterVolume = Number(chapter.Volume);

  const isChapterNumber = !Number.isNaN(numberifiedChapter);
  const isChapterVolumeNumber = !Number.isNaN(numberifiedChapterVolume);

  if (isChapterNumber && isChapterVolumeNumber) {
    return (
      numberifiedChapter * (numberifiedChapterVolume + 1) // Add +1 to the volume number in case the volume is weird (i.e., it's 0)
    );
  }
  return isChapterNumber
    ? numberifiedChapter
    : isChapterVolumeNumber
    ? numberifiedChapterVolume
    : 0;
};

export const sortChapters = (chapters: Chapter[], isDescending = true) =>
  chapters.sort((a, b) => {
    const [calculatedA, calculatedB] = [getChapterValue(a), getChapterValue(b)];
    if (calculatedA === calculatedB)
      // Sort by date instead
      return (
        new Date(a.PublishedAt).getTime() - new Date(b.PublishedAt).getTime()
      );

    return (isDescending ? -1 : 1) * (calculatedA - calculatedB);
  });

export const filterChaptersToLanguage = (
  chapters: Chapter[],
  targetLanguage = 'en'
) =>
  chapters.filter(
    (x) => x.translatedLanguage.toLowerCase() === targetLanguage.toLowerCase()
  );

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
