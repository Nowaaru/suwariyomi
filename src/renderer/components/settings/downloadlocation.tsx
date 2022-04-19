import {
  Button,
  Box,
  Typography,
  UseButtonProps,
  Tooltip,
} from '@mui/material';
import { StyleSheet, css } from 'aphrodite';
import { dialog } from 'electron';
import { settingsStylesObject } from '../../util/func';
import type { Schema } from '../../util/auxiliary';

const styles = StyleSheet.create({
  ...(settingsStylesObject as any),
  settingsButton: {
    border: '1px solid #DF2935',
    color: '#DF2935',
    minWidth: '150px',
    width: 'fit-content',
    height: '42px',
    ':hover': {
      backgroundColor: '#DF2935',
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
  },
}) as any;

const DownloadLocation = (
  props: UseButtonProps & {
    schema: Schema;
    setting: string;
    onChange: (location: string) => void;
  }
) => {
  const { setting, schema, onChange } = props;

  return (
    <Box className={css(styles.optionContainer)}>
      <Typography className={css(styles.optionLabel)}>
        {schema.label}
        <Typography className={css(styles.optionLabelDescription)}>
          {schema.description}
        </Typography>
      </Typography>

      <Tooltip title={setting}>
        <Button
          className={css(styles.settingsButton)}
          variant="outlined"
          onClick={async () => {
            const chosenPath =
              (await window.electron.util.showOpenDialog({
                buttonLabel: 'Set',
                title: 'Set Download Location',
                defaultPath: setting,
                properties: ['openDirectory', 'createDirectory'],
              })) ?? [];

            if (chosenPath.length > 0) onChange(chosenPath[0] ?? setting);
          }}
        >
          Change
        </Button>
      </Tooltip>
    </Box>
  );
};

export default DownloadLocation;
