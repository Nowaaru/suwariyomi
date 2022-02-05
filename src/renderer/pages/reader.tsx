import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { StyleSheet, css, StyleDeclaration, CSSProperties } from 'aphrodite';
import { URLSearchParams } from 'url';
import { useRef } from 'react';

import Handler from '../../sources/handler';
import Sidebar from '../components/sidebar';
import useQuery from '../util/hook/usequery';
import SourceBase from '../../sources/static/base';

const stylesObject = {
  container: {
    display: 'block',
    position: 'absolute',
    width: '100vw',
    height: 'calc(100vh - 42px)',
  },
  sidebar: {
    display: 'block',
    top: '0px',
    left: '0px',
    width: '200px',
    height: '100%',
    backgroundColor: '#312F2F',
  },

  dialogContainer: {
    backgroundColor: 'transparent',
  },

  dialogContainerInner: {
    backgroundColor: '#312F2F',
  },

  dialog: {
    backgroundColor: 'transparent',
  },

  dialogText: {
    backgroundColor: 'transparent',
    color: 'white',
  },

  dialogActions: {
    backgroundColor: 'transparent',
  },

  dialogButton: {
    backgroundColor: 'transparent',
    fontWeight: 'bold',
    color: '#DF2935',
  },

  dialogTitle: {
    color: 'white',
    backgroundColor: 'transparent',
  },
};

const styles = StyleSheet.create<typeof stylesObject>(
  stylesObject as StyleDeclaration<typeof stylesObject>
);

const Reader = () => {
  const queryParameters = useQuery();
  const Navigate = useNavigate();

  const goBack = () => {
    Navigate('/library');
  };

  const {
    source: sourceId = 'MangaDex',
    id: mangaId = '',
    chapter: chapterId = '',
    page: pageNumber = '1',
  } = Object.fromEntries(queryParameters as unknown as URLSearchParams);

  let selectedSource;
  {
    const mappedFileNamesRef = useRef<SourceBase[]>(
      window.electron.util
        .getSourceFiles()
        .map(Handler.getSource)
        .filter((x) => x.getName().toLowerCase() === sourceId.toLowerCase())
    );
    // selectedSource = mappedFileNamesRef.current[0];
    ({ 0: selectedSource } = mappedFileNamesRef.current);
  }

  console.log(
    `chapterId: ${chapterId} || mangaId: ${mangaId} || pageNumber: ${pageNumber}`
  );

  // No selected source dialog
  // This is here in case a bug occurs OR a user tries to access a source that doesn't exist.
  // typically via a direct link / protocol.
  if (selectedSource)
    return (
      <Dialog
        className={css(styles.dialogContainer)}
        sx={{
          '& .MuiDialog-paper': stylesObject.dialogContainerInner,
        }}
        open
        onClose={goBack}
      >
        <DialogTitle className={css(styles.dialogTitle)}>Error</DialogTitle>
        <DialogContent className={css(styles.dialog)}>
          <DialogContentText className={css(styles.dialogText)}>
            <span>{`You do not have any sources that go by the name of ${sourceId}.`}</span>
          </DialogContentText>
          <DialogActions className={css(styles.dialogActions)}>
            <Button onClick={goBack} className={css(styles.dialogButton)}>
              Go Home
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    );

  return (
    <div className={css(styles.container)}>
      <Sidebar outOf={32} />
    </div>
  );
};

export default Reader;
