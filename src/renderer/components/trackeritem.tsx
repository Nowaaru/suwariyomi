import { StyleSheet, css } from 'aphrodite';
import { Box } from '@mui/material';
import { useState } from 'react';
import sanitizeHtml from 'sanitize-html';

import Theme from '../../main/util/theme';
import { useTranslation } from '../../shared/intl';
import { Media } from '../util/tracker/tracker';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const themeColors = currentTheme.getColors();
const componentStyle = currentTheme.getComponentStyle('trackeritem');

const styles = StyleSheet.create({
  chosen: {
    backgroundColor: `${themeColors.accent.substring(0, 7)}33`,
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    width: '500px',
    height: 'fit-content',
    cursor: 'pointer',
    marginBottom: '32px',
    transition: 'background-color 0.2s ease-in-out',
    borderRadius: '5px',
  },
  coverImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: '5px',
  },
  coverImageContainer: {
    width: '100px',
    height: '144px',
  },
  containerContentText: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '8px',
  },
  containerContentMeta: {
    display: 'flex',
    fontFamily: 'PT Sans Narrow',
    color: '#9e9e9e',
  },
  containerContentDescription: {
    color: '#AeAeAe',
    marginTop: '8px',
    fontSize: '0.8em',
    maxWidth: '300px',
    fontFamily: 'Open Sans, sans-serif',
  },
  containerContentTitle: {
    color: '#fff',
    fontFamily: 'Poppins',
    fontSize: '1.3em',
    fontWeight: 400,
  },

  ...componentStyle,
}) as any;

const TrackerItem = ({
  id,
  onClick,
  chosen,
  media,
}: {
  id: string | number;
  media: Media;
  chosen?: boolean;
  onClick?: () => void;
}) => {
  const coverImage =
    media.covers?.medium ?? media.covers?.large ?? media.covers?.extraLarge;

  const { t } = useTranslation();
  const descriptionTrimLength = 200;
  const [isBackgroundIlluminated, setIllumination] = useState<boolean>(chosen!);
  return (
    <Box
      className={css(
        styles.container,
        isBackgroundIlluminated && styles.chosen
      )}
      onMouseEnter={() => setIllumination(true)}
      onMouseLeave={() => setIllumination(chosen!)}
      onClick={onClick}
      key={id}
    >
      {coverImage ? (
        <div className={css(styles.coverImageContainer)}>
          <img src={coverImage} className={css(styles.coverImage)} alt="" />
        </div>
      ) : null}
      <div className={css(styles.containerContentText)}>
        <span className={css(styles.containerContentTitle)}>
          {media.title?.userPreferred ??
            media.title?.romaji ??
            media.title?.english ??
            media.title?.native ??
            t('notitle')}
        </span>
        {media.chapters ?? media.volumes ? (
          <span className={css(styles.containerContentMeta)}>
            {media.volumes
              ? media.volumes === 1
                ? t('countv')
                : t('countvs')
              : null}
            {media.volumes ? t('comma') : ''}
            {media.chapters
              ? t(media.chapters === 1 ? 'countc' : 'countcs')
              : null}
          </span>
        ) : null}
        <span className={css(styles.containerContentDescription)}>
          {sanitizeHtml(media.description ?? t('trackeritem_nodesc')).substring(
            0,
            descriptionTrimLength
          )}
          {(media.description?.length ?? 0) > descriptionTrimLength
            ? '...'
            : null}
        </span>
      </div>
    </Box>
  );
};

TrackerItem.defaultProps = {
  chosen: false,
  onClick: () => {},
};

export default TrackerItem;
