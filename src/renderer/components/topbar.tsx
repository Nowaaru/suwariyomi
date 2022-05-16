import { StyleSheet, css } from 'aphrodite';
import { useState, useEffect, useCallback } from 'react';
import type { IpcRendererEvent } from 'electron/renderer';
import icon from '../../../assets/icons/main/32x32.png';

import Theme from '../../main/util/theme';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const colors = currentTheme.getColors();
const componentStyle = currentTheme.getComponentStyle('topbar');

export const Styling = StyleSheet.create({
  button: {
    width: '16px',
    height: '16px',
    margin: '8px',
    borderRadius: '50%',
    zIndex: 260,
    border: 'none',
    background: 'none',
    padding: 0,
    '-webkit-app-region': 'no-drag',
  },

  topbar: {
    background: `linear-gradient(to bottom, ${colors.backgroundDark} 60%, transparent 100%)`,
    position: 'fixed',
    height: '48px',
    width: '100%',
    '-webkit-app-region': 'drag',
    zIndex: Number.MAX_SAFE_INTEGER,
    paddingLeft: '8px',
  },

  icon: {
    position: 'absolute',
    zIndex: 261,
    userSelect: 'none',
    '::after': {
      content: '"SUWARIYOMI"',
      fontFamily: "'Bebas Neue', cursive",
      verticalAlign: 'text-bottom',
      color: 'white',
    },
  },
  close: {
    backgroundColor: '#A51A1A',
  },
  minimize: {
    backgroundColor: '#B4AA1D',
  },
  maximize: {
    backgroundColor: '#1AAA1A',
  },
  buttonContainer: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    float: 'right',
    width: '128px',
    height: 'inherit',
    right: 0,
  },
  inner: {
    position: 'relative',
    width: '100%',
    height: 'inherit',
  },
  buttonContainerInner: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'inherit',
    height: 'inherit',
  },

  ...componentStyle,
}) as any;

const Topbar = () => {
  const { ipcRenderer } = window.electron;
  const doExit = () => ipcRenderer.exit();
  const doMinimize = () => ipcRenderer.minimize();
  const doMaximize = () => ipcRenderer.maximize();
  const [doHide, setHide] = useState(false);

  const handleFullscreen = useCallback(
    (_: IpcRendererEvent, isVisible: boolean) => setHide(isVisible),
    [setHide]
  );

  useEffect(() => {
    ipcRenderer.on('fullscreen-toggle', handleFullscreen);

    return () => {
      ipcRenderer.off('fullscreen-toggle', handleFullscreen);
    };
  }, [setHide, ipcRenderer, handleFullscreen]);

  return doHide ? null : (
    <div className={css(Styling.topbar)}>
      <div className={css(Styling.icon)}>
        <img src={icon} alt="Icon" title="Suwariyomi" />
      </div>
      <div className={css(Styling.inner)}>
        <div className={`${css(Styling.buttonContainer)}`}>
          <div className={css(Styling.buttonContainerInner)}>
            <button
              type="button"
              onClick={doMinimize}
              aria-label="Minimize"
              className={css(Styling.button, Styling.minimize)}
            />
            <button
              type="button"
              onClick={doMaximize}
              aria-label="Maximize"
              className={css(Styling.button, Styling.maximize)}
            />
            <button
              type="button"
              onClick={doExit}
              aria-label="Close"
              className={css(Styling.button, Styling.close)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
