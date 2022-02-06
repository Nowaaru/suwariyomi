/* eslint-disable import/prefer-default-export */
import { Chapter } from '../../main/util/manga';

export const sortChapters = (chapters: Chapter[], isDescending = true) =>
  chapters.sort((a, b) => {
    const numberifiedA = Number(a.Chapter);
    const numberifiedB = Number(b.Chapter);

    const numberifiedAVolume = Number(a.Volume);
    const numberifiedBVolume = Number(b.Volume);

    const isANumber = !Number.isNaN(numberifiedA);
    const isBNumber = !Number.isNaN(numberifiedB);

    const isAVolumeNumber = !Number.isNaN(numberifiedAVolume);
    const isBVolumeNumber = !Number.isNaN(numberifiedBVolume);

    const calculatedA =
      numberifiedA * (isAVolumeNumber ? Math.max(numberifiedAVolume, 1) : 1);
    const calculatedB =
      numberifiedB * (isBVolumeNumber ? Math.max(numberifiedBVolume, 1) : 1);
    if (isANumber && isBNumber) {
      return (isDescending ? -1 : 1) * (calculatedA - calculatedB);
    }

    return -1;
  });
