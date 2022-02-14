import './css/App.css';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { StyleSheet, css } from 'aphrodite';

import Topbar from './components/topbar';
import Library from './pages/library';
import Login from './pages/login';
import Search from './pages/search';
import NotFound from './pages/404';
import View from './pages/view';
import Reader from './pages/reader';

const styles = StyleSheet.create({
  root: {
    top: '36px',
    position: 'relative',
    height: 'calc(100% - 36px)',
    width: '100vw',
  },
});

export default function App() {
  return (
    <>
      <Topbar />
      <div className={css(styles.root)} id="root">
        <Router>
          <Routes>
            <Route path="*" element={<NotFound />} />
            <Route path="/" element={<Login />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
            <Route path="/view" element={<View />} />
            <Route path="/read" element={<Reader />} />
          </Routes>
        </Router>
      </div>
    </>
  );
}
