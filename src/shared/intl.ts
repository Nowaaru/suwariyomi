/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import { useCallback, cloneElement } from 'react';

export default class Translator {
  /**
   *
   * @param supportedLanguages an array of supported languages
   * @param currentLanguage the language to use. defaults to 'en'.
   */
  constructor(supportedLanguages: string[], currentLanguage = 'en') {
    this.supportedLanguages = [...supportedLanguages, currentLanguage];
    this.currentLanguage = currentLanguage;

    supportedLanguages.forEach((language) => {
      try {
        this.loadedLanguages.set(
          language,
          require(`../shared/locale/${language}.json`)
        );
      } catch (e) {
        throw new Error(`Cannot not load language file "${language}.json"`);
      }
    });
  }

  /**
   * translate
   * @param key {string} the key to translate
   */
  public translate(key: string) {
    const { currentLanguage } = this;
    const language = this.loadedLanguages.get(currentLanguage);

    if (!language) return key;
    return language[key] || key;
  }

  private loadedLanguages = new Map<
    string,
    Record<string, string | undefined>
  >();

  public get langdata() {
    return this.loadedLanguages;
  }

  private currentLanguage: string;

  private supportedLanguages: string[];
}

export const mainTranslator = new Translator(['en']);
export const useTranslation = (): {
  t: (k: string, vars?: Record<string, string | number>) => string;
  a: (
    k: string,
    arrTags: Array<any>,
    vars?: Record<string, string | number>
  ) => string | JSX.Element[];
  intl: Translator;
} => {
  const translateItem = (
    toTranslate: string,
    vars?: Record<string, string | number>
  ): string => {
    const translated = mainTranslator.translate(toTranslate);
    if (Array.isArray(translated)) return translated;

    return vars
      ? Object.entries(vars).reduce(
          (acc, [k, v]) =>
            acc.replace(`{{${k}}}`, typeof v !== 'string' ? String(v) : v),
          translated
        )
      : translated;
  };

  const translateArray = useCallback(
    (
      key: string,
      arrTags: Array<any>,
      vars?: Record<string, string | number>
    ): string | JSX.Element[] => {
      const translated = mainTranslator.translate(key);
      if (arrTags && Array.isArray(translated)) {
        return translated.map((x, i) => {
          // if translated is an array, we check if the key of the current
          // index is in the array of tags. If it is, we replace the
          // the translated value with an instance of that HTML tag
          // with the translated value as its content.

          const tag = arrTags.find((t, y) => y === i);
          const translatedX = translateItem(x, vars);

          return tag
            ? cloneElement(tag, undefined, [
                ...(tag.props.children ?? []),
                translatedX,
              ])
            : translatedX;
        }) as JSX.Element[];
      } else if (Array.isArray(translated)) {
        return translated.map((x) => translateItem(x, vars)).join(' ');
      }

      return translateItem(translated, vars);
    },
    []
  );
  return { t: translateItem, a: translateArray, intl: mainTranslator };
};
