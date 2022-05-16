import {
  Button,
  Box,
  Typography,
  UseButtonProps,
  Tooltip,
} from '@mui/material';
import { StyleSheet, css } from 'aphrodite';
import { settingsStylesObject } from '../../util/func';
import type { Schema } from '../../util/auxiliary';
import Theme from '../../../main/util/theme';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const themeColors = currentTheme.getColors();
const componentStyle = currentTheme.getComponentStyle('downloadlocation');

const styles = StyleSheet.create({
  ...(settingsStylesObject as any),
  settingsButton: {
    border: `1px solid ${themeColors.accent}`,
    color: themeColors.accent,
    minWidth: '150px',
    width: 'fit-content',
    height: '42px',
    ':hover': {
      backgroundColor: themeColors.accent,
      color: themeColors.textLight,
      fontWeight: 'bold',
    },
  },
  ...componentStyle,
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
