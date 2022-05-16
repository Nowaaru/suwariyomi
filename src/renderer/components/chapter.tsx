import { Paper, Button, Checkbox, IconButton, Tooltip } from '@mui/material';
import { useState } from 'react';
import { StyleSheet, css } from 'aphrodite';

import dayjs from 'dayjs';
import dayjs_advancedFormat from 'dayjs/plugin/advancedFormat';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

import Handler from '../../main/sources/handler';
import { ReadDatabaseValue } from '../../main/util/read';
import { convertDateToFormatted } from '../util/func';
import {
  Chapter as DatabaseChapter,
  Manga as DatabaseManga,
} from '../../main/util/manga';
import Theme from '../../main/util/theme';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const themeColors = currentTheme.getColors();
const componentStyle = currentTheme.getComponentStyle('trackeritem');

const styles = StyleSheet.create({
  chapter: {
    display: 'flex',
    position: 'relative',
    flexDirection: 'row',
    marginBottom: '8px',
    height: 'fit-content',
    boxSizing: 'border-box',
    padding: '8px',
    font: '14px Roboto, sans-serif',
    backgroundColor: '#222222',
    boxShadow: `0px 0px 5px ${themeColors.black}`,
  },
  chapterDateData: {
    fontSize: '0.7em',
    fontWeight: 200,
    fontVariant: 'small-caps',
    marginTop: '36px',
    display: 'inline',
    fontFamily: 'Open Sans, sans-serif',
    color: themeColors.white,
  },

  downloadButton: {
    float: 'right',
  },

  downloadButtonIcon: {
    color: themeColors.white,
    ':hover': {
      color: themeColors.accent,
    },
  },

  disabledDownloadButton: {
    color: themeColors.white,
    filter: 'brightness(0.4)',
    ':hover': {
      color: themeColors.white,
    },
  },

  chapterGroups: {},

  chapterGroupsText: {
    color: 'rgb(127,127,127)',
  },

  chapterContainerReadButtonContainer: {
    width: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box',
    padding: '8px',
  },

  chapterContainerReadButton: {
    display: 'flex',
    fontWeight: 'bold',
    color: themeColors.accent,
    minWidth: '80px',
  },

  chapterContainerBookmarkButton: {
    color: themeColors.accent,
  },

  chapterNumberData: {
    // This only shows when there is a chapter title.
    // This is because if there is no chapter title, then the chapter number is
    // the chapter title.
    fontSize: '0.8em',
    fontWeight: 200,
    fontVariant: 'small-caps',
    marginRight: '8px',
    display: 'inline',
    fontFamily: 'Open Sans, sans-serif',
    color: themeColors.white,
  },

  chapterTitle: {
    width: '95%',
    height: '100%',
  },

  chapterTitleHeader: {
    display: 'inline',
    marginRight: '8px',
    color: themeColors.white,
    textShadow: 'none',
  },

  bookmarksButton: {
    color: themeColors.white,
  },

  bookmarksButtonFilled: {
    color: themeColors.accent,
  },

  markAsReadButton: {
    float: 'right',
  },

  markUnreadIcon: {
    color: themeColors.accent,
    width: '24px',
    height: '24px',
    transition: 'color 0.2s ease-in-out',
    ':hover': {
      color: themeColors.white,
    },
  },

  markReadIcon: {
    color: themeColors.accent,
    transition: 'color 0.2s ease-in-out',
    width: '24px',
    height: '24px',
    ':hover': {
      color: themeColors.white,
    },
  },

  ...componentStyle,
}) as any;

dayjs.extend(dayjs_advancedFormat);

