import './css/App.css';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { StyleSheet, css } from 'aphrodite';
import { ipcRenderer } from 'electron';

import Topbar from './components/topbar';
import Library from './pages/library';
import Login from './pages/login';
import Search from './pages/search';
import NotFound from './pages/404';
import View from './pages/view';
import Reader from './pages/reader';
import Settings from './pages/settings';
import Sources from './pages/sources';
import Theme from '../main/util/theme';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const themeColors = currentTheme.getColors();
const pageStyle = currentTheme.getPageStyle('main');

const styles = StyleSheet.create({
  root: {
    height: 'calc(100% - 32px)',
    width: '100%',
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
  },
  main: {
    height: '101%',
    width: '100%',
    backgroundColor: themeColors.background,
    zIndex: 1,
    position: 'absolute',
  },
  ...pageStyle,
}) as any;

ipcRenderer.on('download-source-error', (_, src, msg) =>
  window.electron.log.error(`DL Error for Source ${src}:`, msg)
);

ipcRenderer.on('download-source-success', (_, src, msg) =>
  window.electron.log.info(`DL Response for Source ${src}:`, msg)
);

export default function App() {
  window.electron.log.info('App.tsx: Rendering App');
  return (
    <div className={css(styles.main)}>
      <Topbar />
      <div className={css(styles.root)} id="root">
        <Router>
          <Routes>
            <Route path="*" element={<NotFound />} />
            <Route path="/" element={<Library />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
            <Route path="/view" element={<View />} />
            <Route path="/read" element={<Reader />} />
            <Route path="/login" element={<Login />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/sources" element={<Sources />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}
