import { StyleSheet, css } from 'aphrodite';
import icon from '../../../assets/icons/main/32x32.png';

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
    backgroundColor: '#11111100',
    position: 'fixed',
    height: '32px',
    width: '100%',
    '-webkit-app-region': 'drag',
    zIndex: Number.MAX_SAFE_INTEGER,
  },
  icon: {
    position: 'absolute',
    zIndex: 261,
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
});

const Topbar = () => {
  const { ipcRenderer } = window.electron;
  const doExit = () => ipcRenderer.exit();
  const doMinimize = () => ipcRenderer.minimize();
  const doMaximize = () => ipcRenderer.maximize();
  return (
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
