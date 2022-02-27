import { Dialog, DialogTitle, DialogContent, Button } from '@mui/material';
import { StyleSheet, css } from 'aphrodite';
import { useRef, useState, useEffect } from 'react';

import {
  Chapter as DatabaseChapter,
  Manga as DatabaseManga,
} from '../../main/util/manga';

import Loading from './loading';
import Chapter from './chapter';
import Handler from '../../main/sources/handler';

import { sortChapters } from '../util/func';

const stylesObject = {
  dialog: {},
  selected: {
    border: '4px solid #DF2935',
  },

  chapterModalDialog: { background: 'transparent' },

  chapterModalDialogTitle: { backgroundColor: '#111111', color: 'white' },

  chapterModalDialogContent: {
    backgroundColor: '#111111',
    '::-webkit-scrollbar': {
      width: '4px',
    },
    '::-webkit-scrollbar-thumb': {
      background: '#FFFFFF',
      ':hover': {
        background: '#DF2935',
      },
    },
  },

  chapterModalDialogChapterItem: {},

  chapterModalDialogLoadingCircle: {},

  chapterModalDialogErrorContainer: {},

  chapterModalDialogErrorRetryButton: {},
};

const styles = StyleSheet.create(stylesObject);

const ChapterModal = ({
  onChange,
  onClose,

  chapters,
  current,
  source,
  manga,
  open,
}: {
  onChange: (chapterId: string) => void;
  onClose?: () => void;

  chapters: DatabaseChapter[];
  current: string;
  source: string;
  manga: string;
  open: boolean;
}) => {
  const Chapters = useRef(window.electron.read.get(source));
  const [mangaObject, setManga] = useState<
    DatabaseManga | Record<string, never>
  >();
  const [errorOccured, setErrorOccured] = useState(false);

  // If manga is not in cache, pull from source
  useEffect(() => {
    if (!mangaObject || errorOccured) {
      const cacheManga = window.electron.library.getCachedManga(source, manga);
      if (cacheManga) return setManga(cacheManga);

      const foundSource = window.electron.util
        .getSourceFiles()
        .map(Handler.getSource)
        .filter((x) => x.getName().toLowerCase() === source.toLowerCase());

      if (foundSource.length === 0) {
        window.electron.log.error(`Source ${source} not found`);
        return setErrorOccured(true);
      }
      const sourceObject = foundSource[0];
      sourceObject
        .getManga(manga, false)
        .then((fullManga) => {
          return setManga(fullManga);
        })
        .catch((e) => {
          window.electron.log.error(e);
          setErrorOccured(true);
        });
    }

    return undefined;
  }, [mangaObject, source, manga, errorOccured]);

  return (
    <Dialog
      className={css(styles.chapterModalDialog)}
      open={open}
      onClose={onClose}
    >
      <DialogTitle className={css(styles.chapterModalDialogTitle)}>
        Chapters
      </DialogTitle>
      <DialogContent className={css(styles.chapterModalDialogContent)}>
        {errorOccured ? (
          <div className={css(styles.chapterModalDialogErrorContainer)}>
            <p>
              An error occured while loading chapters.
              <Button
                className={css(styles.chapterModalDialogErrorRetryButton)}
                onClick={() => {
                  setManga({});
                  setErrorOccured(false);
                }}
              >
                Retry
              </Button>
            </p>
          </div>
        ) : (
          <div>
            {mangaObject ? (
              <div>
                {sortChapters(chapters).map((chapter) => {
                  return (
                    <Chapter
                      onReadClick={onChange}
                      downloadable={false}
                      chapter={chapter}
                      source={source}
                      dbchapter={Chapters.current?.[chapter.ChapterID]}
                      className={css(
                        chapter.ChapterID === current && styles.selected,
                        styles.chapterModalDialogChapterItem
                      )}
                      manga={mangaObject as DatabaseManga}
                      key={chapter.ChapterID}
                    />
                  );
                })}
              </div>
            ) : (
              <div>
                <Loading
                  className={css(styles.chapterModalDialogLoadingCircle)}
                />
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

ChapterModal.defaultProps = {
  onClose: () => {},
};

export default ChapterModal;
