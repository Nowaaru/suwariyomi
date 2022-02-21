import './css/App.css';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { StyleSheet, css } from 'aphrodite';

import Topbar from './components/Topbar';
import Library from './pages/library';
import Login from './pages/login';
import Search from './pages/search';
import NotFound from './pages/404';
import View from './pages/view';
import Reader from './pages/reader';
import Settings from './pages/settings';

const styles = StyleSheet.create({
  root: {
    height: 'calc(100% - 32px)',
    width: '100vw',
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
  },
});

window.electron.log.info('app.jsx reached');

export default function App() {
  return (
    <div>
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
          </Routes>
        </Router>
      </div>
    </div>
  );
}
