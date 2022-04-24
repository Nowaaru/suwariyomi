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

type DialogProps = MuiDialogProps &
  Pick<Required<MuiDialogProps>, 'children' | 'open'> & {
    rawcontent?: boolean;
    title?: string;
    actions?: React.ReactNode;
  };

const stylesObject = {
  dialog: {},
  selected: {
    border: '4px solid #DF2935',
  },

  modalDialog: { background: 'transparent' },

  modalDialogTitle: { backgroundColor: '#111111', color: 'white' },

  modalDialogContent: {
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

  modalDialogActions: {
    background: '#111111',
  },
};

const styles = StyleSheet.create(stylesObject);
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