const Chapter = ({
  onReadClick,
  onBookmark,
  onMarkRead,

  dateformat = 'MM/DD/YYYY',
  modifierShift,
  downloadable,
  dbchapter,
  className,
  chapter,
  source,
  manga,
}: {
  onReadClick: (chapterId: string) => void;
  onBookmark?: (wasBookmarked: boolean) => void;
  onMarkRead?: (wasMarked: boolean) => void;

  dateformat?: string;
  downloadable: boolean;
  modifierShift?: boolean;
  dbchapter?: ReadDatabaseValue[string];
  className?: string;
  chapter: DatabaseChapter;
  source: string;
  manga: DatabaseManga;
}) => {
  const { lastRead = undefined, timeElapsed = 0 } = dbchapter ?? {};
  const [currentPage, setCurrentPage] = useState(dbchapter?.currentPage ?? -1);
  const isRead =
    dbchapter && currentPage !== -1 && currentPage >= chapter.PageCount;
  const isBookmarked = dbchapter && dbchapter.isBookmarked;

  // If the page count is too large, recorrect it.
  if (chapter.PageCount < currentPage) {
    setCurrentPage(chapter.PageCount);
    window.electron.read.set(
      source,
      chapter.ChapterID,
      chapter.PageCount,
      chapter.PageCount,
      lastRead,
      timeElapsed,
      !!isBookmarked,
      manga.MangaID
    );
  }

  return (
    <Paper
      elevation={3}
      key={chapter.ChapterID}
      className={`${css(styles.chapter)}${className ? ` ${className}` : ''}`}
      // Aphrodite says **not** to do this, but unfortunately it also provides no overload to join string declarations via the css function.
      // So, in short, this sucks. I'm sorry.
    >
      <div className={css(styles.chapterTitle)}>
        <h3 className={css(styles.chapterTitleHeader)}>
          {chapter.ChapterTitle ||
            `${
              chapter.Volume
                ? `Volume ${chapter.Volume} Chapter ${chapter.Chapter}`
                : `Chapter ${chapter.Chapter}`
            }`}
        </h3>
        {chapter.ChapterTitle && (
          <h4 className={css(styles.chapterNumberData)}>
            {chapter.Volume
              ? `VOL. ${chapter.Volume} CH. ${chapter.Chapter}`
              : `CH. ${chapter.Chapter}`}
          </h4>
        )}
        {chapter.Groups && chapter.Groups.length > 0 ? (
          <div className={css(styles.chapterGroups)}>
            <span className={css(styles.chapterGroupsText)}>
              {chapter.Groups.join(' & ').slice(0, 45)}
            </span>
          </div>
        ) : null}
        {chapter.PublishedAt ? (
          <h4 className={css(styles.chapterDateData)}>
            {convertDateToFormatted(
              dayjs(chapter.PublishedAt),
              dateformat as any
            )}
          </h4>
        ) : null}
      </div>
      <div className={css(styles.chapterContainerReadButtonContainer)}>
        <Tooltip
          title={
            currentPage !== -1
              ? `Page ${currentPage} / ${chapter.PageCount}`
              : 'Unread'
          }
          placement="top"
        >
          <Button
            className={css(styles.chapterContainerReadButton)}
            sx={{
              '&:hover': {
                backgroundColor: '#FFFFFF11 !important',
              },
            }}
            onClick={() => onReadClick(chapter.ChapterID)}
          >
            {dbchapter && currentPage !== -1
              ? isRead
                ? 'Re-read'
                : 'Continue'
              : 'Read'}
          </Button>
        </Tooltip>
      </div>
      <Tooltip title="Bookmark">
        <Checkbox
          className={css(styles.chapterContainerBookmarkButton)}
          sx={{
            '&:hover': {
              backgroundColor: 'transparent !important',
            },
          }}
          checkedIcon={
            <BookmarkIcon className={css(styles.bookmarksButtonFilled)} />
          }
          icon={<BookmarkBorderIcon className={css(styles.bookmarksButton)} />}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const { checked } = event.target;
            window.electron.read.set(
              source,
              chapter.ChapterID,
              chapter.PageCount,
              currentPage,
              lastRead,
              timeElapsed,
              checked,
              manga.MangaID
            );

            onBookmark?.(checked);
          }}
          checked={!!isBookmarked}
        />
      </Tooltip>
      {modifierShift ? (
        <Tooltip title={isRead ? 'Mark as unread' : 'Mark as read'}>
          <Checkbox
            checked={!!isRead}
            checkedIcon={
              <VisibilityOffIcon className={css(styles.markUnreadIcon)} />
            }
            sx={{
              '&:hover': {
                backgroundColor: 'transparent !important',
              },
            }}
            icon={<VisibilityIcon className={css(styles.markReadIcon)} />}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const { checked } = event.target;
              const newCurrentPage = checked ? chapter.PageCount : -1;
              window.electron.read.setSync(
                source,
                chapter.ChapterID,
                chapter.PageCount,
                newCurrentPage,
                lastRead,
                timeElapsed,
                !!isBookmarked,
                manga.MangaID
              );

              if (onMarkRead) {
                onMarkRead(checked);
              }
              setCurrentPage(newCurrentPage);
            }}
          />
        </Tooltip>
      ) : downloadable ? (
        <Tooltip
          title={`Download Ch. ${chapter.Chapter}${
            chapter.ChapterTitle ? ` - ${chapter.ChapterTitle}` : ''
          }`}
          placement="top"
        >
          <IconButton
            className={css(styles.downloadButton)}
            onClick={() => {
              const sourceHandler = Handler.getSource(source);
              if (sourceHandler?.canDownload) {
                sourceHandler.download(
                  window.electron.download.getDownloadsPath(),
                  manga.MangaID,
                  chapter.ChapterID
                );
              }
            }}
          >
            <DownloadIcon
              className={css(
                styles.downloadButtonIcon,
                styles.disabledDownloadButton
              )}
            />
          </IconButton>
        </Tooltip>
      ) : null}
    </Paper>
  );
};

Chapter.defaultProps = {
  modifierShift: false,
  onBookmark: () => {},
  onMarkRead: () => {},
  dbchapter: {},
  dateformat: 'MM/DD/YYYY',
  className: '',
};

export default Chapter;
