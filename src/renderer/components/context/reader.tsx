/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
import {
  Menu,
  MenuItem,
  MenuProps,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

import { css, StyleSheet } from 'aphrodite';

import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import SendIcon from '@mui/icons-material/Send';

import Theme from '../../../main/util/theme';
import { useTranslation } from '../../../shared/intl';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const themeColors = currentTheme.getColors();
const componentStyle = currentTheme.getComponentStyle('reader');

const contextMenuInner = {
  backgroundColor: themeColors.background,
};

const contextDividerLine = {
  borderTop: `${themeColors.white.substring(0, 7)}22`,
};

const styles = StyleSheet.create({
  contextMenu: {
    zIndex: 32000,
  },
  contextMenuFont: {
    fontSize: '0.8rem',
  },
  contextMenuIcon: {
    color: themeColors.accent,
  },

  contextDivider: {
    fontFamily: 'Poppins',
    color: 'white',
  },

  contextItem: {
    color: 'white',
  },

  // Stlyes used with MUI's `sx` fields.
  contextMenuInner,
  contextDividerLine,
  ...componentStyle,
}) as any;

type UniversalChildren = JSX.Element[] | JSX.Element | string;
const ElementDivider = ({ children }: { children: UniversalChildren }) => (
  <Divider
    className={css(styles.contextDivider)}
    sx={{
      '&': {
        '::after': contextDividerLine,
        '::before': contextDividerLine,
      },
    }}
    textAlign="left"
    variant="middle"
  >
    {children}
  </Divider>
);

const ReaderMenu = (
  props: Exclude<
    MenuProps & {
      onItemClick?: (itemClicked: string) => void;
    },
    'className'
  >
) => {
  const { t } = useTranslation();

  const onItemClick = props.onItemClick!; // Will be present due to defaultProps.
  const dataSet: Record<
    string,
    Array<{ op: string; icon: JSX.Element; text: string }>
  > = {
    File: [
      {
        op: 'clipboard',
        icon: <ContentCopyIcon />,
        text: t('menu_reader_file_clipboard'),
      },
      {
        op: 'save',
        icon: <FileDownloadIcon />,
        text: t('menu_reader_file_save'),
      },
    ],
    Pages: [
      {
        op: 'nextpage',
        icon: <NavigateNextIcon />,
        text: t('menu_reader_pages_nextpage'),
      },
      {
        op: 'prevpage',
        icon: <NavigateBeforeIcon />,
        text: t('menu_reader_pages_prevpage'),
      },
    ],
    Chapters: [
      {
        op: 'nextchap',
        icon: <SkipNextIcon />,
        text: t('menu_reader_chapters_nextchap'),
      },
      {
        op: 'prevchap',
        icon: <SkipPreviousIcon />,
        text: t('menu_reader_chapters_prevchap'),
      },
    ],
    Misc: [
      {
        op: 'sharepage',
        icon: <ShareIcon />,
        text: t('menu_reader_misc_sharepage'),
      },
      {
        op: 'sharechapter',
        icon: <SendIcon />,
        text: t('menu_reader_misc_sharechapter'),
      },
    ],
  };

  return (
    <Menu
      {...props}
      sx={{
        '& .MuiPaper-root': contextMenuInner,
      }}
      className={css(styles.contextMenu)}
      transitionDuration={0}
    >
      {Object.keys(dataSet).map((key) => {
        return (
          <div>
            <ElementDivider key={key}>{key}</ElementDivider>
            {dataSet[key].map((item) => {
              return (
                <MenuItem onClick={() => onItemClick(item.op)}>
                  <ListItemIcon className={css(styles.contextMenuIcon)}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    className={css(styles.contextItem)}
                    primary={item.text}
                  />
                </MenuItem>
              );
            })}
          </div>
        );
      })}
    </Menu>
  );
};

ReaderMenu.defaultProps = {
  onItemClick: () => {},
};

export default ReaderMenu;
