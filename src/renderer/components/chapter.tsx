import { Paper, Button, Checkbox, IconButton } from '@mui/material';
import { StyleSheet, css } from 'aphrodite';
import { useNavigate } from 'react-router-dom';

import moment from 'moment';
import DownloadIcon from '@mui/icons-material/Download';
import DownloadDoneIcon from '@mui/icons-material/DownloadDone';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

import { ReadDatabaseValue } from '../../main/util/read';
import {
  Chapter as DatabaseChapter,
  Manga as DatabaseManga,
} from '../../main/util/manga';

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
    boxShadow: '0px 0px 5px #000000',
  },
  chapterDateData: {
    fontSize: '0.7em',
    fontWeight: 200,
    fontVariant: 'small-caps',
    marginTop: '36px',
    display: 'inline',
    fontFamily: 'Open Sans, sans-serif',
    color: 'white',
  },

  downloadButton: {
    float: 'right',
  },

  downloadButtonIcon: {
    color: 'white',
    ':hover': {
      color: '#DF2935',
    },
  },

  disabledDownloadButton: {
    color: 'white',
    filter: 'brightness(0.4)',
    ':hover': {
      color: 'white',
    },
  },

  chapterGroups: {},

  chapterGroupsText: {
    color: 'rgb(127,127,127)',
  },

  chapterContainerReadButton: {
    padding: '8px',
    fontWeight: 'bold',
    color: '#DF2935',
    boxSizing: 'border-box',
    width: '135px',
    top: '50%',
  },

  chapterContainerBookmarkButton: {
    color: '#DF2935',
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
    color: 'white',
  },

  chapterTitle: {
    width: '95%',
    height: '100%',
  },

  chapterTitleHeader: {
    display: 'inline',
    marginRight: '8px',
    color: '#FFFFFF',
    textShadow: 'none',
  },

  bookmarksButton: {
    color: 'white',
  },

  bookmarksButtonFilled: {
    color: '#DF2935',
  },
});

const Chapter = ({
  onReadClick,

  downloadable,
  dbchapter,
  className,
  chapter,
  source,
  manga,
}: {
  onReadClick: (chapterId: string) => void;

  downloadable: boolean;
  dbchapter?: ReadDatabaseValue[string];
  className?: string;
  chapter: DatabaseChapter;
  source: string;
  manga: DatabaseManga;
}) => {
  const Navigate = useNavigate();

  const {
    pageCount = -1,
    currentPage = -1,
    lastRead = -1,
    timeElapsed = 0,
  } = dbchapter ?? {};
  const isRead =
    dbchapter &&
    currentPage !== -1 &&
    pageCount !== -1 &&
    currentPage === pageCount;
  const isBookmarked = dbchapter && dbchapter.isBookmarked;

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
            {moment(chapter.PublishedAt).format('MMMM Do YYYY')}
          </h4>
        ) : null}
      </div>
      <Button
        className={css(styles.chapterContainerReadButton)}
        sx={{
          '&:hover': {
            backgroundColor: 'transparent !important',
          },
        }}
        onClick={(x) => onReadClick(chapter.ChapterID)}
      >
        {dbchapter && currentPage !== -1
          ? isRead
            ? 'Re-read'
            : 'Continue'
          : 'Read'}
      </Button>
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
          if (checked)
            // TODO: try using array + deconstruction here?
            window.electron.read.set(
              source,
              chapter.ChapterID,
              pageCount,
              currentPage,
              lastRead,
              timeElapsed,
              true
            );
          else
            window.electron.read.set(
              source,
              chapter.ChapterID,
              pageCount,
              currentPage,
              lastRead,
              timeElapsed,
              false
            );
        }}
        defaultChecked={isBookmarked}
      />
      {downloadable ? (
        <IconButton className={css(styles.downloadButton)}>
          <DownloadIcon
            className={css(
              styles.downloadButtonIcon,
              styles.disabledDownloadButton
            )}
          />
        </IconButton>
      ) : null}
    </Paper>
  );
};

Chapter.defaultProps = {
  dbchapter: {},
  className: '',
};

export default Chapter;
