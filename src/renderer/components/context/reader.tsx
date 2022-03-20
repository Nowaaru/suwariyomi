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

const contextMenuInner = {
  backgroundColor: '#111111',
};

const contextDividerLine = {
  borderTop: '1px solid #FFFFFF22',
};

const styles = StyleSheet.create({
  contextMenu: {
    zIndex: 32000,
  },
  contextMenuFont: {
    fontSize: '0.8rem',
  },
  contextMenuIcon: {
    color: '#DF2935',
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
});

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
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const onItemClick = props.onItemClick!; // Will be present due to defaultProps.
  const dataSet: Record<
    string,
    Array<{ op: string; icon: JSX.Element; text: string }>
  > = {
    File: [
      {
        op: 'clipboard',
        icon: <ContentCopyIcon />,
        text: 'Copy to Clipboard',
      },
      {
        op: 'save',
        icon: <FileDownloadIcon />,
        text: 'Save to Disk',
      },
    ],
    Pages: [
      {
        op: 'nextpage',
        icon: <NavigateNextIcon />,
        text: 'Next Page',
      },
      {
        op: 'prevpage',
        icon: <NavigateBeforeIcon />,
        text: 'Previous Page',
      },
    ],
    Chapters: [
      {
        op: 'nextchap',
        icon: <SkipNextIcon />,
        text: 'Next Chapter',
      },
      {
        op: 'prevchap',
        icon: <SkipPreviousIcon />,
        text: 'Previous Chapter',
      },
    ],
    Misc: [
      {
        op: 'sharepage',
        icon: <ShareIcon />,
        text: 'Share Page',
      },
      {
        op: 'sharechapter',
        icon: <SendIcon />,
        text: 'Share Chapter',
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
