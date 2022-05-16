/* eslint-disable react/jsx-props-no-spreading */
import {
  Dialog as MuiDialog,
  DialogContent,
  DialogTitle,
  DialogProps as MuiDialogProps,
  DialogActions,
} from '@mui/material';
import { StyleSheet, css } from 'aphrodite';
import { omit } from 'lodash';
import Theme from '../../main/util/theme';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const themeColors = currentTheme.getColors();
const componentStyle = currentTheme.getComponentStyle('trackeritem');

type DialogProps = MuiDialogProps &
  Pick<Required<MuiDialogProps>, 'children' | 'open'> & {
    rawcontent?: boolean;
    title?: string;
    actions?: React.ReactNode;
  };

const stylesObject = {
  dialog: {},
  selected: {
    border: `4px solid ${themeColors.accent}`,
  },

  modalDialog: { background: 'transparent' },

  modalDialogTitle: {
    backgroundColor: themeColors.background,
    color: themeColors.textLight,
  },

  modalDialogContent: {
    backgroundColor: themeColors.background,
    '::-webkit-scrollbar': {
      width: '8px',
    },
    '::-webkit-scrollbar-thumb': {
      background: themeColors.white,
      ':hover': {
        background: themeColors.accent,
      },
    },
  },

  modalDialogActions: {
    background: themeColors.accent,
  },

  ...componentStyle,
};

const styles = StyleSheet.create(stylesObject) as any;
const Dialog = (props: DialogProps) => {
  const { children, rawcontent, actions, title } = props;
  return (
    <MuiDialog {...omit(props, 'rawcontent', 'children')}>
      {rawcontent ? (
        children
      ) : (
        <>
          <DialogTitle className={css(styles.modalDialogTitle)}>
            {title}
          </DialogTitle>
          <DialogContent className={css(styles.modalDialogContent)}>
            {children}
          </DialogContent>
          {actions ? (
            <DialogActions className={css(styles.modalDialogActions)}>
              {actions}
            </DialogActions>
          ) : null}
        </>
      )}
    </MuiDialog>
  );
};

Dialog.defaultProps = {
  rawcontent: false,
  title: 'Modal',
  actions: null,
};

export default Dialog;
